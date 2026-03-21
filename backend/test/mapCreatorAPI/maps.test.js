require("./helpers/setup-mocks.js");

const { createTestApp } = require("./helpers/setup-test.js");
const { testInvalidIDs, testRequiresAuth, expectSuccessfulTransaction, expectRollback, expectErrorResponse, randomId, buildRequest, suppressConsoleErrors } = require("./helpers/helpers.js");
const { invalidTitles, validTitles, mockImageMetadata, imageStatusForPath } = require("./helpers/test-data.js");
const database = require("../../sql/database.js");
const { mockConnection } = require("./helpers/mock-database.js");
const { processImageMetadata, createWebpAndLowRes } = require("../../utils/imageProcessor.js");
const { deleteFile } = require("../../utils/fileUtils.js");
const fs = require("fs/promises");
const path = require("path");


const requestWithSupertest = createTestApp();

describe("Map Creator API - Map Endpoints - /api/map-creator/", () => {
    describe("GET /game-maps/:gameMapID/maps", () => {
        const mockMaps = [
            { id: 101, title: "Test Map Title" },
            { id: 102, title: "Another Map Title" }
        ];

        const defaults = {
            id: randomId()
        };

        const makeGetRequest = (overrides = {}) => buildRequest(
            (id) => requestWithSupertest.get(`/api/map-creator/game-maps/${encodeURIComponent(id)}/maps`),
            overrides,
            defaults
        );

        beforeEach(() => {
            jest.clearAllMocks();
            database.checkUserOwnsGameMap.mockResolvedValue(true);
            database.getMapsByGameMapId.mockResolvedValue(mockMaps);
        });

        testRequiresAuth(() => makeGetRequest());

        it("Should respond with 400 if the game map id is incorrect", async () => {
            await testInvalidIDs(
                (id) => makeGetRequest({ id }),
                "Helytelen pálya ID"
            );
        });

        it("Should return all maps for a game map", async () => {
            const response = await makeGetRequest();

            expect(response.statusCode).toBe(200);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("maps");
            expect(response.body.maps.length).toBe(2);
            expect(response.body.maps[0].id).toBe(mockMaps[0].id);
            expect(response.body.maps[0].title).toBe(mockMaps[0].title);
        });

        it("Should return an empty array if the game map has no maps", async () => {
            database.getMapsByGameMapId.mockResolvedValue([]);

            const response = await makeGetRequest();

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("maps");
            expect(response.body.maps).toEqual([]);
        });

        it("Should respond with 403 if it's not the user's game map", async () => {
            database.checkUserOwnsGameMap.mockResolvedValue(false);

            const response = await makeGetRequest();

            expect(response.statusCode).toBe(403);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Nincs hozzáférése ehhez a pályához");
        });

        describe("Server Errors", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if an unexpected database error occurs", async () => {
                database.getMapsByGameMapId.mockRejectedValueOnce(new Error("Database connection refused"));

                const response = await makeGetRequest();

                expectErrorResponse(response);
            });
        });
    });

    describe("PUT /maps/:mapID", () => {
        const defaults = {
            id: randomId(),
            title: "new title",
        };

        const makePutRequest = (overrides = {}) => buildRequest(
            (id) => requestWithSupertest.put(`/api/map-creator/maps/${encodeURIComponent(id)}`),
            overrides,
            defaults
        );

        beforeEach(() => {
            jest.clearAllMocks();
            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getMapInfo.mockResolvedValue({ title: "Test Map Title", game_maps_id: 1 });
            database.updateMapTitle.mockResolvedValue(1);
        });

        testRequiresAuth(() => makePutRequest());

        it("Should respond with 400 if the map id is incorrect", async () => {
            await testInvalidIDs(
                (id) => makePutRequest({ id }),
                "Helytelen térkép ID"
            );
        });

        it("Should respond with 403 if it's not the user's map", async () => {
            database.checkUserOwnsMap.mockResolvedValueOnce(false);

            const response = await makePutRequest();

            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Nincs hozzáférése ehhez a térképhez");
        });

        it.each(invalidTitles)("Should respond with 400 if the new title is incorrect: '%s'", async (invalidTitle) => {
            const response = await makePutRequest({ title: invalidTitle });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Helytelen térképnév!");
        });

        it("Should respond with 400 if the new title is not given in the body", async () => {
            const response = await makePutRequest({ title: "" });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Helytelen térképnév!");
        });

        it("Should respond with 400 if a body is not provided", async () => {
            const response = await makePutRequest({ title: null });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Hiányzó adatok!");
        });

        it("Should respond with 404 if the map doesn't exist somehow", async () => {
            database.getMapInfo.mockResolvedValueOnce(null);

            const response = await makePutRequest();

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "A térkép nem létezik");
        });

        it("Should respond with 200, the mapID and the saved title on successful save", async () => {
            for (const newTitle of validTitles) {
                const response = await makePutRequest({ title: newTitle });

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty("success", true);
                expect(response.body).toHaveProperty("mapId", defaults.id);
                expect(response.body).toHaveProperty("title", newTitle.trim());
                expect(database.getConnection).toHaveBeenCalled();
                expect(database.updateMapTitle).toHaveBeenCalledWith(mockConnection, defaults.id, newTitle.trim());
                expectSuccessfulTransaction(mockConnection);
            }
        });

        describe("Server Errors", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if an unexpected database error occurs", async () => {
                database.updateMapTitle.mockRejectedValueOnce(new Error("Database connection refused"));

                const response = await makePutRequest();

                expectErrorResponse(response);
            });

            it.each([0, 2, 3])("Should respond with 500 if the update failed. Invalid affectedRow %s", async (affectedRows) => {
                database.updateMapTitle.mockResolvedValueOnce(affectedRows);

                const response = await makePutRequest();

                expectErrorResponse(response, 500, "A térkép átnevezése nem sikerült");
                expect(database.getConnection).toHaveBeenCalled();
                expect(database.updateMapTitle).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.title.trim());
                expectRollback(mockConnection);
            });
        });
    });

    describe("POST /game-maps/:gameMapID/maps", () => {
        const defaults = {
            id: randomId(),
            title: "new title",
            file: Buffer.from("mapimage"),
            filename: "map.jpg",
            fileFieldName: "mapImage"
        };

        const makePostRequest = (overrides = {}) => buildRequest(
            (id) => requestWithSupertest.post(`/api/map-creator/game-maps/${encodeURIComponent(id)}/maps`),
            overrides,
            defaults
        );

        const imageId = randomId();
        const mapId = randomId();

        beforeEach(() => {
            jest.clearAllMocks();
            database.checkUserOwnsGameMap.mockResolvedValue(true);
            database.insertImage.mockResolvedValue(imageId);
            database.insertMap.mockResolvedValue(mapId);
        });

        testRequiresAuth(() => makePostRequest());

        it("Should respond with 400 if the game map id is incorrect", async () => {
            await testInvalidIDs(
                (id) => makePostRequest({ id }),
                "Helytelen pálya ID"
            );
        });

        it("Should respond with 400 if a body is not provided", async () => {
            const response = await makePostRequest({ file: undefined, title: undefined });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Hiányzó adatok!");
        });

        it("Should respond with 403 if it's not the user's game map", async () => {
            database.checkUserOwnsGameMap.mockResolvedValueOnce(false);

            const response = await makePostRequest();

            expect(response.statusCode).toBe(403);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Nincs hozzáférése ehhez a pályához");
            expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
        });

        it.each(invalidTitles)("Should respond with 400 if the title is incorrect: '%s'", async (invalidTitle) => {
            const response = await makePostRequest({ title: invalidTitle });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Helytelen térképnév!");
            expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
        });

        it("Should respond with 400 if the title is not given", async () => {
            const response = await makePostRequest({ title: undefined });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Helytelen térképnév!");
        });

        it("Should respond with 400 if the map image is not given", async () => {
            const response = await makePostRequest({ file: undefined });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Nem adott meg képet!");
        });

        it("Should respond with 413 for images too large", async () => {
            const tooBigFile = Buffer.alloc(11 * 1024 * 1024);

            const response = await makePostRequest({ file: tooBigFile });

            expect(response.statusCode).toBe(413);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Túl nagy fájlméret! (Max 10MB)");
        });

        it("Should respond with 400 for unexpected multer errors", async () => {
            const response = await makePostRequest({ fileFieldName: "wrongimageFieldName" });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Fájlfeltöltési hiba történt!");
        });

        it("Should respond with 201 if all the data is correct and it saved everything well", async () => {
            for (const validTitle of validTitles) {
                const response = await makePostRequest({ title: validTitle });

                expect(database.getConnection).toHaveBeenCalled();
                expect(database.insertImage).toHaveBeenCalledWith(mockConnection, mockImageMetadata.width, mockImageMetadata.height, imageStatusForPath);
                expect(database.insertMap).toHaveBeenCalledWith(mockConnection, validTitle.trim(), defaults.id, imageId);
                expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, imageId, expect.any(String));
                expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                expectSuccessfulTransaction(mockConnection);

                expect(response.statusCode).toBe(201);
                expect(response.body.success).toBe(true);
                expect(response.body).toHaveProperty("mapId", mapId);
                expect(response.body).toHaveProperty("message", "Térkép sikeresen mentve!");
            }
        });

        it("Should accept a valid title surrounded by spaces and trim it", async () => {
            const title = "   Valid Title   ";
            const expectedTrimmedTitle = "Valid Title";

            const response = await makePostRequest({ title });

            expect(response.statusCode).toBe(201);
            expect(database.insertMap).toHaveBeenCalledWith(
                mockConnection,
                expectedTrimmedTitle,
                defaults.id,
                imageId
            );
        });

        describe("Server Error Handling", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if the database refused connection", async () => {
                database.getConnection.mockRejectedValueOnce(new Error("Database connection refused"));

                const response = await makePostRequest();

                expectErrorResponse(response);
            });

            it("Should respond with 500 if the insertMap failed and delete requestFile", async () => {
                database.insertMap.mockRejectedValueOnce(new Error("Insertion failed"));

                const response = await makePostRequest();

                expectRollback(mockConnection);
                expect(deleteFile).toHaveBeenCalled();
                expectErrorResponse(response);
            });

            it("Should respond with 500 if the database commit failed and delete all files", async () => {
                mockConnection.commit.mockRejectedValueOnce(new Error("Commit failed"));

                const response = await makePostRequest();

                expect(mockConnection.rollback).toHaveBeenCalled();
                expect(mockConnection.release).toHaveBeenCalled();
                expect(deleteFile).toHaveBeenCalled();
                expectErrorResponse(response);
            });

            it("Should respond with 500 if the image processing failed", async () => {
                processImageMetadata.mockRejectedValueOnce(new Error("Image processing failed"));

                const response = await makePostRequest();

                expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                expect(deleteFile).toHaveBeenCalledWith(expect.any(String));

                expectErrorResponse(response, 500, "Hiba a kép feldolgozásakor!");
            });

            it("Should respond with 500, rollback DB, and delete temp file if image conversion fails", async () => {
                createWebpAndLowRes.mockRejectedValueOnce(new Error("Image processing failed"));

                const response = await makePostRequest();

                expectRollback(mockConnection);
                expect(deleteFile).toHaveBeenCalled();
                expectErrorResponse(response, 500);
            });

            it("Should respond with 500 even if rollback itself fails during error handling", async () => {
                createWebpAndLowRes.mockRejectedValueOnce(new Error("Image processing failed"));
                mockConnection.rollback.mockRejectedValueOnce(new Error("Rollback failed"));

                const response = await makePostRequest();

                expect(mockConnection.rollback).toHaveBeenCalled();
                expect(deleteFile).toHaveBeenCalled();
                expectErrorResponse(response, 500);
            });

            it("Should respond with 500 even if deleteFile fails during error handling", async () => {
                createWebpAndLowRes.mockRejectedValueOnce(new Error("Image processing failed"));
                deleteFile.mockRejectedValueOnce(new Error("Delete failed"));

                const response = await makePostRequest();

                expect(deleteFile).toHaveBeenCalled();
                expectErrorResponse(response, 500);
            });

            it("Should respond with 500, rollback DB, and delete ALL files if updateImagePath fails", async () => {
                database.updateImagePath.mockRejectedValueOnce(new Error("Update failed"));

                const response = await makePostRequest();

                expect(mockConnection.rollback).toHaveBeenCalled();
                expect(mockConnection.release).toHaveBeenCalled();
                expect(deleteFile).toHaveBeenCalledTimes(3); // 3 because mainPath, lowResPath, temp uploaded file
                expectErrorResponse(response, 500);
            });
        });
    });

    describe("DELETE /maps/:mapID", () => {
        let rmSpy;
        const defaults = {
            id: randomId()
        };

        const makeDeleteRequest = (overrides = {}) => buildRequest(
            (id) => requestWithSupertest.delete(`/api/map-creator/maps/${encodeURIComponent(id)}`),
            overrides,
            defaults
        );

        beforeEach(() => {
            jest.clearAllMocks();
            rmSpy = jest.spyOn(fs, "rm").mockResolvedValue(undefined);
            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getMapInfo.mockResolvedValue({ title: "Test Map Title", game_maps_id: 100 });
            database.deleteMapById.mockResolvedValue(true);
            database.getAllImageIdsForMap.mockResolvedValue([101, 102, 124, 412]);
            database.deleteImageById.mockResolvedValue(true);
        });

        afterEach(() => {
            rmSpy.mockRestore();
        });

        testRequiresAuth(() => requestWithSupertest.delete("/api/map-creator/maps/1"));

        it("Should respond with 400 if the map id is incorrect", async () => {
            await testInvalidIDs(
                (id) => makeDeleteRequest({ id }),
                "Helytelen térkép ID"
            );
        });

        it("Should respond with 403 if it's not the user's map", async () => {
            database.checkUserOwnsMap.mockResolvedValueOnce(false);

            const response = await makeDeleteRequest();

            expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Nincs hozzáférése ehhez a térképhez");
        });

        it("Should respond with 404 if the map doesn't exist somehow", async () => {
            database.getMapInfo.mockResolvedValueOnce(null);

            const response = await makeDeleteRequest();

            expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "A térkép nem létezik");
        });

        it.each(
            [
                [[]],
                [[101, 102, 124, 412]]
            ]
        )("Should respond with 204 if everything was successful %s", async (imageIds) => {
            const gameMapId = 100;
            database.getMapInfo.mockResolvedValueOnce({ title: "Test Map Title", game_maps_id: gameMapId });
            database.getAllImageIdsForMap.mockResolvedValueOnce(imageIds);

            const response = await makeDeleteRequest();

            expect(database.getConnection).toHaveBeenCalled();
            expect(database.deleteMapById).toHaveBeenCalledWith(mockConnection, defaults.id);
            expect(database.deleteImageById).toHaveBeenCalledTimes(imageIds.length);
            for (const imageId of imageIds) {
                expect(database.deleteImageById).toHaveBeenCalledWith(mockConnection, imageId);
            }
            expect(fs.rm).toHaveBeenCalledWith(
                expect.stringContaining(path.join(gameMapId.toString(), defaults.id.toString())),
                { recursive: true, force: true }
            );
            expectSuccessfulTransaction(mockConnection);
            expect(response.statusCode).toBe(204);
        });

        describe("Server Errors", () => {
            suppressConsoleErrors();

            it("Should respond with 204 even if directory deletion failed but should console.error it", async () => {
                const gameMapId = 100;
                database.getMapInfo.mockResolvedValueOnce({ title: "Test Map Title", game_maps_id: gameMapId });
                const imageIds = [101, 102, 124, 412];
                database.getAllImageIdsForMap.mockResolvedValueOnce(imageIds);

                const errorMessage = "fs remove fail";
                rmSpy.mockRejectedValueOnce(new Error(errorMessage));

                const response = await makeDeleteRequest();

                const expectedPath = path.join(gameMapId.toString(), defaults.id.toString());
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

            it("Should respond with 500 if the database map deletion failed", async () => {
                database.deleteMapById.mockResolvedValueOnce(false);
                const response = await makeDeleteRequest();

                expectRollback(mockConnection);
                expectErrorResponse(response, 500, "A térkép törlése nem sikerült");
            });

            it("Should respond with 500 if the database commit failed", async () => {
                const gameMapId = 100;
                database.getMapInfo.mockResolvedValueOnce({ title: "Test Map Title", game_maps_id: gameMapId });
                const imageIds = [101, 102, 124, 412];
                database.getAllImageIdsForMap.mockResolvedValueOnce(imageIds);
                mockConnection.commit.mockRejectedValueOnce(new Error("Commit failed"));

                const response = await makeDeleteRequest();

                expect(fs.rm).not.toHaveBeenCalled();
                expect(mockConnection.rollback).toHaveBeenCalled();
                expect(mockConnection.release).toHaveBeenCalled();
                expectErrorResponse(response);
            });

            it("Should respond with 500 if the database images deletion failed", async () => {
                const imageId = 103;
                database.getAllImageIdsForMap.mockResolvedValueOnce([imageId]);
                database.deleteImageById.mockResolvedValueOnce(false);

                const response = await makeDeleteRequest();

                expectRollback(mockConnection);
                expectErrorResponse(response, 500, "A térkép képeinek törlése nem sikerült");
            });
        });
    });
});
