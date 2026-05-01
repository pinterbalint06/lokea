const { checkGameSession, checkAuth } = require("#utils/auth.js");

function testRequiresGameSession(requestCallback) {
    it("Should respond with 401 if the user is not authenticated", async () => {
        checkGameSession.mockImplementationOnce((request, response, next) => {
            response.status(401).json({ message:"Bejelentkezés szükséges!" });
        });

        const response = await requestCallback();

        expect(response.statusCode).toBe(401);
    });

    it("Should respond with 403 if there is no active game session", async () => {
        checkGameSession.mockImplementationOnce((request, response, next) => {
            response.status(403).json({ message:"Nincs aktív játék munkamenet!" });
        });

        const response = await requestCallback();

        expect(response.statusCode).toBe(403);
    });
}

function testRequiresAuth(requestCallback) {
    it("Should respond with 401 if the user is not authenticated", async () => {
        checkAuth.mockImplementationOnce((request, response, next) => {
            response.status(401).json({ message: "Bejelentkezés szükséges!" });
        });

        const response = await requestCallback();

        expect(response.statusCode).toBe(401);
    });
}

function suppressConsoleErrors() {
    beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => {});
    });
    afterEach(() => {
        console.error.mockRestore();
    });
}

module.exports = {
    testRequiresGameSession,
    testRequiresAuth,
    suppressConsoleErrors
};
