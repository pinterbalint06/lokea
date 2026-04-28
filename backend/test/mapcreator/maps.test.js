const { createTestApp } = require("#mapcreatortest/helpers/setup-test.js");
const { testInvalidIDs, testRequiresAuth, expectSuccessfulTransaction, expectRollback, expectErrorResponse, randomId, buildRequest, suppressConsoleErrors } = require("#testhelpers/helpers.js");
const { emptyTitles, tooLongTitles, invalidCharTitles, validTitles, imageStatusForPath } = require("#mapcreatortest/helpers/test-data.js");

const database = require("#sql/database.js");
const { mockConnection } = database;

const {
    processImageMetadata,
    createWebpAndLowRes,
    mockImageMetadata
} = require("#utils/image-processor.js");

const {
    deleteFile
} = require("#utils/file-utils.js");

const fs = require("fs/promises");
const path = require("path");
const ERRORS = require("#utils/error-messages.js");


const requestWithSupertest = createTestApp();

describe("Map Creator API - /api/map-creator/", () => {
    describe("Map Endpoints", () => {
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
                database.getMapsByGameMapId.mockResolvedValue(mockMaps);
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makeGetRequest());

                it("Should respond with 403 if it's not the user's game map", async () => {
                    database.checkUserOwnsGameMap.mockResolvedValueOnce(false);

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 403, ERRORS.GAMEMAP.NO_ACCESS);
                });
            })

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeGetRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should return all maps for a game map", async () => {
                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.type).toEqual(expect.stringContaining("json"));
                    expect(response.body).toHaveProperty("maps");
                    expect(response.body.maps.length).toBe(2);
                    expect(response.body.maps[0].id).toBe(mockMaps[0].id);
                    expect(response.body.maps[0].title).toBe(mockMaps[0].title);
                });

                it("Should return an empty array if the game map has no maps", async () => {
                    database.getMapsByGameMapId.mockResolvedValue([]);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toHaveProperty("maps");
                    expect(response.body.maps).toEqual([]);
                });
            });

            describe("Server errors (500)", () => {
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
                database.getMapInfo.mockResolvedValue({ title: "Test Map Title", game_maps_id: 1 });
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePutRequest());
                it("Should respond with 403 if it's not the user's map", async () => {
                    database.checkUserOwnsMap.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expectErrorResponse(response, 403, ERRORS.MAP.NO_ACCESS);
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makePutRequest({ id }),
                        ERRORS.MAP.INVALID_ID
                    );
                });

                it("Should respond with 400 if a body is not provided", async () => {
                    const response = await makePutRequest({ title: undefined });

                    expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_DATA);
                });

                describe("Title validation", () => {
                    it.each(invalidCharTitles)("Should respond with 400 if the title has invalid characters: '%s'", async (invalidTitle) => {
                        const response = await makePutRequest({ title: invalidTitle });

                        expectErrorResponse(response, 400, ERRORS.MAP.TITLE_INVALID_CHARS);
                    });

                    it.each(tooLongTitles)("Should respond with 400 if the title is too long: '%s'", async (invalidTitle) => {
                        const response = await makePutRequest({ title: invalidTitle });

                        expectErrorResponse(response, 400, ERRORS.MAP.TITLE_TOO_LONG);
                    });

                    it.each(emptyTitles)("Should respond with 400 if the title is empty: '%s'", async (invalidTitle) => {
                        const response = await makePutRequest({ title: invalidTitle });

                        expectErrorResponse(response, 400, ERRORS.MAP.TITLE_EMPTY);
                    });

                    it("Should respond with 400 if the title is missing", async () => {
                        const response = await makePutRequest({ title: undefined, randomField: "randomValue" });

                        expectErrorResponse(response, 400, ERRORS.MAP.TITLE_EMPTY);
                    });
                });
            });

            describe("Conflicts, (404, 409)", () => {
                it("Should respond with 404 if the map doesn't exist somehow", async () => {
                    database.getMapInfo.mockResolvedValueOnce(null);

                    const response = await makePutRequest();

                    expectErrorResponse(response, 404, ERRORS.MAP.NOT_FOUND);
                });
            })

            describe("Happy paths (200, 201, 204)", () => {
                it.each(validTitles)("Should respond with 200, the mapID and the saved title (%s) on successful save", async (newTitle) => {
                    const response = await makePutRequest({ title: newTitle });

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toHaveProperty("title", newTitle.trim());
                    expect(database.getConnection).toHaveBeenCalled();
                    expect(database.updateMapTitle).toHaveBeenCalledWith(mockConnection, defaults.id, newTitle.trim());
                    expectSuccessfulTransaction(mockConnection);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if an unexpected database error occurs", async () => {
                    database.updateMapTitle.mockRejectedValueOnce(new Error("Database connection refused"));

                    const response = await makePutRequest();

                    expectErrorResponse(response);
                });

                it("Should respond with 500 if the update failed", async () => {
                    database.updateMapTitle.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expectErrorResponse(response, 500, ERRORS.MAP.RENAME_FAILED);
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
                database.insertImage.mockResolvedValue(imageId);
                database.insertMap.mockResolvedValue(mapId);
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePostRequest());

                it("Should respond with 403 if it's not the user's game map", async () => {
                    database.checkUserOwnsGameMap.mockResolvedValueOnce(false);

                    const response = await makePostRequest();

                    expectErrorResponse(response, 403, ERRORS.GAMEMAP.NO_ACCESS);
                    expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makePostRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });

                it("Should respond with 400 if a body is not provided", async () => {
                    const response = await makePostRequest({ file: undefined, title: undefined });

                    expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_DATA);
                });

                describe("Title validation", () => {
                    it.each(invalidCharTitles)("Should respond with 400 if the title has invalid characters: '%s'", async (invalidTitle) => {
                        const response = await makePostRequest({ title: invalidTitle });

                        expectErrorResponse(response, 400, ERRORS.MAP.TITLE_INVALID_CHARS);
                    });

                    it.each(tooLongTitles)("Should respond with 400 if the title is too long: '%s'", async (invalidTitle) => {
                        const response = await makePostRequest({ title: invalidTitle });

                        expectErrorResponse(response, 400, ERRORS.MAP.TITLE_TOO_LONG);
                    });

                    it.each(emptyTitles)("Should respond with 400 if the title is empty: '%s'", async (invalidTitle) => {
                        const response = await makePostRequest({ title: invalidTitle });

                        expectErrorResponse(response, 400, ERRORS.MAP.TITLE_EMPTY);
                    });

                    it("Should respond with 400 if the title is missing", async () => {
                        const response = await makePostRequest({ title: undefined, randomField: "randomValue" });

                        expectErrorResponse(response, 400, ERRORS.MAP.TITLE_EMPTY);
                        expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
                    });
                });

                describe("Image validation", () => {
                    it("Should respond with 400 if the map image is not given", async () => {
                        const response = await makePostRequest({ file: undefined });

                        expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_IMAGE);
                    });

                    it("Should respond with 413 for images too large", async () => {
                        const tooBigFile = Buffer.alloc(11 * 1024 * 1024);

                        const response = await makePostRequest({ file: tooBigFile });

                        expectErrorResponse(response, 413, ERRORS.COMMON.FILE_TOO_LARGE);
                    });

                    it("Should respond with 400 for unexpected multer errors", async () => {
                        const response = await makePostRequest({ fileFieldName: "wrongimageFieldName" });

                        expectErrorResponse(response, 400, ERRORS.COMMON.FILE_UPLOAD_ERROR);
                    });

                    it("Should respond with 422 if the image processing failed", async () => {
                        processImageMetadata.mockRejectedValueOnce(new Error("Image processing failed"));

                        const response = await makePostRequest();

                        expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                        expect(deleteFile).toHaveBeenCalledWith(expect.any(String));

                        expectErrorResponse(response, 422, ERRORS.COMMON.IMAGE_PROCESSING_ERROR);
                    });

                    it("Should respond with 415 if the image mimetype is invalid", async () => {
                        const response = await makePostRequest({ filename: "map.txt", file: Buffer.from("notanimage") });

                        expect(mockConnection.beginTransaction).not.toHaveBeenCalled();

                        expectErrorResponse(response, 415, ERRORS.COMMON.INVALID_IMAGE_TYPE);
                    });
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
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
                        expect(response.body).toHaveProperty("mapId", mapId);
                    }
                });

                it("Should respond with 201 and accept a valid title surrounded by spaces and trim it", async () => {
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

                describe("Happy path with deletion failure", () => {
                    suppressConsoleErrors();

                    it("Should still respond with 200 even if deleting temporary file failed but should console.error it", async () => {
                        deleteFile.mockRejectedValueOnce(new Error("Image deletion failed"));

                        const response = await makePostRequest();

                        expect(mockConnection.commit).toHaveBeenCalled();
                        expect(deleteFile).toHaveBeenCalled();
                        expect(console.error).toHaveBeenCalledWith(
                            expect.stringContaining("Failed to delete temporary file"),
                            expect.any(Error)
                        );
                        expect(deleteFile).toHaveBeenCalled(); // temp uploaded file

                        expectSuccessfulTransaction(mockConnection);

                        expect(response.statusCode).toBe(201);
                        expect(response.body).toHaveProperty("mapId", mapId);
                    });
                });
            });

            describe("Server errors (500)", () => {
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

                it("Should respond with 500, rollback DB, and delete ALL files if updateImagePath fails with false", async () => {
                    database.updateImagePath.mockResolvedValueOnce(false);

                    const response = await makePostRequest();

                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();
                    expect(deleteFile).toHaveBeenCalledTimes(3); // 3 because mainPath, lowResPath, temp uploaded file
                    expectErrorResponse(response, 500, ERRORS.MAP.SAVE_FAILED);
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
                rmSpy = jest.spyOn(fs, "rm").mockResolvedValue(undefined);
                database.getMapInfo.mockResolvedValue({ title: "Test Map Title", game_maps_id: 100 });
                database.getAllImageIdsForMap.mockResolvedValue([101, 102, 124, 412]);
            });

            afterEach(() => {
                rmSpy.mockRestore();
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makeDeleteRequest());

                it("Should respond with 403 if it's not the user's map", async () => {
                    database.checkUserOwnsMap.mockResolvedValueOnce(false);

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 403, ERRORS.MAP.NO_ACCESS);
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeDeleteRequest({ id }),
                        ERRORS.MAP.INVALID_ID
                    );
                });
            });

            describe("Conflicts, (404, 409)", () => {
                it("Should respond with 404 if the map doesn't exist somehow", async () => {
                    database.getMapInfo.mockResolvedValueOnce(null);

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 404, ERRORS.MAP.NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                const imageIdsOnMap = [
                    [[]],
                    [[101, 102, 124, 412]]
                ];

                it.each(imageIdsOnMap)("Should respond with 204 if everything was successful %s", async (imageIds) => {
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

                describe("Happy path with deletion failure", () => {
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

                it("Should respond with 500 if the database map deletion failed", async () => {
                    database.deleteMapById.mockResolvedValueOnce(false);
                    const response = await makeDeleteRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.MAP.DELETE_FAILED);
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
                    expectErrorResponse(response, 500, ERRORS.MAP.IMAGE_DELETIONS_FAILED);
                });
            });
        });
    });
});
