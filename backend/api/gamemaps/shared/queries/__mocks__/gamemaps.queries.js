const mockSharedGameMapQueries = {
    getGameMapDetails: jest.fn(),
    doesGameMapExist: jest.fn().mockResolvedValue(true)
};

module.exports = mockSharedGameMapQueries;
