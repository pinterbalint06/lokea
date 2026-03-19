const { createTestApp } = require("./helpers/setup-test.js");
const { testInvalidIDs, testRequiresAuth } = require("./helpers/helpers.js");
const { invalidTitles, validTitles } = require("./helpers/test-data.js");

jest.mock("../../auth.js", () => ({
    checkAuth: jest.fn((request, response, next) => {
        request.session = { userid: 1 };
        next();
    })
}));

const mockConnection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
};

jest.mock("../../sql/database.js", () => {
    return {
        getConnection: jest.fn().mockImplementation(() => Promise.resolve(mockConnection)),
        checkUserOwnsGameMap: jest.fn(),
        checkUserOwnsMap: jest.fn(),
        updateMapTitle: jest.fn(),
        getMapsByGameMapId: jest.fn(),
        getMapInfo: jest.fn(),
        updateMapTitle: jest.fn(),
        insertMap: jest.fn(),
        insertImage: jest.fn(),
        updateImagePath: jest.fn()
    };
});

const database = require("../../sql/database.js");

jest.mock("../../utils/imageProcessor.js", () => ({
    processImageMetadata: jest.fn().mockResolvedValue({ width: 800, height: 600, extension: ".jpg" }),
    createWebpAndLowRes: jest.fn().mockResolvedValue({ targetFileName: "mock.webp", lowResFileName: "mock_low_res.webp", mainPath: "/path/to/mock.webp", lowResPath: "/path/to/mock_low_res.webp" }),
    deleteImageAndLowResByMainPath: jest.fn().mockResolvedValue()
}));

const { processImageMetadata, createWebpAndLowRes } = require("../../utils/imageProcessor.js");

jest.mock("../../utils/fileUtils.js", () => ({
    deleteFile: jest.fn().mockResolvedValue()
}));

const { deleteFile } = require("../../utils/fileUtils.js");

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

    it("Should respond with 403 if it's not the user's game map", async () => {
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

describe("PUT /maps/:mapID", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    testRequiresAuth(() => requestWithSupertest.put("/api/map-creator/maps/1"));

    it("Should respond with 400 if the game map id is incorrect", async () => {
        await testInvalidIDs(
            (id) => requestWithSupertest
                .put(`/api/map-creator/maps/${encodeURIComponent(id)}`)
                .send({
                    title: "new title"
                }),
            "Helytelen térkép ID"
        );
    });

    it("Should respond with 403 if it's not the user's map", async () => {
        database.checkUserOwnsMap.mockResolvedValue(false);
        const response = await requestWithSupertest
            .put(`/api/map-creator/maps/1`)
            .send({
                title: "new title"
            });

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Nincs hozzáférése ehhez a térképhez");
    });


    it.each(invalidTitles)("Should respond with 400 if the new title is incorrect: '%s'", async (invalidTitle) => {
        database.checkUserOwnsMap.mockResolvedValue(true);

        const response = await requestWithSupertest
            .put(`/api/map-creator/maps/1`)
            .send({
                title: invalidTitle
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Helytelen térképnév!");
    });

    it("Should respond with 400 if the new title is not given in the body", async () => {
        database.checkUserOwnsMap.mockResolvedValue(true);

        const response = await requestWithSupertest
            .put(`/api/map-creator/maps/1`)
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Helytelen térképnév!");
    });

    it("Should respond with 400 if a body is not provided", async () => {
        database.checkUserOwnsMap.mockResolvedValue(true);

        const response = await requestWithSupertest
            .put(`/api/map-creator/maps/1`);

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Hiányzó adatok!");
    });

    it("Should respond with 500 if an unexpected database error occurs", async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });

        database.checkUserOwnsMap.mockResolvedValue(true);
        database.getMapInfo.mockResolvedValue({ title: "Test Map Title", game_maps_id: 1 });
        database.updateMapTitle.mockRejectedValue(new Error("Database connection refused"));

        const response = await requestWithSupertest
            .put("/api/map-creator/maps/1")
            .send({
                title: "new title"
            });

        expect(response.statusCode).toEqual(500);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");

        console.error.mockRestore();
    });

    it("Should respond with 404 if the map doesn't exist somehow", async () => {
        database.checkUserOwnsMap.mockResolvedValue(true);
        database.getMapInfo.mockResolvedValue(null);

        const response = await requestWithSupertest
            .put("/api/map-creator/maps/1")
            .send({
                title: "Új térképnév"
            });

        expect(response.statusCode).toEqual(404);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("error", "A térkép nem létezik");
    });

    it("Should respond with 200, the mapID and the saved title on successful save", async () => {
        database.checkUserOwnsMap.mockResolvedValue(true);
        database.getMapInfo.mockResolvedValue({ title: "Test Map Title", game_maps_id: 1 });
        database.updateMapTitle.mockResolvedValue(1);

        const mapId = 1;

        for (const newTitle of validTitles) {
            const response = await requestWithSupertest
                .put(`/api/map-creator/maps/${mapId}`)
                .send({
                    title: newTitle
                });

            expect(response.statusCode).toEqual(200);
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("mapId", mapId);
            expect(response.body).toHaveProperty("title", newTitle.trim());
            expect(database.getConnection).toHaveBeenCalled();
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.updateMapTitle).toHaveBeenCalledWith(mockConnection, mapId, newTitle.trim());
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        }
    });

    it.each([0, 2, 3])("Should respond with 500 if the update failed. Invalid affectedRow %s", async (affectedRows) => {
        database.checkUserOwnsMap.mockResolvedValue(true);
        database.getMapInfo.mockResolvedValue({ title: "Test Map Title", game_maps_id: 1 });
        database.updateMapTitle.mockResolvedValue(affectedRows);

        const mapId = 1;
        const newTitle = "Új térképnév";
        const response = await requestWithSupertest
            .put(`/api/map-creator/maps/${mapId}`)
            .send({
                title: newTitle
            });

        expect(response.statusCode).toEqual(500);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("error", "A térkép átnevezése nem sikerült");
        expect(database.getConnection).toHaveBeenCalled();
        expect(mockConnection.beginTransaction).toHaveBeenCalled();
        expect(database.updateMapTitle).toHaveBeenCalledWith(mockConnection, mapId, newTitle);
        expect(mockConnection.rollback).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();
    });
});

