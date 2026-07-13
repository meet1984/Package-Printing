const sequelize = require('./config/db');

async function addNameColumn() {
  try {
    await sequelize.authenticate();
    await sequelize.query('ALTER TABLE Users ADD COLUMN name VARCHAR(255);');
    console.log('Successfully added name column to Users table.');
  } catch (error) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('Name column already exists.');
    } else {
      console.error('Error adding name column:', error);
    }
  } finally {
    process.exit(0);
  }
}

addNameColumn();
