const Product = require('./product.model');
const ProductVariant = require('./productVariant.model');
const ProductImage = require('./productImage.model');
const ProductFaq = require('./productFaq.model');
const Category = require('../categories/category.model');
const Template = require('../templates/template.model');
const { Op } = require('sequelize');

// Public routes
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const whereClause = { is_active: true };
    
    if (category) {
      const categoryData = await Category.findOne({ where: { slug: category } });
      if (categoryData) {
        whereClause.category_id = categoryData.id;
      }
    }

    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`
      };
    }

    const products = await Product.findAll({
      where: whereClause,
      include: [
        { model: ProductImage, as: 'images', where: { is_primary: true }, required: false },
        { model: Category },
        { model: Template, as: 'Template', required: false, attributes: ['id', 'name'] }
      ]
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug, is_active: true },
      include: [
        { model: ProductVariant, as: 'variants' },
        { model: ProductImage, as: 'images' },
        { model: ProductFaq, as: 'faqs' },
        { model: Category },
        { 
          model: Template, 
          as: 'Template',
          required: false,
          attributes: ['id', 'name', 'productType', 'baseImageUrl', 'printArea', 'constraints', 'shadingMapUrl', 'faces']
        }
      ],
      order: [
        [{ model: ProductImage, as: 'images' }, 'sort_order', 'ASC'],
        [{ model: ProductFaq, as: 'faqs' }, 'sort_order', 'ASC']
      ]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Admin Routes (protected via protect + admin middleware in product.routes.js)
exports.createProduct = async (req, res, next) => {
  try {
    if (req.body.templateId === '') {
      req.body.templateId = null;
    }
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (req.body.templateId === '') {
      req.body.templateId = null;
    }
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

exports.addProductImage = async (req, res, next) => {
  try {
    const { url, is_primary } = req.body;
    const productId = req.params.id;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If making primary, unset other primaries
    if (is_primary) {
      await ProductImage.update({ is_primary: false }, { where: { product_id: productId } });
    }

    const image = await ProductImage.create({
      product_id: productId,
      url,
      is_primary: is_primary || false
    });

    res.status(201).json(image);
  } catch (error) {
    next(error);
  }
};

exports.deleteProductImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    
    const image = await ProductImage.findOne({ where: { id: imageId, product_id: id } });
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await image.destroy();
    res.json({ message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
};