describe("POST /game-maps/:gameMapID/maps", () => {
    const validData = {
        title: "new title",
        file: Buffer.from("mapimage")
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    testRequiresAuth(() => requestWithSupertest
        .post("/api/map-creator/game-maps/1/maps")
        .field("title", validData.title)
        .attach("file", validData.file, "testmap.png")
    );

    it("Should respond with 400 if a body is not provided", async () => {
        database.checkUserOwnsMap.mockResolvedValue(true);

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps");

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Hiányzó adatok!");
    });

    it("Should respond with 400 if the game map id is incorrect", async () => {
        await testInvalidIDs(
            (id) => requestWithSupertest
                .post(`/api/map-creator/game-maps/${encodeURIComponent(id)}/maps`)
                .field("title", validData.title)
                .attach("mapImage", validData.file, "testmap.png"),
            "Helytelen pálya ID"
        );
    });

    it("Should respond with 403 if it's not the user's game map", async () => {
        database.checkUserOwnsGameMap.mockResolvedValue(false);

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps")
            .field("title", validData.title)
            .attach("mapImage", validData.file, "testmap.png");

        expect(response.statusCode).toEqual(403);
        expect(response.type).toEqual(expect.stringContaining("json"));
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("error", "Nincs hozzáférése ehhez a pályához");
        expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
    });

    it.each(invalidTitles)("Should respond with 400 if the title is incorrect: '%s'", async (invalidTitle) => {
        database.checkUserOwnsGameMap.mockResolvedValue(true);

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps")
            .attach("mapImage", validData.file, "testmap.png")
            .field("title", invalidTitle);

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Helytelen térképnév!");
        expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
    });

    it("Should respond with 400 if the title is not given", async () => {
        database.checkUserOwnsMap.mockResolvedValue(true);

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps")
            .field("random", "random data");

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Helytelen térképnév!");
    });

    it("Should respond with 400 if the map image is not given", async () => {
        database.checkUserOwnsMap.mockResolvedValue(true);

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps")
            .field("title", validData.title);

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Nem adott meg képet!");
    });

    it("Should respond with 500 if the database refused connection", async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        database.checkUserOwnsMap.mockResolvedValue(true);
        database.getConnection.mockRejectedValueOnce(new Error("Database connection refused"));

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps")
            .attach("mapImage", validData.file, "testmap.png")
            .field("title", validData.title);

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Váratlan hiba történt!");
        console.error.mockRestore();
    });

    it("Should respond with 500 if the insertMap failed and delete requestFile", async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });

        database.checkUserOwnsMap.mockResolvedValue(true);
        const imageId = 106;
        database.insertImage.mockResolvedValue(imageId);
        database.insertMap.mockRejectedValueOnce(new Error("Insertion failed"));

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps")
            .attach("mapImage", validData.file, "testmap.png")
            .field("title", validData.title);

        expect(database.getConnection).toHaveBeenCalled();
        expect(mockConnection.beginTransaction).toHaveBeenCalled();
        expect(database.insertImage).toHaveBeenCalledWith(mockConnection, 800, 600, "pending");
        expect(database.insertMap).toHaveBeenCalledWith(mockConnection, validData.title.trim(), 1, imageId);
        expect(mockConnection.rollback).toHaveBeenCalled();
        expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
        expect(mockConnection.release).toHaveBeenCalled();

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe("Váratlan hiba történt!");

        console.error.mockRestore();
    });

    it("Should respond with 500 if the database commit failed and delete all files", async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });

        database.checkUserOwnsMap.mockResolvedValue(true);
        const imageId = 106;
        database.insertImage.mockResolvedValue(imageId);
        const mapId = 201;
        database.insertMap.mockResolvedValue(mapId);
        mockConnection.commit.mockRejectedValueOnce(new Error("Commit failed"));

        const gameMapID = 1;
        const response = await requestWithSupertest
            .post(`/api/map-creator/game-maps/${gameMapID}/maps`)
            .attach("mapImage", validData.file, "testmap.png")
            .field("title", validData.title);

        expect(database.getConnection).toHaveBeenCalled();
        expect(mockConnection.beginTransaction).toHaveBeenCalled();
        expect(database.insertImage).toHaveBeenCalledWith(mockConnection, 800, 600, "pending");
        expect(database.insertMap).toHaveBeenCalledWith(mockConnection, validData.title.trim(), gameMapID, imageId);
        expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, imageId, expect.any(String));
        expect(mockConnection.commit).toHaveBeenCalled();
        expect(deleteFile).toHaveBeenCalledTimes(3); // main image, low res image, temporary uploaded file
        expect(mockConnection.rollback).toHaveBeenCalled();
        expect(mockConnection.release).toHaveBeenCalled();

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");

        console.error.mockRestore();
    });

    it("Should respond with 413 for images too large", async () => {
        const tooBigFile = Buffer.alloc(11 * 1024 * 1024);

        const gameMapID = 1;
        const response = await requestWithSupertest
            .post(`/api/map-creator/game-maps/${gameMapID}/maps`)
            .attach("mapImage", tooBigFile, "testmap.png")
            .field("title", validData.title);

        expect(response.statusCode).toBe(413);
        expect(response.body.success).toBe(false);
        expect(response.body).toHaveProperty("error", "Túl nagy fájlméret! (Max 10MB)");
    });

    it("Should respond with 400 for unexpected multer errors", async () => {
        const gameMapID = 1;
        const response = await requestWithSupertest
            .post(`/api/map-creator/game-maps/${gameMapID}/maps`)
            .attach("wrongimageFieldName", validData.file, "testmap.png")
            .field("title", validData.title);

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body).toHaveProperty("error", "Fájlfeltöltési hiba történt!");
    });

    it("Should respond with 200 if all the data is correct and it saved everything well", async () => {
        database.checkUserOwnsMap.mockResolvedValue(true);
        const imageId = 106;
        database.insertImage.mockResolvedValue(imageId);
        const mapId = 201;
        database.insertMap.mockResolvedValue(mapId);

        const gameMapID = 1;
        for (const validTitle of validTitles) {
            const response = await requestWithSupertest
                .post(`/api/map-creator/game-maps/${gameMapID}/maps`)
                .attach("mapImage", validData.file, "testmap.png")
                .field("title", validTitle);

            expect(database.getConnection).toHaveBeenCalled();
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.insertImage).toHaveBeenCalledWith(mockConnection, 800, 600, "pending");
            expect(database.insertMap).toHaveBeenCalledWith(mockConnection, validTitle.trim(), gameMapID, imageId);
            expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, imageId, expect.any(String));
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
            expect(mockConnection.release).toHaveBeenCalled();

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty("mapId", mapId);
            expect(response.body).toHaveProperty("message", "Térkép sikeresen mentve!");
        }
    });

    it("Should accept a valid title surrounded by spaces and trim it", async () => {
        database.checkUserOwnsGameMap.mockResolvedValue(true);
        const imageId = 106;
        database.insertImage.mockResolvedValue(imageId);
        const mapId = 201;
        database.insertMap.mockResolvedValue(mapId);

        const title = "   Valid Title   ";
        const expectedTrimmedTitle = "Valid Title";

        const response = await requestWithSupertest
            .post(`/api/map-creator/game-maps/1/maps`)
            .attach("mapImage", validData.file, "testmap.png")
            .field("title", title);

        expect(response.statusCode).toBe(201);
        expect(database.insertMap).toHaveBeenCalledWith(
            mockConnection,
            expectedTrimmedTitle,
            1,
            imageId
        );
    });

    it("Should respond with 500 and delete temp file if image metadata processing fails", async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });

        database.checkUserOwnsGameMap.mockResolvedValue(true);

        processImageMetadata.mockRejectedValueOnce(new Error("Corrupted image"));

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps")
            .attach("mapImage", validData.file, "testmap.png")
            .field("title", validData.title);

        expect(response.statusCode).toBe(500);
        expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
        expect(deleteFile).toHaveBeenCalledWith(expect.any(String));

        console.error.mockRestore();
    });

    it("Should respond with 500, rollback DB, and delete temp file if image conversion fails", async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });

        database.checkUserOwnsGameMap.mockResolvedValue(true);
        database.insertImage.mockResolvedValue(106);
        database.insertMap.mockResolvedValue(201);

        createWebpAndLowRes.mockRejectedValueOnce(new Error("Image processing failed"));

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps")
            .attach("mapImage", validData.file, "testmap.png")
            .field("title", validData.title);

        expect(response.statusCode).toBe(500);
        expect(mockConnection.rollback).toHaveBeenCalled();
        expect(deleteFile).toHaveBeenCalledTimes(1);

        console.error.mockRestore();
    });

    it("Should respond with 500 even if rollback itself fails during error handling", async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });

        database.checkUserOwnsGameMap.mockResolvedValue(true);
        database.insertImage.mockResolvedValue(106);
        database.insertMap.mockResolvedValue(201);

        createWebpAndLowRes.mockRejectedValueOnce(new Error("Image processing failed"));
        mockConnection.rollback.mockRejectedValueOnce(new Error("Rollback failed"));

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps")
            .attach("mapImage", validData.file, "testmap.png")
            .field("title", validData.title);

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");
        expect(mockConnection.rollback).toHaveBeenCalled();
        expect(deleteFile).toHaveBeenCalled();

        console.error.mockRestore();
    });

    it("Should respond with 500 even if deleteFile fails during error handling", async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });

        database.checkUserOwnsGameMap.mockResolvedValue(true);
        database.insertImage.mockResolvedValue(106);
        database.insertMap.mockResolvedValue(201);

        createWebpAndLowRes.mockRejectedValueOnce(new Error("Image processing failed"));
        deleteFile.mockRejectedValueOnce(new Error("Delete failed"));

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps")
            .attach("mapImage", validData.file, "testmap.png")
            .field("title", validData.title);

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");
        expect(deleteFile).toHaveBeenCalled();

        console.error.mockRestore();
    });

    it("Should respond with 500, rollback DB, and delete ALL files if updateImagePath fails", async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        database.checkUserOwnsGameMap.mockResolvedValue(true);
        database.insertImage.mockResolvedValue(106);
        database.insertMap.mockResolvedValue(201);

        database.updateImagePath.mockRejectedValueOnce(new Error("Update failed"));

        const response = await requestWithSupertest
            .post("/api/map-creator/game-maps/1/maps")
            .attach("mapImage", validData.file, "testmap.png")
            .field("title", validData.title);

        expect(response.statusCode).toBe(500);
        expect(mockConnection.rollback).toHaveBeenCalled();
        expect(deleteFile).toHaveBeenCalledTimes(3); // 3 because mainPath, lowResPath, temp uploaded file

        console.error.mockRestore();
    });
});

//TODOp!!!: DELETE /api/map-creator/maps/:mapID tesztelése
