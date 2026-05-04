const { createTestApp } = require("./helpers/setup-test.js");
const {
    randomId,
    buildRequest,
    testInvalidIDs,
    expectErrorResponse,
    suppressConsoleErrors,
    testRequiresAuth,
    expectRollback,
    expectSuccessfulTransaction
} = require("#testhelpers/helpers.js");
const { invalidTypeNumbers, invalidIds, invalidCharForHungarian } = require("#testhelpers/test-data.js");

const express = require("express");
const ERRORS = require("#utils/error-messages.js");

const database = require("#gamemaps/cover-image/cover-image.queries.js");
const { mockConnection, getConnection } = require("#sql/database.js");

const { checkUserOwnsGameMap } = require("#sharedapi/queries/ownership.queries.js");

const { doesGameMapExist } = require("#gamemaps/shared/queries/gamemaps.queries.js");

const imageQueries = require("#imagequeries");

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

const { UPLOAD_ROOT_MAP_DATA } = require("#config/mapdatas-upload-config.js");
const { LOW_RES_SUFFIX } = require("#config/image-config.js");

const path = require("path");

const requestWithSupertest = createTestApp();

describe("Game Maps API - /api/game-maps/", () => {
    describe("Cover Image Endpoints", () => {
        describe("GET /:gameMapID/cover-image", () => {
            const defaults = {
                id: randomId()
            };

            const mockImageData = {
                image_id: 1,
                filepath: "user1/gamemap1/cover.jpg",
                width: 1920,
                height: 1080
            };

            let sendFileSpy;

            const makeGetRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.get(`/api/game-maps/${encodeURIComponent(id)}/cover-image`),
                overrides,
                defaults
            );

            beforeAll(() => {
                sendFileSpy = jest.spyOn(express.response, "sendFile").mockImplementation(function (path, options, cb) {
                    this.status(200).send(Buffer.from("mock-image-data"));
                    if (cb) {
                        cb();
                    }
                });
            });

            afterAll(() => {
                sendFileSpy.mockRestore();
            });

            beforeEach(() => {
                database.getGameMapCoverImage.mockResolvedValue(mockImageData);
                sendFileSpy.mockClear();
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeGetRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });

                describe("Test resolution query", () => {
                    it.each([...invalidTypeNumbers, ...invalidCharForHungarian, "invalid_res", 123])("Should respond with 400 if the resolution query is invalid: %s", async (invalidResolution) => {
                        const response = await makeGetRequest({ query: { resolution: invalidResolution } });

                        expectErrorResponse(response, 400, ERRORS.COMMON.INVALID_RESOLUTION);
                    });
                });
            });

            describe("Conflicts (404, 409)", () => {
                it("Should respond with 404 if the file does not actually exist on the disk", async () => {
                    sendFileSpy.mockImplementationOnce(function (path, options, cb) {
                        if (cb) {
                            cb(new Error("ENOENT: no such file or directory"));
                        }
                    });

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 404, ERRORS.COMMON.FILE_NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 200, return the image, and send headers if no resolution query is provided", async () => {
                    const response = await makeGetRequest();

                    expect(database.getGameMapCoverImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.stringContaining(mockImageData.filepath),
                        {
                            root: UPLOAD_ROOT_MAP_DATA
                        },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);
                    expect(response.headers["access-control-expose-headers"]).toContain("imageWidth");
                    expect(response.headers["access-control-expose-headers"]).toContain("imageHeight");
                    expect(response.headers["imagewidth"]).toBe(mockImageData.width.toString());
                    expect(response.headers["imageheight"]).toBe(mockImageData.height.toString());
                });

                it("Should respond with 200 and return the default cover image if the database returns null", async () => {
                    database.getGameMapCoverImage.mockResolvedValueOnce(null);

                    const response = await makeGetRequest();

                    expect(database.getGameMapCoverImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.stringContaining("not_found.webp"),
                        {
                            root: UPLOAD_ROOT_MAP_DATA
                        },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);
                    expect(response.headers["imagewidth"]).toBe("750");
                    expect(response.headers["imageheight"]).toBe("545");
                });

                it("Should respond with 200 and process the resolution query properly if provided", async () => {
                    const response = await makeGetRequest({ query: { resolution: "low" } });

                    expect(database.getGameMapCoverImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.stringContaining(LOW_RES_SUFFIX),
                        {
                            root: UPLOAD_ROOT_MAP_DATA
                        },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);
                    expect(response.headers["imagewidth"]).toBe(mockImageData.width.toString());
                    expect(response.headers["imageheight"]).toBe(mockImageData.height.toString());
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if there is an unexpected database error during getGameMapCoverImage", async () => {
                    database.getGameMapCoverImage.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });

        describe("PUT /:gameMapID/cover-image", () => {
            const defaults = {
                id: randomId(),
                file: Buffer.from("coverImage"),
                filename: "cover.jpg",
                fileFieldName: "coverImage"
            };

            const makePutRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.put(`/api/game-maps/${encodeURIComponent(id)}/cover-image`),
                overrides,
                defaults
            );

            let imageIdDB;
            let oldImageIdDB;
            const dbOldImageFilePath = "user1/gamemap1/old_cover.jpg";

            beforeEach(() => {
                imageIdDB = randomId();
                oldImageIdDB = randomId();

                database.getGameMapCoverImage.mockResolvedValue(null);

                imageQueries.insertImage.mockResolvedValue(imageIdDB);
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePutRequest());

                it("Should respond with 403 if it's not the user's game map", async () => {
                    checkUserOwnsGameMap.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expectErrorResponse(response, 403, ERRORS.GAMEMAP.NO_ACCESS);
                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makePutRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });

                it("Should respond with 400 if the image file is not provided", async () => {
                    const response = await makePutRequest({ file: undefined });

                    expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_IMAGE);
                });

                it("Should respond with 400 for unexpected multer errors", async () => {
                    const response = await makePutRequest({ fileFieldName: "wrongFieldName" });

                    expectErrorResponse(response, 400, ERRORS.COMMON.FILE_UPLOAD_ERROR);
                });

                it("Should respond with 413 for images too large", async () => {
                    const tooBigFile = Buffer.alloc(11 * 1024 * 1024);

                    const response = await makePutRequest({ file: tooBigFile });

                    expectErrorResponse(response, 413, ERRORS.COMMON.FILE_TOO_LARGE);
                });

                it("Should respond with 415 if the image mimetype is invalid", async () => {
                    const response = await makePutRequest({ filename: "image.txt", file: Buffer.from("notanimage") });

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();

                    expectErrorResponse(response, 415, ERRORS.COMMON.INVALID_IMAGE_TYPE);
                });

                it("Should respond with 422, rollback and delete temp file if processImageMetadata fails", async () => {
                    processImageMetadata.mockRejectedValueOnce(new Error("Image processing failed"));

                    const response = await makePutRequest();

                    expect(processImageMetadata).toHaveBeenCalled();
                    expect(imageQueries.insertImage).not.toHaveBeenCalled();

                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 422, ERRORS.COMMON.IMAGE_PROCESSING_ERROR);
                });
            });

            describe("Conflicts (404, 409)", () => {
                it("Should respond with 404 if the game map does not exist somehow", async () => {
                    doesGameMapExist.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                    expectErrorResponse(response, 404, ERRORS.GAMEMAP.NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 204 and handle everything correctly when there is no old cover image", async () => {
                    const response = await makePutRequest();

                    expect(imageQueries.insertImage).toHaveBeenCalledWith(mockConnection, mockImageMetadata.width, mockImageMetadata.height, "pending");
                    expect(createWebpAndLowRes).toHaveBeenCalledWith({
                        inputFilePath: expect.any(String),
                        outputDirPath: expect.any(String),
                        baseName: expect.stringContaining(defaults.id.toString())
                    });

                    expect(imageQueries.updateImagePath).toHaveBeenCalledWith(mockConnection, imageIdDB, expect.stringContaining(mockImageProcessed.targetFileName));
                    expect(database.updateGameMapCoverImage).toHaveBeenCalledWith(mockConnection, defaults.id, imageIdDB);

                    expect(imageQueries.deleteImageById).not.toHaveBeenCalled();
                    expect(deleteImageAndLowResByMainPath).not.toHaveBeenCalled();
                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String));

                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and handle everything correctly when replacing an existing cover image", async () => {
                    database.getGameMapCoverImage.mockResolvedValueOnce({ image_id: oldImageIdDB, filepath: dbOldImageFilePath });

                    const response = await makePutRequest();

                    expect(database.updateGameMapCoverImage).toHaveBeenCalledWith(mockConnection, defaults.id, imageIdDB);
                    expect(imageQueries.deleteImageById).toHaveBeenCalledWith(mockConnection, oldImageIdDB);
                    expect(deleteImageAndLowResByMainPath).toHaveBeenCalledWith(expect.stringContaining(path.join(dbOldImageFilePath)));
                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String));

                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
                });

                describe("Happy paths with deletion failures", () => {
                    suppressConsoleErrors();

                    it("Should still respond with 204 if deleting old image deleteImageAndLowResByMainPath failed but should console.error it", async () => {
                        database.getGameMapCoverImage.mockResolvedValueOnce({ image_id: oldImageIdDB, filepath: dbOldImageFilePath });
                        deleteImageAndLowResByMainPath.mockRejectedValueOnce(new Error("Image deletion failed"));

                        const response = await makePutRequest();

                        expect(deleteImageAndLowResByMainPath).toHaveBeenCalled();
                        expect(console.error).toHaveBeenCalledWith(expect.stringContaining("unsuccessful deletion"), expect.any(String));
                        expect(deleteFile).toHaveBeenCalled();

                        expectSuccessfulTransaction(mockConnection);
                        expect(response.statusCode).toBe(204);
                    });

                    it("Should still respond with 204 if deleting temporary file failed but should console.error it", async () => {
                        deleteFile.mockRejectedValueOnce(new Error("File deletion failed"));

                        const response = await makePutRequest();

                        expect(console.error).toHaveBeenCalledWith(
                            expect.stringContaining("Failed to delete temporary file"),
                            expect.any(Error)
                        );
                        expect(deleteFile).toHaveBeenCalled();

                        expectSuccessfulTransaction(mockConnection);
                        expect(response.statusCode).toBe(204);
                    });
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it.each([
                    { name: 'doesGameMapExist', databaseFunction: doesGameMapExist },
                    { name: 'checkUserOwnsGameMap', databaseFunction: checkUserOwnsGameMap },
                    { name: 'getConnection', databaseFunction: getConnection }
                ])("Should respond with 500 and delete temp file if there is an unexpected database error during: $name", async ({ databaseFunction }) => {
                    databaseFunction.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500, rollback and delete temp file if imageQueries.insertImage fails", async () => {
                    imageQueries.insertImage.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePutRequest();

                    expectRollback(mockConnection);
                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500, rollback and delete temp file if createWebpAndLowRes fails", async () => {
                    createWebpAndLowRes.mockRejectedValueOnce(new Error("Image processing failed"));

                    const response = await makePutRequest();

                    expect(createWebpAndLowRes).toHaveBeenCalled();
                    expect(imageQueries.updateImagePath).not.toHaveBeenCalled();

                    expectRollback(mockConnection);
                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                    expectErrorResponse(response);
                });

                it("Should respond with 500, rollback and delete files if imageQueries.updateImagePath fails", async () => {
                    imageQueries.updateImagePath.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(imageQueries.updateImagePath).toHaveBeenCalledWith(mockConnection, imageIdDB, expect.any(String));

                    expectRollback(mockConnection);
                    expect(deleteFile).toHaveBeenCalledTimes(3); // 3 because temp file, mainPath, lowResPath
                    expectErrorResponse(response, 500, ERRORS.GAMEMAP.COVER_IMAGE_UPDATE_FAILED);
                });

                it("Should respond with 500, rollback and delete files if updateGameMapCoverImage fails", async () => {
                    database.updateGameMapCoverImage.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(database.updateGameMapCoverImage).toHaveBeenCalledWith(mockConnection, defaults.id, imageIdDB);

                    expectRollback(mockConnection);
                    expect(deleteFile).toHaveBeenCalledTimes(3); // 3 because temp file, mainPath, lowResPath
                    expectErrorResponse(response, 500, ERRORS.GAMEMAP.COVER_IMAGE_UPDATE_FAILED);
                });

                it("Should respond with 500, rollback and delete files if imageQueries.deleteImageById fails", async () => {
                    database.getGameMapCoverImage.mockResolvedValueOnce({ image_id: oldImageIdDB, filepath: dbOldImageFilePath });
                    imageQueries.deleteImageById.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(imageQueries.deleteImageById).toHaveBeenCalledWith(mockConnection, oldImageIdDB);

                    expectRollback(mockConnection);
                    expect(deleteFile).toHaveBeenCalledTimes(3); // 3 because temp file, mainPath, lowResPath
                    expectErrorResponse(response, 500, ERRORS.GAMEMAP.COVER_IMAGE_UPDATE_FAILED);
                });

                it("Should respond with 500, rollback and delete all files if database commit fails", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(mockConnection.commit).toHaveBeenCalled();
                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();

                    expect(deleteFile).toHaveBeenCalledTimes(3); // 3 because temp file, mainPath, lowResPath
                    expectErrorResponse(response);
                });
            });
        });

        describe("DELETE /:gameMapID/cover-image", () => {
            const defaults = {
                id: randomId()
            };

            const makeDeleteRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.delete(`/api/game-maps/${encodeURIComponent(id)}/cover-image`),
                overrides,
                defaults
            );

            let dbCoverImage;

            beforeEach(() => {
                dbCoverImage = {
                    image_id: randomId(),
                    filepath: "user1/gamemap1/cover.jpg"
                };

                database.getGameMapCoverImage.mockResolvedValue(dbCoverImage);
                deleteImageAndLowResByMainPath.mockResolvedValue();
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makeDeleteRequest());

                it("Should respond with 403 if it's not the user's game map", async () => {
                    checkUserOwnsGameMap.mockResolvedValueOnce(false);

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 403, ERRORS.GAMEMAP.NO_ACCESS);
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeDeleteRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });
            });

            describe("Conflicts (404, 409)", () => {
                it("Should respond with 404 if the game map has no cover image", async () => {
                    database.getGameMapCoverImage.mockResolvedValueOnce(null);

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 404, ERRORS.GAMEMAP.COVER_IMAGE_NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 204 and successfully delete the cover image from the database and the filesystem", async () => {
                    const response = await makeDeleteRequest();

                    expect(imageQueries.deleteImageById).toHaveBeenCalledWith(mockConnection, dbCoverImage.image_id);
                    expect(deleteImageAndLowResByMainPath).toHaveBeenCalledWith(expect.stringContaining(path.normalize(dbCoverImage.filepath)));

                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and successfully delete the cover image from the database without deleting files if filepath is pending", async () => {
                    database.getGameMapCoverImage.mockResolvedValueOnce({ image_id: dbCoverImage.image_id, filepath: "pending" });

                    const response = await makeDeleteRequest();

                    expect(imageQueries.deleteImageById).toHaveBeenCalledWith(mockConnection, dbCoverImage.image_id);
                    expect(deleteImageAndLowResByMainPath).not.toHaveBeenCalled();

                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
                });

                describe("Happy paths with deletion failure", () => {
                    suppressConsoleErrors();

                    it("Should respond with 204 even if filesystem deletion throws an error but should console.error it", async () => {
                        const errorMsg = "Filesystem error";
                        deleteImageAndLowResByMainPath.mockRejectedValueOnce(new Error(errorMsg));

                        const response = await makeDeleteRequest();

                        expect(imageQueries.deleteImageById).toHaveBeenCalledWith(mockConnection, dbCoverImage.image_id);
                        expect(deleteImageAndLowResByMainPath).toHaveBeenCalled();
                        expect(console.error).toHaveBeenCalledWith(
                            expect.stringContaining("unsuccessful deletion"),
                            expect.stringContaining(errorMsg)
                        );

                        expectSuccessfulTransaction(mockConnection);
                        expect(response.statusCode).toBe(204);
                    });
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it.each([
                    { name: 'checkUserOwnsGameMap', databaseFunction: checkUserOwnsGameMap },
                    { name: 'database.getGameMapCoverImage', databaseFunction: database.getGameMapCoverImage },
                    { name: 'getConnection', databaseFunction: getConnection }
                ])("Should respond with 500 if there is an unexpected database error during: $name", async ({ databaseFunction }) => {
                    databaseFunction.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if imageQueries.deleteImageById returns false", async () => {
                    imageQueries.deleteImageById.mockResolvedValueOnce(false);

                    const response = await makeDeleteRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.GAMEMAP.COVER_IMAGE_DELETE_FAILED);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during imageQueries.deleteImageById", async () => {
                    imageQueries.deleteImageById.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeDeleteRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during commit", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(mockConnection.commit).toHaveBeenCalled();
                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });
    });
});
