const mockSessionsQueries = {
    getGameInfoById: jest.fn().mockResolvedValue({ title: "Test Game", map_id: 1, point_id: 1 }),
    insertGameSession: jest.fn().mockResolvedValue(1),
    selectLatestActiveGameSession: jest.fn().mockResolvedValue(null),
    finishGameSession: jest.fn().mockResolvedValue(undefined)
};

module.exports = mockSessionsQueries;
