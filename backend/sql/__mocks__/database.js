const mockConnection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn()
};

const mockDatabase = {
    getConnection: jest.fn().mockResolvedValue(mockConnection)
};

module.exports = mockDatabase;
module.exports.mockConnection = mockConnection;
