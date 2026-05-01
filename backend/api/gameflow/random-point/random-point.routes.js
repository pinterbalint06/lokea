const express = require("express");
const router = express.Router();
const controller = require("./random-point.controller.js");

router.get("/round", controller.getRandomPoint);

module.exports = router;
