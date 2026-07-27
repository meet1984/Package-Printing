const sequelize = require('./config/db');
const SiteFaq = require('./modules/content/siteFaq.model');

async function createSiteFaqsTable() {
  try {
    await sequelize.authenticate();
    await SiteFaq.sync();
    console.log('Successfully created SiteFaqs table.');
  } catch (error) {
    console.error('Error creating SiteFaqs table:', error);
  } finally {
    process.exit(0);
  }
}

createSiteFaqsTable();
