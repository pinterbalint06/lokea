const mockFavoriteQueries = {
    isUserFavorite: jest.fn().mockResolvedValue(true),
    insertFavorite: jest.fn(),
    deleteFavorite: jest.fn().mockResolvedValue(true)
};

module.exports = mockFavoriteQueries;
