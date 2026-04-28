const express = require("express");
const router = express.Router();
const controller = require("./guess.controller.js");

router.post("/round/guess", controller.processGuess);

module.exports = router;
