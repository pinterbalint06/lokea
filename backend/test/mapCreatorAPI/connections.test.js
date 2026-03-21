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
});
