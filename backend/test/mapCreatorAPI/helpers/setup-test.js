const express = require("express");
const supertest = require("supertest");
const mapCreationEndpoints = require('../../../api/mapCreatorAPI.js');

function createTestApp() {
    const app = express();
    app.use(express.json());
    // Error handling middleware for multer etc could be added here if needed globally
    app.use("/api/map-creator", mapCreationEndpoints);
    return supertest(app);
}

module.exports = { createTestApp };