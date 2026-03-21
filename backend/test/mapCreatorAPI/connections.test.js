require("./helpers/setup-mocks.js");

const { createTestApp } = require("./helpers/setup-test.js");
const { testInvalidIDs, testRequiresAuth, expectSuccessfulTransaction, expectRollback, expectErrorResponse, randomId, buildRequest, suppressConsoleErrors } = require("./helpers/helpers.js");
const database = require("../../sql/database.js");
const { mockConnection } = require("./helpers/mock-database.js");


const requestWithSupertest = createTestApp();

describe("Map Creator API - Connection Endpoints - /api/map-creator/", () => {
    describe("GET /game-maps/:gameMapID/connections", () => {
        let mockConnections = [];
        const defaults = {
            id: randomId()
        };

        const makeGetRequest = (overrides = {}) => buildRequest(
            (id) => requestWithSupertest.get(`/api/map-creator/game-maps/${encodeURIComponent(id)}/connections`),
            overrides,
            defaults
        );

        beforeEach(() => {
            jest.clearAllMocks();
            database.checkUserOwnsGameMap.mockResolvedValue(true);
            mockConnections = [{
                connection_id: randomId(),
                start_point_id: randomId(),
                end_point_id: randomId(),
                start_map_id: randomId(),
                end_map_id: randomId()
            }];
            for (let i = 1; i < 4; i++) {
                mockConnections.push({
                    connection_id: mockConnections[i - 1].connection_id + randomId(),
                    start_point_id: mockConnections[i - 1].start_point_id + randomId(),
                    end_point_id: mockConnections[i - 1].end_point_id + randomId(),
                    start_map_id: mockConnections[i - 1].start_map_id + randomId(),
                    end_map_id: mockConnections[i - 1].end_map_id + randomId()
                });
            }
            database.getConnectionsByGameMapId.mockResolvedValue(mockConnections);
        });

        testRequiresAuth(() => makeGetRequest());

        it("Should respond with 400 if the game map id is incorrect", async () => {
            await testInvalidIDs(
                (id) => makeGetRequest({ id }),
                "Helytelen pálya ID"
            );
        });

        it("Should respond with 403 if it's not the user's game map", async () => {
            database.checkUserOwnsGameMap.mockResolvedValue(false);

            const response = await makeGetRequest();

            expect(response.statusCode).toBe(403);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Nincs hozzáférése ehhez a pályához");
        });

        it("Should return all connections for a game map", async () => {
            const response = await makeGetRequest();

            expect(response.statusCode).toBe(200);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("connections");
            expect(response.body.connections).toEqual(mockConnections);
            expect(response.body.connections.length).toBe(mockConnections.length);
        });

        it("Should return an empty array if the game map has no connections", async () => {
            database.getConnectionsByGameMapId.mockResolvedValue([]);

            const response = await makeGetRequest();

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("connections");
            expect(response.body.connections).toEqual([]);
        });

        describe("Server Errors", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if an unexpected database error occurs", async () => {
                database.getConnectionsByGameMapId.mockRejectedValueOnce(new Error("Database connection refused"));

                const response = await makeGetRequest();

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

        beforeEach(() => {
            jest.clearAllMocks();
            database.checkUserOwnsConnection.mockResolvedValue(true);
            database.deleteConnectionById.mockResolvedValue(true);
        });

        testRequiresAuth(() => makeDeleteRequest());

        it("Should respond with 400 if the connection id is incorrect", async () => {
            await testInvalidIDs(
                (id) => makeDeleteRequest({ id }),
                "Helytelen kapcsolat ID"
            );
        });

        it("Should respond with 403 if it's not the user's connection", async () => {
            database.checkUserOwnsConnection.mockResolvedValueOnce(false);

            const response = await makeDeleteRequest();

            expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Nincs hozzáférése ehhez a kapcsolathoz");
        });

        it("Should respond with 204 if the connection is successfully deleted", async () => {
            const response = await makeDeleteRequest();

            expect(database.deleteConnectionById).toHaveBeenCalledWith(mockConnection, defaults.id);

            expectSuccessfulTransaction(mockConnection);
            expect(response.statusCode).toBe(204);
        });

        it("Should respond with 404 if the connection deletion failed (probably it did not exist)", async () => {
            database.deleteConnectionById.mockResolvedValueOnce(false);

            const response = await makeDeleteRequest();

            expect(database.deleteConnectionById).toHaveBeenCalledWith(mockConnection, defaults.id);

            expectRollback(mockConnection);
            expectErrorResponse(response, 404, "A kapcsolat nem létezik vagy már törölve lett!");
        });

        describe("Server Errors", () => {
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
        });
    });

    describe("POST /game-maps/:gameMapID/connections", () => {
        const defaults = {
            id: randomId(),
            startPointId: randomId()
        };
        defaults.endPointId = defaults.startPointId + randomId();

        const makePostRequest = (overrides = {}) => buildRequest(
            (id) => requestWithSupertest.post(`/api/map-creator/game-maps/${encodeURIComponent(id)}/connections`),
            overrides,
            defaults
        );

        let newConnectionId;

        beforeEach(() => {
            jest.clearAllMocks();
            database.checkUserOwnsGameMap.mockResolvedValue(true);
            database.arePointsInSameGameMap.mockResolvedValue(true);
            database.doesConnectionAlreadyExist.mockResolvedValue(false);
            newConnectionId = randomId();
            database.insertConnection.mockResolvedValue(newConnectionId);
        });

        testRequiresAuth(() => makePostRequest());

        it("Should respond with 400 if the game map id is incorrect", async () => {
            await testInvalidIDs(
                (id) => makePostRequest({ id }),
                "Helytelen pálya ID"
            );
        });

        it("Should respond with 400 if the starting point id is incorrect", async () => {
            await testInvalidIDs(
                (startid) => makePostRequest({ startPointId: startid }),
                "Helytelen kezdőpont ID",
                false
            );
        });

        it("Should respond with 400 if the ending point id is incorrect", async () => {
            await testInvalidIDs(
                (endid) => makePostRequest({ endPointId: endid }),
                "Helytelen végpont ID",
                false
            );
        });

        it("Should respond with 400 if a body is not provided", async () => {
            const response = await makePostRequest({ startPointId: null, endPointId: null });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Hiányzó adatok!");
        });

        it("Should respond with 403 if it's not the user's game map", async () => {
            database.checkUserOwnsGameMap.mockResolvedValueOnce(false);

            const response = await makePostRequest();

            expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
            expect(response.statusCode).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Nincs hozzáférése ehhez a pályához");
        });

        describe("Test missing fields", () => {
            const missingFields = [
                { field: "startPointId", overrides: { startPointId: undefined }, errorMsg: "Helytelen kezdőpont ID" },
                { field: "endPointId", overrides: { endPointId: undefined }, errorMsg: "Helytelen végpont ID" }
            ];

            it.each(missingFields)("Should respond with 400 if $field is missing", async ({ overrides, errorMsg }) => {
                const response = await makePostRequest(overrides);

                expect(response.statusCode).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.error).toBe(errorMsg);
            });
        });

        it("Should respond with 400 if starting and ending point ids are the same", async () => {
            const response = await makePostRequest({ endPointId: defaults.startPointId });

            expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("A kezdőpont és a végpont nem lehet ugyanaz!");
        });

        it("Should respond with 400 if starting and ending points are not in the same game map and the ids are not in the given game map", async () => {
            database.arePointsInSameGameMap.mockResolvedValue(false);

            const response = await makePostRequest();

            expect(database.arePointsInSameGameMap).toHaveBeenCalledWith(mockConnection, defaults.startPointId, defaults.endPointId, defaults.id);
            expectRollback(mockConnection);

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("A megadott pontok nem ugyanahhoz a pályához tartoznak!");
        });

        it("Should respond with 400 if connection between starting and ending points already exists", async () => {
            database.doesConnectionAlreadyExist.mockResolvedValue(true);

            const response = await makePostRequest();

            expect(database.doesConnectionAlreadyExist).toHaveBeenCalledWith(mockConnection, defaults.startPointId, defaults.endPointId);
            expectRollback(mockConnection);

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("A megadott pontok már össze vannak kapcsolva!");
        });

        it("Should respond with 201 if connection was created successfully", async () => {
            const response = await makePostRequest();

            expect(database.insertConnection).toHaveBeenCalledWith(mockConnection, defaults.startPointId, defaults.endPointId, defaults.id);
            expectSuccessfulTransaction(mockConnection);

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty("connectionId", newConnectionId);
            expect(response.body.message).toBe("Kapcsolat sikeresen mentve!");
        });

        describe("Server Errors", () => {
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
});
