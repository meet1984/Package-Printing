const express = require('express');
const router = express.Router();
const homeScrollerController = require('./homeScroller.controller');
const { protect, admin } = require('../../middleware/authMiddleware');

router.get('/', homeScrollerController.getAllScrollers);
router.get('/:id', homeScrollerController.getScroller);
router.post('/', protect, admin, homeScrollerController.createScroller);
router.put('/:id', protect, admin, homeScrollerController.updateScroller);
router.delete('/:id', protect, admin, homeScrollerController.deleteScroller);

module.exports = router;
