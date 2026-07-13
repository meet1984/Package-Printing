const BlogPost = require('./blogPost.model');

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await BlogPost.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

exports.getPostBySlug = async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({ where: { slug: req.params.slug } });
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const post = await BlogPost.create(req.body);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    await post.update(req.body);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    await post.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
