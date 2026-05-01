const mockMapQueries = {
    insertMap: jest.fn(),
    getMapInfo: jest.fn(),
    getMapsByGameMapId: jest.fn(),
    updateMapTitle: jest.fn().mockResolvedValue(true),
    getAllImageIdsForMap: jest.fn(),
    deleteMapById: jest.fn().mockResolvedValue(true)
};

module.exports = mockMapQueries;
