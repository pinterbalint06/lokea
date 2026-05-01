const { createTestApp } = require("./helpers/setup-test.js");
const {
    randomId,
    buildRequest,
    testInvalidIDs,
    testRequiresAuth,
    expectErrorResponse,
    expectRollback,
    expectSuccessfulTransaction,
    suppressConsoleErrors
} = require("#testhelpers/helpers.js");

const ERRORS = require("#utils/error-messages.js");

const database = require("#gamemaps/favorite/favorite.queries.js");
const { doesGameMapExist } = require("#gamemaps/shared/queries/gamemaps.queries.js");
const { mockConnection, getConnection } = require("#sql/database.js");

const requestWithSupertest = createTestApp();

describe("Game Maps API - /api/game-maps/", () => {
    describe("Favorite Endpoints", () => {
        describe("GET /:gameMapID/favorite", () => {
            const defaults = {
                id: randomId()
            };

            const makeGetRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.get(`/api/game-maps/${encodeURIComponent(id)}/favorite`),
                overrides,
                defaults
            );

            describe("Authorization (401)", () => {
                testRequiresAuth(() => makeGetRequest());
            });

            describe("Input validation (400)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeGetRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });
            });

            describe("Happy paths (200)", () => {
                it("Should respond with 200 and return is_favorited: false if not favorited", async () => {
                    database.isUserFavorite.mockResolvedValueOnce(false);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toEqual({ is_favorited: false });
                });

                it("Should respond with 200 and return is_favorited: true if favorited", async () => {
                    database.isUserFavorite.mockResolvedValueOnce(true);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toEqual({ is_favorited: true });
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if there is an unexpected database error during isUserFavorite", async () => {
                    database.isUserFavorite.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });

        describe("POST /:gameMapID/favorite", () => {
            const defaults = {
                id: randomId()
            };

            const makePostRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.post(`/api/game-maps/${encodeURIComponent(id)}/favorite`),
                overrides,
                defaults
            );

            beforeEach(() => {
                database.isUserFavorite.mockResolvedValue(false);
            });

            afterAll(() => {
                database.isUserFavorite.mockResolvedValue(true);
            });

            describe("Authorization (401)", () => {
                testRequiresAuth(() => makePostRequest());
            });

            describe("Input validation (400)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makePostRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });
            });

            describe("Conflicts (404, 409)", () => {
                it("Should respond with 404 if the game map does not exist", async () => {
                    doesGameMapExist.mockResolvedValueOnce(false);

                    const response = await makePostRequest();

                    expectErrorResponse(response, 404, ERRORS.GAMEMAP.NOT_FOUND);
                });

                it("Should respond with 409 if the user has already favorited the map", async () => {
                    database.isUserFavorite.mockResolvedValueOnce(true);

                    const response = await makePostRequest();

                    expectErrorResponse(response, 409, ERRORS.FAVORITE.ALREADY_FAVORITED);
                });
            });

            describe("Happy paths (204)", () => {
                it("Should respond with 204 and add the favorite", async () => {
                    const response = await makePostRequest();

                    expectSuccessfulTransaction(mockConnection);
                    expect(database.insertFavorite).toHaveBeenCalledWith(mockConnection, defaults.id, expect.any(Number));

                    expect(response.statusCode).toBe(204);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it.each([
                    { name: 'getConnection', databaseFunction: getConnection },
                    { name: 'mockConnection.beginTransaction', databaseFunction: mockConnection.beginTransaction },
                    { name: 'doesGameMapExist', databaseFunction: doesGameMapExist },
                    { name: 'database.isUserFavorite', databaseFunction: database.isUserFavorite }
                ])("Should respond with 500 if there is an unexpected database error during: $name", async ({ databaseFunction }) => {
                    databaseFunction.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during insertFavorite", async () => {
                    database.insertFavorite.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during commit", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expect(getConnection).toHaveBeenCalled();
                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(mockConnection.commit).toHaveBeenCalled();
                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });

        describe("DELETE /:gameMapID/favorite", () => {
            const defaults = {
                id: randomId()
            };

            const makeDeleteRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.delete(`/api/game-maps/${encodeURIComponent(id)}/favorite`),
                overrides,
                defaults
            );

            describe("Authorization (401)", () => {
                testRequiresAuth(() => makeDeleteRequest());
            });

            describe("Input validation (400)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeDeleteRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });
            });

            describe("Conflicts (404)", () => {
                it("Should respond with 404 if the user has not favorited the map", async () => {
                    database.isUserFavorite.mockResolvedValueOnce(false);

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 404, ERRORS.FAVORITE.NOT_FAVORITED);
                });
            });

            describe("Happy paths (204)", () => {
                it("Should respond with 204 and remove the favorite", async () => {
                    const response = await makeDeleteRequest();

                    expectSuccessfulTransaction(mockConnection);
                    expect(database.deleteFavorite).toHaveBeenCalledWith(mockConnection, defaults.id, expect.any(Number));

                    expect(response.statusCode).toBe(204);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it.each([
                    { name: 'getConnection', databaseFunction: getConnection },
                    { name: 'mockConnection.beginTransaction', databaseFunction: mockConnection.beginTransaction },
                    { name: 'database.isUserFavorite', databaseFunction: database.isUserFavorite }
                ])("Should respond with 500 if there is an unexpected database error during: $name", async ({ databaseFunction }) => {
                    databaseFunction.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeDeleteRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if deleteFavorite fails", async () => {
                    database.deleteFavorite.mockResolvedValueOnce(false);

                    const response = await makeDeleteRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.FAVORITE.REMOVE_FAILED);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during deleteFavorite", async () => {
                    database.deleteFavorite.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeDeleteRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during commit", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeDeleteRequest();

                    expect(getConnection).toHaveBeenCalled();
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
