const mockOwnershipQueries = {
    checkUserOwnsGameMap: jest.fn().mockResolvedValue(true),
    checkUserOwnsMap: jest.fn().mockResolvedValue(true),
    checkUserOwnsPoint: jest.fn().mockResolvedValue(true),
    checkUserOwnsConnection: jest.fn().mockResolvedValue(true)
};

module.exports = mockOwnershipQueries;
