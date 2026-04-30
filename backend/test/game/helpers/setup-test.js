const express = require("express");
const supertest = require("supertest");
const gameEndpoints = require("#root/api/gameflow/game.js");
const gameLobbyEndpoints = require("#root/api/gameflow/gamelobby.js");

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
            res.status(200).json({ success: true, filePath });
        });
        next();
    });
    app.use("/api/choose-game", gameLobbyEndpoints);
    return supertest(app);
}

module.exports = { createGameTestApp, createGameLobbyTestApp };
