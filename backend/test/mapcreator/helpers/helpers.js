const { invalidIds, invalidIdsWithNulls } = require("#mapcreatortest/helpers/test-data.js");
const { checkAuth } = require("#root/auth.js");

const database = require("#sql/database.js");
const ERRORS = require("#utils/errorMessages.js");
const { mockConnection } = database;

async function testInvalidIDs(requestCallback, expectedErrorMessage, withNulls = true) {
    const idsToTest = withNulls ? invalidIdsWithNulls : invalidIds;
    for (const id of idsToTest) {
        const response = await requestCallback(id);

        expect(mockConnection.beginTransaction).not.toHaveBeenCalled();

        expect({ id, status: response.statusCode }).toEqual({ id, status: 400 });
        expect({ id, error: response.body.error }).toEqual({ id, error: expectedErrorMessage });
    }
}

function testRequiresAuth(requestCallback) {
    it("Should respond with 401 if the user is not authenticated", async () => {
        checkAuth.mockImplementationOnce((request, response, next) => {
            response.status(401).json({ message: "Bejelentkezés szükséges!" });
        });

        const response = await requestCallback();

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Bejelentkezés szükséges!");
    });
}

function expectSuccessfulTransaction(connection) {
    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
    expect(connection.rollback).not.toHaveBeenCalled();
}

function expectRollback(connection) {
    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.rollback).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
    expect(connection.commit).not.toHaveBeenCalled();
}

function randomId() {
    return Math.floor(Math.random() * 100000) + 1;
}

function buildRequest(baseRequest, overrides, defaults) {
    const finalValues = { ...defaults, ...overrides };
    const { id, file, filename, fileFieldName, ...formDataFields } = finalValues;

    let request = baseRequest(id);

    for (const [key, value] of Object.entries(formDataFields)) {
        if (value != undefined) {
            request = request.field(key, value);
        }
    }
    if (file != undefined && fileFieldName) {
        request = request.attach(fileFieldName, file, filename);
    }
    return request;
};

function suppressConsoleErrors() {
    beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => { });
    });
    afterEach(() => {
        console.error.mockRestore();
    });
};

function expectErrorResponse(response, statusCode = 500, errorMessage = ERRORS.COMMON.UNEXPECTED_ERROR) {
    expect(response.statusCode).toBe(statusCode);
    expect(response.type).toEqual(expect.stringContaining("json"));
    expect(response.body.error).toBe(errorMessage);
}

module.exports = {
    testInvalidIDs,
    testRequiresAuth,
    expectSuccessfulTransaction,
    expectRollback,
    randomId,
    buildRequest,
    suppressConsoleErrors,
    expectErrorResponse
};