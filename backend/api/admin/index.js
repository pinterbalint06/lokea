const express = require('express');
const router = express.Router();

const auth = require('#middlewares/auth.js');

const adminRoutes = require('./apiAdmin.js');
const userRoutes = require('./apiUsers.js');
const logsRoutes = require('./apiLogs.js');
const settingsRoutes = require('./apiSettings.js');

router.use(auth.checkAuth, auth.checkRole("ADMIN", "LORD"));

router.use(adminRoutes);
router.use(userRoutes);
router.use(logsRoutes);
router.use(settingsRoutes);

module.exports = router;
