const express = require("express");
const router = express.Router();
const multer = require("multer");
const { checkAuth } = require("#root/auth.js");
const controller = require("./sessions.controller.js");

const upload = multer();

router.get("/session", checkAuth, controller.getActiveSession);
router.post("/session", checkAuth, upload.none(), controller.createGameSession);

module.exports = router;
