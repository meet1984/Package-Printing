const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const { protect, admin } = require('../../middleware/authMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin routes
router.post('/', protect, admin, categoryController.createCategory);
router.put('/:id', protect, admin, categoryController.updateCategory);
router.delete('/:id', protect, admin, categoryController.deleteCategory);

module.exports = router;
