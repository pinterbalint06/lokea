const { createTestApp } = require("#mapcreatortest/helpers/setup-test.js");
const { testInvalidIDs, testRequiresAuth, expectSuccessfulTransaction, expectRollback, expectErrorResponse, randomId, buildRequest, suppressConsoleErrors } = require("#testhelpers/helpers.js");
const { invalidTypeNumbers, negativeNumbers, tooBigUV, tooBigDegrees, imageStatusForPath } = require("#mapcreatortest/helpers/test-data.js");

const database = require("#sql/database.js");
const { mockConnection } = database;

const {
    processImageMetadata,
    createWebpAndLowRes,
    deleteImageAndLowResByMainPath,
    mockImageMetadata,
    mockImageProcessed
} = require("#utils/image-processor.js");

const {
    deleteFile
} = require("#utils/file-utils.js");

const fs = require("fs/promises");
const path = require("path");
const ERRORS = require("#utils/error-messages.js");


const requestWithSupertest = createTestApp();

describe("Map Creator API - /api/map-creator/", () => {
    describe("Point Endpoints", () => {
        describe("GET /maps/:mapID/points", () => {
            const mockPoints = [
                { id: 32, point_u: 0.23, point_v: 0.743, north_direction: 32 },
                { id: 54, point_u: 0.12, point_v: 0.456, north_direction: 12 },
                { id: 76, point_u: 0.89, point_v: 0.234, north_direction: 76 },
                { id: 98, point_u: 0.45, point_v: 0.678, north_direction: 98 }
            ];

            const defaults = {
                id: randomId()
            };

            const makeGetRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.get(`/api/map-creator/maps/${encodeURIComponent(id)}/points`),
                overrides,
                defaults
            );

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makeGetRequest());

                it("Should respond with 403 if it's not the user's map", async () => {
                    database.checkUserOwnsMap.mockResolvedValueOnce(false);
                    database.getPointsOnMap.mockResolvedValue(mockPoints);

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 403, ERRORS.MAP.NO_ACCESS);
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeGetRequest({ id }),
                        ERRORS.MAP.INVALID_ID
                    );
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 200 and return all points for a map", async () => {
                    database.getPointsOnMap.mockResolvedValue(mockPoints);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.type).toEqual(expect.stringContaining("json"));
                    expect(response.body).toHaveProperty("points");
                    for (const point of mockPoints) {
                        expect(response.body.points).toContainEqual(point);
                    }
                });

                it("Should respond with 200 and return an empty list if there are no points on the map", async () => {
                    database.getPointsOnMap.mockResolvedValue([]);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.type).toEqual(expect.stringContaining("json"));
                    expect(response.body).toHaveProperty("points", []);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if an unexpected database error occurs", async () => {
                    database.getPointsOnMap.mockRejectedValueOnce(new Error("Database connection refused"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response);
                });
            });
        });

        describe("PUT /points/:pointID", () => {
            let rmSpy;
            const defaults = {
                id: randomId(),
                u: Math.random(),
                v: Math.random(),
                northDirection: Math.floor(Math.random() * 360),
                file: Buffer.from("equirectangularImage"),
                filename: "test_image.jpg",
                fileFieldName: "equirectangularImage"
            };

            const makePutRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.put(`/api/map-creator/points/${encodeURIComponent(id)}`),
                overrides,
                defaults
            );

            let mapId;
            let gameMapId;
            let northDirectionDB;
            let uDB;
            let vDB;
            let imageIdDB;
            const dbImageFilePath = "path/to/image.jpg";
            let newImageIdDB;

            beforeEach(() => {
                rmSpy = jest.spyOn(fs, "rm").mockResolvedValue(undefined);

                mapId = randomId();
                gameMapId = randomId();
                uDB = defaults.u < 0.5 ? defaults.u + 0.5 : defaults.u - 0.5;
                vDB = defaults.v < 0.5 ? defaults.v + 0.5 : defaults.v - 0.5;
                imageIdDB = randomId();
                newImageIdDB = imageIdDB + randomId();
                northDirectionDB = defaults.northDirection < 180
                    ? defaults.northDirection + 180
                    : defaults.northDirection - 180;

                database.insertImage.mockResolvedValue(newImageIdDB);
                database.getPointOnMapByCoordinates.mockResolvedValue([]);
                database.getPointInfo.mockResolvedValue({ point_id: defaults.id, point_u: uDB, point_v: vDB, north_direction: northDirectionDB, map_id: mapId, game_maps_id: gameMapId });
                database.getPointImage.mockResolvedValue({ image_id: imageIdDB, filepath: dbImageFilePath, width: 1000, height: 500 });
            });

            afterEach(() => {
                rmSpy.mockRestore();
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePutRequest());

                it("Should respond with 403 if it's not the user's point", async () => {
                    database.checkUserOwnsPoint.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expectErrorResponse(response, 403, ERRORS.POINT.NO_ACCESS);
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the point id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makePutRequest({ id }),
                        ERRORS.POINT.INVALID_ID
                    );
                });

                it("Should respond with 400 if a body is not provided", async () => {
                    const response = await makePutRequest({ u: undefined, v: undefined, northDirection: undefined, file: undefined });

                    expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_DATA);
                });

                describe("Test missing fields", () => {
                    const missingFields = [
                        { field: "u", overrides: { u: undefined }, errorMsg: ERRORS.POINT.UV_REQUIRED },
                        { field: "v", overrides: { v: undefined }, errorMsg: ERRORS.POINT.UV_REQUIRED },
                        { field: "northDirection", overrides: { northDirection: undefined }, errorMsg: ERRORS.POINT.NORTH_DIRECTION_REQUIRED }
                    ];

                    it.each(missingFields)("Should respond with 400 if $field is missing", async ({ overrides, errorMsg }) => {
                        const response = await makePutRequest(overrides);

                        expectErrorResponse(response, 400, errorMsg);
                    });
                });

                describe("Test UV validation", () => {
                    ["u", "v"].forEach((UorV) => {
                        it.each(invalidTypeNumbers)("Should respond with 400 if %s coordinate is invalid type", async (invalidUV) => {
                            const response = await makePutRequest({ [UorV]: invalidUV });

                            expectErrorResponse(response, 400, ERRORS.POINT.UV_INVALID_TYPE);
                        });

                        it.each(negativeNumbers)("Should respond with 400 if %s coordinate is negative", async (invalidUV) => {
                            const response = await makePutRequest({ [UorV]: invalidUV });

                            expectErrorResponse(response, 400, ERRORS.POINT.UV_MIN_ERROR);
                        });

                        it.each(tooBigUV)("Should respond with 400 if %s coordinate is too big", async (invalidUV) => {
                            const response = await makePutRequest({ [UorV]: invalidUV });

                            expectErrorResponse(response, 400, ERRORS.POINT.UV_MAX_ERROR);
                        });
                    });
                });

                describe("Test northDirection validation", () => {
                    it.each(invalidTypeNumbers)(`Should respond with 400 if northDirection is invalid type: '%s'`, async (invalidValue) => {
                        const response = await makePutRequest({ northDirection: invalidValue });

                        expectErrorResponse(response, 400, ERRORS.POINT.NORTH_DIRECTION_TYPE);
                    });

                    it.each(negativeNumbers)(`Should respond with 400 if northDirection is too small: '%s'`, async (invalidValue) => {
                        const response = await makePutRequest({ northDirection: invalidValue });

                        expectErrorResponse(response, 400, ERRORS.POINT.NORTH_DIRECTION_MIN);
                    });

                    it.each(tooBigDegrees)(`Should respond with 400 if northDirection is too big: '%s'`, async (invalidValue) => {
                        const response = await makePutRequest({ northDirection: invalidValue });

                        expectErrorResponse(response, 400, ERRORS.POINT.NORTH_DIRECTION_MAX);
                    });
                });

                describe("Test image validation", () => {
                    it("Should respond with 422, rollback and delete temp file if processImageMetadata fails", async () => {
                        processImageMetadata.mockRejectedValueOnce(new Error("Image processing failed"));

                        const response = await makePutRequest();

                        expect(processImageMetadata).toHaveBeenCalled();
                        expect(database.insertImage).not.toHaveBeenCalled();


                        expect(deleteFile).toHaveBeenCalled(); // temp uploaded file
                        expectRollback(mockConnection);
                        expectErrorResponse(response, 422, ERRORS.COMMON.IMAGE_PROCESSING_ERROR);
                    });

                    it("Should respond with 413 for images too large", async () => {
                        const tooBigFile = Buffer.alloc(11 * 1024 * 1024);

                        const response = await makePutRequest({ file: tooBigFile });

                        expectErrorResponse(response, 413, ERRORS.COMMON.FILE_TOO_LARGE);
                    });

                    it("Should respond with 415 if the image mimetype is invalid", async () => {
                        const response = await makePutRequest({ filename: "map.txt" });

                        expect(mockConnection.beginTransaction).not.toHaveBeenCalled();

                        expectErrorResponse(response, 415, ERRORS.COMMON.INVALID_IMAGE_TYPE);
                    });
                });
            });

            describe("Conflicts (404, 409)", () => {
                it("Should respond with 404 if the point doesn't exist somehow", async () => {
                    database.getPointInfo.mockResolvedValueOnce(null);

                    const response = await makePutRequest();

                    expectErrorResponse(response, 404, ERRORS.POINT.NOT_FOUND);
                });

                it("Should respond with 409 if the point already exists", async () => {
                    database.getPointOnMapByCoordinates.mockResolvedValueOnce([{ point_id: 55 }]);

                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, defaults.u, defaults.v);

                    expectErrorResponse(response, 409, ERRORS.POINT.ALREADY_EXISTS);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 204 and only change coordinates and north direction if those were provided", async () => {
                    const response = await makePutRequest({ file: undefined, fileFieldName: undefined, filename: undefined });

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, defaults.u, defaults.v);
                    expect(database.updatePointCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v);
                    expect(database.updatePointNorthDirection).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.northDirection);

                    expect(database.getPointImage).not.toHaveBeenCalled();

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and only change coordinates if that is different", async () => {
                    const response = await makePutRequest({ file: undefined, fileFieldName: undefined, filename: undefined, northDirection: northDirectionDB });

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, defaults.u, defaults.v);
                    expect(database.updatePointCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v);
                    expect(database.updatePointNorthDirection).not.toHaveBeenCalled();

                    expect(database.getPointImage).not.toHaveBeenCalled();

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and only change north direction if that is different", async () => {
                    const response = await makePutRequest({ file: undefined, fileFieldName: undefined, filename: undefined, u: uDB, v: vDB });

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.getPointOnMapByCoordinates).not.toHaveBeenCalledWith();
                    expect(database.updatePointCoordinates).not.toHaveBeenCalledWith();
                    expect(database.updatePointNorthDirection).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.northDirection);

                    expect(database.getPointImage).not.toHaveBeenCalled();

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and still update coordinates even if only u is different", async () => {
                    const response = await makePutRequest({ file: undefined, fileFieldName: undefined, filename: undefined, u: uDB, northDirection: northDirectionDB });

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, uDB, defaults.v);
                    expect(database.updatePointCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, uDB, defaults.v);
                    expect(database.updatePointNorthDirection).not.toHaveBeenCalled();

                    expect(database.getPointImage).not.toHaveBeenCalled();

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and still update coordinates even if only v is different", async () => {
                    const response = await makePutRequest({ file: undefined, fileFieldName: undefined, filename: undefined, v: vDB, northDirection: northDirectionDB });

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, defaults.u, vDB);
                    expect(database.updatePointCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, vDB);
                    expect(database.updatePointNorthDirection).not.toHaveBeenCalled();

                    expect(database.getPointImage).not.toHaveBeenCalled();

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 even if everything matched db and no updates were done", async () => {
                    const response = await makePutRequest({ file: undefined, fileFieldName: undefined, filename: undefined, v: vDB, u: uDB, northDirection: northDirectionDB });

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.getPointOnMapByCoordinates).not.toHaveBeenCalled();
                    expect(database.updatePointCoordinates).not.toHaveBeenCalled();
                    expect(database.updatePointNorthDirection).not.toHaveBeenCalled();

                    expect(database.getPointImage).not.toHaveBeenCalled();

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and handle everything correctly with correct given data", async () => {
                    const response = await makePutRequest();

                    expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, defaults.u, defaults.v);
                    expect(database.updatePointCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v);
                    expect(database.updatePointNorthDirection).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.northDirection);

                    expect(database.getPointImage).toHaveBeenCalledWith(defaults.id);
                    expect(processImageMetadata).toHaveBeenCalled();
                    expect(database.insertImage).toHaveBeenCalledWith(mockConnection, mockImageMetadata.width, mockImageMetadata.height, imageStatusForPath);
                    const outputDir = path.join(
                        gameMapId.toString(),
                        mapId.toString(),
                        "point_images",
                        defaults.id.toString()
                    );
                    expect(createWebpAndLowRes).toHaveBeenCalledWith({
                        inputFilePath: expect.any(String),
                        outputDirPath: expect.stringContaining(outputDir),
                        baseName: expect.stringContaining(`${defaults.id}_`)
                    });

                    expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, newImageIdDB, expect.stringContaining(mockImageProcessed.targetFileName));
                    expect(database.updatePointImage).toHaveBeenCalledWith(mockConnection, defaults.id, newImageIdDB);
                    expect(database.deleteImageById).toHaveBeenCalledWith(mockConnection, imageIdDB);
                    let expectedPath = path.join(dbImageFilePath);
                    expect(deleteImageAndLowResByMainPath).toHaveBeenCalledWith(expect.stringContaining(expectedPath));
                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String)); // temp uploaded file

                    expectSuccessfulTransaction(mockConnection);

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and round the north direction to two decimals", async () => {
                    const northDirection = 123.456789;
                    const northDirectionRounded = Number(northDirection.toFixed(2));
                    const response = await makePutRequest({ northDirection: northDirection });

                    expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, defaults.u, defaults.v);
                    expect(database.updatePointCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v);
                    expect(database.updatePointNorthDirection).toHaveBeenCalledWith(mockConnection, defaults.id, northDirectionRounded);

                    expect(database.getPointImage).toHaveBeenCalledWith(defaults.id);
                    expect(processImageMetadata).toHaveBeenCalled();
                    expect(database.insertImage).toHaveBeenCalledWith(mockConnection, mockImageMetadata.width, mockImageMetadata.height, imageStatusForPath);
                    const outputDir = path.join(
                        gameMapId.toString(),
                        mapId.toString(),
                        "point_images",
                        defaults.id.toString()
                    );
                    expect(createWebpAndLowRes).toHaveBeenCalledWith({
                        inputFilePath: expect.any(String),
                        outputDirPath: expect.stringContaining(outputDir),
                        baseName: expect.stringContaining(`${defaults.id}_`)
                    });

                    expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, newImageIdDB, expect.stringContaining(mockImageProcessed.targetFileName));
                    expect(database.updatePointImage).toHaveBeenCalledWith(mockConnection, defaults.id, newImageIdDB);
                    expect(database.deleteImageById).toHaveBeenCalledWith(mockConnection, imageIdDB);
                    let expectedPath = path.join(dbImageFilePath);
                    expect(deleteImageAndLowResByMainPath).toHaveBeenCalledWith(expect.stringContaining(expectedPath));
                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String)); // temp uploaded file

                    expectSuccessfulTransaction(mockConnection);

                    expect(response.statusCode).toBe(204);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500, rollback and delete temp file if updatePointCoordinates fails", async () => {
                    database.updatePointCoordinates.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(database.updatePointCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v);
                    expect(database.updatePointNorthDirection).not.toHaveBeenCalled();

                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.POINT.COORDINATES_UPDATE_FAILED);
                });

                it("Should respond with 500, rollback and delete temp file if updatePointNorthDirection fails", async () => {
                    database.updatePointNorthDirection.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(database.updatePointNorthDirection).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.northDirection);
                    expect(database.getPointImage).not.toHaveBeenCalled();

                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.POINT.NORTH_DIRECTION_UPDATE_FAILED);
                });

                it("Should respond with 500, rollback and delete files if updatePointImage fails", async () => {
                    database.updatePointImage.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(database.updatePointImage).toHaveBeenCalledWith(mockConnection, defaults.id, newImageIdDB);
                    expect(database.deleteImageById).not.toHaveBeenCalled();

                    expect(deleteFile).toHaveBeenCalledTimes(3); // because temp uploaded file, new processed image and low res
                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.POINT.IMAGE_PATH_UPDATE_FAILED);
                });

                it("Should respond with 500, rollback and delete files if deleteImageById fails", async () => {
                    database.deleteImageById.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(database.deleteImageById).toHaveBeenCalledWith(mockConnection, imageIdDB);
                    expect(deleteImageAndLowResByMainPath).not.toHaveBeenCalled();


                    expect(deleteFile).toHaveBeenCalledTimes(3); // because temp uploaded file, new processed image and low res
                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.POINT.OLD_IMAGE_DELETION_FAILED);
                });

                it("Should respond with 500, rollback and all files if database commit fails", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Image processing failed"));

                    const response = await makePutRequest();

                    expect(mockConnection.commit).toHaveBeenCalled();

                    expect(deleteFile).toHaveBeenCalledTimes(3); // because temp uploaded file, new processed image and low res
                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();
                    expectErrorResponse(response);
                });

                it("Should respond with 500, rollback and delete temp file if createWebpAndLowRes fails", async () => {
                    createWebpAndLowRes.mockRejectedValueOnce(new Error("Image processing failed"));

                    const response = await makePutRequest();

                    expect(createWebpAndLowRes).toHaveBeenCalled();
                    expect(database.updateImagePath).not.toHaveBeenCalled();


                    expect(deleteFile).toHaveBeenCalled(); // temp uploaded file
                    expectRollback(mockConnection);
                    expectErrorResponse(response);
                });

                it("Should still respond with 200 if deleting old image deleteImageAndLowResByMainPath failed but should console.error it", async () => {
                    deleteImageAndLowResByMainPath.mockRejectedValueOnce(new Error("Image processing failed"));

                    const response = await makePutRequest();

                    expect(deleteImageAndLowResByMainPath).toHaveBeenCalled();
                    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("unsuccessful deletion"));
                    expect(console.error).toHaveBeenCalledWith(expect.stringContaining(path.join(dbImageFilePath)));
                    expect(deleteFile).toHaveBeenCalled(); // temp uploaded file

                    expectSuccessfulTransaction(mockConnection);

                    expect(response.statusCode).toBe(204);
                });

                it("Should still respond with 200 if deleting temporary file failed but should console.error it", async () => {
                    deleteFile.mockRejectedValueOnce(new Error("Image deletion failed"));

                    const response = await makePutRequest();

                    expect(deleteImageAndLowResByMainPath).toHaveBeenCalled();
                    expect(console.error).toHaveBeenCalledWith(
                        expect.stringContaining("Failed to delete temporary file"),
                        expect.any(Error)
                    );
                    expect(deleteFile).toHaveBeenCalled(); // temp uploaded file

                    expectSuccessfulTransaction(mockConnection);

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 413 for images too large", async () => {
                    const tooBigFile = Buffer.alloc(11 * 1024 * 1024);

                    const response = await makePutRequest({ file: tooBigFile });

                    expectErrorResponse(response, 413, ERRORS.COMMON.FILE_TOO_LARGE);
                });

                it("Should respond with 400 for unexpected multer errors", async () => {
                    const response = await makePutRequest({ fileFieldName: "wrongFieldName" });

                    expectErrorResponse(response, 400, ERRORS.COMMON.FILE_UPLOAD_ERROR);
                });
            });
        });

        describe("POST /maps/:mapID/points", () => {
            const defaults = {
                id: randomId(),
                u: Math.random(),
                v: Math.random(),
                northDirection: Math.floor(Math.random() * 360),
                file: Buffer.from("equirectangularImage"),
                filename: "test_image.jpg",
                fileFieldName: "equirectangularImage"
            };

            const makePostRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.post(`/api/map-creator/maps/${encodeURIComponent(id)}/points`),
                overrides,
                defaults
            );

            const imageId = randomId();
            const pointId = randomId();

            beforeEach(() => {
                database.getGameMapIdByMapId.mockResolvedValue(randomId());
                database.getPointOnMapByCoordinates.mockResolvedValue([]);
                database.insertImage.mockResolvedValue(imageId);
                database.insertPoint.mockResolvedValue(pointId);
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePostRequest());

                it("Should respond with 403 if it's not the user's map", async () => {
                    database.checkUserOwnsMap.mockResolvedValueOnce(false);

                    const response = await makePostRequest();

                    expectErrorResponse(response, 403, ERRORS.MAP.NO_ACCESS);
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {

                it("Should respond with 400 if the map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makePostRequest({ id }),
                        ERRORS.MAP.INVALID_ID
                    );
                });

                it("Should respond with 400 if a body is not provided", async () => {
                    const response = await makePostRequest({ u: undefined, v: undefined, northDirection: undefined, file: undefined });

                    expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_DATA);
                });

                describe("Test missing fields", () => {
                    const missingFields = [
                        { field: "u", overrides: { u: undefined }, errorMsg: ERRORS.POINT.UV_REQUIRED },
                        { field: "v", overrides: { v: undefined }, errorMsg: ERRORS.POINT.UV_REQUIRED },
                        { field: "northDirection", overrides: { northDirection: undefined }, errorMsg: ERRORS.POINT.NORTH_DIRECTION_REQUIRED }
                    ];

                    it.each(missingFields)("Should respond with 400 if $field is missing", async ({ overrides, errorMsg }) => {
                        const response = await makePostRequest(overrides);

                        expectErrorResponse(response, 400, errorMsg);
                        expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                    });
                });

                describe("Test UV validation", () => {
                    ["u", "v"].forEach((UorV) => {
                        it.each(invalidTypeNumbers)("Should respond with 400 if %s coordinate is invalid type", async (invalidUV) => {
                            const response = await makePostRequest({ [UorV]: invalidUV });

                            expectErrorResponse(response, 400, ERRORS.POINT.UV_INVALID_TYPE);
                        });

                        it.each(negativeNumbers)("Should respond with 400 if %s coordinate is negative", async (invalidUV) => {
                            const response = await makePostRequest({ [UorV]: invalidUV });

                            expectErrorResponse(response, 400, ERRORS.POINT.UV_MIN_ERROR);
                        });

                        it.each(tooBigUV)("Should respond with 400 if %s coordinate is too big", async (invalidUV) => {
                            const response = await makePostRequest({ [UorV]: invalidUV });

                            expectErrorResponse(response, 400, ERRORS.POINT.UV_MAX_ERROR);
                        });
                    });
                });

                describe("Test northDirection validation", () => {
                    it.each(invalidTypeNumbers)(`Should respond with 400 if northDirection is invalid type: '%s'`, async (invalidValue) => {
                        const response = await makePostRequest({ northDirection: invalidValue });

                        expectErrorResponse(response, 400, ERRORS.POINT.NORTH_DIRECTION_TYPE);
                    });

                    it.each(negativeNumbers)(`Should respond with 400 if northDirection is too small: '%s'`, async (invalidValue) => {
                        const response = await makePostRequest({ northDirection: invalidValue });

                        expectErrorResponse(response, 400, ERRORS.POINT.NORTH_DIRECTION_MIN);
                    });

                    it.each(tooBigDegrees)(`Should respond with 400 if northDirection is too big: '%s'`, async (invalidValue) => {
                        const response = await makePostRequest({ northDirection: invalidValue });

                        expectErrorResponse(response, 400, ERRORS.POINT.NORTH_DIRECTION_MAX);
                    });
                });

                describe("Test image validation", () => {
                    it("Should respond with 400 if no image was provided", async () => {
                        const response = await makePostRequest({ file: undefined });

                        expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_IMAGE);
                        expect(deleteFile).not.toHaveBeenCalled();
                    });

                    it("Should respond with 413 for images too large", async () => {
                        const tooBigFile = Buffer.alloc(11 * 1024 * 1024);

                        const response = await makePostRequest({ file: tooBigFile });

                        expectErrorResponse(response, 413, ERRORS.COMMON.FILE_TOO_LARGE);
                    });

                    it("Should respond with 422 if the image processing failed", async () => {
                        processImageMetadata.mockRejectedValueOnce(new Error("Image processing failed"));

                        const response = await makePostRequest();

                        expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                        expect(deleteFile).toHaveBeenCalledWith(expect.any(String));

                        expectErrorResponse(response, 422, ERRORS.COMMON.IMAGE_PROCESSING_ERROR);
                    });

                    it("Should respond with 400 for unexpected multer errors", async () => {
                        const response = await makePostRequest({ fileFieldName: "wrongFieldName" });

                        expectErrorResponse(response, 400, ERRORS.COMMON.FILE_UPLOAD_ERROR);
                    });

                    it("Should respond with 415 if the image mimetype is invalid", async () => {
                        const response = await makePostRequest({ filename: "map.txt", file: Buffer.from("notanimage") });

                        expect(mockConnection.beginTransaction).not.toHaveBeenCalled();

                        expectErrorResponse(response, 415, ERRORS.COMMON.INVALID_IMAGE_TYPE);
                    });
                });
            });

            describe("Conflicts (404, 409)", () => {
                it("Should respond with 409 if the point already exists", async () => {
                    database.getPointOnMapByCoordinates.mockResolvedValueOnce([{ point_id: 55 }]);

                    const response = await makePostRequest();

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v);

                    expectErrorResponse(response, 409, ERRORS.POINT.ALREADY_EXISTS);
                    expect(deleteFile).toHaveBeenCalled();
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 201 if everything was successful", async () => {
                    const response = await makePostRequest();

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v);
                    expect(database.insertImage).toHaveBeenCalledWith(mockConnection, mockImageMetadata.width, mockImageMetadata.height, imageStatusForPath);
                    expect(database.insertPoint).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v, defaults.northDirection, imageId);
                    expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, imageId, expect.any(String));
                    expectSuccessfulTransaction(mockConnection);

                    expect(response.statusCode).toBe(201);
                    expect(response.body).toHaveProperty("pointId", pointId);
                    expect(deleteFile).toHaveBeenCalled();
                });

                it("Should respond with 201 and round the north direction to two decimals", async () => {
                    const northDirection = 123.456789;
                    const northDirectionRounded = Number(northDirection.toFixed(2));
                    const response = await makePostRequest({ northDirection: northDirection });

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v);
                    expect(database.insertImage).toHaveBeenCalledWith(mockConnection, mockImageMetadata.width, mockImageMetadata.height, imageStatusForPath);
                    expect(database.insertPoint).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v, northDirectionRounded, imageId);
                    expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, imageId, expect.any(String));
                    expectSuccessfulTransaction(mockConnection);

                    expect(response.statusCode).toBe(201);
                    expect(response.body).toHaveProperty("pointId", pointId);
                    expect(deleteFile).toHaveBeenCalled();
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if database refused connection", async () => {
                    database.getConnection.mockRejectedValueOnce(new Error("Database connection refused"));

                    const response = await makePostRequest();

                    expect(deleteFile).toHaveBeenCalled();
                    expectErrorResponse(response);
                });

                it("Should respond with 500 if getGameMapIdByMapId fails with null", async () => {
                    database.getGameMapIdByMapId.mockResolvedValueOnce(null);

                    const response = await makePostRequest();

                    expect(deleteFile).toHaveBeenCalled();
                    expectErrorResponse(response);
                });

                it("Should respond with 500 if getGameMapIdByMapId fails with error", async () => {
                    database.getGameMapIdByMapId.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expect(deleteFile).toHaveBeenCalled();
                    expectErrorResponse(response);
                });

                it("Should respond with 500 if insertImage failed", async () => {
                    database.insertImage.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expectRollback(mockConnection);
                    expect(deleteFile).toHaveBeenCalled();
                    expectErrorResponse(response);
                });

                it("Should respond with 500 if insertPoint failed", async () => {
                    database.insertPoint.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expectRollback(mockConnection);
                    expect(deleteFile).toHaveBeenCalled();
                    expectErrorResponse(response, 500);
                });

                it("Should respond with 500 if updateImagePath failed", async () => {
                    database.updateImagePath.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expectRollback(mockConnection);
                    expect(deleteFile).toHaveBeenCalledTimes(3); // 3 because mainPath, lowResPath, temp uploaded file
                    expectErrorResponse(response);
                });

                it("Should respond with 500 if database commit failed", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();
                    expect(deleteFile).toHaveBeenCalledTimes(3); // 3 because mainPath, lowResPath, temp uploaded file
                    expectErrorResponse(response);
                });

                it("Should respond with 500 if database rollback failed and still delete files", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error"));
                    mockConnection.rollback.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(deleteFile).toHaveBeenCalledTimes(3); // 3 because mainPath, lowResPath, temp uploaded file
                    expect(console.error).toHaveBeenCalledWith(
                        expect.stringContaining("Database rollback failed"),
                        expect.any(Error)
                    );
                    expectErrorResponse(response);
                });

                it("Should respond with 500 if image conversion failed", async () => {
                    createWebpAndLowRes.mockRejectedValueOnce(new Error("Image processing failed"));

                    const response = await makePostRequest();

                    expectRollback(mockConnection);
                    expect(deleteFile).toHaveBeenCalled();
                    expectErrorResponse(response);
                });

                it("Should still respond with 201 even if temporary file deletion failed", async () => {
                    deleteFile.mockRejectedValueOnce(new Error("Failed to delete temporary file"));

                    const response = await makePostRequest();

                    expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v);
                    expect(database.insertImage).toHaveBeenCalledWith(mockConnection, mockImageMetadata.width, mockImageMetadata.height, imageStatusForPath);
                    expect(database.insertPoint).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v, defaults.northDirection, imageId);
                    expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, imageId, expect.any(String));
                    expect(mockConnection.commit).toHaveBeenCalled();
                    expect(mockConnection.rollback).not.toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();

                    expect(response.statusCode).toBe(201);
                    expect(response.body).toHaveProperty("pointId", pointId);
                    expect(deleteFile).toHaveBeenCalled();
                    expect(console.error).toHaveBeenCalledWith(
                        expect.stringContaining("Failed to delete temporary file"),
                        expect.any(Error)
                    );
                });
            });
        });

        describe("DELETE /points/:pointID", () => {
            let rmSpy;
            const defaults = {
                id: randomId()
            };

            const makeDeleteRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.delete(`/api/map-creator/points/${encodeURIComponent(id)}`),
                overrides,
                defaults
            );

            let mapId;
            let gameMapId;
            let northDirection;
            let u;
            let v;
            let imageId;

            beforeEach(() => {
                rmSpy = jest.spyOn(fs, "rm").mockResolvedValue(undefined);
                mapId = randomId();
                gameMapId = randomId();
                u = Math.random();
                v = Math.random();
                imageId = randomId();
                northDirection = Math.floor(Math.random() * 360);
                database.getPointInfo.mockResolvedValue({ point_id: defaults.id, point_u: u, point_v: v, north_direction: northDirection, map_id: mapId, game_maps_id: gameMapId });
                database.getPointImage.mockResolvedValue({ image_id: imageId, filepath: "path/to/image.jpg", width: 1000, height: 500 });
            });

            afterEach(() => {
                rmSpy.mockRestore();
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makeDeleteRequest());

                it("Should respond with 403 if it's not the user's point", async () => {
                    database.checkUserOwnsPoint.mockResolvedValueOnce(false);

                    const response = await makeDeleteRequest();

                    expectErrorResponse(response, 403, ERRORS.POINT.NO_ACCESS);
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the point id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeDeleteRequest({ id }),
                        ERRORS.POINT.INVALID_ID
                    );
                });
            });

            describe("Conflicts (404)", () => {
                it("Should respond with 404 if the point doesn't exist somehow", async () => {
                    database.getPointInfo.mockResolvedValueOnce(null);

                    const response = await makeDeleteRequest();

                    expectErrorResponse(response, 404, ERRORS.POINT.NOT_FOUND);
                });
            });

            describe("Happy paths (204)", () => {
                it("Should respond with 204 if everything was successful", async () => {
                    const response = await makeDeleteRequest();

                    expect(database.deleteImageById).toHaveBeenCalledWith(mockConnection, imageId);
                    expect(database.deletePointById).toHaveBeenCalledWith(mockConnection, defaults.id);
                    expect(fs.rm).toHaveBeenCalledWith(
                        expect.stringContaining(
                            path.join(
                                gameMapId.toString(),
                                mapId.toString()),
                            "point_images",
                            defaults.id.toString()
                        ),
                        { recursive: true, force: true }
                    );
                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 even if the point had no image in database", async () => {
                    database.getPointImage.mockResolvedValueOnce(null);

                    const response = await makeDeleteRequest();

                    expect(database.deleteImageById).not.toHaveBeenCalled();
                    expect(database.deletePointById).toHaveBeenCalledWith(mockConnection, defaults.id);
                    const expectedPath = path.join(
                        gameMapId.toString(),
                        mapId.toString(),
                        "point_images",
                        defaults.id.toString()
                    );
                    expect(fs.rm).toHaveBeenCalledWith(
                        expect.stringContaining(expectedPath),
                        { recursive: true, force: true }
                    );
                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
                });

                describe("Happy path with deletion failure", () => {
                    suppressConsoleErrors();

                    it("Should respond with 204 even if the image file deletion failed but should log", async () => {
                        database.getPointImage.mockResolvedValueOnce(null);
                        const errorMessage = "fs remove fail";
                        rmSpy.mockRejectedValueOnce(new Error(errorMessage));

                        const response = await makeDeleteRequest();

                        expect(database.deleteImageById).not.toHaveBeenCalled();
                        expect(database.deletePointById).toHaveBeenCalledWith(mockConnection, defaults.id);
                        const expectedPath = path.join(
                            gameMapId.toString(),
                            mapId.toString(),
                            "point_images",
                            defaults.id.toString()
                        );
                        expect(fs.rm).toHaveBeenCalledWith(
                            expect.stringContaining(expectedPath),
                            { recursive: true, force: true }
                        );
                        expect(console.error).toHaveBeenCalledWith(expect.stringContaining(expectedPath));
                        expect(console.error).toHaveBeenCalledWith(expect.stringContaining(errorMessage));
                        expectSuccessfulTransaction(mockConnection);
                        expect(response.statusCode).toBe(204);
                    });
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if the database refused connection", async () => {
                    database.getConnection.mockRejectedValueOnce(new Error("Database connection refused"));
                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response);
                });

                it("Should respond with 500 if getPointInfo failed", async () => {
                    database.getPointInfo.mockRejectedValueOnce(new Error("Database connection refused"));
                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response);
                });

                it("Should respond with 500 if getPointImage failed", async () => {
                    database.getPointImage.mockRejectedValueOnce(new Error("Database connection refused"));
                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response);
                });

                it("Should respond with 500 and rollback if deleteImageById failed", async () => {
                    database.deleteImageById.mockResolvedValueOnce(false);
                    const response = await makeDeleteRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.POINT.IMAGE_DELETION_FAILED);
                });

                it("Should respond with 500 and rollback if deletePointById failed", async () => {
                    database.deletePointById.mockResolvedValueOnce(false);
                    const response = await makeDeleteRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.POINT.DELETE_FAILED);
                });

                it("Should respond with 500 and rollback if database commit failed", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error"));
                    const response = await makeDeleteRequest();

                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();
                    expectErrorResponse(response);
                });
            });
        });
    });
});
