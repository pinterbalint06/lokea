const express = require('express');
const router = express.Router();

const mainRoutes = require('./apiMain.js');
const settingsRoutes = require('./apiSettings.js');

router.use(mainRoutes);
router.use(settingsRoutes);

module.exports = router;