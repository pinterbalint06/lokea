const { createTestApp } = require("./helpers/setup-test.js");
const { testInvalidIDs, testRequiresAuth } = require("./helpers/helpers.js");
const { invalidUVs, invalidDegrees } = require("./helpers/test-data.js");

jest.mock("../../auth.js", () => ({
    checkAuth: jest.fn((request, response, next) => {
        request.session = { userid: 1 };
        next();
    })
}));

jest.mock("../../sql/database.js", () => require("./helpers/mockDatabase.js").mockDatabase);

const database = require("../../sql/database.js");
const { mockConnection } = require("./helpers/mockDatabase.js");

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
const fs = require("fs/promises");
const path = require("path");

const requestWithSupertest = createTestApp();

describe("Map Creator API - Point Endpoints - /api/map-creator/", () => {
    describe("GET /maps/:mapID/points", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        testRequiresAuth(() => requestWithSupertest.get("/api/map-creator/maps/1/points"));

        it("Should respond with 400 if the map id is incorrect", async () => {
            await testInvalidIDs(
                (id) => requestWithSupertest
                    .get(`/api/map-creator/maps/${encodeURIComponent(id)}/points`),
                "Helytelen térkép ID"
            );
        });

        it("Should return all points for a map", async () => {
            database.checkUserOwnsMap.mockResolvedValue(true);
            const points = [
                { id: 32, point_u: 0.23, point_v: 0.743, north_direction: 32 },
                { id: 54, point_u: 0.12, point_v: 0.456, north_direction: 12 },
                { id: 76, point_u: 0.89, point_v: 0.234, north_direction: 76 },
                { id: 98, point_u: 0.45, point_v: 0.678, north_direction: 98 }
            ];
            database.getPointsOnMap.mockResolvedValue(points);

            const response = await requestWithSupertest.get("/api/map-creator/maps/1/points");

            expect(response.statusCode).toEqual(200);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("points");
            for (const point of points) {
                expect(response.body.points).toContainEqual(point);
            }
        });

        it("Should return an empty list if there are no points on the map", async () => {
            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getPointsOnMap.mockResolvedValue([]);

            const response = await requestWithSupertest.get("/api/map-creator/maps/1/points");

            expect(response.statusCode).toEqual(200);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("points", []);
        });

        it("Should respond with 403 if it's not the user's game map", async () => {
            database.checkUserOwnsMap.mockResolvedValue(false);
            const points = [
                { id: 32, point_u: 0.23, point_v: 0.743, north_direction: 32 },
                { id: 54, point_u: 0.12, point_v: 0.456, north_direction: 12 },
                { id: 76, point_u: 0.89, point_v: 0.234, north_direction: 76 },
                { id: 98, point_u: 0.45, point_v: 0.678, north_direction: 98 }
            ];
            database.getPointsOnMap.mockResolvedValue(points);

            const response = await requestWithSupertest.get("/api/map-creator/maps/1/points");

            expect(response.statusCode).toEqual(403);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Nincs hozzáférése ehhez a térképhez");
        });

        it("Should respond with 500 if an unexpected database error occurs", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getPointsOnMap.mockRejectedValueOnce(new Error("Database connection refused"));

            const response = await requestWithSupertest.get("/api/map-creator/maps/1/points");

            expect(response.statusCode).toEqual(500);
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");

            console.error.mockRestore();
        });
    });

    describe("POST /maps/:mapID/points", () => {
        const validPointData = {
            u: 0.25,
            v: 0.5,
            northDirection: 45,
            equirectangularImage: Buffer.from("equirectangularImage")
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        testRequiresAuth(
            () => requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg")
        );

        it("Should respond with 400 if the map id is incorrect", async () => {
            await testInvalidIDs(
                (id) => requestWithSupertest
                    .post(`/api/map-creator/maps/${encodeURIComponent(id)}/points`)
                    .field("u", validPointData.u)
                    .field("v", validPointData.v)
                    .field("northDirection", validPointData.northDirection)
                    .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg"),
                "Helytelen térkép ID"
            );
        });

        it("Should respond with 403 if it's not the user's game map", async () => {
            database.checkUserOwnsMap.mockResolvedValue(false);

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(response.statusCode).toEqual(403);
            expect(response.type).toEqual(expect.stringContaining("json"));
            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("error", "Nincs hozzáférése ehhez a térképhez");
        });

        it("Should respond with 400 if a body is not provided", async () => {
            database.checkUserOwnsMap.mockResolvedValue(true);

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points");

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Hiányzó adatok!");
        });

        it("Should respond with 400 if u is missing", async () => {
            database.checkUserOwnsMap.mockResolvedValue(true);

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Helytelen koordináták!");
            expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
        });

        it.each(invalidUVs)("Should respond with 400 if u coordinate is invalid: '%s'", async (invalidU) => {
            database.checkUserOwnsMap.mockResolvedValue(true);

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("u", invalidU)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Helytelen koordináták!");
            expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
        });

        it("Should respond with 400 if v is missing", async () => {
            database.checkUserOwnsMap.mockResolvedValue(true);

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("u", validPointData.u)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Helytelen koordináták!");
            expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
        });

        it.each(invalidUVs)("Should respond with 400 if v is invalid: '%s'", async (invalidV) => {
            database.checkUserOwnsMap.mockResolvedValue(true);

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("u", validPointData.u)
                .field("v", invalidV)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Helytelen koordináták!");
            expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
        });

        it("Should respond with 400 if northDirection is missing", async () => {
            database.checkUserOwnsMap.mockResolvedValue(true);

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Helytelen északirány!");
            expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
        });

        it.each(invalidDegrees)("Should respond with 400 if northDirection is invalid: '%s'", async (invalidDirection) => {
            database.checkUserOwnsMap.mockResolvedValue(true);

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", invalidDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Helytelen északirány!");
            expect(deleteFile).toHaveBeenCalledWith(expect.any(String));
        });

        it("Should respond with 400 if no image was provided", async () => {
            database.checkUserOwnsMap.mockResolvedValue(true);

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection);

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Nem adott meg képet!");
            expect(deleteFile).not.toHaveBeenCalled();
        });

        it("Should respond with 500 if database refused connection", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getGameMapIdByMapId.mockResolvedValue(10);
            database.getConnection.mockRejectedValueOnce(new Error("Database connection refused"));

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(response.statusCode).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Váratlan hiba történt!");
            expect(deleteFile).toHaveBeenCalled();

            console.error.mockRestore();
        });

        it("Should respond with 500 if getGameMapIdByMapId fails with null", async () => {
            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getGameMapIdByMapId.mockResolvedValue(null);

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(response.statusCode).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Váratlan hiba történt!");
            expect(deleteFile).toHaveBeenCalled();
        });

        it("Should respond with 500 if getGameMapIdByMapId fails with error", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getGameMapIdByMapId.mockRejectedValueOnce(new Error("Database error"));
            database.getPointOnMapByCoordinates.mockResolvedValue([]);

            const response = await requestWithSupertest
                .post("/api/map-creator/maps/1/points")
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(response.statusCode).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Váratlan hiba történt!");
            expect(deleteFile).toHaveBeenCalled();

            console.error.mockRestore();
        });

        it("Should respond with 500 if insertImage failed", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getPointOnMapByCoordinates.mockResolvedValue([]);
            database.getGameMapIdByMapId.mockResolvedValue(10);
            database.insertImage.mockRejectedValueOnce(new Error("Database error"));

            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v);
            expect(database.insertImage).toHaveBeenCalledWith(mockConnection, 800, 600, "pending");
            expect(mockConnection.commit).not.toHaveBeenCalled();
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();

            expect(response.statusCode).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Váratlan hiba történt!");
            expect(deleteFile).toHaveBeenCalled();

            console.error.mockRestore();
        });

        it("Should respond with 500 if insertPoint failed", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getPointOnMapByCoordinates.mockResolvedValue([]);
            database.getGameMapIdByMapId.mockResolvedValue(10);
            const newImageId = 88;
            database.insertImage.mockResolvedValue(newImageId);
            database.insertPoint.mockRejectedValueOnce(new Error("Database error"));

            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v);
            expect(database.insertImage).toHaveBeenCalledWith(mockConnection, 800, 600, "pending");
            expect(database.insertPoint).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v, validPointData.northDirection, newImageId);
            expect(database.updateImagePath).not.toHaveBeenCalledWith();
            expect(mockConnection.commit).not.toHaveBeenCalled();
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();

            expect(response.statusCode).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");
            expect(deleteFile).toHaveBeenCalled();

            console.error.mockRestore();
        });

        it("Should respond with 500 if updateImagePath failed", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getPointOnMapByCoordinates.mockResolvedValue([]);
            database.getGameMapIdByMapId.mockResolvedValue(10);
            const newImageId = 88;
            database.insertImage.mockResolvedValue(newImageId);
            const newPointId = 77;
            database.insertPoint.mockResolvedValue(newPointId);
            database.updateImagePath.mockRejectedValueOnce(new Error("Database error"));

            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v);
            expect(database.insertImage).toHaveBeenCalledWith(mockConnection, 800, 600, "pending");
            expect(database.insertPoint).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v, validPointData.northDirection, newImageId);
            expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, newImageId, expect.any(String));
            expect(mockConnection.commit).not.toHaveBeenCalled();
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
            expect(deleteFile).toHaveBeenCalledTimes(3); // original upload, the webp, and the low res

            expect(response.statusCode).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");

            console.error.mockRestore();
        });

        it("Should respond with 500 if database commit failed", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getPointOnMapByCoordinates.mockResolvedValue([]);
            database.getGameMapIdByMapId.mockResolvedValue(10);
            const newImageId = 88;
            database.insertImage.mockResolvedValue(newImageId);
            const newPointId = 77;
            database.insertPoint.mockResolvedValue(newPointId);
            mockConnection.commit.mockRejectedValueOnce(new Error("Database error"));

            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v);
            expect(database.insertImage).toHaveBeenCalledWith(mockConnection, 800, 600, "pending");
            expect(database.insertPoint).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v, validPointData.northDirection, newImageId);
            expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, newImageId, expect.any(String));
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
            expect(deleteFile).toHaveBeenCalledTimes(3); // original upload, the webp, and the low res

            expect(response.statusCode).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");

            console.error.mockRestore();
        });

        it("Should respond with 500 if database rollback failed and still delete files", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getPointOnMapByCoordinates.mockResolvedValue([]);
            database.getGameMapIdByMapId.mockResolvedValue(10);
            const newImageId = 88;
            database.insertImage.mockResolvedValue(newImageId);
            const newPointId = 77;
            database.insertPoint.mockResolvedValue(newPointId);
            mockConnection.commit.mockRejectedValueOnce(new Error("Database error"));
            mockConnection.rollback.mockRejectedValueOnce(new Error("Database error"));

            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v);
            expect(database.insertImage).toHaveBeenCalledWith(mockConnection, 800, 600, "pending");
            expect(database.insertPoint).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v, validPointData.northDirection, newImageId);
            expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, newImageId, expect.any(String));
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
            expect(deleteFile).toHaveBeenCalledTimes(3); // original upload, the webp, and the low res

            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("Database rollback failed"),
                expect.any(Error)
            );

            expect(response.statusCode).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");

            console.error.mockRestore();
        });

        it("Should respond with 409 if the point already exists", async () => {
            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getPointOnMapByCoordinates.mockResolvedValue(
                [
                    { point_id: 55 }
                ]
            );
            database.getGameMapIdByMapId.mockResolvedValue(10);

            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v);

            expect(response.statusCode).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Ezen a térképen már létezik pont ezeken a koordinátákon!");
            expect(deleteFile).toHaveBeenCalled();
        });

        it("Should respond with 500 if the image processing failed", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            database.checkUserOwnsMap.mockResolvedValue(true);
            processImageMetadata.mockRejectedValueOnce(new Error("Image processing failed"));

            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");


            expect(mockConnection.beginTransaction).not.toHaveBeenCalled();
            expect(deleteFile).toHaveBeenCalledWith(expect.any(String));

            expect(response.statusCode).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Hiba a kép feldolgozásakor!");

            console.error.mockRestore();
        });


        it("Should respond with 500 if image conversion failed", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getPointOnMapByCoordinates.mockResolvedValue([]);
            database.getGameMapIdByMapId.mockResolvedValue(10);
            const newImageId = 88;
            database.insertImage.mockResolvedValue(newImageId);
            const newPointId = 77;
            database.insertPoint.mockResolvedValue(newPointId);
            createWebpAndLowRes.mockRejectedValueOnce(new Error("Image processing failed"));

            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v);
            expect(database.insertImage).toHaveBeenCalledWith(mockConnection, 800, 600, "pending");
            expect(database.insertPoint).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v, validPointData.northDirection, newImageId);
            expect(database.updateImagePath).not.toHaveBeenCalled();
            expect(mockConnection.commit).not.toHaveBeenCalled();
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();

            expect(response.statusCode).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Váratlan hiba történt!");
            expect(deleteFile).toHaveBeenCalled();

            console.error.mockRestore();
        });

        it("Should respond with 201 if everything was successful", async () => {
            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getPointOnMapByCoordinates.mockResolvedValue([]);
            database.getGameMapIdByMapId.mockResolvedValue(10);
            const newImageId = 88;
            database.insertImage.mockResolvedValue(newImageId);
            const newPointId = 77;
            database.insertPoint.mockResolvedValue(newPointId);

            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v);
            expect(database.insertImage).toHaveBeenCalledWith(mockConnection, 800, 600, "pending");
            expect(database.insertPoint).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v, validPointData.northDirection, newImageId);
            expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, newImageId, expect.any(String));
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.rollback).not.toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty("pointId", newPointId);
            expect(deleteFile).toHaveBeenCalled();
        });

        it("Should respond with 500 if temporary file deletion failed", async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });

            database.checkUserOwnsMap.mockResolvedValue(true);
            database.getPointOnMapByCoordinates.mockResolvedValue([]);
            database.getGameMapIdByMapId.mockResolvedValue(10);
            const newImageId = 88;
            database.insertImage.mockResolvedValue(newImageId);
            const newPointId = 77;
            database.insertPoint.mockResolvedValue(newPointId);
            deleteFile.mockRejectedValueOnce(new Error("Failed to delete temporary file"));

            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", validPointData.equirectangularImage, "test_image.jpg");

            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(database.getPointOnMapByCoordinates).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v);
            expect(database.insertImage).toHaveBeenCalledWith(mockConnection, 800, 600, "pending");
            expect(database.insertPoint).toHaveBeenCalledWith(mockConnection, mapId, validPointData.u, validPointData.v, validPointData.northDirection, newImageId);
            expect(database.updateImagePath).toHaveBeenCalledWith(mockConnection, newImageId, expect.any(String));
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.rollback).not.toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();

            expect(response.statusCode).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty("pointId", newPointId);
            expect(deleteFile).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to delete temporary file"),
                expect.any(Error)
            );

            console.error.mockRestore();
        });

        it("Should respond with 413 for images too large", async () => {
            const tooBigFile = Buffer.alloc(11 * 1024 * 1024);

            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("equirectangularImage", tooBigFile, "test_image.jpg");

            expect(response.statusCode).toBe(413);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Túl nagy fájlméret! (Max 10MB)");
        });

        it("Should respond with 400 for unexpected multer errors", async () => {
            const mapId = 1;
            const response = await requestWithSupertest
                .post(`/api/map-creator/maps/${mapId}/points`)
                .field("u", validPointData.u)
                .field("v", validPointData.v)
                .field("northDirection", validPointData.northDirection)
                .attach("wrongFieldName", validPointData.equirectangularImage, "test_image.jpg");

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty("error", "Fájlfeltöltési hiba történt!");
        });
    });
});
