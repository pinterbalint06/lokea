const { createGameLobbyTestApp } = require("#gametest/helpers/setup-test.js");
const { testRequiresAuth, suppressConsoleErrors } = require("#gametest/helpers/helpers.js");
const AppError = require("#utils/app-error.js");
const gameLobbyQueries = require("#gameflow/gamelobby.queries.js");
const sessionsQueries = require("#gameflow/sessions/sessions.queries.js");

const requestWithSupertest = createGameLobbyTestApp();

const mockGameMaps = [
    { id: 1, title: "Test Map", plays: 10, rating: 4.5 },
    { id: 2, title: "Another Map", plays: 5, rating: 3.0 }
];

describe("Game Lobby API - /api/choose-game/", () => {
    describe("GET /", () => {
        beforeEach(() => {
            gameLobbyQueries.getGameMaps.mockResolvedValue(mockGameMaps);
        });

        describe("Input validation (400)", () => {
            it("Should respond with 400 for an invalid sort parameter", async () => {
                const response = await requestWithSupertest.get("/api/choose-game?sort=invalid");

                expect(response.statusCode).toBe(400);
            });

            it("Should accept uppercase sort by converting to lowercase", async () => {
                const response = await requestWithSupertest.get("/api/choose-game?sort=CREATED");

                expect(response.statusCode).toBe(200);
                expect(gameLobbyQueries.getGameMaps).toHaveBeenCalledWith("created", undefined, 0);
            });

            it("Should respond with 400 for a negative offset parameter", async () => {
                const response = await requestWithSupertest.get("/api/choose-game?offset=-5");

                expect(response.statusCode).toBe(400);
            });

            it("Should respond with 400 for a non-integer offset parameter", async () => {
                const response = await requestWithSupertest.get("/api/choose-game?offset=abc");

                expect(response.statusCode).toBe(400);
            });
        });

        describe("Happy paths (200)", () => {
            it.each(["created", "rating", "plays", "favorites"])("Should return 200 with results for sort=%s", async (sort) => {
                const response = await requestWithSupertest.get(`/api/choose-game?sort=${sort}`);

                expect(response.statusCode).toBe(200);
                expect(response.body.results).toEqual(mockGameMaps);
                expect(gameLobbyQueries.getGameMaps).toHaveBeenCalledWith(sort, undefined, 0);
            });

            it("Should default to 'created' sort when no sort param is given", async () => {
                const response = await requestWithSupertest.get("/api/choose-game");

                expect(response.statusCode).toBe(200);
                expect(gameLobbyQueries.getGameMaps).toHaveBeenCalledWith("created", undefined, 0);
            });

            it("Should pass offset to database when provided", async () => {
                const response = await requestWithSupertest.get("/api/choose-game?offset=10");

                expect(response.statusCode).toBe(200);
                expect(gameLobbyQueries.getGameMaps).toHaveBeenCalledWith("created", undefined, 10);
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if the database throws", async () => {
                gameLobbyQueries.getGameMaps.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest.get("/api/choose-game");

                expect(response.statusCode).toBe(500);
            });
        });
    });

    describe("GET /session", () => {
        describe("Authorization (401)", () => {
            testRequiresAuth(() => requestWithSupertest.get("/api/choose-game/session"));
        });

        describe("Happy paths (200)", () => {
            it("Should return hasActiveSession: false when there is no active session", async () => {
                sessionsQueries.selectLatestActiveGameSession.mockResolvedValueOnce(null);

                const response = await requestWithSupertest.get("/api/choose-game/session");

                expect(response.statusCode).toBe(200);
                expect(response.body.hasActiveSession).toBe(false);
            });

            it("Should return hasActiveSession: true and gameTitle when session exists", async () => {
                sessionsQueries.selectLatestActiveGameSession.mockResolvedValueOnce({
                    session_id: 5,
                    game_maps_id: 100,
                    current_cycle: 1,
                    sharpness: -3,
                    rounds: 5,
                    current_round: 2,
                    time_per_round: 60,
                    title: "My Game"
                });

                const response = await requestWithSupertest.get("/api/choose-game/session");

                expect(response.statusCode).toBe(200);
                expect(response.body.hasActiveSession).toBe(true);
                expect(response.body.gameTitle).toBe("My Game");
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if the database throws", async () => {
                sessionsQueries.selectLatestActiveGameSession.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest.get("/api/choose-game/session");

                expect(response.statusCode).toBe(500);
            });
        });
    });

    describe("POST /session", () => {
        const validBody = {
            difficulty: "normal",
            gameMapId: 100,
            rounds: 5,
            roundTime: 60
        };

        describe("Authorization (401)", () => {
            testRequiresAuth(() => requestWithSupertest.post("/api/choose-game/session").send(validBody));
        });

        describe("Input validation (400)", () => {
            it("Should respond with 400 if gameMapId is not an integer", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send({ ...validBody, gameMapId: "abc" });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Invalid gameMapId");
            });

            it("Should respond with 400 if gameMapId is 0", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send({ ...validBody, gameMapId: 0 });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Invalid gameMapId");
            });

            it("Should respond with 400 if gameMapId is negative", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send({ ...validBody, gameMapId: -5 });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Invalid gameMapId");
            });

            it("Should respond with 400 if gameMapId is missing", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send({ difficulty: "normal", rounds: 5, roundTime: 60 });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Invalid gameMapId");
            });

            it("Should respond with 400 if difficulty is invalid", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send({ ...validBody, difficulty: "unknown" });

                expect(response.statusCode).toBe(400);
            });

            it.each([
                [{ ...validBody, rounds: "abc" }, "rounds is not a number"],
                [{ ...validBody, rounds: 0 }, "rounds is below minimum"],
                [{ ...validBody, rounds: 101 }, "rounds is above maximum"],
                [{ difficulty: "normal", gameMapId: 100, roundTime: 60 }, "rounds is missing"],
            ])("Should respond with 400 for invalid rounds (%s)", async (body) => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send(body);

                expect(response.statusCode).toBe(400);
            });

            it.each([
                [{ ...validBody, roundTime: "abc" }, "roundTime is not a number"],
                [{ ...validBody, roundTime: 0 }, "roundTime is below minimum"],
                [{ ...validBody, roundTime: 301 }, "roundTime is above maximum"],
                [{ difficulty: "normal", gameMapId: 100, rounds: 5 }, "roundTime is missing"],
            ])("Should respond with 400 for invalid roundTime (%s)", async (body) => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send(body);

                expect(response.statusCode).toBe(400);
            });
        });

        describe("Not found (404)", () => {
            it("Should respond with 404 if the game map does not exist", async () => {
                sessionsQueries.getGameTitleById.mockResolvedValueOnce(null);

                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send(validBody);

                expect(response.statusCode).toBe(404);
            });
        });

        describe("Happy paths (200)", () => {
            it("Should create a session and return 200 for normal difficulty", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send(validBody);

                expect(response.statusCode).toBe(200);
                expect(sessionsQueries.insertGameSession).toHaveBeenCalledWith(1, 5, 60, 100, -3);
            });

            it("Should use sharpness -1.5 for easy difficulty", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send({ ...validBody, difficulty: "easy" });

                expect(response.statusCode).toBe(200);
                expect(sessionsQueries.insertGameSession).toHaveBeenCalledWith(1, 5, 60, 100, -1.5);
            });

            it("Should use sharpness -5 for hard difficulty", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send({ ...validBody, difficulty: "hard" });

                expect(response.statusCode).toBe(200);
                expect(sessionsQueries.insertGameSession).toHaveBeenCalledWith(1, 5, 60, 100, -5);
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if insertGameSession throws", async () => {
                sessionsQueries.insertGameSession.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send(validBody);

                expect(response.statusCode).toBe(500);
            });

            it("Should respect statusCode from AppError thrown by database", async () => {
                sessionsQueries.insertGameSession.mockRejectedValueOnce(new AppError("Custom error", 503));

                const response = await requestWithSupertest
                    .post("/api/choose-game/session")
                    .send(validBody);

                expect(response.statusCode).toBe(503);
                expect(response.body.message).toBe("Custom error");
            });
        });
    });
});
