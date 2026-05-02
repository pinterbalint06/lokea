const { createTestApp } = require("./helpers/setup-test.js");
const {
    randomId,
    buildRequest,
    testInvalidIDs,
    expectErrorResponse,
    suppressConsoleErrors,
    testRequiresAuth
} = require("#testhelpers/helpers.js");

const ERRORS = require("#utils/error-messages.js");

const database = require("#gamemaps/paths/paths.queries.js");
const { isAllowedToAccessPoint } = require("#gamemaps/shared/middlewares/gamemaps.middleware.js");

const requestWithSupertest = createTestApp();

describe("Game Maps API - /api/game-maps/", () => {
    describe("Paths Endpoints", () => {
        describe("GET /points/:pointID/paths", () => {
            const defaults = {
                id: randomId()
            };

            const makeGetRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.get(`/api/game-maps/points/${encodeURIComponent(id)}/paths`),
                overrides,
                defaults
            );

            beforeEach(() => {
                isAllowedToAccessPoint.mockImplementation((req, res, next) => next());
            });

            afterEach(() => {
                isAllowedToAccessPoint.mockReset();
            });

            describe("Authorization (401, 403)", () => {
                testRequiresAuth(() => makeGetRequest());

                it("Should respond with 403 if the user is not allowed to access the point", async () => {
                    isAllowedToAccessPoint.mockImplementationOnce((request, response, next) => {
                        response.status(403).json({ error: ERRORS.POINT.NO_ACCESS });
                    });

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 403, ERRORS.POINT.NO_ACCESS);
                    expect(database.getConnectionsByPointId).not.toHaveBeenCalled();
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the point id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeGetRequest({ id }),
                        ERRORS.POINT.INVALID_ID
                    );
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 200 and return empty paths if there are no connections", async () => {
                    database.getConnectionsByPointId.mockResolvedValueOnce([]);

                    const response = await makeGetRequest();

                    expect(database.getConnectionsByPointId).toHaveBeenCalledWith(defaults.id);
                    expect(response.statusCode).toBe(200);
                    expect(response.body).toEqual({ paths: [] });
                });

                it("Should respond with 200 and calculate cross-map directions correctly", async () => {
                    const mockConnections = [
                        {
                            start_point_id: defaults.id,
                            end_point_id: 101,
                            start_map_id: 1,
                            end_map_id: 2,
                            direction_start_to_end: 145.5,
                            direction_end_to_start: 325.5
                        },
                        {
                            start_point_id: 102,
                            end_point_id: defaults.id,
                            start_map_id: 3,
                            end_map_id: 1,
                            direction_start_to_end: 90,
                            direction_end_to_start: 270
                        }
                    ];

                    database.getConnectionsByPointId.mockResolvedValueOnce(mockConnections);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toEqual({
                        paths: [
                            {
                                targetPointId: 101,
                                directionDegrees: 145.5
                            },
                            {
                                targetPointId: 102,
                                directionDegrees: 270
                            }
                        ]
                    });
                });

                it("Should respond with 200 and calculate same-map directions correctly", async () => {
                    const mockConnections = [
                        {
                            start_point_id: defaults.id,
                            end_point_id: 101,
                            start_map_id: 1,
                            end_map_id: 1,
                            start_u: 0.5,
                            start_v: 0.5,
                            end_u: 0.5,
                            end_v: 0.25,
                            map_width: 1000,
                            map_height: 1000
                        },
                        {
                            start_point_id: 102,
                            end_point_id: defaults.id,
                            start_map_id: 1,
                            end_map_id: 1,
                            start_u: 0.75,
                            start_v: 0.5,
                            end_u: 0.5,
                            end_v: 0.5,
                            map_width: 1000,
                            map_height: 1000
                        }
                    ];

                    database.getConnectionsByPointId.mockResolvedValueOnce(mockConnections);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toEqual({
                        paths: [
                            {
                                targetPointId: 101,
                                directionDegrees: 0
                            },
                            {
                                targetPointId: 102,
                                directionDegrees: 90
                            }
                        ]
                    });
                });

                it("Should respond with 200 and normalize degrees correctly", async () => {
                    const mockConnections = [
                        {
                            start_point_id: defaults.id,
                            end_point_id: 101,
                            start_map_id: 1,
                            end_map_id: 2,
                            direction_start_to_end: 360,
                            direction_end_to_start: 0
                        },
                        {
                            start_point_id: defaults.id,
                            end_point_id: 102,
                            start_map_id: 1,
                            end_map_id: 2,
                            direction_start_to_end: -90,
                            direction_end_to_start: 0
                        },
                        {
                            start_point_id: defaults.id,
                            end_point_id: 103,
                            start_map_id: 1,
                            end_map_id: 2,
                            direction_start_to_end: 450,
                            direction_end_to_start: 0
                        },
                        {
                            start_point_id: defaults.id,
                            end_point_id: 104,
                            start_map_id: 1,
                            end_map_id: 2,
                            direction_start_to_end: 359.9999999,
                            direction_end_to_start: 0
                        }
                    ];

                    database.getConnectionsByPointId.mockResolvedValueOnce(mockConnections);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toEqual({
                        paths: [
                            { targetPointId: 101, directionDegrees: 0 },
                            { targetPointId: 102, directionDegrees: 270 },
                            { targetPointId: 103, directionDegrees: 90 },
                            { targetPointId: 104, directionDegrees: 0 }
                        ]
                    });
                });

                it("Should respond with 200 and handle invalid directions as null", async () => {
                    const mockConnections = [
                        {
                            start_point_id: defaults.id,
                            end_point_id: 105,
                            start_map_id: 1,
                            end_map_id: 2,
                            direction_start_to_end: "invalid_num",
                            direction_end_to_start: 0
                        }
                    ];

                    database.getConnectionsByPointId.mockResolvedValueOnce(mockConnections);

                    const response = await makeGetRequest();

                    expect(response.statusCode).toBe(200);
                    expect(response.body).toEqual({
                        paths: [
                            { targetPointId: 105, directionDegrees: null }
                        ]
                    });
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if an unexpected database error occurs", async () => {
                    database.getConnectionsByPointId.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 if connections array contains connections not related to pointID", async () => {
                    const mockConnections = [
                        {
                            // 1st element is valid
                            start_point_id: defaults.id,
                            end_point_id: 101,
                            start_map_id: 1,
                            end_map_id: 2,
                            direction_start_to_end: 180,
                            direction_end_to_start: 0
                        },
                        {
                            // 2nd element is invalid
                            start_point_id: 999,
                            end_point_id: 1000,
                            start_map_id: 1,
                            end_map_id: 2,
                            direction_start_to_end: 180,
                            direction_end_to_start: 0
                        }
                    ];

                    database.getConnectionsByPointId.mockResolvedValueOnce(mockConnections);

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 if same map connection lacks map_width", async () => {
                    const mockConnections = [
                        {
                            start_point_id: defaults.id,
                            end_point_id: 101,
                            start_map_id: 1,
                            end_map_id: 1,
                            start_u: 0.5,
                            start_v: 0.5,
                            end_u: 0.6,
                            end_v: 0.6,
                            map_width: null,
                            map_height: 1000
                        }
                    ];

                    database.getConnectionsByPointId.mockResolvedValueOnce(mockConnections);

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });

                it("Should respond with 500 if same map connection lacks map_height", async () => {
                    const mockConnections = [
                        {
                            start_point_id: defaults.id,
                            end_point_id: 101,
                            start_map_id: 1,
                            end_map_id: 1,
                            start_u: 0.5,
                            start_v: 0.5,
                            end_u: 0.6,
                            end_v: 0.6,
                            map_width: 1000,
                            map_height: null
                        }
                    ];

                    database.getConnectionsByPointId.mockResolvedValueOnce(mockConnections);

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });
    });
});
