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
    });
});