module.exports = {
    checkAuth: jest.fn((request, response, next) => {
        request.session = { userid: 1 };
        next();
    })
};