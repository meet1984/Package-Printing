const sequelize = require('./src/config/db');
const ProductImage = require('./src/modules/products/productImage.model');

async function check() {
  await sequelize.authenticate();
  const images = await ProductImage.findAll({ limit: 5 });
  console.log(JSON.stringify(images, null, 2));
  process.exit();
}
check();
