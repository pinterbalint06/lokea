const { invalidIds } = require("./test-data.js");
const auth = require("../../../auth.js");
const { mockConnection } = require("./mockDatabase.js");

async function testInvalidIDs(requestCallback, expectedErrorMessage) {
    for (const id of invalidIds) {
        const response = await requestCallback(id);

        expect(mockConnection.beginTransaction).not.toHaveBeenCalled();

        expect({ id, status: response.statusCode }).toEqual({ id, status: 400 });
        expect({ id, success: response.body.success }).toEqual({ id, success: false });
        expect({ id, error: response.body.error }).toEqual({ id, error: expectedErrorMessage });
    }
}

function testRequiresAuth(requestCallback) {
    it("Should respond with 401 if the user is not authenticated", async () => {
        auth.checkAuth.mockImplementationOnce((request, response, next) => {
            response.status(401).json({ message: "Bejelentkezés szükséges!" });
        });

        const response = await requestCallback();

        expect(response.statusCode).toEqual(401);
        expect(response.body.message).toBe("Bejelentkezés szükséges!");
    });
}

module.exports = { testInvalidIDs, testRequiresAuth };