const express = require('express');
const router = express.Router();
const statsController = require('./stats.controller');
const { protect, admin } = require('../../middleware/authMiddleware');

router.get('/', protect, admin, statsController.getStats);

module.exports = router;
