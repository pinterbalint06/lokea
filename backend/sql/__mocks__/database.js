const mockConnection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
};

const mockDatabase = {
    getConnection: jest.fn().mockResolvedValue(mockConnection),
    
    checkUserOwnsGameMap: jest.fn(),
    checkUserOwnsMap: jest.fn(),
    checkUserOwnsPoint: jest.fn(),
    checkUserOwnsConnection: jest.fn(),

    updateMapTitle: jest.fn(),
    getMapsByGameMapId: jest.fn(),
    getMapInfo: jest.fn(),
    insertMap: jest.fn(),
    insertImage: jest.fn(),
    updateImagePath: jest.fn(),
    deleteMapById: jest.fn(),
    deleteImageById: jest.fn(),
    getAllImageIdsForMap: jest.fn(),
    getPointsOnMap: jest.fn(),
    getGameMapIdByMapId: jest.fn(),
    getPointOnMapByCoordinates: jest.fn(),
    insertPoint: jest.fn(),
    getPointInfo: jest.fn(),
    getPointImage: jest.fn(),
    deletePointById: jest.fn(),
    updatePointCoordinates: jest.fn(),
    updatePointNorthDirection: jest.fn(),
    updatePointImage: jest.fn(),
    getConnectionsByGameMapId: jest.fn(),
    deleteConnectionById: jest.fn(),
    arePointsInSameGameMap: jest.fn(),
    doesConnectionAlreadyExist: jest.fn(),
    insertConnection: jest.fn(),
    arePointsInSameMap: jest.fn(),
    isConnectionCrossMap: jest.fn(),
    updateConnectionDirections: jest.fn()
};

module.exports = mockDatabase;
module.exports.mockConnection = mockConnection;
