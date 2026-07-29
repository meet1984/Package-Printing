const sequelize = require('../config/db');
const Template = require('../modules/templates/template.model');
const Product = require('../modules/products/product.model');

async function run() {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='Products' AND COLUMN_NAME='templateId'"
    );
    console.log('templateId column exists:', rows.length > 0 ? 'YES ✅' : 'NO ❌');
    console.log('Product->Template association:', !!Product.associations.Template ? 'YES ✅' : 'NO ❌');
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
run();
