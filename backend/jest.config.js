module.exports = {
    // general
    clearMocks: true,
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.js"],
    testEnvironment: "node",
    roots: ["<rootDir>"],
    testPathIgnorePatterns: ["/node_modules/"],

    // path aliases
    moduleNameMapper: {
        "^@sql/(.*)$": "<rootDir>/sql/$1",
        "^@utils/(.*)$": "<rootDir>/utils/$1",
        "^@helpers/(.*)$": "<rootDir>/test/mapcreator/helpers/$1",
        "^@root/(.*)$": "<rootDir>/$1",
        "^@config/(.*)$": "<rootDir>/config/$1",
        "^@api/(.*)$": "<rootDir>/api/$1"
    },

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