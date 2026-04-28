const { createTestApp } = require("./helpers/setup-test.js");
const {
    randomId,
    buildRequest,
    testInvalidIDs,
    expectErrorResponse,
    suppressConsoleErrors
} = require("#testhelpers/helpers.js");
const { invalidTypeNumbers, invalidCharForHungarian } = require("#testhelpers/test-data.js");

const express = require("express");
const ERRORS = require("#utils/error-messages.js");

const database = require("#sql/database.js");

const { UPLOAD_ROOT_MAP_DATA } = require("#config/mapdatas-upload-config.js");
const { LOW_RES_SUFFIX } = require("#config/image-config.js");

const { isAllowedToAccessPoint, isAllowedToGetMapImage } = require("#gamemaps/shared/middlewares/gamemaps.middleware.js");

const requestWithSupertest = createTestApp();

describe("Game Maps API - /api/game-maps/", () => {
    describe("Images Endpoints", () => {
        describe("GET /points/:pointID/image", () => {
            const defaults = {
                id: randomId()
            };

            const mockImageData = {
                filepath: "user1/gamemap1/map1/point_images/image1.webp",
                width: 1920,
                height: 1080,
                north_direction: 45
            };

            let sendFileSpy;

            const makeGetRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.get(`/api/game-maps/points/${encodeURIComponent(id)}/image`),
                overrides,
                defaults
            );

            beforeAll(() => {
                sendFileSpy = jest.spyOn(express.response, "sendFile").mockImplementation(function (path, options, cb) {
                    this.status(200).send(Buffer.from("mock-image-data"));
                    if (cb) {
                        cb();
                    }
                });
            });

            afterAll(() => {
                sendFileSpy.mockRestore();
            });

            beforeEach(() => {
                database.getPointImage.mockResolvedValue(mockImageData);
                sendFileSpy.mockClear();
            });

            describe("Authorization (401, 403)", () => {
                it("Should respond with 403 if the user is not allowed to access the point", async () => {
                    isAllowedToAccessPoint.mockImplementationOnce((request, response, next) => {
                        response.status(403).json({ error: ERRORS.POINT.NO_ACCESS });
                    });

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 403, ERRORS.POINT.NO_ACCESS);
                    expect(database.getPointImage).not.toHaveBeenCalled();
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the point id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeGetRequest({ id }),
                        ERRORS.POINT.INVALID_ID
                    );
                });

                describe("Test resolution query", () => {
                    it.each([...invalidTypeNumbers, ...invalidCharForHungarian, "invalid_res", 123])("Should respond with 400 if the resolution query is invalid: %s", async (invalidResolution) => {
                        const response = await makeGetRequest({ query: { resolution: invalidResolution } });

                        expectErrorResponse(response, 400, ERRORS.COMMON.INVALID_RESOLUTION);
                    });
                });
            });

            describe("Conflicts (404, 409)", () => {
                it("Should respond with 404 if the point image does not exist in the database", async () => {
                    database.getPointImage.mockResolvedValueOnce(null);

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 404, ERRORS.COMMON.FILE_NOT_FOUND);
                });

                it("Should respond with 404 if the file does not exist", async () => {
                    sendFileSpy.mockImplementationOnce(function (path, options, cb) {
                        if (cb) {
                            cb(new Error("ENOENT: no such file or directory"));
                        }
                    });

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 404, ERRORS.COMMON.FILE_NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 200, return the high-resolution image, and send headers if no resolution query is provided", async () => {
                    const response = await makeGetRequest();

                    expect(database.getPointImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.stringContaining(mockImageData.filepath),
                        { root: UPLOAD_ROOT_MAP_DATA },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);

                    expect(response.headers["imagewidth"]).toBe(mockImageData.width.toString());
                    expect(response.headers["imageheight"]).toBe(mockImageData.height.toString());
                    expect(response.headers["northdirection"]).toBe(mockImageData.north_direction.toString());
                });

                it("Should respond with 200, return the high-resolution image, and send headers if resolution=high is provided", async () => {
                    const response = await makeGetRequest({ query: { resolution: "high" } });

                    expect(database.getPointImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.not.stringContaining(LOW_RES_SUFFIX),
                        { root: UPLOAD_ROOT_MAP_DATA },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);
                    expect(response.headers["imagewidth"]).toBe(mockImageData.width.toString());
                    expect(response.headers["imageheight"]).toBe(mockImageData.height.toString());
                    expect(response.headers["northdirection"]).toBe(mockImageData.north_direction.toString());
                });

                it("Should respond with 200, return the low-resolution image, and send headers if resolution=low is provided", async () => {
                    const response = await makeGetRequest({ query: { resolution: "low" } });

                    expect(database.getPointImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.stringContaining(LOW_RES_SUFFIX),
                        { root: UPLOAD_ROOT_MAP_DATA },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);
                    expect(response.headers["imagewidth"]).toBe(mockImageData.width.toString());
                    expect(response.headers["imageheight"]).toBe(mockImageData.height.toString());
                    expect(response.headers["northdirection"]).toBe(mockImageData.north_direction.toString());
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if there is an unexpected database error during getPointImage", async () => {
                    database.getPointImage.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });

        describe("GET /maps/:mapID/image", () => {
            const defaults = {
                id: randomId()
            };

            const mockImageData = {
                filepath: "user1/gamemap1/map1/map_image.webp",
                width: 1920,
                height: 1080
            };

            let sendFileSpy;

            const makeGetRequest = (overrides = {}) => buildRequest(
                (id) => requestWithSupertest.get(`/api/game-maps/maps/${encodeURIComponent(id)}/image`),
                overrides,
                defaults
            );

            beforeAll(() => {
                sendFileSpy = jest.spyOn(express.response, "sendFile").mockImplementation(function (path, options, cb) {
                    this.status(200).send(Buffer.from("mock-image-data"));
                    if (cb) {
                        cb();
                    }
                });
            });

            afterAll(() => {
                sendFileSpy.mockRestore();
            });

            beforeEach(() => {
                database.getMapImage.mockResolvedValue(mockImageData);
                sendFileSpy.mockClear();
            });

            describe("Authorization (401, 403)", () => {
                it("Should respond with 403 if the user is not allowed to access the map", async () => {
                    isAllowedToGetMapImage.mockImplementationOnce((req, res, next) => {
                        res.status(403).json({ error: ERRORS.MAP.NO_ACCESS });
                    });

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 403, ERRORS.MAP.NO_ACCESS);
                    expect(database.getMapImage).not.toHaveBeenCalled();
                });
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeGetRequest({ id }),
                        ERRORS.MAP.INVALID_ID
                    );
                });

                describe("Test resolution query", () => {
                    it.each([...invalidTypeNumbers, ...invalidCharForHungarian, "invalid_res", 123])("Should respond with 400 if the resolution query is invalid: %s", async (invalidResolution) => {
                        const response = await makeGetRequest({ query: { resolution: invalidResolution } });

                        expectErrorResponse(response, 400, ERRORS.COMMON.INVALID_RESOLUTION);
                    });
                });
            });

            describe("Conflicts (404, 409)", () => {
                it("Should respond with 404 if the map image does not exist in the database", async () => {
                    database.getMapImage.mockResolvedValueOnce(null);

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 404, ERRORS.COMMON.FILE_NOT_FOUND);
                });

                it("Should respond with 404 if the file does not exist", async () => {
                    sendFileSpy.mockImplementationOnce(function (path, options, cb) {
                        if (cb) {
                            cb(new Error("ENOENT: no such file or directory"));
                        }
                    });

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 404, ERRORS.COMMON.FILE_NOT_FOUND);
                });
            });

            describe("Happy paths (200, 201, 204)", () => {
                it("Should respond with 200, return the high-resolution image, and send headers if no resolution query is provided", async () => {
                    const response = await makeGetRequest();

                    expect(database.getMapImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.stringContaining(mockImageData.filepath),
                        { root: UPLOAD_ROOT_MAP_DATA },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);
                    expect(response.headers["access-control-expose-headers"]).toContain("imageWidth");
                    expect(response.headers["access-control-expose-headers"]).toContain("imageHeight");

                    expect(response.headers["imagewidth"]).toBe(mockImageData.width.toString());
                    expect(response.headers["imageheight"]).toBe(mockImageData.height.toString());
                });

                it("Should respond with 200, return the high-resolution image, and send headers if resolution=high is provided", async () => {
                    const response = await makeGetRequest({ query: { resolution: "high" } });

                    expect(database.getMapImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.not.stringContaining(LOW_RES_SUFFIX),
                        { root: UPLOAD_ROOT_MAP_DATA },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);
                    expect(response.headers["access-control-expose-headers"]).toContain("imageWidth");
                    expect(response.headers["access-control-expose-headers"]).toContain("imageHeight");

                    expect(response.headers["imagewidth"]).toBe(mockImageData.width.toString());
                    expect(response.headers["imageheight"]).toBe(mockImageData.height.toString());
                });

                it("Should respond with 200, return the low-resolution image, and send headers if resolution=low is provided", async () => {
                    const response = await makeGetRequest({ query: { resolution: "low" } });

                    expect(database.getMapImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.stringContaining(LOW_RES_SUFFIX),
                        { root: UPLOAD_ROOT_MAP_DATA },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);
                    expect(response.headers["access-control-expose-headers"]).toContain("imageWidth");
                    expect(response.headers["access-control-expose-headers"]).toContain("imageHeight");

                    expect(response.headers["imagewidth"]).toBe(mockImageData.width.toString());
                    expect(response.headers["imageheight"]).toBe(mockImageData.height.toString());
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if there is an unexpected database error during getMapImage", async () => {
                    database.getMapImage.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });
    });
});