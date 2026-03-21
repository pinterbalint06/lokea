require("./helpers/setup-mocks.js");

const { createTestApp } = require("./helpers/setup-test.js");
const { testInvalidIDs, testRequiresAuth, expectSuccessfulTransaction, expectRollback, expectErrorResponse, randomId, buildRequest, suppressConsoleErrors } = require("./helpers/helpers.js");
const { invalidUVs, invalidDegrees, mockImageMetadata, imageStatusForPath } = require("./helpers/test-data.js");
const database = require("../../sql/database.js");
const { mockConnection } = require("./helpers/mock-database.js");
const { processImageMetadata, createWebpAndLowRes } = require("../../utils/imageProcessor.js");
const { deleteFile } = require("../../utils/fileUtils.js");
const fs = require("fs/promises");
const path = require("path");


const requestWithSupertest = createTestApp();

describe("Map Creator API - Point Endpoints - /api/map-creator/", () => {
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

        beforeEach(() => {
            jest.clearAllMocks();
            database.checkUserOwnsMap.mockResolvedValue(true);
        });

        testRequiresAuth(() => makeGetRequest());

        it("Should respond with 400 if the map id is incorrect", async () => {
            await testInvalidIDs(
                (id) => makeGetRequest({ id }),
                "Helytelen térkép ID"
            );
        });

        it("Should return all points for a map", async () => {
            database.getPointsOnMap.mockResolvedValue(mockPoints);

            const response = await makeGetRequest();

            expect(response.statusCode).toBe(200);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("points");
            for (const point of mockPoints) {
                expect(response.body.points).toContainEqual(point);
            }
        });

        it("Should return an empty list if there are no points on the map", async () => {
            database.getPointsOnMap.mockResolvedValue([]);

            const response = await makeGetRequest();

            expect(response.statusCode).toBe(200);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("points", []);
        });

        it("Should respond with 403 if it's not the user's map", async () => {
            database.checkUserOwnsMap.mockResolvedValue(false);
            database.getPointsOnMap.mockResolvedValue(mockPoints);

            const response = await makeGetRequest();

            expect(response.statusCode).toBe(403);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Nincs hozzáférése ehhez a térképhez");
        });

        describe("Server Errors", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if an unexpected database error occurs", async () => {
                database.getPointsOnMap.mockRejectedValueOnce(new Error("Database connection refused"));

                const response = await makeGetRequest();

                expectErrorResponse(response);
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
            jest.clearAllMocks();
            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getGameMapIdByMapId.mockResolvedValue(randomId());
            database.getPointOnMapByCoordinates.mockResolvedValue([]);
            database.insertImage.mockResolvedValue(imageId);
            database.insertPoint.mockResolvedValue(pointId);
        });

        testRequiresAuth(() => makePostRequest());

        it("Should respond with 400 if the map id is incorrect", async () => {
            await testInvalidIDs(
                (id) => makePostRequest({ id }),
                "Helytelen térkép ID"
            );
        });

        it("Should respond with 403 if it's not the user's map", async () => {
            database.checkUserOwnsMap.mockResolvedValueOnce(false);

            const response = await makePostRequest();

            expect(response.statusCode).toBe(403);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Nincs hozzáférése ehhez a térképhez");
        });

        it("Should respond with 400 if a body is not provided", async () => {
            const response = await makePostRequest({ u: undefined, v: undefined, northDirection: undefined, file: undefined });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Hiányzó adatok!");
        });

        describe("Test missing fields", () => {
            const missingFields = [
                { field: "u", overrides: { u: undefined }, errorMsg: "Helytelen koordináták!" },
                { field: "v", overrides: { v: undefined }, errorMsg: "Helytelen koordináták!" },
                { field: "northDirection", overrides: { northDirection: undefined }, errorMsg: "Helytelen északirány!" }
            ];

            it.each(missingFields)("Should respond with 400 if $field is missing", async ({ overrides, errorMsg }) => {
                const response = await makePostRequest(overrides);

                expect(response.statusCode).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error).toBe(errorMsg);
                expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
            });
        });

        it.each(["u", "v"])("Should respond with 400 if %s coordinate is invalid", async (UorV) => {
            for (const invalidUV of invalidUVs) {
                const response = await makePostRequest({ [UorV]: invalidUV });

                expect(response.statusCode).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error).toBe("Helytelen koordináták!");
                expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
            }
        });

        it.each(invalidDegrees)("Should respond with 400 if northDirection is invalid: '%s'", async (invalidDirection) => {
            const response = await makePostRequest({ northDirection: invalidDirection });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Helytelen északirány!");
            expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
        });

        it("Should respond with 400 if no image was provided", async () => {
            const response = await makePostRequest({ file: undefined });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Nem adott meg képet!");
            expect(deleteFile).not.toHaveBeenCalled();
        });

        it("Should respond with 409 if the point already exists", async () => {
            database.getPointOnMapByCoordinates.mockResolvedValueOnce([{ point_id: 55 }]);

            const response = await makePostRequest();

            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v);

            expect(response.statusCode).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Ezen a térképen már létezik pont ezeken a koordinátákon!");
            expect(deleteFile).toHaveBeenCalled();
        });

        it("Should respond with 201 if everything was successful", async () => {
            const response = await makePostRequest();

            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v);
            expect(database.insertImage).toHaveBeenCalledWith(mockConnection, mockImageMetadata.width, mockImageMetadata.height, imageStatusForPath);
            expect(database.insertPoint).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.u, defaults.v, defaults.northDirection, imageId);
            expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, imageId, expect.any(String));
            expectSuccessfulTransaction(mockConnection);

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty("pointId", pointId);
            expect(deleteFile).toHaveBeenCalled();
        });

        it("Should respond with 413 for images too large", async () => {
            const tooBigFile = Buffer.alloc(11 * 1024 * 1024);

            const response = await makePostRequest({ file: tooBigFile });

            expect(response.statusCode).toBe(413);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Túl nagy fájlméret! (Max 10MB)");
        });

        it("Should respond with 400 for unexpected multer errors", async () => {
            const response = await makePostRequest({ fileFieldName: "wrongFieldName" });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Fájlfeltöltési hiba történt!");
        });

        describe("Server Errors", () => {
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

            it("Should respond with 500 if the image processing failed", async () => {
                processImageMetadata.mockRejectedValueOnce(new Error("Image processing failed"));

                const response = await makePostRequest();

                expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                expect(deleteFile).toHaveBeenCalledWith(expect.any(String));

                expectErrorResponse(response, 500, "Hiba a kép feldolgozásakor!");
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
                expect(response.body.success).toBe(true);
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
            jest.clearAllMocks();
            rmSpy = jest.spyOn(fs, "rm").mockResolvedValue(undefined);
            database.checkUserOwnsPoint.mockResolvedValue(true);
            database.deleteImageById.mockResolvedValue(true);
            database.deletePointById.mockResolvedValue(true);
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

        testRequiresAuth(() => makeDeleteRequest());

        it("Should respond with 400 if the point id is incorrect", async () => {
            await testInvalidIDs(
                (id) => makeDeleteRequest({ id }),
                "Helytelen pont ID"
            );
        });

        it("Should respond with 403 if it's not the user's point", async () => {
            database.checkUserOwnsPoint.mockResolvedValue(false);

            const response = await makeDeleteRequest();

            expect(response.statusCode).toBe(403);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Nincs hozzáférése ehhez a ponthoz");
        });

        it("Should respond with 404 if the point doesn't exist somehow", async () => {
            database.getPointInfo.mockResolvedValueOnce(null);

            const response = await makeDeleteRequest();

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "A pont nem létezik");
        });

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

        describe("Server Errors", () => {
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
                database.deleteImageById.mockResolvedValue(false);
                const response = await makeDeleteRequest();

                expectRollback(mockConnection);
                expectErrorResponse(response, 500, "A kép törlése nem sikerült");
            });

            it("Should respond with 500 and rollback if deletePointById failed", async () => {
                database.deletePointById.mockResolvedValue(false);
                const response = await makeDeleteRequest();

                expectRollback(mockConnection);
                expectErrorResponse(response, 500, "A pont törlése nem sikerült");
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
