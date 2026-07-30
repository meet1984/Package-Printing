const express = require('express');
const router = express.Router();
const blogPostController = require('./blogPost.controller');
const { protect, admin } = require('../../middleware/authMiddleware');
const { JWT_SECRET } = require('../../config/env');

// Populate req.user if a valid token is present, without rejecting the request otherwise.
// Lets admins see draft/unpublished posts on the public list/detail routes while
// keeping those routes open (unauthenticated) for regular site visitors.
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
      // ignore invalid/expired token, treat as anonymous
    }
  }
  next();
};

router.get('/', optionalAuth, blogPostController.getAllPosts);
router.get('/:slug', optionalAuth, blogPostController.getPostBySlug);
router.post('/', protect, admin, blogPostController.createPost);
router.put('/:id', protect, admin, blogPostController.updatePost);
router.delete('/:id', protect, admin, blogPostController.deletePost);

module.exports = router;
