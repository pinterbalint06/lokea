const mockImageMetadata = {
    width: 800,
    height: 600,
    extension: ".jpg"
};

const mockImageProcessed = {
    targetFileName: "mock.webp",
    lowResFileName: "mock_low_res.webp",
    mainPath: "/path/to/mock.webp",
    lowResPath: "/path/to/mock_low_res.webp"
};

const imageProcessorMock = {
    processImageMetadata: jest.fn().mockResolvedValue(mockImageMetadata),
    createWebpAndLowRes: jest.fn().mockResolvedValue(mockImageProcessed),
    deleteImageAndLowResByMainPath: jest.fn().mockResolvedValue(),

    mockImageMetadata,
    mockImageProcessed
};

module.exports = imageProcessorMock;