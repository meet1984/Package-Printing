const sequelize = require('./config/db');

require('./modules/categories/category.model');
require('./modules/templates/template.model');
require('./modules/products/product.model');
require('./modules/products/productVariant.model');
require('./modules/products/productImage.model');
require('./modules/products/productFaq.model');
require('./modules/inquiries/inquiry.model');
require('./modules/inquiries/inquiryItem.model');
require('./modules/content/blogPost.model');
require('./modules/content/pageContent.model');
require('./modules/content/testimonial.model');
require('./modules/content/siteFaq.model');
require('./modules/portfolio/portfolioItem.model');
require('./modules/homepage/heroBanner.model');
require('./modules/about/teamMember.model');
require('./modules/about/statCounter.model');
require('./modules/about/valueProp.model');
require('./modules/about/processPillar.model');
require('./modules/about/partnerBrand.model');
require('./modules/homepage/homeScroller.model');
require('./modules/users/user.model');


async function syncDb() {
  try {
    await sequelize.authenticate();
    const alter = !process.argv.includes('--no-alter');
    console.log(`Syncing database... (alter: ${alter})`);
    await sequelize.sync({ alter });
    console.log('Database synced successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing DB:', err);
    process.exit(1);
  }
}

syncDb();
