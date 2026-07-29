const sequelize = require('./config/db');

async function migrateInquiries() {
  try {
    await sequelize.authenticate();
    
    // Add department enum and attachment_url
    await sequelize.query("ALTER TABLE Inquiries ADD COLUMN department ENUM('general', 'bulk', 'support', 'partnership', 'careers') DEFAULT 'general';");
    await sequelize.query("ALTER TABLE Inquiries ADD COLUMN attachment_url VARCHAR(255) NULL;");
    
    console.log('Successfully migrated Inquiries table.');
  } catch (error) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Error migrating Inquiries table:', error);
    }
  } finally {
    process.exit(0);
  }
}

migrateInquiries();
