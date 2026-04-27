const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("./sessions.controller.js");

const upload = multer();

router.get("/active_game_session", controller.getActiveSession);
router.post("/post_game_id", upload.none(), controller.createGameSession);

module.exports = router;
