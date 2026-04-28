const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("./sessions.controller.js");

const upload = multer();

router.get("/session", controller.getActiveSession);
router.post("/session", upload.none(), controller.createGameSession);

module.exports = router;
