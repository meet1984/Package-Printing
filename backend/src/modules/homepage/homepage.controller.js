const HeroBanner = require('./heroBanner.model');
const Category = require('../categories/category.model');
const Product = require('../products/product.model');
const ProductImage = require('../products/productImage.model');
const BlogPost = require('../content/blogPost.model');
const PageContent = require('../content/pageContent.model');
const HomeScroller = require('./homeScroller.model');

exports.getHomepageData = async (req, res, next) => {
  try {
    // These six lookups are independent of one another (none depends on another's
    // result), so run them concurrently instead of awaiting each in series - this
    // reduces homepage TTFB from the sum of all query times to roughly the slowest one.
    const [
      heroBanners,
      trendingCategories,
      homeScrollProducts,
      featuredProducts,
      blogPosts,
      customScrollers,
      valueProps
    ] = await Promise.all([
      // 1. Hero Banners
      HeroBanner.findAll({
        where: { is_active: true },
        order: [['sort_order', 'ASC']]
      }),

      // 2. Trending Categories
      Category.findAll({
        where: { show_on_homepage: true },
        order: [['homepage_sort_order', 'ASC']],
        attributes: ['id', 'name', 'slug', 'homepage_image']
      }),

      // 3. Homepage Scroll Products
      Product.findAll({
        where: { show_in_home_scroll: true, is_active: true },
        order: [['home_scroll_order', 'ASC']],
        include: [
          { model: ProductImage, as: 'images', attributes: ['url', 'is_primary'] },
          { model: Category }
        ]
      }),

      // 4. Featured Products (Trusted Brands)
      Product.findAll({
        where: { homepage_tag: 'featured', is_active: true },
        order: [['homepage_sort_order', 'ASC']],
        include: [
          { model: ProductImage, as: 'images', attributes: ['url', 'is_primary'] },
          { model: Category }
        ]
      }),

      // 5. Blog Posts (Get Inspired)
      BlogPost.findAll({
        where: { is_published: true },
        order: [['published_at', 'DESC']],
        limit: 4
      }),

      // 5.5 Custom Scrollers
      HomeScroller.findAll({
        where: { is_active: true },
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
      }),

      // 6. Value Props
      PageContent.findOne({ where: { page_key: 'home_value_props' } })
    ]);

    let formattedValueProps = {
      title: 'Why brands choose Zeprr',
      content: JSON.stringify([
        { title: 'Low minimums & custom branding', content: 'We offer low MOQs to help your brand grow.' },
        { title: 'Fast turnaround & production tracking', content: 'Track your order from design to delivery.' },
        { title: 'Dedicated design support', content: 'Our designers are here to help you stand out.' },
        { title: 'Quality guarantee / reprint policy', content: '100% satisfaction guaranteed.' },
        { title: 'Flexible bulk pricing', content: 'Scale your business with competitive pricing.' }
      ])
    };

    if (valueProps && valueProps.content) {
      try {
        const parsed = JSON.parse(valueProps.content);
        if (Array.isArray(parsed)) {
          formattedValueProps.content = valueProps.content;
        } else {
          formattedValueProps.title = parsed.title || formattedValueProps.title;
          formattedValueProps.content = JSON.stringify(parsed.items || []);
        }
      } catch (e) {
        // Fallback to defaults
      }
    }

    res.json({
      heroBanners,
      trendingCategories,
      homeScrollProducts,
      featuredProducts,
      blogPosts,
      customScrollers,
      valueProps: formattedValueProps
    });
  } catch (error) {
    next(error);
  }
};
