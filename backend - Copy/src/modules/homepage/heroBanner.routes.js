const express = require('express');
const router = express.Router();
const heroBannerController = require('./heroBanner.controller');
const { protect, admin } = require('../../middleware/authMiddleware');

router.get('/', heroBannerController.getAllBanners);
router.post('/', protect, admin, heroBannerController.createBanner);
router.put('/:id', protect, admin, heroBannerController.updateBanner);
router.delete('/:id', protect, admin, heroBannerController.deleteBanner);

module.exports = router;
