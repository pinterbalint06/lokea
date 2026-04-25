const { createGameChoosingTestApp } = require("#gametest/helpers/setup-test.js");
const { testRequiresAuth, suppressConsoleErrors } = require("#gametest/helpers/helpers.js");
const database = require("#sql/database.js");

const requestWithSupertest = createGameChoosingTestApp();

const mockGameMaps = [
    { id: 1, title: "Test Map", plays: 10, rating: 4.5 },
    { id: 2, title: "Another Map", plays: 5, rating: 3.0 }
];

describe("Game Choosing API - /api/choose-game/", () => {
    describe("GET /game_maps", () => {
        beforeEach(() => {
            database.getGameMaps.mockResolvedValue(mockGameMaps);
        });

        describe("Authorization (401)", () => {
            testRequiresAuth(() => requestWithSupertest.get("/api/choose-game/game_maps"));
        });

        describe("Input validation (400)", () => {
            it("Should respond with 400 for an invalid sort parameter", async () => {
                const response = await requestWithSupertest.get("/api/choose-game/game_maps?sort=invalid");

                expect(response.statusCode).toBe(400);
                expect(response.body.success).toBe(false);
            });

            it("Should accept uppercase sort by converting to lowercase", async () => {
                const response = await requestWithSupertest.get("/api/choose-game/game_maps?sort=CREATED");

                expect(response.statusCode).toBe(200);
                expect(database.getGameMaps).toHaveBeenCalledWith("created", 1, 0);
            });
        });

        describe("Happy paths (200)", () => {
            it.each(["created", "rating", "plays", "favorites"])("Should return 200 with results for sort=%s", async (sort) => {
                const response = await requestWithSupertest.get(`/api/choose-game/game_maps?sort=${sort}`);

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.results).toEqual(mockGameMaps);
                expect(database.getGameMaps).toHaveBeenCalledWith(sort, 1, 0);
            });

            it("Should default to 'created' sort when no sort param is given", async () => {
                const response = await requestWithSupertest.get("/api/choose-game/game_maps");

                expect(response.statusCode).toBe(200);
                expect(database.getGameMaps).toHaveBeenCalledWith("created", 1, 0);
            });

            it("Should pass offset to database when provided", async () => {
                const response = await requestWithSupertest.get("/api/choose-game/game_maps?offset=10");

                expect(response.statusCode).toBe(200);
                expect(database.getGameMaps).toHaveBeenCalledWith("created", 1, 10);
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if the database throws", async () => {
                database.getGameMaps.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest.get("/api/choose-game/game_maps");

                expect(response.statusCode).toBe(500);
                expect(response.body.success).toBe(false);
            });
        });
    });

    describe("GET /get_cover_image/:cover_image_id", () => {
        const uploadsPath = require("path").join(__dirname, "../../api/../uploads");

        describe("Happy paths (200)", () => {
            it("Should send the file at the path returned by the database", async () => {
                database.getImagePath.mockResolvedValueOnce("cover_images/test.jpg");

                const response = await requestWithSupertest.get("/api/choose-game/get_cover_image/42");

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(database.getImagePath).toHaveBeenCalledWith("42");
                expect(response.body.filePath).toContain("cover_images");
                expect(response.body.filePath).toContain("test.jpg");
            });

            it("Should fall back to image-not-found.jpg when DB returns no path", async () => {
                database.getImagePath.mockResolvedValueOnce(null);

                const response = await requestWithSupertest.get("/api/choose-game/get_cover_image/99");

                expect(response.statusCode).toBe(200);
                expect(response.body.filePath).toContain("image-not-found.jpg");
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if the database throws", async () => {
                database.getImagePath.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest.get("/api/choose-game/get_cover_image/1");

                expect(response.statusCode).toBe(500);
                expect(response.body.success).toBe(false);
            });
        });
    });

    describe("GET /active_game_session", () => {
        describe("Authorization (401)", () => {
            testRequiresAuth(() => requestWithSupertest.get("/api/choose-game/active_game_session"));
        });

        describe("Happy paths (200)", () => {
            it("Should return hasActiveSession: false when there is no active session", async () => {
                database.selectLatestActiveGameSession.mockResolvedValueOnce(null);

                const response = await requestWithSupertest.get("/api/choose-game/active_game_session");

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.hasActiveSession).toBe(false);
            });

            it("Should return hasActiveSession: true and gameTitle when session exists", async () => {
                database.selectLatestActiveGameSession.mockResolvedValueOnce({
                    session_id: 5,
                    game_maps_id: 100,
                    current_cycle: 1,
                    sharpness: -3,
                    rounds: 5,
                    current_round: 2,
                    time_per_round: 60,
                    title: "My Game"
                });

                const response = await requestWithSupertest.get("/api/choose-game/active_game_session");

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.hasActiveSession).toBe(true);
                expect(response.body.gameTitle).toBe("My Game");
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if the database throws", async () => {
                database.selectLatestActiveGameSession.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest.get("/api/choose-game/active_game_session");

                expect(response.statusCode).toBe(500);
                expect(response.body.success).toBe(false);
            });
        });
    });

    describe("POST /post_game_id", () => {
        const validBody = {
            difficulty: "normal",
            gameMapId: 100,
            rounds: 5,
            roundTime: 60
        };

        describe("Authorization (401)", () => {
            testRequiresAuth(() => requestWithSupertest.post("/api/choose-game/post_game_id").send(validBody));
        });

        describe("Input validation (400)", () => {
            it("Should respond with 400 if gameMapId is not an integer", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send({ ...validBody, gameMapId: "abc" });

                expect(response.statusCode).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe("Invalid gameMapId");
            });

            it("Should respond with 400 if gameMapId is 0", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send({ ...validBody, gameMapId: 0 });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Invalid gameMapId");
            });

            it("Should respond with 400 if gameMapId is negative", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send({ ...validBody, gameMapId: -5 });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Invalid gameMapId");
            });

            it("Should respond with 400 if gameMapId is missing", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send({ difficulty: "normal", rounds: 5, roundTime: 60 });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Invalid gameMapId");
            });
        });

        describe("Conflicts (409)", () => {
            it("Should respond with 409 if the user already has an active session", async () => {
                database.selectLatestActiveGameSession.mockResolvedValueOnce({ session_id: 1 });

                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send(validBody);

                expect(response.statusCode).toBe(409);
                expect(response.body.success).toBe(false);
            });
        });

        describe("Happy paths (200)", () => {
            it("Should create a session and return 200 for normal difficulty", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send(validBody);

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(database.insertGameSession).toHaveBeenCalledWith(1, 5, 60, 100, -3);
            });

            it("Should use sharpness -1.5 for easy difficulty", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send({ ...validBody, difficulty: "easy" });

                expect(response.statusCode).toBe(200);
                expect(database.insertGameSession).toHaveBeenCalledWith(1, 5, 60, 100, -1.5);
            });

            it("Should use sharpness -5 for hard difficulty", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send({ ...validBody, difficulty: "hard" });

                expect(response.statusCode).toBe(200);
                expect(database.insertGameSession).toHaveBeenCalledWith(1, 5, 60, 100, -5);
            });

            it("Should use sharpness -3 for unknown difficulty", async () => {
                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send({ ...validBody, difficulty: "unknown" });

                expect(response.statusCode).toBe(200);
                expect(database.insertGameSession).toHaveBeenCalledWith(1, 5, 60, 100, -3);
            });

            it("Should use 'N/A' as game title if getGameTitleById returns null", async () => {
                database.getGameTitleById.mockResolvedValueOnce(null);

                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send(validBody);

                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
            });
        });

        describe("Server errors (500)", () => {
            suppressConsoleErrors();

            it("Should respond with 500 if insertGameSession throws", async () => {
                database.insertGameSession.mockRejectedValueOnce(new Error("DB error"));

                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send(validBody);

                expect(response.statusCode).toBe(500);
                expect(response.body.success).toBe(false);
            });

            it("Should respect statusCode from AppError thrown by database", async () => {
                const AppError = require("#root/utils/AppError.js");
                database.insertGameSession.mockRejectedValueOnce(new AppError("Custom error", 503));

                const response = await requestWithSupertest
                    .post("/api/choose-game/post_game_id")
                    .send(validBody);

                expect(response.statusCode).toBe(503);
                expect(response.body.message).toBe("Custom error");
            });
        });
    });
});
