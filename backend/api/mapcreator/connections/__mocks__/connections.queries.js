const mockConnectionQueries = {
    insertConnection: jest.fn(),
    getConnectionsByGameMapId: jest.fn(),
    updateConnectionDirections: jest.fn().mockResolvedValue(true),
    isConnectionCrossMap: jest.fn().mockResolvedValue(true),
    arePointsInSameGameMap: jest.fn().mockResolvedValue(true),
    arePointsInSameMap: jest.fn().mockResolvedValue(true),
    doesConnectionAlreadyExist: jest.fn().mockResolvedValue(false),
    deleteConnectionById: jest.fn().mockResolvedValue(true)
};

module.exports = mockConnectionQueries;
