const app = require('./app');
const sequelize = require('./config/db');

// Import all models to ensure they are registered before sync
require('./modules/categories/category.model');
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
require('./modules/users/user.model');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models (in production, use migrations)
    await sequelize.sync();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
