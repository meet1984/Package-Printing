const HomeScroller = require('./homeScroller.model');
const Product = require('../products/product.model');
const ProductImage = require('../products/productImage.model');

// Get all home scrollers
exports.getAllScrollers = async (req, res, next) => {
  try {
    const scrollers = await HomeScroller.findAll({
      order: [['sort_order', 'ASC']],
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'slug', 'base_price', 'moq', 'is_new'],
          through: { attributes: [] },
          include: [
            { model: ProductImage, as: 'images', attributes: ['url', 'is_primary'] }
          ]
        }
      ]
    });
    res.json(scrollers);
  } catch (error) {
    next(error);
  }
};

// Get single scroller
exports.getScroller = async (req, res, next) => {
  try {
    const scroller = await HomeScroller.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });
    if (!scroller) return res.status(404).json({ message: 'Scroller not found' });
    res.json(scroller);
  } catch (error) {
    next(error);
  }
};

// Create a scroller
exports.createScroller = async (req, res, next) => {
  try {
    const { title, sort_order, is_active, productIds } = req.body;
    const scroller = await HomeScroller.create({ title, sort_order, is_active });
    
    if (productIds && Array.isArray(productIds)) {
      await scroller.setProducts(productIds);
    }
    
    res.status(201).json(scroller);
  } catch (error) {
    next(error);
  }
};

// Update a scroller
exports.updateScroller = async (req, res, next) => {
  try {
    const { title, sort_order, is_active, productIds } = req.body;
    const scroller = await HomeScroller.findByPk(req.params.id);
    
    if (!scroller) return res.status(404).json({ message: 'Scroller not found' });
    
    await scroller.update({ title, sort_order, is_active });
    
    if (productIds && Array.isArray(productIds)) {
      await scroller.setProducts(productIds);
    }
    
    res.json(scroller);
  } catch (error) {
    next(error);
  }
};

// Delete a scroller
exports.deleteScroller = async (req, res, next) => {
  try {
    const scroller = await HomeScroller.findByPk(req.params.id);
    if (!scroller) return res.status(404).json({ message: 'Scroller not found' });
    
    await scroller.destroy();
    res.json({ message: 'Scroller deleted successfully' });
  } catch (error) {
    next(error);
  }
};
