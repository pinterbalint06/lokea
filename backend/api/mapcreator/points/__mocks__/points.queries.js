const mockPointQueries = {
    insertPoint: jest.fn(),
    getPointsOnMap: jest.fn(),
    getPointInfo: jest.fn(),
    getPointOnMapByCoordinates: jest.fn(),
    getGameMapIdByMapId: jest.fn(),
    updatePointCoordinates: jest.fn().mockResolvedValue(true),
    updatePointNorthDirection: jest.fn().mockResolvedValue(true),
    updatePointImage: jest.fn().mockResolvedValue(true),
    deletePointById: jest.fn().mockResolvedValue(true)
};

module.exports = mockPointQueries;
