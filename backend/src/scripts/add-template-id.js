const sequelize = require('../config/db');
async function run() {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='Products' AND COLUMN_NAME='templateId'"
    );
    if (rows.length > 0) {
      console.log('Column templateId already exists, skipping.');
    } else {
      await sequelize.query('ALTER TABLE Products ADD COLUMN templateId CHAR(36) NULL DEFAULT NULL;');
      console.log('Done: templateId column added.');
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
run();
