const HeroBanner = require('./heroBanner.model');
const Category = require('../categories/category.model');
const Product = require('../products/product.model');
const ProductImage = require('../products/productImage.model');
const BlogPost = require('../content/blogPost.model');
const PageContent = require('../content/pageContent.model');

exports.getHomepageData = async (req, res, next) => {
  try {
    // 1. Hero Banners
    const heroBanners = await HeroBanner.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']]
    });

    // 2. Trending Categories
    const trendingCategories = await Category.findAll({
      where: { show_on_homepage: true },
      order: [['homepage_sort_order', 'ASC']],
      attributes: ['id', 'name', 'slug', 'homepage_image']
    });

    // 3. Homepage Scroll Products
    const homeScrollProducts = await Product.findAll({
      where: { show_in_home_scroll: true, is_active: true },
      order: [['home_scroll_order', 'ASC']],
      include: [
        { model: ProductImage, as: 'images', attributes: ['url', 'is_primary'] },
        { model: Category }
      ]
    });

    // 4. Featured Products (Trusted Brands)
    const featuredProducts = await Product.findAll({
      where: { homepage_tag: 'featured', is_active: true },
      order: [['homepage_sort_order', 'ASC']],
      include: [
        { model: ProductImage, as: 'images', attributes: ['url', 'is_primary'] },
        { model: Category }
      ]
    });

    // 5. Blog Posts (Get Inspired)
    const blogPosts = await BlogPost.findAll({
      where: { is_published: true },
      order: [['published_at', 'DESC']],
      limit: 4
    });

    // 6. Value Props
    let valueProps = await PageContent.findOne({ where: { page_key: 'home_value_props' } });
    if (!valueProps) {
      valueProps = {
        title: 'Why brands choose P&P',
        content: JSON.stringify([
          { title: 'Low minimums & custom branding', content: 'We offer low MOQs to help your brand grow.' },
          { title: 'Fast turnaround & production tracking', content: 'Track your order from design to delivery.' },
          { title: 'Dedicated design support', content: 'Our designers are here to help you stand out.' },
          { title: 'Quality guarantee / reprint policy', content: '100% satisfaction guaranteed.' },
          { title: 'Flexible bulk pricing', content: 'Scale your business with competitive pricing.' }
        ])
      };
    }

    res.json({
      heroBanners,
      trendingCategories,
      homeScrollProducts,
      featuredProducts,
      blogPosts,
      valueProps
    });
  } catch (error) {
    next(error);
  }
};
