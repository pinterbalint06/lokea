const { mockImageMetadata } = require("./test-data.js");

jest.mock("../../../auth.js", () => ({
    checkAuth: jest.fn((request, response, next) => {
        request.session = { userid: 1 };
        next();
    })
}));

jest.mock("../../../sql/database.js", () => require("./mock-database.js").mockDatabase);

jest.mock("../../../utils/imageProcessor.js", () => ({
    processImageMetadata: jest.fn().mockResolvedValue(mockImageMetadata),
    createWebpAndLowRes: jest.fn().mockResolvedValue(
        {
            targetFileName: "mock.webp",
            lowResFileName: "mock_low_res.webp",
            mainPath: "/path/to/mock.webp",
            lowResPath: "/path/to/mock_low_res.webp"
        })
}));

jest.mock("../../../utils/fileUtils.js", () => ({
    deleteFile: jest.fn().mockResolvedValue()
}));
