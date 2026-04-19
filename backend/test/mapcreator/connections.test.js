const { createTestApp } = require("#mapcreatortest/helpers/setup-test.js");
const { testInvalidIDs, testRequiresAuth, expectSuccessfulTransaction, expectRollback, expectErrorResponse, randomId, buildRequest, suppressConsoleErrors } = require("#mapcreatortest/helpers/helpers.js");
const { invalidTypeNumbers, negativeNumbers, tooBigDegrees, } = require("#mapcreatortest/helpers/test-data.js");

const database = require("#sql/database.js");
const { mockConnection } = database;

const ERRORS = require("#utils/errorMessages.js");


const requestWithSupertest = createTestApp();

describe("Map Creator API - /api/map-creator/", () => {
    describe("Connection Endpoints", () => {
        describe("GET /game-maps/:gameMapID/connections", () => {
            let mockConnectionsData = [];
            const defaults = {
                id: randomId()
            };

            const makeGetRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.get(`/api/map-creator/game-maps/${encodeURIComponent(id)}/connections`),
                overrides,
                defaults
            );

            beforeEach(() => {
                mockConnectionsData = [{
                    connection_id: randomId(),
                    start_point_id: randomId(),
                    end_point_id: randomId(),
                    start_map_id: randomId(),
                    end_map_id: randomId(),
                    start_to_end_direction: Math.floor(Math.random() * 360),
                    end_to_start_direction: Math.floor(Math.random() * 360)
                }];
                for (let i = 1; i < 4; i++) {
                    mockConnectionsData.push({
                        connection_id: mockConnectionsData[i - 1].connection_id + randomId(),
                        start_point_id: mockConnectionsData[i - 1].start_point_id + randomId(),
                        end_point_id: mockConnectionsData[i - 1].end_point_id + randomId(),
                        start_map_id: mockConnectionsData[i - 1].start_map_id + randomId(),
                        end_map_id: mockConnectionsData[i - 1].end_map_id + randomId(),
                        direction_start_to_end: Math.floor(Math.random() * 360),
                        direction_end_to_start: Math.floor(Math.random() * 360)
                    });
                }
                for (let i = 1; i < 4; i++) {
                    let mapId = mockConnectionsData[i - 1].start_map_id + randomId();
                    mockConnectionsData.push({
                        connection_id: mockConnectionsData[i - 1].connection_id + randomId(),
                        start_point_id: mockConnectionsData[i - 1].start_point_id + randomId(),
                        end_point_id: mockConnectionsData[i - 1].end_point_id + randomId(),
                        start_map_id: mapId,
                        end_map_id: mapId
                    });
                }
                database.getConnectionsByGameMapId.mockResolvedValue(mockConnectionsData);
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makeGetRequest());

                it("Should respond with 403 if it's not the user's game map", async () => {
                    database.checkUserOwnsGameMap.mockResolvedValueOnce(false);

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 403, ERRORS.GAMEMAP.NO_ACCESS);
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeGetRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
                    );
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should return all connections for a game map", async () => {
                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.type).toEqual(expect.stringContaining("json"));
                    expect(response.body).toHaveProperty("connections");
                    expect(response.body.connections).toEqual(mockConnectionsData);
                    expect(response.body.connections.length).toBe(mockConnectionsData.length);
                });

                it("Should return an empty array if the game map has no connections", async () => {
                    database.getConnectionsByGameMapId.mockResolvedValueOnce([]);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toHaveProperty("connections");
                    expect(response.body.connections).toEqual([]);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if an unexpected database error occurs", async () => {
                    database.getConnectionsByGameMapId.mockRejectedValueOnce(new Error("Database connection refused"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response);
                });
            });
        });

        describe("PUT /connections/:connectionID", () => {
            const defaults = {
                id: randomId(),
                directionStartToEnd: Math.floor(Math.random() * 360),
                directionEndToStart: Math.floor(Math.random() * 360)
            };

            const makePutRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.put(`/api/map-creator/connections/${encodeURIComponent(id)}`),
                overrides,
                defaults
            );

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePutRequest());

                it("Should respond with 403 if it's not the user's connection", async () => {
                    database.checkUserOwnsConnection.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 403, ERRORS.CONNECTION.NO_ACCESS);
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if a body is not provided", async () => {
                    const response = await makePutRequest({ directionStartToEnd: undefined, directionEndToStart: undefined });

                    expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_DATA);
                });

                it("Should respond with 400 if the connection id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makePutRequest({ id }),
                        ERRORS.CONNECTION.INVALID_ID
                    );
                });

                it("Should respond with 400 if the connection is not a crossmap connection", async () => {
                    database.isConnectionCrossMap.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expectErrorResponse(response, 400, ERRORS.CONNECTION.NOT_CROSSMAP);
                });

                describe("Direction validation", () => {

                    it("Should respond with 400 if no direction changes were given", async () => {
                        const response = await makePutRequest({ directionStartToEnd: undefined, directionEndToStart: undefined, randomField: "randomValue" });

                        expectErrorResponse(response, 400, ERRORS.CONNECTION.ATLEAST_ONE_DIRECTION);
                    });

                    ["directionStartToEnd", "directionEndToStart"].forEach((directionField) => {
                        it.each(invalidTypeNumbers)(`Should respond with 400 if ${directionField} is invalid: '%s'`, async (invalidValue) => {
                            database.arePointsInSameMap.mockResolvedValueOnce(false);

                            const response = await makePutRequest({ [directionField]: invalidValue });

                            expectErrorResponse(
                                response,
                                400,
                                directionField == "directionStartToEnd"
                                    ? ERRORS.CONNECTION.START_TO_END_TYPE
                                    : ERRORS.CONNECTION.END_TO_START_TYPE
                            );
                        });

                        it.each(negativeNumbers)(`Should respond with 400 if ${directionField} is invalid: '%s'`, async (invalidValue) => {
                            database.arePointsInSameMap.mockResolvedValueOnce(false);

                            const response = await makePutRequest({ [directionField]: invalidValue });

                            expectErrorResponse(
                                response,
                                400,
                                directionField == "directionStartToEnd"
                                    ? ERRORS.CONNECTION.START_TO_END_MIN
                                    : ERRORS.CONNECTION.END_TO_START_MIN
                            );
                        });

                        it.each(tooBigDegrees)(`Should respond with 400 if ${directionField} is invalid: '%s'`, async (invalidValue) => {
                            database.arePointsInSameMap.mockResolvedValueOnce(false);

                            const response = await makePutRequest({ [directionField]: invalidValue });

                            expectErrorResponse(
                                response,
                                400,
                                directionField == "directionStartToEnd"
                                    ? ERRORS.CONNECTION.START_TO_END_MAX
                                    : ERRORS.CONNECTION.END_TO_START_MAX
                            );
                        });
                    });
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 200 if only directionStartToEnd was updated", async () => {
                    const response = await makePutRequest({ directionEndToStart: undefined });

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.isConnectionCrossMap).toHaveBeenCalledWith(mockConnection, defaults.id);
                    expect(database.updateConnectionDirections).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.directionStartToEnd, null);

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 200 if only directionEndToStart was updated", async () => {
                    const response = await makePutRequest({ directionStartToEnd: undefined });

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.isConnectionCrossMap).toHaveBeenCalledWith(mockConnection, defaults.id);
                    expect(database.updateConnectionDirections).toHaveBeenCalledWith(mockConnection, defaults.id, null, defaults.directionEndToStart);

                    expect(response.statusCode).toBe(204);
                });

                it("Should respond with 200 if both directions were updated", async () => {
                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(database.isConnectionCrossMap).toHaveBeenCalledWith(mockConnection, defaults.id);
                    expect(database.updateConnectionDirections).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.directionStartToEnd, defaults.directionEndToStart);

                    expect(response.statusCode).toBe(204);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if the database refused connection", async () => {
                    database.getConnection.mockRejectedValueOnce(new Error("Database connection refused"));

                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();

                    expectErrorResponse(response);
                });

                it("Should respond with 500 and rollback if isConnectionCrossMap throws error", async () => {
                    database.isConnectionCrossMap.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePutRequest();

                    expect(database.isConnectionCrossMap).toHaveBeenCalledWith(mockConnection, defaults.id);

                    expectRollback(mockConnection);
                    expectErrorResponse(response);
                });

                it("Should respond with 500 and rollback if updateConnectionDirections throws error", async () => {
                    database.updateConnectionDirections.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePutRequest();

                    expect(database.updateConnectionDirections).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.directionStartToEnd, defaults.directionEndToStart);

                    expectRollback(mockConnection);
                    expectErrorResponse(response);
                });

                it("Should respond with 500 and rollback if updateConnectionDirections failed", async () => {
                    database.updateConnectionDirections.mockResolvedValueOnce(false);

                    const response = await makePutRequest();

                    expect(database.updateConnectionDirections).toHaveBeenCalledWith(mockConnection, defaults.id, defaults.directionStartToEnd, defaults.directionEndToStart);

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.CONNECTION.UPDATE_FAILED);
                });

                it("Should respond with 500 and rollback if database commit fails", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error on commit"));

                    const response = await makePutRequest();

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(mockConnection.commit).toHaveBeenCalled();
                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();
                    expectErrorResponse(response);
                });
            });
        });

        describe("POST /game-maps/:gameMapID/connections", () => {
            const defaults = {
                id: randomId(),
                startPointId: randomId(),
                directionStartToEnd: Math.floor(Math.random() * 360),
                directionEndToStart: Math.floor(Math.random() * 360)
            };
            defaults.endPointId = defaults.startPointId + randomId() + 1;

            const makePostRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.post(`/api/map-creator/game-maps/${encodeURIComponent(id)}/connections`),
                overrides,
                defaults
            );

            let newConnectionId;

            beforeEach(() => {
                newConnectionId = randomId();
                database.insertConnection.mockResolvedValue(newConnectionId);
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makePostRequest());

                it("Should respond with 403 if it's not the user's game map", async () => {
                    database.checkUserOwnsGameMap.mockResolvedValueOnce(false);

                    const response = await makePostRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 403, ERRORS.GAMEMAP.NO_ACCESS);
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
                    const response = await makePostRequest({ startPointId: undefined, endPointId: undefined, directionStartToEnd: undefined, directionEndToStart: undefined });

                    expectErrorResponse(response, 400, ERRORS.COMMON.MISSING_DATA);
                });

                describe("Test missing fields", () => {
                    const missingFields = [
                        { field: "startPointId", overrides: { startPointId: undefined }, errorMsg: ERRORS.CONNECTION.INVALID_START_ID },
                        { field: "endPointId", overrides: { endPointId: undefined }, errorMsg: ERRORS.CONNECTION.INVALID_END_ID }
                    ];

                    it.each(missingFields)("Should respond with 400 if $field is missing", async ({ overrides, errorMsg }) => {
                        const response = await makePostRequest(overrides);

                        expectErrorResponse(response, 400, errorMsg);
                    });
                });

                describe("Direction validation", () => {
                    ["directionStartToEnd", "directionEndToStart"].forEach((directionField) => {
                        it.each(invalidTypeNumbers)(`Should respond with 400 if ${directionField} is invalid: %s`, async (invalidValue) => {
                            database.arePointsInSameMap.mockResolvedValueOnce(false);

                            const response = await makePostRequest({ [directionField]: invalidValue });

                            expectErrorResponse(
                                response,
                                400,
                                directionField == "directionStartToEnd"
                                    ? ERRORS.CONNECTION.START_TO_END_TYPE
                                    : ERRORS.CONNECTION.END_TO_START_TYPE
                            );
                        });

                        it(`Should respond with 400 if ${directionField} is missing`, async () => {
                            database.arePointsInSameMap.mockResolvedValueOnce(false);

                            const response = await makePostRequest({ [directionField]: undefined });

                            expectErrorResponse(response, 400, ERRORS.CONNECTION.DIRECTION_NOT_GIVEN_FOR_CROSSMAP);
                        });
                    });
                });

                describe("Starting and ending point validation", () => {
                    it("Should respond with 400 if the starting point id is incorrect", async () => {
                        await testInvalidIDs(
                            (startid) => makePostRequest({ startPointId: startid }),
                            ERRORS.CONNECTION.INVALID_START_ID,
                            false
                        );
                    });

                    it("Should respond with 400 if the ending point id is incorrect", async () => {
                        await testInvalidIDs(
                            (endid) => makePostRequest({ endPointId: endid }),
                            ERRORS.CONNECTION.INVALID_END_ID,
                            false
                        );
                    });

                    it("Should respond with 400 if the starting id is bigger than the end id", async () => {
                        const response = await makePostRequest({ startPointId: defaults.endPointId, endPointId: defaults.startPointId });

                        expectErrorResponse(response, 400, ERRORS.CONNECTION.END_MUST_BE_GREATER);
                    });

                    it("Should respond with 400 if starting and ending point ids are the same", async () => {
                        const response = await makePostRequest({ endPointId: defaults.startPointId });

                        expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                        expectErrorResponse(response, 400, ERRORS.CONNECTION.SAME_START_END);
                    });

                    it("Should respond with 400 if starting and ending points are not in the same game map and the ids are not in the given game map", async () => {
                        database.arePointsInSameGameMap.mockResolvedValueOnce(false);

                        const response = await makePostRequest();

                        expect(database.arePointsInSameGameMap).toHaveBeenCalledWith(mockConnection, defaults.startPointId, defaults.endPointId, defaults.id);
                        expectRollback(mockConnection);

                        expectErrorResponse(response, 400, ERRORS.CONNECTION.NOT_ON_SAME_GAME_MAP);
                    });
                });
            });

            describe("Conflicts, (404, 409)", () => {
                it("Should respond with 409 if connection between starting and ending points already exists", async () => {
                    database.doesConnectionAlreadyExist.mockResolvedValueOnce(true);

                    const response = await makePostRequest();

                    expect(database.doesConnectionAlreadyExist).toHaveBeenCalledWith(mockConnection, defaults.startPointId, defaults.endPointId);
                    expectRollback(mockConnection);

                    expectErrorResponse(response, 409, ERRORS.CONNECTION.ALREADY_EXISTS);
                });
            })

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 201 if connection was created successfully", async () => {
                    const response = await makePostRequest();

                    expect(database.insertConnection).toHaveBeenCalledWith(mockConnection, defaults.startPointId, defaults.endPointId, defaults.id, defaults.directionStartToEnd, defaults.directionEndToStart);
                    expectSuccessfulTransaction(mockConnection);

                    expect(response.statusCode).toBe(201);
                    expect(response.body).toHaveProperty("connectionId", newConnectionId);
                });

                it("Should respond with 201 if connection was created successfully offmap connection", async () => {
                    database.arePointsInSameMap.mockResolvedValueOnce(false);

                    const response = await makePostRequest();

                    expect(database.insertConnection).toHaveBeenCalledWith(mockConnection, defaults.startPointId, defaults.endPointId, defaults.id, defaults.directionStartToEnd, defaults.directionEndToStart);
                    expectSuccessfulTransaction(mockConnection);

                    expect(response.statusCode).toBe(201);
                    expect(response.body).toHaveProperty("connectionId", newConnectionId);
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if the database refused connection", async () => {
                    database.getConnection.mockRejectedValueOnce(new Error("Database connection refused"));

                    const response = await makePostRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();

                    expectErrorResponse(response);
                });

                it("Should respond with 500 and rollback if arePointsInSameGameMap throws error", async () => {
                    database.arePointsInSameGameMap.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response);
                });

                it("Should respond with 500 and rollback if doesConnectionAlreadyExist throws error", async () => {
                    database.doesConnectionAlreadyExist.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response);
                });

                it("Should respond with 500 and rollback if insertConnection throws error", async () => {
                    database.insertConnection.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makePostRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response);
                });

                it("Should respond with 500 and rollback if database commit fails", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error on commit"));

                    const response = await makePostRequest();

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(mockConnection.commit).toHaveBeenCalled();
                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();
                    expectErrorResponse(response);
                });
            });
        });

        describe("DELETE /connections/:connectionID", () => {
            const defaults = {
                id: randomId()
            };

            const makeDeleteRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.delete(`/api/map-creator/connections/${encodeURIComponent(id)}`),
                overrides,
                defaults
            );

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makeDeleteRequest());

                it("Should respond with 403 if it's not the user's connection", async () => {
                    database.checkUserOwnsConnection.mockResolvedValueOnce(false);

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
                    expectErrorResponse(response, 403, ERRORS.CONNECTION.NO_ACCESS);
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the connection id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeDeleteRequest({ id }),
                        ERRORS.CONNECTION.INVALID_ID
                    );
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 204 if the connection is successfully deleted", async () => {
                    const response = await makeDeleteRequest();

                    expect(database.deleteConnectionById).toHaveBeenCalledWith(mockConnection, defaults.id);

                    expectSuccessfulTransaction(mockConnection);
                    expect(response.statusCode).toBe(204);
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

                it("Should respond with 500 and rollback if deleteConnectionById throws error", async () => {
                    database.deleteConnectionById.mockRejectedValueOnce(new Error("Database error on delete"));

                    const response = await makeDeleteRequest();

                    expectRollback(mockConnection);
                    expectErrorResponse(response);
                });

                it("Should respond with 500 and rollback if database commit fails", async () => {
                    mockConnection.commit.mockRejectedValueOnce(new Error("Database error on commit"));

                    const response = await makeDeleteRequest();

                    expect(mockConnection.beginTransaction).toHaveBeenCalled();
                    expect(mockConnection.commit).toHaveBeenCalled();
                    expect(mockConnection.rollback).toHaveBeenCalled();
                    expect(mockConnection.release).toHaveBeenCalled();
                    expectErrorResponse(response);
                });

                it("Should respond with 500 if the connection deletion failed", async () => {
                    database.deleteConnectionById.mockResolvedValueOnce(false);

                    const response = await makeDeleteRequest();

                    expect(database.deleteConnectionById).toHaveBeenCalledWith(mockConnection, defaults.id);

                    expectRollback(mockConnection);
                    expectErrorResponse(response, 500, ERRORS.CONNECTION.DELETE_FAILED);
                });
            });
        });
    });
});
