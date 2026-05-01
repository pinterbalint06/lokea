const express = require("express");
const supertest = require("supertest");
const gameEndpoints = require("#utils/api/gameflow/game.js");
const gameLobbyEndpoints = require("#utils/api/gameflow/gamelobby.js");

function createGameTestApp() {
    const app = express();
    app.use(express.json());
    app.use("/api/game", gameEndpoints);
    return supertest(app);
}

function createGameLobbyTestApp() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use((req, res, next) => {
        res.sendFile = jest.fn((filePath) => {
            res.status(200).json({ filePath });
        });
        next();
    });
    app.use("/api/choose-game", gameLobbyEndpoints);
    return supertest(app);
}

module.exports = { createGameTestApp, createGameLobbyTestApp };
