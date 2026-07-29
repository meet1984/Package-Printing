const express = require('express');
const router = express.Router();
const siteFaqController = require('./siteFaq.controller');
const { protect, admin } = require('../../middleware/authMiddleware');

// Public route
router.get('/', siteFaqController.getActiveFaqs);

// Admin routes
router.get('/all', protect, admin, siteFaqController.getAllFaqs);
router.post('/', protect, admin, siteFaqController.createFaq);
router.put('/:id', protect, admin, siteFaqController.updateFaq);
router.delete('/:id', protect, admin, siteFaqController.deleteFaq);

module.exports = router;
