const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { protect, admin } = require('../../middleware/authMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProductBySlug);

// Admin routes
router.post('/', protect, admin, productController.createProduct);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

// Product Image Routes
router.post('/:id/images', protect, admin, productController.addProductImage);
router.delete('/:id/images/:imageId', protect, admin, productController.deleteProductImage);

module.exports = router;
