const express = require('express');
const router = express.Router();
const homepageController = require('./homepage.controller');

router.get('/', homepageController.getHomepageData);

module.exports = router;
