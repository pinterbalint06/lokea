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
    getAllImageIdsForMap: jest.fn()
};

module.exports = { mockConnection, mockDatabase };