const express = require("express");
const router = express.Router();
const controller = require("./guess.controller.js");

router.post("/session_guess", controller.processGuess);

module.exports = router;
