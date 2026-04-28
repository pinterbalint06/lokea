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
const { invalidTypeNumbers, invalidIds, negativeNumbers, negativeIntegers, tooBigNumbers, invalidCharForHungarian } = require("#testhelpers/test-data.js");

const ERRORS = require("#utils/error-messages.js");

const database = require("#gamemaps/comments/comments.queries.js");
const { mockConnection, getConnection, getGameMapDetails } = require("#sql/database.js");

const requestWithSupertest = createTestApp();

describe("Game Maps API - /api/game-maps/", () => {
    describe("Comment Endpoints", () => {
        describe("GET /:gameMapID/comments", () => {
            const defaults = {
                id: randomId()
            };

            const comments = [
                { rating: 1, comment_text: "Great map!", username: "User1", created_at: "2024-01-01T12:00:00Z" },
                { rating: 3, comment_text: "Needs more detail.", username: "User2", created_at: "2024-01-02T15:30:00Z" },
                { rating: 2, comment_text: null, username: "User3", created_at: "2024-01-03T18:45:00Z" },
                { rating: 5, comment_text: "Loved the design!", username: "User4", created_at: "2024-01-04T20:20:00Z" }
            ];

            const makeGetRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.get(`/api/game-maps/${encodeURIComponent(id)}/comments`),
                overrides,
                defaults
            );

            beforeEach(() => {
                database.getGameMapComments.mockResolvedValue(comments);
                database.getGameMapCommentCount.mockResolvedValue(comments.length);
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

                describe("Test page query", () => {
                    it.each([...invalidTypeNumbers, ...invalidIds])("Should respond with 400 if the page query is invalid: %s", async (invalidNumber) => {
                        const response = await makeGetRequest({ query: { page: invalidNumber } });

                        expectErrorResponse(response, 400, ERRORS.COMMON.INVALID_PAGE);
                    });
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 200 and return comments", async () => {
                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toHaveProperty("comments");
                    expect(response.body).toHaveProperty("pagination");
                    expect(response.body.comments).toEqual(comments);
                    expect(response.body.pagination.totalCount).toBe(comments.length);
                    expect(response.body.pagination.totalPages).toBe(1);
                });

                it("Should respond with 200 and return empty array if there are no comments", async () => {
                    database.getGameMapComments.mockResolvedValueOnce([]);
                    database.getGameMapCommentCount.mockResolvedValueOnce(0);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toHaveProperty("comments");
                    expect(response.body).toHaveProperty("pagination");
                    expect(response.body.comments).toEqual([]);
                    expect(response.body.pagination.totalCount).toBe(0);
                    expect(response.body.pagination.totalPages).toBe(0);
                });

                it("Should respond with 200 and return comments if valid page is given", async () => {
                    const page = 2;
                    const response = await makeGetRequest({ query: { page } });

                    expect(database.getGameMapComments).toHaveBeenCalledWith(defaults.id, page);

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toHaveProperty("comments");
                    expect(response.body).toHaveProperty("pagination");
                    expect(response.body.comments).toEqual(comments);
                    expect(response.body.pagination.totalCount).toBe(comments.length);
                    expect(response.body.pagination.totalPages).toBe(1);
                });

                it.each([{ count: 101, pages: 3 }, { count: 0, pages: 0 }, { count: 50, pages: 1 }])("Should respond with 200 and calculate totalPages correctly: %s", async (testData) => {
                    database.getGameMapCommentCount.mockResolvedValueOnce(testData.count);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toHaveProperty("comments");
                    expect(response.body).toHaveProperty("pagination");
                    expect(response.body.comments).toEqual(comments);
                    expect(response.body.pagination.totalCount).toBe(testData.count);
                    expect(response.body.pagination.totalPages).toBe(testData.pages);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if there is an unexpected database error during getGameMapComments", async () => {
                    database.getGameMapComments.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 if there is an unexpected database error during getGameMapCommentCount", async () => {
                    database.getGameMapCommentCount.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });

        describe("GET /:gameMapID/my-comment", () => {
            const defaults = {
                id: randomId()
            };

            const comment = { rating: 4, comment_text: "Nice map!", username: "TestUser", created_at: "2024-01-01T12:00:00Z" };

            const makeGetRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.get(`/api/game-maps/${encodeURIComponent(id)}/my-comment`),
                overrides,
                defaults
            );

            beforeEach(() => {
                database.getUserCommentOnGameMap.mockResolvedValue(comment);
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
                it("Should respond with 404 if the user has not commented on the game map", async () => {
                    database.hasUserCommentedOnGameMap.mockResolvedValueOnce(false);

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 404, ERRORS.COMMENT.NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 200 and return the user's comment", async () => {
                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toEqual(comment);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if there is an unexpected database error during hasUserCommentedOnGameMap", async () => {
                    database.hasUserCommentedOnGameMap.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 if there is an unexpected database error during getUserCommentOnGameMap", async () => {
                    database.getUserCommentOnGameMap.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });

        describe("PUT /:gameMapID/my-comment", () => {
            const defaults = {
                id: randomId(),
                rating: 3,
                comment: "Updated comment"
            };

            const makePutRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.put(`/api/game-maps/${encodeURIComponent(id)}/my-comment`),
                overrides,
                defaults
            );

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePutRequest());
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makePutRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });

                it("Should respond with 400 if the body is missing", async () => {
                    const response = await makePutRequest({ rating: undefined, comment: undefined });

                    expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_DATA);
                });

                describe("Test rating", () => {
                    it("Should respond with 400 if the rating is missing", async () => {
                        const response = await makePutRequest({ rating: undefined });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.RATING_REQUIRED);
                    });

                    it.each([...negativeIntegers, 0])("Should respond with 400 if the rating is smaller than 1: %s", async (invalidRating) => {
                        const response = await makePutRequest({ rating: invalidRating });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.TOO_LOW_RATING);
                    });

                    it.each([6, 7, 8, 341])("Should respond with 400 if the rating is bigger than 5: %s", async (invalidRating) => {
                        const response = await makePutRequest({ rating: invalidRating });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.TOO_HIGH_RATING);
                    });

                    it.each([...tooBigNumbers, ...invalidTypeNumbers, 3.4, 2.123])("Should respond with 400 if the rating is invalid: %s", async (invalidRating) => {
                        const response = await makePutRequest({ rating: invalidRating });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.INVALID_RATING);
                    });
                });

                describe("Test comment", () => {
                    it("Should respond with 400 if the comment is empty", async () => {
                        const response = await makePutRequest({ comment: "" });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.EMPTY_CONTENT);
                    });

                    it("Should respond with 400 if the comment is too long", async () => {
                        let tooLongComment = "";
                        for (let i = 0; i < 256; i++) {
                            tooLongComment += "a";
                        }
                        const response = await makePutRequest({ comment: tooLongComment });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.TOO_LONG);
                    });

                    it.each([...invalidCharForHungarian])("Should respond with 400 if the comment contains invalid characters: %s", async (invalidChar) => {
                        const response = await makePutRequest({ comment: invalidChar });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.INVALID_CHARACTERS);
                    });
                });
            });

            describe("Conflicts (404, 409)", () => {
                it("Should respond with 404 if the user has not commented yet", async () => {
                    database.hasUserCommentedOnGameMap.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 404, ERRORS.COMMENT.NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 204 and update the comment", async () => {
                    const response = await makePutRequest();

                    expectSuccessfulTransaction(mockConnection);
                    expect(database.updateUserCommentOnGameMap).toHaveBeenCalledWith(mockConnection, defaults.id, expect.any(Number), defaults.comment, defaults.rating);

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and update the comment with no comment text too", async () => {
                    const response = await makePutRequest({ comment: undefined });

                    expectSuccessfulTransaction(mockConnection);
                    expect(database.updateUserCommentOnGameMap).toHaveBeenCalledWith(mockConnection, defaults.id, expect.any(Number), null, defaults.rating);

                    expect(response.statusCode).toBe(204);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it.each([
                    getConnection,
                    mockConnection.beginTransaction,
                    database.hasUserCommentedOnGameMap
                ])("Should respond with 500 if there is an unexpected database error during: %s", async (databaseFunction) => {
                    databaseFunction.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePutRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if updateUserCommentOnGameMap fails", async () => {
                    database.updateUserCommentOnGameMap.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.COMMENT.UPDATE_FAILED);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during updateUserCommentOnGameMap", async () => {
                    database.updateUserCommentOnGameMap.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePutRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during commit", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePutRequest();

                    expect(getConnection).toHaveBeenCalled();
                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(mockConnection.commit).toHaveBeenCalled();
                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();
                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });

        describe("POST /:gameMapID/my-comment", () => {
            const defaults = {
                id: randomId(),
                rating: 4,
                comment: "Nice map"
            };

            const makePostRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.post(`/api/game-maps/${encodeURIComponent(id)}/my-comment`),
                overrides,
                defaults
            );

            beforeEach(() => {
                getGameMapDetails.mockResolvedValue({ creator_id: 1, creator_name: "TestUser", title: "Test Map", rating: 4.5, plays: 100, game_created: "2024-01-01T12:00:00Z", game_description: "A test map" });
                database.hasUserCommentedOnGameMap.mockResolvedValue(false);
            });

            afterAll(() => {
                database.hasUserCommentedOnGameMap.mockResolvedValue(true);
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePostRequest());
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makePostRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });

                it("Should respond with 400 if the body is missing", async () => {
                    const response = await makePostRequest({ rating: undefined, comment: undefined });

                    expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_DATA);
                });

                describe("Test rating", () => {
                    it("Should respond with 400 if the rating is missing", async () => {
                        const response = await makePostRequest({ rating: undefined });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.RATING_REQUIRED);
                    });

                    it.each([...negativeIntegers, 0])("Should respond with 400 if the rating is smaller than 1: %s", async (invalidRating) => {
                        const response = await makePostRequest({ rating: invalidRating });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.TOO_LOW_RATING);
                    });

                    it.each([6, 7, 8, 341])("Should respond with 400 if the rating is bigger than 5: %s", async (invalidRating) => {
                        const response = await makePostRequest({ rating: invalidRating });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.TOO_HIGH_RATING);
                    });

                    it.each([...tooBigNumbers, ...invalidTypeNumbers, 3.4, 2.123])("Should respond with 400 if the rating is invalid: %s", async (invalidRating) => {
                        const response = await makePostRequest({ rating: invalidRating });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.INVALID_RATING);
                    });
                });

                describe("Test comment", () => {
                    it("Should respond with 400 if the comment is empty", async () => {
                        const response = await makePostRequest({ comment: "" });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.EMPTY_CONTENT);
                    });

                    it("Should respond with 400 if the comment is too long", async () => {
                        let tooLongComment = "";
                        for (let i = 0; i < 256; i++) {
                            tooLongComment += "a";
                        }
                        const response = await makePostRequest({ comment: tooLongComment });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.TOO_LONG);
                    });

                    it.each([...invalidCharForHungarian])("Should respond with 400 if the comment contains invalid characters: %s", async (invalidComment) => {
                        const response = await makePostRequest({ comment: invalidComment });

                        expectErrorResponse(response, 400, ERRORS.COMMENT.INVALID_CHARACTERS);
                    });
                });
            });

            describe("Conflicts (404, 409)", () => {
                it("Should respond with 404 if the game map does not exist", async () => {
                    getGameMapDetails.mockResolvedValueOnce(null);

                    const response = await makePostRequest();

                    expectErrorResponse(response, 404, ERRORS.GAMEMAP.NOT_FOUND);
                });

                it("Should respond with 409 if the user already commented", async () => {
                    database.hasUserCommentedOnGameMap.mockResolvedValueOnce(true);

                    const response = await makePostRequest();

                    expectErrorResponse(response, 409, ERRORS.COMMENT.ALREADY_COMMENTED);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 204 and create the comment", async () => {
                    const response = await makePostRequest();

                    expectSuccessfulTransaction(mockConnection);
                    expect(database.insertGameMapComment).toHaveBeenCalledWith(mockConnection, defaults.id, expect.any(Number), defaults.comment, defaults.rating);

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 204 and create the comment with no comment text too", async () => {
                    const response = await makePostRequest({ comment: undefined });

                    expectSuccessfulTransaction(mockConnection);
                    expect(database.insertGameMapComment).toHaveBeenCalledWith(mockConnection, defaults.id, expect.any(Number), null, defaults.rating);

                    expect(response.statusCode).toBe(204);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it.each([
                    { name: 'getConnection', databaseFunction: getConnection },
                    { name: 'mockConnection.beginTransaction', databaseFunction: mockConnection.beginTransaction },
                    { name: 'getGameMapDetails', databaseFunction: getGameMapDetails },
                    { name: 'database.hasUserCommentedOnGameMap', databaseFunction: database.hasUserCommentedOnGameMap }
                ])("Should respond with 500 if there is an unexpected database error during: $name", async ({ databaseFunction }) => {
                    databaseFunction.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during insertGameMapComment", async () => {
                    database.insertGameMapComment.mockRejectedValueOnce(new Error("Database error"));

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

        describe("DELETE /:gameMapID/my-comment", () => {
            const defaults = {
                id: randomId()
            };

            const makeDeleteRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.delete(`/api/game-maps/${encodeURIComponent(id)}/my-comment`),
                overrides,
                defaults
            );

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makeDeleteRequest());
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
                it("Should respond with 404 if the user has not commented yet", async () => {
                    database.hasUserCommentedOnGameMap.mockResolvedValueOnce(false);

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 404, ERRORS.COMMENT.NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 204 and delete the comment", async () => {
                    const response = await makeDeleteRequest();

                    expectSuccessfulTransaction(mockConnection);
                    expect(database.deleteUserCommentOnGameMap).toHaveBeenCalledWith(mockConnection, defaults.id, expect.any(Number));

                    expect(response.statusCode).toBe(204);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it.each([
                    { name: 'getConnection', databaseFunction: getConnection },
                    { name: 'mockConnection.beginTransaction', databaseFunction: mockConnection.beginTransaction },
                    { name: 'database.hasUserCommentedOnGameMap', databaseFunction: database.hasUserCommentedOnGameMap }
                ])("Should respond with 500 if there is an unexpected database error during: $name", async ({ databaseFunction }) => {
                    databaseFunction.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeDeleteRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });


                it("Should respond with 500 and rollback if deleteUserCommentOnGameMap fails", async () => {
                    database.deleteUserCommentOnGameMap.mockResolvedValueOnce(false);

                    const response = await makeDeleteRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.COMMENT.DELETE_FAILED);
                });

                it("Should respond with 500 and rollback if there is an unexpected database error during deleteUserCommentOnGameMap", async () => {
                    database.deleteUserCommentOnGameMap.mockRejectedValueOnce(new Error("Database error"));

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
