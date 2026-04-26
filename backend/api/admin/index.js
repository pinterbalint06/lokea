const express = require('express');
const router = express.Router();

const adminRoutes = require('./apiAdmin.js');
const userRoutes = require('./apiUsers.js');
const logsRoutes = require('./apiLogs.js');
const settingsRoutes = require('./apiSettings.js');

router.use(adminRoutes);
router.use(userRoutes);
router.use(logsRoutes);
router.use(settingsRoutes);

module.exports = router;