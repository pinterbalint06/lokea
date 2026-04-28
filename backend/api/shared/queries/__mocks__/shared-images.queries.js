const mockSharedImageQueries = {
    insertImage: jest.fn(),
    updateImagePath: jest.fn().mockResolvedValue(true),
    deleteImageById: jest.fn().mockResolvedValue(true),
    getImagePath: jest.fn()
};

module.exports = mockSharedImageQueries;
