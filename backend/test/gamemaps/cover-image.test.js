const { createTestApp } = require("./helpers/setup-test.js");
const {
    randomId,
    buildRequest,
    testInvalidIDs,
    expectErrorResponse,
    suppressConsoleErrors
} = require("#testhelpers/helpers.js");
const { invalidTypeNumbers, invalidIds, invalidCharForHungarian } = require("#testhelpers/test-data.js");

const express = require("express");
const ERRORS = require("#utils/error-messages.js");

const database = require("#sql/database.js");
const { UPLOAD_ROOT_MAP_DATA } = require("#config/mapdatas-upload-config.js");
const { LOW_RES_SUFFIX } = require("#config/image-config.js");
const { mockConnection } = database;

const requestWithSupertest = createTestApp();

describe("Game Maps API - /api/game-maps/", () => {
    describe("Cover Image Endpoints", () => {
        describe("GET /:gameMapID/cover-image", () => {
            const defaults = {
                id: randomId()
            };

            const mockImageData = {
                image_id: 1,
                filepath: "user1/gamemap1/cover.jpg",
                width: 1920,
                height: 1080
            };

            let sendFileSpy;

            const makeGetRequest = (overrides = {}, query = "") => buildRequest(
                (id) => requestWithSupertest.get(`/api/game-maps/${encodeURIComponent(id)}/cover-image${query}`),
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
                database.getGameMapCoverImage.mockResolvedValue(mockImageData);
                sendFileSpy.mockClear();
            });

            describe("Input validation (400, 413, 415, 422)", () => {
                it("Should respond with 400 if the game map id is incorrect", async () => {
                    await testInvalidIDs(
                        (id) => makeGetRequest({ id }),
                        ERRORS.GAMEMAP.INVALID_ID
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
                it("Should respond with 404 if the file does not actually exist on the disk", async () => {
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
                it("Should respond with 200, return the image, and send headers if no resolution query is provided", async () => {
                    const response = await makeGetRequest();

                    expect(database.getGameMapCoverImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.stringContaining(mockImageData.filepath),
                        {
                            root: UPLOAD_ROOT_MAP_DATA
                        },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);
                    expect(response.headers["access-control-expose-headers"]).toContain("imageWidth");
                    expect(response.headers["access-control-expose-headers"]).toContain("imageHeight");
                    expect(response.headers["imagewidth"]).toBe(mockImageData.width.toString());
                    expect(response.headers["imageheight"]).toBe(mockImageData.height.toString());
                });

                it("Should respond with 200 and return the default cover image if the database returns null", async () => {
                    database.getGameMapCoverImage.mockResolvedValueOnce(null);

                    const response = await makeGetRequest();

                    expect(database.getGameMapCoverImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.stringContaining("not_found.webp"),
                        {
                            root: UPLOAD_ROOT_MAP_DATA
                        },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);
                    expect(response.headers["imagewidth"]).toBe("750");
                    expect(response.headers["imageheight"]).toBe("545");
                });

                it("Should respond with 200 and process the resolution query properly if provided", async () => {
                    const response = await makeGetRequest({ query: { resolution: "low" } });

                    expect(database.getGameMapCoverImage).toHaveBeenCalledWith(defaults.id);
                    expect(sendFileSpy).toHaveBeenCalledWith(
                        expect.stringContaining(LOW_RES_SUFFIX),
                        {
                            root: UPLOAD_ROOT_MAP_DATA
                        },
                        expect.any(Function)
                    );

                    expect(response.statusCode).toBe(200);
                    expect(response.headers["imagewidth"]).toBe(mockImageData.width.toString());
                    expect(response.headers["imageheight"]).toBe(mockImageData.height.toString());
                });
            });

            describe("Server errors (500)", () => {
                suppressConsoleErrors();

                it("Should respond with 500 if there is an unexpected database error during getGameMapCoverImage", async () => {
                    database.getGameMapCoverImage.mockRejectedValueOnce(new Error("Database error"));

                    const response = await makeGetRequest();

                    expectErrorResponse(response, 500, ERRORS.COMMON.UNEXPECTED_ERROR);
                });
            });
        });
    });
});
