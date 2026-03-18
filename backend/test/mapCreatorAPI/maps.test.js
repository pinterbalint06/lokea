const { createTestApp } = require("./helpers/setup-test.js");
const { testInvalidIDs, testRequiresAuth } = require("./helpers/helpers.js");
const auth = require("../../auth.js");

jest.mock("../../auth.js", () => ({
    checkAuth: jest.fn((request, response, next) => {
        request.session = { userid: 1 };
        next();
    })
}));

jest.mock("../../sql/database.js", () => {
    const mockConnection = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn()
    };
    return {
        getConnection: jest.fn().mockResolvedValue(mockConnection),
        checkUserOwnsGameMap: jest.fn(),
        checkUserOwnsMap: jest.fn(),
        updateMapTitle: jest.fn(),
        getMapsByGameMapId: jest.fn()
    };
});

const database = require("../../sql/database.js");

jest.mock("../../utils/imageProcessor.js", () => ({
    processImageMetadata: jest.fn().mockResolvedValue({ width: 800, height: 600, extension: ".jpg" }),
    createWebpAndLowRes: jest.fn().mockResolvedValue({ targetFileName: "mock.webp", lowResFileName: "mock_low_res.webp", mainPath: "/path/to/mock.webp", lowResPath: "/path/to/mock_low_res.webp" }),
    deleteImageAndLowResByMainPath: jest.fn().mockResolvedValue()
}));

const requestWithSupertest = createTestApp();

describe("GET /game-maps/:gameMapID/maps", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    testRequiresAuth(() => requestWithSupertest.get("/api/map-creator/game-maps/1/maps"));

    it("Should return all maps for a game map", async () => {
        database.checkUserOwnsGameMap.mockResolvedValue(true);
        database.getMapsByGameMapId.mockResolvedValue([
            { id: 101, title: "Test Map Title" },
            { id: 102, title: "Another Map Title" }
        ]);

        const response = await requestWithSupertest.get("/api/map-creator/game-maps/1/maps");

        expect(response.statusCode).toEqual(200);
        expect(response.type).toEqual(expect.stringContaining("json"));
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("maps");
        expect(response.body.maps.length).toBe(2);
        expect(response.body.maps[0].id).toBe(101);
        expect(response.body.maps[0].title).toBe("Test Map Title");
    });

    it("Should return an empty array if the game map has no maps", async () => {
        database.checkUserOwnsGameMap.mockResolvedValue(true);
        database.getMapsByGameMapId.mockResolvedValue([]);

        const response = await requestWithSupertest.get("/api/map-creator/game-maps/1/maps");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("maps");
        expect(response.body.maps).toEqual([]);
    });

    it("Should respond with 403 if it's not the user's map", async () => {
        database.checkUserOwnsGameMap.mockResolvedValue(false);
        database.getMapsByGameMapId.mockResolvedValue([
            { id: 101, title: "Test Map Title" },
            { id: 102, title: "Another Map Title" }
        ]);

        const response = await requestWithSupertest.get("/api/map-creator/game-maps/1/maps");

        expect(response.statusCode).toEqual(403);
        expect(response.type).toEqual(expect.stringContaining("json"));
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("error", "Nincs hozzáférése ehhez a pályához");
    });

    it("Should respond with 400 if the game map id is incorrect", async () => {
        await testInvalidIDs(
            (id) => requestWithSupertest.get(`/api/map-creator/game-maps/${encodeURIComponent(id)}/maps`),
            "Helytelen pálya ID"
        );
    });

    it("Should respond with 500 if an unexpected database error occurs", async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });

        database.checkUserOwnsGameMap.mockResolvedValue(true);
        database.getMapsByGameMapId.mockRejectedValue(new Error("Database connection refused"));

        const response = await requestWithSupertest.get("/api/map-creator/game-maps/1/maps");

        expect(response.statusCode).toEqual(500);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");

        console.error.mockRestore();
    });
});

// TODOp!!!!: befejezni ezt
describe("PUT /maps/:mapID", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    testRequiresAuth(() => requestWithSupertest.put("/api/map-creator/maps/1"));

    it("Should respond with 400 if the game map id is incorrect", async () => {
        await testInvalidIDs(
            (id) => requestWithSupertest.put(`/api/map-creator/maps/${encodeURIComponent(id)}`),
            "Helytelen térkép ID"
        );
    });

    const invalidTitles = [
        "",
        "This is exactly 21 ch",
        "Very long title exceeding limits",
        "Hello World!",
        "Q&A Session",
        "Email@Address",
        "Version 1.0",
        "User, Name",
        "A+B=C",
        "(Parentheses)",
        "El Niño",
        "Façade",
        "Gutenhello ß",
        "Emoji 🚀",
        "Line\nBreak"
    ];

    it.each(invalidTitles)("Should respond with 400 if the new title is incorrect: '%s'", async (invalidTitle) => {
        database.checkUserOwnsMap.mockResolvedValue(true);

        const response = await requestWithSupertest
            .put(`/api/map-creator/maps/1`)
            .send({
                title: invalidTitle
            });

        // Simple, clean assertions
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Helytelen térképnév!");
    });

    it("Should respond with 500 if an unexpected database error occurs", async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });

        database.checkUserOwnsMap.mockResolvedValue(true);
        database.updateMapTitle.mockRejectedValue(new Error("Database connection refused"));

        const response = await requestWithSupertest.put("/api/map-creator/maps/1");

        expect(response.statusCode).toEqual(500);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");

        console.error.mockRestore();
    });
});

