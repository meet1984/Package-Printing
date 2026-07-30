const BlogPost = require('./blogPost.model');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const sanitizePostBody = (body) => {
  if (body && typeof body.content === 'string') {
    return { ...body, content: DOMPurify.sanitize(body.content) };
  }
  return body;
};

exports.getAllPosts = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const where = isAdmin ? {} : { is_published: true };
    const posts = await BlogPost.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

exports.getPostBySlug = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const post = await BlogPost.findOne({ where: { slug: req.params.slug } });
    if (!post || (!isAdmin && !post.is_published)) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const post = await BlogPost.create(sanitizePostBody(req.body));
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
    await post.update(sanitizePostBody(req.body));
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
