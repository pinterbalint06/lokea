const mockGameMapQueries = {
    getTopScoresForGameMap: jest.fn(),
    updateGameMapDetails: jest.fn().mockResolvedValue(true),
    getAllImageIdsForGameMap: jest.fn(),
    deleteGameMapById: jest.fn().mockResolvedValue(true)
};

module.exports = mockGameMapQueries;
