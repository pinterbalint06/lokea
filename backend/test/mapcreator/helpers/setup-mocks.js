const { mockImageMetadata, mockImageProccessed } = require("./test-data.js");

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
            targetFileName: mockImageProccessed.targetFileName,
            lowResFileName: mockImageProccessed.lowResFileName,
            mainPath: mockImageProccessed.mainPath,
            lowResPath: mockImageProccessed.lowResPath
        }),
    deleteImageAndLowResByMainPath: jest.fn().mockResolvedValue()
}));

jest.mock("../../../utils/fileUtils.js", () => ({
    deleteFile: jest.fn().mockResolvedValue()
}));
