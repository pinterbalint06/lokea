const express = require("express");
const supertest = require("supertest");
const mapCreationEndpoints = require('@mapcreator/mapcreator.js');
const fs = require("fs/promises");
const path = require("path");
const { TEMP_DIR } = require("@config/mapStorage.js");

function createTestApp() {
    const app = express();
    app.use(express.json());
    app.use("/api/map-creator", mapCreationEndpoints);

    afterAll(async () => {
        try {
            await fs.rm(TEMP_DIR, { recursive: true, force: true });
        } catch (err) {
        }
    });
    return supertest(app);
}

module.exports = { createTestApp };