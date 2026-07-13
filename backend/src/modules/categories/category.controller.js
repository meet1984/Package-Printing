const Category = require('./category.model');

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['sort_order', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug },
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

// Admin Routes below

exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, parent_id, sort_order, image } = req.body;
    const category = await Category.create({
      name,
      slug,
      parent_id,
      sort_order,
      image,
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.update(req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.destroy(); // Soft delete because paranoid: true
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
