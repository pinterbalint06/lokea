const express = require("express");
const router = express.Router();
const controller = require("./maps.controller.js");

router.get("/maps", controller.getAllMaps);

module.exports = router;
