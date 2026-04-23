const mockConnection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
};

const mockDatabase = {
    getConnection: jest.fn().mockResolvedValue(mockConnection),

    checkUserOwnsGameMap: jest.fn().mockResolvedValue(true),
    checkUserOwnsMap: jest.fn().mockResolvedValue(true),
    checkUserOwnsPoint: jest.fn().mockResolvedValue(true),
    checkUserOwnsConnection: jest.fn().mockResolvedValue(true),

    updateMapTitle: jest.fn().mockResolvedValue(true),
    getGameMapDetails: jest.fn(),
    getMapsByGameMapId: jest.fn(),
    getMapInfo: jest.fn(),
    insertMap: jest.fn(),
    insertImage: jest.fn(),
    updateImagePath: jest.fn().mockResolvedValue(true),
    deleteMapById: jest.fn().mockResolvedValue(true),
    deleteImageById: jest.fn().mockResolvedValue(true),
    getAllImageIdsForMap: jest.fn(),
    getPointsOnMap: jest.fn(),
    getGameMapIdByMapId: jest.fn(),
    getPointOnMapByCoordinates: jest.fn(),
    insertPoint: jest.fn(),
    getPointInfo: jest.fn(),
    getPointImage: jest.fn(),
    deletePointById: jest.fn().mockResolvedValue(true),
    updatePointCoordinates: jest.fn().mockResolvedValue(true),
    updatePointNorthDirection: jest.fn().mockResolvedValue(true),
    updatePointImage: jest.fn().mockResolvedValue(true),
    getConnectionsByGameMapId: jest.fn(),
    deleteConnectionById: jest.fn().mockResolvedValue(true),
    arePointsInSameGameMap: jest.fn().mockResolvedValue(true),
    doesConnectionAlreadyExist: jest.fn().mockResolvedValue(false),
    insertConnection: jest.fn(),
    arePointsInSameMap: jest.fn().mockResolvedValue(true),
    isConnectionCrossMap: jest.fn().mockResolvedValue(true),
    updateConnectionDirections: jest.fn().mockResolvedValue(true),

    getGameMapComments: jest.fn(),
    getGameMapCommentCount: jest.fn(),
    hasUserCommentedOnGameMap: jest.fn().mockResolvedValue(true),
    getUserCommentOnGameMap: jest.fn(),
    insertGameMapComment: jest.fn(),
    updateUserCommentOnGameMap: jest.fn().mockResolvedValue(true),
    deleteUserCommentOnGameMap: jest.fn().mockResolvedValue(true),
    getGameMapCoverImage: jest.fn(),
    updateGameMapCoverImage: jest.fn().mockResolvedValue(true),
    getTopScoresForGameMap: jest.fn(),
    updateGameMapDetails: jest.fn().mockResolvedValue(true),
    getAllImageIdsForGameMap: jest.fn(),
    deleteGameMapById: jest.fn().mockResolvedValue(true)
};

module.exports = mockDatabase;
module.exports.mockConnection = mockConnection;
