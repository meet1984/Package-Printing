const express = require('express');
const router = express.Router();
const templateController = require('./template.controller');
const { protect, admin } = require('../../middleware/authMiddleware');
const { JWT_SECRET } = require('../../config/env');

// Note: getTemplates and getTemplateById have custom logic for non-admins to only see published templates
// However, the user needs to be authenticated to make a mockup, or maybe it's public.
// Plan says: GET /api/templates?status=published is public
// GET/POST/PATCH/DELETE /api/templates is admin only
// So we use an optional auth middleware if we can, or just handle req.user if it exists.
// Let's create an optional auth middleware or just use standard protect for some.

// Custom middleware to optionally populate req.user
const optionalAuth = (req, res, next) => {
  const jwt = require('jsonwebtoken');
  let token = req.cookies?.token;
  if (!token && req.header('Authorization') && req.header('Authorization').startsWith('Bearer ')) {
    token = req.header('Authorization').substring(7);
  }
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // ignore
    }
  }
  next();
};

router.get('/', optionalAuth, templateController.getTemplates);
router.get('/:id', optionalAuth, templateController.getTemplateById);

router.post('/', protect, admin, templateController.createTemplate);
router.patch('/:id', protect, admin, templateController.updateTemplate);
router.delete('/:id', protect, admin, templateController.deleteTemplate);

module.exports = router;
