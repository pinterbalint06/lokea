const { createGameTestApp } = require("#gametest/helpers/setup-test.js");
const { testRequiresGameSession, suppressConsoleErrors } = require("#gametest/helpers/helpers.js");
const { checkGameSession } = require("#utils/auth.js");
const { mockConnection } = require("#sql/database.js");
const mapsQueries = require("#gameflow/maps/maps.queries.js");
const randomPointQueries = require("#gameflow/random-point/random-point.queries.js");
const guessQueries = require("#gameflow/guess/guess.queries.js");
const sessionsQueries = require("#gameflow/sessions/sessions.queries.js");

const requestWithSupertest = createGameTestApp();

const mockMap = {
    map_id: 1,
    title: "Test Map",
    width: 800,
    height: 600
};

const mockPoint = {
    point_id: 10,
    point_u: 0.5,
    point_v: 0.5,
    north_direction: 0,
    map_id: 1
};

describe("Game API - /api/game/", () => {
    describe("GET /session", () => {
        describe("Authorization (401, 403)", () => {
            testRequiresGameSession(() => requestWithSupertest.get("/api/game/session"));
        });

        describe("Happy paths (200)", () => {
            it("Should return game info from the session", async () => {
                const response = await requestWithSupertest.get("/api/game/session");

                expect(response.statusCode).toBe(200);
                expect(response.body.game).toEqual({
                    title: "Test Game",
                    gameMapId: 100,
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

                const response = await requestWithSupertest.get("/api/game/session");

                expect(response.statusCode).toBe(500);
            });
        });
    });

    describe("GET /maps", () => {
        beforeEach(() => {
            mapsQueries.getAllMaps.mockResolvedValue([mockMap]);
        });

        describe("Authorization (401, 403)", () => {
            testRequiresGameSession(() => requestWithSupertest.get("/api/game/maps"));
        });

        describe("Happy paths (200)", () => {
            it("Should return maps array with title and mapId", async () => {
                const response = await requestWithSupertest.get("/api/game/maps");

                expect(response.statusCode).toBe(200);
                expect(response.body.maps).toHaveLength(1);
                expect(response.body.maps[0].title).toBe("Test Map");
                expect(response.body.maps[0].mapId).toBe(1);
                expect(mapsQueries.getAllMaps).toHaveBeenCalledWith(100);
            });

            it("Should return an empty maps array if there are no maps", async () => {
                mapsQueries.getAllMaps.mockResolvedValueOnce([]);

                const response = await requestWithSupertest.get("/api/game/maps");

                expect(response.statusCode).toBe(200);
                expect(response.body.maps).toEqual([]);
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if the database throws", async () => {
                mapsQueries.getAllMaps.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest.get("/api/game/maps");

                expect(response.statusCode).toBe(500);
            });
        });
    });

    describe("GET /round", () => {
        describe("Authorization (401, 403)", () => {
            testRequiresGameSession(() => requestWithSupertest.get("/api/game/round"));
        });

        describe("Happy paths (200)", () => {
            it("Should return the existing current point if one is set", async () => {
                randomPointQueries.getCurrentPointId.mockResolvedValueOnce(10);
                randomPointQueries.getPointById.mockResolvedValueOnce(mockPoint);

                const response = await requestWithSupertest.get("/api/game/round");

                expect(response.statusCode).toBe(200);
                expect(response.body.point.pointId).toBe(mockPoint.point_id);
                expect(response.body.point.game.timeLeft).toBeGreaterThanOrEqual(0);
                expect(response.body.point.game.roundEndAt).toBeTruthy();
                expect(randomPointQueries.getPointById).toHaveBeenCalledWith(10);
            });

            it("Should get a random point if there is no current point", async () => {
                randomPointQueries.getCurrentPointId.mockResolvedValueOnce(null);
                randomPointQueries.getRandomPoint.mockResolvedValueOnce(mockPoint);

                const response = await requestWithSupertest.get("/api/game/round");

                expect(response.statusCode).toBe(200);
                expect(randomPointQueries.getRandomPoint).toHaveBeenCalledWith(100, 1);
                expect(randomPointQueries.incrementCycle).not.toHaveBeenCalled();
            });

            it("Should increment cycle and retry when no random point is found on first attempt", async () => {
                randomPointQueries.getCurrentPointId.mockResolvedValueOnce(null);
                randomPointQueries.getRandomPoint
                    .mockResolvedValueOnce(null)
                    .mockResolvedValueOnce(mockPoint);

                const response = await requestWithSupertest.get("/api/game/round");

                expect(response.statusCode).toBe(200);
                expect(randomPointQueries.incrementCycle).toHaveBeenCalledWith(1);
                expect(randomPointQueries.getRandomPoint).toHaveBeenCalledTimes(2);
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
                randomPointQueries.getCurrentPointId.mockResolvedValueOnce(null);
                randomPointQueries.getRandomPoint.mockResolvedValueOnce(mockPoint);

                const response = await requestWithSupertest.get("/api/game/round");

                expect(response.statusCode).toBe(200);
                expect(session.game.roundStartedAt).toBeTruthy();
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if no points are available after cycle increment", async () => {
                randomPointQueries.getCurrentPointId.mockResolvedValueOnce(null);
                randomPointQueries.getRandomPoint.mockResolvedValue(null);

                const response = await requestWithSupertest.get("/api/game/round");

                expect(response.statusCode).toBe(500);
                expect(response.body.message).toBe("No points available");
            });

            it("Should respond with 500 if the database throws", async () => {
                randomPointQueries.getCurrentPointId.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest.get("/api/game/round");

                expect(response.statusCode).toBe(500);
            });
        });
    });

    describe("POST /round/guess", () => {
        const validGuess = { u: "0.5", v: "0.5", map_id: 1 };

        beforeEach(() => {
            randomPointQueries.getCurrentPointId.mockResolvedValue(10);
            mapsQueries.getMapDimensions.mockResolvedValue({ width: 800, height: 600 });
        });

        describe("Authorization (401, 403)", () => {
            testRequiresGameSession(() =>
                requestWithSupertest.post("/api/game/round/guess").send(validGuess)
            );
        });

        describe("Input validation (400)", () => {
            it("Should respond with 400 if there is no active round", async () => {
                randomPointQueries.getCurrentPointId.mockResolvedValueOnce(null);

                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("No active round");
            });

            it("Should respond with 400 if there is no active point in session", async () => {
                checkGameSession.mockImplementationOnce((request, response, next) => {
                    request.session = {
                        userid: 1,
                        game: {
                            activeSessionId: 1,
                            sharpness: -3,
                            roundTime: 60,
                            currentCycle: 1
                        }
                    };
                    next();
                });

                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("No active point in session");
            });

            it("Should respond with 400 if guess coordinates are not numbers", async () => {
                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send({ u: "abc", v: "0.5", map_id: 1 });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Invalid guess coordinates");
            });
        });

        describe("Score = 0 cases", () => {
            it("Should return score 0 when guess is out of bounds (u > 1)", async () => {
                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send({ u: "1.5", v: "0.5", map_id: 1 });

                expect(response.statusCode).toBe(200);
                expect(response.body.score).toBe(0);
                expect(response.body.distance).toBeNull();
            });

            it("Should return score 0 when guess is out of bounds (v < 0)", async () => {
                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send({ u: "0.5", v: "-0.1", map_id: 1 });

                expect(response.statusCode).toBe(200);
                expect(response.body.score).toBe(0);
            });

            it("Should return score 0 and correct correctMapId when wrong map is selected", async () => {
                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send({ u: "0.5", v: "0.5", map_id: 2 });

                expect(response.statusCode).toBe(200);
                expect(response.body.score).toBe(0);
                expect(response.body.correctMapId).toBe(1);
            });
        });

        describe("Happy paths (200)", () => {
            it("Should return score 5000 for a perfect guess with plenty of time left", async () => {
                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(200);
                expect(response.body.score).toBe(5000);
                expect(response.body.distance).toBe(0);
                expect(response.body.totalScore).toBe(1000);
                expect(response.body.pointu).toBe(0.5);
                expect(response.body.pointv).toBe(0.5);
                expect(guessQueries.saveGuess).toHaveBeenCalled();
                expect(guessQueries.incrementCurrentRound).toHaveBeenCalledWith(mockConnection, 1);
                expect(guessQueries.clearCurrentPoint).toHaveBeenCalledWith(mockConnection, 1);
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
                            point: { pointId: 10, pointu: 0.5, pointv: 0.5, mapId: 1 },
                            roundStartedAt: Date.now() - 30000
                        }
                    };
                    next();
                });

                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
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
                            point: { pointId: 10, pointu: 0.5, pointv: 0.5, mapId: 1 },
                            roundStartedAt: Date.now() - 70000
                        }
                    };
                    next();
                });

                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(200);
                expect(response.body.score).toBe(Math.round(5000 * 0.1));
            });

            it("Should use transaction: commit on success", async () => {
                await requestWithSupertest
                    .post("/api/game/round/guess")
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
                guessQueries.saveGuess.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(500);
                expect(mockConnection.rollback).toHaveBeenCalled();
                expect(mockConnection.release).toHaveBeenCalled();
            });

            it("Should respond with 500 and rollback if incrementCurrentRound throws", async () => {
                guessQueries.incrementCurrentRound.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(500);
                expect(mockConnection.rollback).toHaveBeenCalled();
            });

            it("Should respond with 500 if getConnection throws", async () => {
                const { getConnection } = require("#sql/database.js");
                getConnection.mockRejectedValueOnce(new Error("Connection failed"));

                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(500);
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
                            point: { pointId: 10, pointu: 0.5, pointv: 0.5, mapId: 1 },
                            roundStartedAt: Date.now() - 5000
                        }
                    };
                    next();
                });

                const response = await requestWithSupertest
                    .post("/api/game/round/guess")
                    .send(validGuess);

                expect(response.statusCode).toBe(500);
                expect(response.body.message).toBe("Invalid game configuration");
            });
        });
    });

    describe("DELETE /session", () => {
        describe("Authorization (401, 403)", () => {
            testRequiresGameSession(() =>
                requestWithSupertest.delete("/api/game/session")
            );
        });

        describe("Happy paths (200)", () => {
            it("Should finish the session and return 200", async () => {
                const response = await requestWithSupertest.delete("/api/game/session");

                expect(response.statusCode).toBe(200);
                expect(sessionsQueries.finishGameSession).toHaveBeenCalledWith(1);
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if the database throws", async () => {
                sessionsQueries.finishGameSession.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest.delete("/api/game/session");

                expect(response.statusCode).toBe(500);
            });
        });
    });
});
