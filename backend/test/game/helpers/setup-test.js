const express = require("express");
const supertest = require("supertest");
const gameApiEndpoints = require("#root/api/gameflow/gameApi.js");
const gameChoosingEndpoints = require("#root/api/gameflow/gameChoosing.js");

function createGameApiTestApp() {
    const app = express();
    app.use(express.json());
    app.use("/api/game", gameApiEndpoints);
    return supertest(app);
}

function createGameChoosingTestApp() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use((req, res, next) => {
        res.sendFile = jest.fn((filePath) => {
            res.status(200).json({ success: true, filePath });
        });
        next();
    });
    app.use("/api/choose-game", gameChoosingEndpoints);
    return supertest(app);
}

module.exports = { createGameApiTestApp, createGameChoosingTestApp };
