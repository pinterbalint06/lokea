module.exports = {
    isAllowedToGetMapImage: jest.fn((request, response, next) => next()),
    isAllowedToAccessPoint: jest.fn((request, response, next) => next())
};