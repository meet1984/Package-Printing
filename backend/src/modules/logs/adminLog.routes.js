const express = require('express');
const router = express.Router();
const ctrl = require('./adminLog.controller');
const { protect, admin } = require('../../middleware/authMiddleware');

router.get('/', protect, admin, ctrl.getAdminLogs);
router.delete('/', protect, admin, ctrl.clearAdminLogs);

module.exports = router;
