const express = require("express");
const supertest = require("supertest");
const gameMapsEndpoints = require("#gamemaps/gamemaps.routes.js");

function createTestApp() {
    const app = express();
    app.use(express.json());
    app.use("/api/game-maps", gameMapsEndpoints);

    return supertest(app);
}

module.exports = { createTestApp };
