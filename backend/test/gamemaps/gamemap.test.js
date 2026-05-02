const { createTestApp } = require("./helpers/setup-test.js");
const {
    randomId,
    buildRequest,
    testInvalidIDs,
    testRequiresAuth,
    expectErrorResponse,
    suppressConsoleErrors,
    expectRollback,
    expectSuccessfulTransaction
} = require("#testhelpers/helpers.js");
const { invalidTypeNumbers, invalidIds, invalidCharForHungarian } = require("#testhelpers/test-data.js");

const ERRORS = require("#utils/error-messages.js");

const database = require("#gamemaps/gamemap/gamemap.queries.js");
const { mockConnection, getConnection } = require("#sql/database.js");

const { checkUserOwnsGameMap } = require("#sharedapi/queries/ownership.queries.js");

const { getGameMapDetails } = require("#gamemaps/shared/queries/gamemaps.queries.js");

const imageQueries = require("#imagequeries");

const fs = require("fs/promises");
const path = require("path");

const requestWithSupertest = createTestApp();

describe("Game Maps API - /api/game-maps/", () => {
    describe("Game Map Details Endpoints", () => {
        describe("GET /:gameMapID", () => {
            const defaults = {
                id: randomId()
            };

            const mockGameMapDetails = {
                id: defaults.id,
                creator_id: 1,
                title: "Test Game Map",
                description: "Test Description",
                rating: 4.5,
                plays: 100
            };

            const mockTopScores = [
                { username: "player1", score: 1500 },
                { username: "player2", score: 1200 }
            ];

            const makeGetRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.get(`/api/game-maps/${encodeURIComponent(id)}`),
                overrides,
                defaults
            );

            beforeEach(() => {
                getGameMapDetails.mockResolvedValue(mockGameMapDetails);
                database.getTopScoresForGameMap.mockResolvedValue(mockTopScores);
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makeGetRequest());
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeGetRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });
            });

            describe("Conflicts (404, 409)", () => {
                it("Should respond with 404 if the game map does not exist", async () => {
                    getGameMapDetails.mockResolvedValueOnce(null);

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 404, ERRORS.GAMEMAP.NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 200, returning the game map details, top scores, and is_owner: true if the requesting user is the creator", async () => {
                    getGameMapDetails.mockResolvedValueOnce({ ...mockGameMapDetails });

                    const response = await makeGetRequest();

                    expect(getGameMapDetails).toHaveBeenCalledWith(defaults.id);
                    expect(database.getTopScoresForGameMap).toHaveBeenCalledWith(defaults.id);

                    expect(response.statusCode).toBe(200);
                    expect(response.body.game_map_details).toEqual({
                        ...mockGameMapDetails,
                        is_owner: true,
                        top_scores: mockTopScores
                    });
                });

                it("Should respond with 200, returning the game map details, top scores, and is_owner: false if the requesting user is not the creator", async () => {
                    getGameMapDetails.mockResolvedValueOnce({ ...mockGameMapDetails, creator_id: 999 });

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body.game_map_details).toHaveProperty("is_owner", false);
                    expect(response.body.game_map_details.top_scores).toEqual(mockTopScores);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it.each([
                    { name: 'getGameMapDetails', databaseFunction: getGameMapDetails },
                    { name: 'database.getTopScoresForGameMap', databaseFunction: database.getTopScoresForGameMap }
                ])("Should respond with 500 if there is an unexpected database error during: $name", async ({ databaseFunction }) => {
                    databaseFunction.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });

        describe("PUT /:gameMapID", () => {
            const defaults = {
                id: randomId(),
                title: "Új Térkép",
                description: "Ez egy új térkép leírása"
            };

            const makePutRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.put(`/api/game-maps/${encodeURIComponent(id)}`),
                overrides,
                defaults
            );

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePutRequest());

                it("Should respond with 403 if it's not the user's game map", async () => {
                    checkUserOwnsGameMap.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 403, ERRORS.GAMEMAP.NO_ACCESS);
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makePutRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });

                it("Should respond with 400 if body is missing", async () => {
                    const response = await makePutRequest({ title: undefined, description: undefined });

                    expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_DATA);
                });

                it("Should respond with 400 if both title and description are missing", async () => {
                    const response = await makePutRequest({ title: undefined, description: undefined, randomField: "randomValue" });

                    expectErrorResponse(response, 400, ERRORS.GAMEMAP.ATLEAST_TITLE_OR_DESCRIPTION);
                });

                describe("Test title", () => {
                    it("Should respond with 400 if the title is empty", async () => {
                        const response = await makePutRequest({ title: "", description: undefined });

                        expectErrorResponse(response, 400, ERRORS.GAMEMAP.TITLE.EMPTY);
                    });

                    it.each(["a", "ab"])("Should respond with 400 if the title is too short: '%s'", async (shortTitle) => {
                        const response = await makePutRequest({ title: shortTitle, description: undefined });

                        expectErrorResponse(response, 400, ERRORS.GAMEMAP.TITLE.TOO_SHORT);
                    });

                    it("Should respond with 400 if the title is too long", async () => {
                        let tooLongTitle = "";
                        for (let i = 0; i < 51; i++) {
                            tooLongTitle += "a";
                        }
                        const response = await makePutRequest({ title: tooLongTitle, description: undefined });

                        expectErrorResponse(response, 400, ERRORS.GAMEMAP.TITLE.TOO_LONG);
                    });

                    it.each(invalidCharForHungarian)("Should respond with 400 if the title contains invalid characters: '%s'", async (invalidTitle) => {
                        const response = await makePutRequest({ title: invalidTitle, description: undefined });

                        expectErrorResponse(response, 400, ERRORS.GAMEMAP.TITLE.INVALID_PATTERN);
                    });
                });

                describe("Test description", () => {
                    it("Should respond with 400 if the description is empty", async () => {
                        const response = await makePutRequest({ title: undefined, description: "" });

                        expectErrorResponse(response, 400, ERRORS.GAMEMAP.DESCRIPTION.EMPTY);
                    });

                    it.each(["a", "ab"])("Should respond with 400 if the description is too short: '%s'", async (shortDesc) => {
                        const response = await makePutRequest({ title: undefined, description: shortDesc });

                        expectErrorResponse(response, 400, ERRORS.GAMEMAP.DESCRIPTION.TOO_SHORT);
                    });

                    it("Should respond with 400 if the description is too long", async () => {
                        let tooLongDesc = "";
                        for (let i = 0; i < 256; i++) {
                            tooLongDesc += "a";
                        }
                        const response = await makePutRequest({ title: undefined, description: tooLongDesc });

                        expectErrorResponse(response, 400, ERRORS.GAMEMAP.DESCRIPTION.TOO_LONG);
                    });

                    it.each(invalidCharForHungarian)("Should respond with 400 if the description contains invalid characters: '%s'", async (invalidDesc) => {
                        const response = await makePutRequest({ title: undefined, description: invalidDesc });

                        expectErrorResponse(response, 400, ERRORS.GAMEMAP.DESCRIPTION.INVALID_PATTERN);
                    });
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 204 and update correctly when both title and description are provided", async () => {
                    const response = await makePutRequest();

                    expect(database.updateGameMapDetails).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.title, defaults.description);
                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and update correctly when only title is provided", async () => {
                    const response = await makePutRequest({ description: undefined });

                    expect(database.updateGameMapDetails).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.title, null);
                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and update correctly when only description is provided", async () => {
                    const response = await makePutRequest({ title: undefined });

                    expect(database.updateGameMapDetails).toHaveBeenCalledWith(mockConnection, defaults.id, null, defaults.description);
                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it.each([
                    { name: 'checkUserOwnsGameMap', databaseFunction: checkUserOwnsGameMap },
                    { name: 'getConnection', databaseFunction: getConnection }
                ])("Should respond with 500 if there is an unexpected database error during: $name", async ({ databaseFunction }) => {
                    databaseFunction.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if the update failed with false", async () => {
                    database.updateGameMapDetails.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.GAMEMAP.UPDATE_FAILED);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during updateGameMapDetails", async () => {
                    database.updateGameMapDetails.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePutRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during commit", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(mockConnection.commit).toHaveBeenCalled();
                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });

        describe("POST /:gameMapID", () => {
            const makePostRequest = (overrides = {}) => buildRequest(
                () => requestWithSupertest.post(`/api/game-maps`),
                overrides,
                {}
            );

            beforeEach(() => {
                database.createGameMap.mockResolvedValue(randomId());
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePostRequest());
            });

            describe("Happy paths (201)", () => {
                it("Should respond with 201 and return the newly created game map ID", async () => {
                    const newId = randomId();
                    database.createGameMap.mockResolvedValueOnce(newId);

                    const response = await makePostRequest();

                    expect(database.createGameMap).toHaveBeenCalledWith(expect.any(Number));

                    expect(response.statusCode).toBe(201);
                    expect(response.body).toEqual({ gameMapID: newId });
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if there is an unexpected database error during createGameMap", async () => {
                    database.createGameMap.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });

        describe("DELETE /:gameMapID", () => {
            const defaults = {
                id: randomId()
            };

            const makeDeleteRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.delete(`/api/game-maps/${encodeURIComponent(id)}`),
                overrides,
                defaults
            );

            let rmSpy;
            const mockImageIds = [101, 102, 103];

            beforeEach(() => {
                rmSpy = jest.spyOn(fs, "rm").mockResolvedValue(undefined);

                getGameMapDetails.mockResolvedValue({ id: defaults.id });
                database.getAllImageIdsForGameMap.mockResolvedValue(mockImageIds);
            });

            afterEach(() => {
                rmSpy.mockRestore();
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
                it("Should respond with 404 if the game map does not exist", async () => {
                    getGameMapDetails.mockResolvedValueOnce(null);

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 404, ERRORS.GAMEMAP.NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 204, delete the map from DB, delete all imageIds, and delete the game directory", async () => {
                    const response = await makeDeleteRequest();

                    expect(database.deleteGameMapById).toHaveBeenCalledWith(mockConnection, defaults.id);
                    expect(imageQueries.deleteImageById).toHaveBeenCalledTimes(mockImageIds.length);
                    for (const imageId of mockImageIds) {
                        expect(imageQueries.deleteImageById).toHaveBeenCalledWith(mockConnection, imageId);
                    }

                    expect(fs.rm).toHaveBeenCalledWith(
                        expect.stringContaining(defaults.id.toString()),
                        { recursive: true, force: true }
                    );

                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204, even when the game map has no images", async () => {
                    database.getAllImageIdsForGameMap.mockResolvedValueOnce([]);

                    const response = await makeDeleteRequest();

                    expect(database.deleteGameMapById).toHaveBeenCalledWith(mockConnection, defaults.id);
                    expect(imageQueries.deleteImageById).not.toHaveBeenCalled();

                    expect(fs.rm).toHaveBeenCalledWith(
                        expect.stringContaining(defaults.id.toString()),
                        { recursive: true, force: true }
                    );

                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
                });

                describe("Happy path with deletion failure", () => {
                    suppressConsoleErrors();

                    it("Should respond with 204 even if directory deletion throws an error but should console.error it", async () => {
                        const errorMsg = "Delete error";
                        rmSpy.mockRejectedValueOnce(new Error(errorMsg));

                        const response = await makeDeleteRequest();

                        expect(database.deleteGameMapById).toHaveBeenCalledWith(mockConnection, defaults.id);
                        expect(fs.rm).toHaveBeenCalled();
                        expect(console.error).toHaveBeenCalledWith(
                            expect.stringContaining("Error deleting directory")
                        );

                        expectSuccessfulTransaction(mockConnection);
                        expect(response.statusCode).toBe(204);
                    });
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it.each([
                    { name: 'getGameMapDetails', databaseFunction: getGameMapDetails },
                    { name: 'checkUserOwnsGameMap', databaseFunction: checkUserOwnsGameMap },
                    { name: 'getConnection', databaseFunction: getConnection }
                ])("Should respond with 500 if there is an unexpected database error during: $name", async ({ databaseFunction }) => {
                    databaseFunction.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if getAllImageIdsForGameMap throws an error", async () => {
                    database.getAllImageIdsForGameMap.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeDeleteRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if deleteGameMapById returns false", async () => {
                    database.deleteGameMapById.mockResolvedValueOnce(false);

                    const response = await makeDeleteRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.GAMEMAP.DELETE_FAILED);
                });

                it("Should respond with 500 and rollback if imageQueries.deleteImageById returns false", async () => {
                    imageQueries.deleteImageById
                        .mockResolvedValueOnce(true)
                        .mockResolvedValueOnce(false); // second one fails

                    const response = await makeDeleteRequest();

                    expect(imageQueries.deleteImageById).toHaveBeenCalledTimes(2);
                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.MAP.IMAGE_DELETIONS_FAILED);
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
