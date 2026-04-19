module.exports = {
    // general
    clearMocks: true,
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.js"],
    testEnvironment: "node",
    roots: ["<rootDir>"],
    testPathIgnorePatterns: ["/node_modules/"],

    // coverage
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        "api/**/*.js",
        "sql/**/*.js",
        "utils/**/*.js",
        "server.js"
    ],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/test/"
    ],
    coverageThreshold: {
        "global": {
            "branches": 80,
            "functions": 80,
            "lines": 80,
            "statements": 80
        }
    }
};