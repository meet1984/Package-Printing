const Product = require('../products/product.model');
const Inquiry = require('../inquiries/inquiry.model');
const Category = require('../categories/category.model');

exports.getStats = async (req, res, next) => {
  try {
    const activeProductsCount = await Product.count({ where: { is_active: true } });
    const pendingInquiriesCount = await Inquiry.count({ where: { status: 'pending' } });
    const totalCategoriesCount = await Category.count();

    res.json({
      activeProducts: activeProductsCount,
      pendingInquiries: pendingInquiriesCount,
      totalCategories: totalCategoriesCount
    });
  } catch (error) {
    next(error);
  }
};
