const mockConnection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
};

const mockDatabase = {
    getConnection: jest.fn().mockImplementation(() => Promise.resolve(mockConnection)),
    checkUserOwnsGameMap: jest.fn(),
    checkUserOwnsMap: jest.fn(),
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
    checkUserOwnsPoint: jest.fn(),
    getPointInfo: jest.fn(),
    getPointImage: jest.fn(),
    deletePointById: jest.fn(),
    updatePointCoordinates: jest.fn(),
    updatePointNorthDirection: jest.fn(),
    updatePointImage: jest.fn(),
    getConnectionsByGameMapId: jest.fn(),
    checkUserOwnsConnection: jest.fn(),
    deleteConnectionById: jest.fn(),
    arePointsInSameGameMap: jest.fn(),
    doesConnectionAlreadyExist: jest.fn(),
    insertConnection: jest.fn()
};

module.exports = { mockConnection, mockDatabase };