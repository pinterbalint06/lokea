const mockCoverImageQueries = {
    getGameMapCoverImage: jest.fn(),
    updateGameMapCoverImage: jest.fn().mockResolvedValue(true)
};

module.exports = mockCoverImageQueries;
