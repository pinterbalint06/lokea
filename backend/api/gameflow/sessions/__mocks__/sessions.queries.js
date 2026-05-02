const mockSessionsQueries = {
    getGameTitleById: jest.fn().mockResolvedValue("Test Game"),
    insertGameSession: jest.fn().mockResolvedValue(1),
    selectLatestActiveGameSession: jest.fn().mockResolvedValue(null),
    finishGameSession: jest.fn().mockResolvedValue(undefined)
};

module.exports = mockSessionsQueries;
