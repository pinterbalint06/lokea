const mockConnection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
};

const mockGameDatabase = {
    getConnection: jest.fn().mockResolvedValue(mockConnection),

    getGameMaps: jest.fn(),
    getImagePath: jest.fn(),
    getGameTitleById: jest.fn().mockResolvedValue("Test Game"),
    insertGameSession: jest.fn().mockResolvedValue(1),
    selectLatestActiveGameSession: jest.fn().mockResolvedValue(null),
    finishGameSession: jest.fn().mockResolvedValue(undefined),

    getRandomPoint: jest.fn(),
    getAllMaps: jest.fn(),
    incrementCycle: jest.fn().mockResolvedValue(undefined),
    incrementCurrentRound: jest.fn().mockResolvedValue(undefined),
    saveGuess: jest.fn().mockResolvedValue(undefined),
    totalScore: jest.fn().mockResolvedValue(1000),
    getCurrentPointId: jest.fn(),
    getPointById: jest.fn(),
    setCurrentPoint: jest.fn().mockResolvedValue(undefined),
    clearCurrentPoint: jest.fn().mockResolvedValue(undefined)
};

module.exports = mockGameDatabase;
module.exports.mockConnection = mockConnection;
