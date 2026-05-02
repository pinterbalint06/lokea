const mockRandomPointQueries = {
    getRandomPoint: jest.fn(),
    getCurrentPointId: jest.fn(),
    getPointById: jest.fn(),
    setCurrentPoint: jest.fn().mockResolvedValue(undefined),
    incrementCycle: jest.fn().mockResolvedValue(undefined)
};

module.exports = mockRandomPointQueries;
