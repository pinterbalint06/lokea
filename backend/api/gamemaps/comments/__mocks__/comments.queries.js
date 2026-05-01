const mockCommentQueries = {
    getGameMapComments: jest.fn(),
    getGameMapCommentCount: jest.fn(),
    hasUserCommentedOnGameMap: jest.fn().mockResolvedValue(true),
    insertGameMapComment: jest.fn(),
    getUserCommentOnGameMap: jest.fn(),
    updateUserCommentOnGameMap: jest.fn().mockResolvedValue(true),
    deleteUserCommentOnGameMap: jest.fn().mockResolvedValue(true)
};

module.exports = mockCommentQueries;
