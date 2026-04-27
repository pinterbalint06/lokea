const { createGameApiTestApp } = require("#gametest/helpers/setup-test.js");
const { testRequiresGameSession, suppressConsoleErrors } = require("#gametest/helpers/helpers.js");
const { checkGameSession } = require("#root/auth.js");
const database = require("#sql/database.js");
const { mockConnection } = database;
const fs = require("fs/promises");

const requestWithSupertest = createGameApiTestApp();

const mockMap = {
    map_id: 1,
    title: "Test Map",
    filepath: "1/1/test.webp",
    width: 800,
    height: 600,
    image_id: 10
};

const mockPoint = {
    point_id: 10,
    point_u: 0.5,
    point_v: 0.5,
    north_direction: 0,
    map_id: 1,
    filepath: "1/1/point.webp",
    image_id: 20,
    width: 800,
    height: 600
};

describe("Game API - /api/game/", () => {
    let readFileSpy;

    beforeEach(() => {
        readFileSpy = jest.spyOn(fs, "readFile").mockResolvedValue(Buffer.from("fake-image-data"));
    });

    afterEach(() => {
        readFileSpy.mockRestore();
    });

    describe("GET /get_game_info", () => {
        describe("Authorization (401, 403)", () => {
            testRequiresGameSession(() => requestWithSupertest.get("/api/game/get_game_info"));
        });

        describe("Happy paths (200)", () => {
            it("Should return game info from the session", async () => {
                const response = await requestWithSupertest.get("/api/game/get_game_info");

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.game).toEqual({
                    title: "Test Game",
                    rounds: 5,
                    currentRound: 0,
                    roundTime: 60
                });
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if game is missing from session", async () => {
                checkGameSession.mockImplementationOnce((request, response, next) => {
                    request.session = { userid: 1, game: null };
                    next();
                });

                const response = await requestWithSupertest.get("/api/game/get_game_info");

                expect(response.statusCode).toBe(500);
                expect(response.body.success).toBe(false);
            });
        });
    });

    describe("GET /get_all_maps", () => {
        beforeEach(() => {
            database.getAllMaps.mockResolvedValue([mockMap]);
        });

        describe("Authorization (401, 403)", () => {
            testRequiresGameSession(() => requestWithSupertest.get("/api/game/get_all_maps"));
        });

        describe("Happy paths (200)", () => {
            it("Should return maps with base64 image data", async () => {
                const response = await requestWithSupertest.get("/api/game/get_all_maps");

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.maps).toHaveLength(1);
                expect(response.body.maps[0].title).toBe("Test Map");
                expect(response.body.maps[0].image.base64).toBe(Buffer.from("fake-image-data").toString("base64"));
                expect(response.body.maps[0].image.mimeType).toBe("image/webp");
                expect(database.getAllMaps).toHaveBeenCalledWith(100);
            });

            it("Should return an empty maps array if there are no maps", async () => {
                database.getAllMaps.mockResolvedValueOnce([]);

                const response = await requestWithSupertest.get("/api/game/get_all_maps");

                expect(response.statusCode).toBe(200);
                expect(response.body.maps).toEqual([]);
            });
        });

        describe("Input validation (400)", () => {
            it("Should respond with 400 for a path traversal attack in map filepath", async () => {
                database.getAllMaps.mockResolvedValueOnce([
                    { ...mockMap, filepath: "../../../etc/passwd" }
                ]);

                const response = await requestWithSupertest.get("/api/game/get_all_maps");

                expect(response.statusCode).toBe(400);
                expect(response.body.success).toBe(false);
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if the database throws", async () => {
                database.getAllMaps.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest.get("/api/game/get_all_maps");

                expect(response.statusCode).toBe(500);
                expect(response.body.success).toBe(false);
            });

            it("Should respond with 500 if file reading fails", async () => {
                readFileSpy.mockRejectedValueOnce(new Error("File read error"));

                const response = await requestWithSupertest.get("/api/game/get_all_maps");

                expect(response.statusCode).toBe(500);
                expect(response.body.success).toBe(false);
            });
        });
    });

    describe("GET /get_random_point", () => {
        describe("Authorization (401, 403)", () => {
            testRequiresGameSession(() => requestWithSupertest.get("/api/game/get_random_point"));
        });

        describe("Happy paths (200)", () => {
            it("Should return the existing current point if one is set", async () => {
                database.getCurrentPointId.mockResolvedValueOnce(10);
                database.getPointById.mockResolvedValueOnce(mockPoint);

                const response = await requestWithSupertest.get("/api/game/get_random_point");

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.point.point_id).toBe(mockPoint.point_id);
                expect(response.body.point.north_direction).toBe(mockPoint.north_direction);
                expect(response.body.point.image.base64).toBeTruthy();
                expect(database.getPointById).toHaveBeenCalledWith(10);
            });

            it("Should get a random point if there is no current point", async () => {
                database.getCurrentPointId.mockResolvedValueOnce(null);
                database.getRandomPoint.mockResolvedValueOnce(mockPoint);

                const response = await requestWithSupertest.get("/api/game/get_random_point");

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(database.getRandomPoint).toHaveBeenCalledWith(100, 1);
                expect(database.incrementCycle).not.toHaveBeenCalled();
            });

            it("Should increment cycle and retry when no random point is found on first attempt", async () => {
                database.getCurrentPointId.mockResolvedValueOnce(null);
                database.getRandomPoint
                    .mockResolvedValueOnce(null)
                    .mockResolvedValueOnce(mockPoint);

                const response = await requestWithSupertest.get("/api/game/get_random_point");

                expect(response.statusCode).toBe(200);
                expect(database.incrementCycle).toHaveBeenCalledWith(1);
                expect(database.getRandomPoint).toHaveBeenCalledTimes(2);
            });

            it("Should set roundStartedAt in session if it was not already set", async () => {
                const session = {
                    userid: 1,
                    game: {
                        activeSessionId: 1,
                        gameMapId: 100,
                        currentCycle: 1,
                        roundStartedAt: null
                    }
                };

                checkGameSession.mockImplementationOnce((request, response, next) => {
                    request.session = session;
                    next();
                });
                database.getCurrentPointId.mockResolvedValueOnce(null);
                database.getRandomPoint.mockResolvedValueOnce(mockPoint);

                const response = await requestWithSupertest.get("/api/game/get_random_point");

                expect(response.statusCode).toBe(200);
                expect(session.game.roundStartedAt).toBeTruthy();
            });
        });

        describe("Input validation (400)", () => {
            it("Should respond with 400 for a path traversal attack in point filepath", async () => {
                database.getCurrentPointId.mockResolvedValueOnce(null);
                database.getRandomPoint.mockResolvedValueOnce({
                    ...mockPoint,
                    filepath: "../../../etc/passwd"
                });

                const response = await requestWithSupertest.get("/api/game/get_random_point");

                expect(response.statusCode).toBe(400);
                expect(response.body.success).toBe(false);
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if no points are available after cycle increment", async () => {
                database.getCurrentPointId.mockResolvedValueOnce(null);
                database.getRandomPoint.mockResolvedValue(null);

                const response = await requestWithSupertest.get("/api/game/get_random_point");

                expect(response.statusCode).toBe(500);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe("No points available");
            });

            it("Should respond with 500 if the database throws", async () => {
                database.getCurrentPointId.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest.get("/api/game/get_random_point");

                expect(response.statusCode).toBe(500);
                expect(response.body.success).toBe(false);
            });
        });
    });

    describe("POST /session_guess", () => {
        const validGuess = { u: "0.5", v: "0.5", map_i: "0" };

        beforeEach(() => {
            database.getCurrentPointId.mockResolvedValue(10);
        });

        describe("Authorization (401, 403)", () => {
            testRequiresGameSession(() =>
                requestWithSupertest.post("/api/game/session_guess").send(validGuess)
            );
        });

        describe("Input validation (400)", () => {
            it("Should respond with 400 if there is no active round", async () => {
                database.getCurrentPointId.mockResolvedValueOnce(null);

                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("No active round");
            });

            it("Should respond with 400 if mapInfo is not loaded", async () => {
                checkGameSession.mockImplementationOnce((request, response, next) => {
                    request.session = {
                        userid: 1,
                        game: {
                            activeSessionId: 1,
                            sharpness: -3,
                            roundTime: 60,
                            currentCycle: 1,
                            point: { pointId: 10, pointu: 0.5, pointv: 0.5, mapId: 1 }
                        }
                    };
                    next();
                });

                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Game maps not loaded");
            });

            it("Should respond with 400 if there is no active point in session", async () => {
                checkGameSession.mockImplementationOnce((request, response, next) => {
                    request.session = {
                        userid: 1,
                        game: {
                            activeSessionId: 1,
                            sharpness: -3,
                            roundTime: 60,
                            currentCycle: 1,
                            mapInfo: [{ mapId: 1, width: 800, height: 600 }]
                        }
                    };
                    next();
                });

                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("No active point in session");
            });

            it("Should respond with 400 if guess coordinates are not numbers", async () => {
                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send({ u: "abc", v: "0.5", map_i: "0" });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Invalid guess coordinates");
            });

            it("Should respond with 400 if map index is invalid (mapOb not found)", async () => {
                checkGameSession.mockImplementationOnce((request, response, next) => {
                    request.session = {
                        userid: 1,
                        game: {
                            activeSessionId: 1,
                            sharpness: -3,
                            roundTime: 60,
                            currentCycle: 1,
                            mapInfo: [],
                            point: { pointId: 10, pointu: 0.5, pointv: 0.5, mapId: 999 },
                            roundStartedAt: Date.now() - 5000
                        }
                    };
                    next();
                });

                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Invalid map index");
            });
        });

        describe("Score = 0 cases", () => {
            it("Should return score 0 when guess is out of bounds (u > 1)", async () => {
                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send({ u: "1.5", v: "0.5", map_i: "0" });

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.score).toBe(0);
                expect(response.body.distance).toBeNull();
            });

            it("Should return score 0 when guess is out of bounds (v < 0)", async () => {
                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send({ u: "0.5", v: "-0.1", map_i: "0" });

                expect(response.statusCode).toBe(200);
                expect(response.body.score).toBe(0);
            });

            it("Should return score 0 and correct mapI when wrong map is selected", async () => {
                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send({ u: "0.5", v: "0.5", map_i: "1" });

                expect(response.statusCode).toBe(200);
                expect(response.body.score).toBe(0);
                expect(response.body.mapI).toBe(0);
            });
        });

        describe("Happy paths (200)", () => {
            it("Should return score 5000 for a perfect guess with plenty of time left", async () => {
                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.score).toBe(5000);
                expect(response.body.distance).toBe(0);
                expect(response.body.totalScore).toBe(1000);
                expect(response.body.pointu).toBe(0.5);
                expect(response.body.pointv).toBe(0.5);
                expect(database.saveGuess).toHaveBeenCalled();
                expect(database.incrementCurrentRound).toHaveBeenCalledWith(mockConnection, 1);
                expect(database.clearCurrentPoint).toHaveBeenCalledWith(mockConnection, 1);
            });

            it("Should apply time penalty when time remaining is below timePunishment", async () => {
                checkGameSession.mockImplementationOnce((request, response, next) => {
                    request.session = {
                        userid: 1,
                        game: {
                            activeSessionId: 1,
                            sharpness: -3,
                            rounds: 5,
                            currentRound: 0,
                            roundTime: 60,
                            currentCycle: 1,
                            mapInfo: [{ mapId: 1, width: 800, height: 600 }],
                            point: { pointId: 10, pointu: 0.5, pointv: 0.5, mapId: 1 },
                            roundStartedAt: Date.now() - 30000
                        }
                    };
                    next();
                });

                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(200);
                expect(response.body.score).toBeGreaterThan(0);
                expect(response.body.score).toBeLessThan(5000);
            });

            it("Should apply minimum score multiplier when time has expired", async () => {
                checkGameSession.mockImplementationOnce((request, response, next) => {
                    request.session = {
                        userid: 1,
                        game: {
                            activeSessionId: 1,
                            sharpness: -3,
                            rounds: 5,
                            currentRound: 0,
                            roundTime: 60,
                            currentCycle: 1,
                            mapInfo: [{ mapId: 1, width: 800, height: 600 }],
                            point: { pointId: 10, pointu: 0.5, pointv: 0.5, mapId: 1 },
                            roundStartedAt: Date.now() - 70000
                        }
                    };
                    next();
                });

                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(200);
                expect(response.body.score).toBe(Math.round(5000 * 0.1));
            });

            it("Should use transaction: commit on success", async () => {
                await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(mockConnection.beginTransaction).toHaveBeenCalled();
                expect(mockConnection.commit).toHaveBeenCalled();
                expect(mockConnection.rollback).not.toHaveBeenCalled();
                expect(mockConnection.release).toHaveBeenCalled();
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 and rollback if saveGuess throws", async () => {
                database.saveGuess.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(500);
                expect(mockConnection.rollback).toHaveBeenCalled();
                expect(mockConnection.release).toHaveBeenCalled();
            });

            it("Should respond with 500 and rollback if incrementCurrentRound throws", async () => {
                database.incrementCurrentRound.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(500);
                expect(mockConnection.rollback).toHaveBeenCalled();
            });

            it("Should respond with 500 if getConnection throws", async () => {
                database.getConnection.mockRejectedValueOnce(new Error("Connection failed"));

                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(500);
                expect(response.body.success).toBe(false);
            });

            it("Should respond with 500 if sharpness is invalid", async () => {
                checkGameSession.mockImplementationOnce((request, response, next) => {
                    request.session = {
                        userid: 1,
                        game: {
                            activeSessionId: 1,
                            sharpness: null,
                            roundTime: 60,
                            currentCycle: 1,
                            mapInfo: [{ mapId: 1, width: 800, height: 600 }],
                            point: { pointId: 10, pointu: 0.5, pointv: 0.5, mapId: 1 },
                            roundStartedAt: Date.now() - 5000
                        }
                    };
                    next();
                });

                const response = await requestWithSupertest
                    .post("/api/game/session_guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(500);
                expect(response.body.message).toBe("Invalid game configuration");
            });
        });
    });

    describe("POST /finish_game_session", () => {
        describe("Authorization (401, 403)", () => {
            testRequiresGameSession(() =>
                requestWithSupertest.post("/api/game/finish_game_session")
            );
        });

        describe("Happy paths (200)", () => {
            it("Should finish the session and return 200", async () => {
                const response = await requestWithSupertest.post("/api/game/finish_game_session");

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(database.finishGameSession).toHaveBeenCalledWith(1);
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if the database throws", async () => {
                database.finishGameSession.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest.post("/api/game/finish_game_session");

                expect(response.statusCode).toBe(500);
                expect(response.body.success).toBe(false);
            });
        });
    });
});
