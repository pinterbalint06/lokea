const express = require("express");
const router = express.Router();
const controller = require("./random-point.controller.js");

router.get("/get_random_point", controller.getRandomPoint);

module.exports = router;
