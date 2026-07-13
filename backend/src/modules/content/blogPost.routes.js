const express = require('express');
const router = express.Router();
const blogPostController = require('./blogPost.controller');
const { protect, admin } = require('../../middleware/authMiddleware');

router.get('/', blogPostController.getAllPosts);
router.get('/:slug', blogPostController.getPostBySlug);
router.post('/', protect, admin, blogPostController.createPost);
router.put('/:id', protect, admin, blogPostController.updatePost);
router.delete('/:id', protect, admin, blogPostController.deletePost);

module.exports = router;
