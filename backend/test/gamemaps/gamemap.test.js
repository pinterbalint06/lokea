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

const database = require("#sql/database.js");
const { mockConnection } = database;

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
                database.getGameMapDetails.mockResolvedValue(mockGameMapDetails);
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
                    database.getGameMapDetails.mockResolvedValueOnce(null);

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 404, ERRORS.GAMEMAP.NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 200, returning the game map details, top scores, and is_owner: true if the requesting user is the creator", async () => {
                    database.getGameMapDetails.mockResolvedValueOnce({ ...mockGameMapDetails });

                    const response = await makeGetRequest();

                    expect(database.getGameMapDetails).toHaveBeenCalledWith(defaults.id);
                    expect(database.getTopScoresForGameMap).toHaveBeenCalledWith(defaults.id);

                    expect(response.statusCode).toBe(200);
                    expect(response.body.game_map_details).toEqual({
                        ...mockGameMapDetails,
                        is_owner: true,
                        top_scores: mockTopScores
                    });
                });

                it("Should respond with 200, returning the game map details, top scores, and is_owner: false if the requesting user is not the creator", async () => {
                    database.getGameMapDetails.mockResolvedValueOnce({ ...mockGameMapDetails, creator_id: 999 });

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body.game_map_details).toHaveProperty("is_owner", false);
                    expect(response.body.game_map_details.top_scores).toEqual(mockTopScores);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it.each([
                    { name: 'database.getGameMapDetails', databaseFunction: database.getGameMapDetails },
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

            beforeEach(() => {
                database.updateGameMapDetails.mockResolvedValue(true);
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePutRequest());

                it("Should respond with 403 if it's not the user's game map", async () => {
                    database.checkUserOwnsGameMap.mockResolvedValueOnce(false);

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
                    { name: 'database.checkUserOwnsGameMap', databaseFunction: database.checkUserOwnsGameMap },
                    { name: 'database.getConnection', databaseFunction: database.getConnection }
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
    });
});