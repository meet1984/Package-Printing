const sequelize = require('./config/db');

require('./modules/categories/category.model');
require('./modules/templates/template.model');
require('./modules/products/product.model');
require('./modules/products/productVariant.model');
require('./modules/products/productImage.model');
require('./modules/products/productFaq.model');
require('./modules/inquiries/inquiry.model');
require('./modules/content/blogPost.model');
require('./modules/content/pageContent.model');
require('./modules/homepage/heroBanner.model');
require('./modules/users/user.model');


async function syncDb() {
  try {
    await sequelize.authenticate();
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing DB:', err);
    process.exit(1);
  }
}

syncDb();
