require('dotenv').config();
const sequelize = require('../config/db');

async function cleanupDuplicateIndexes() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database. Scanning for duplicate unique indexes (e.g., email_2, email_3...)...');

    // Query INFORMATION_SCHEMA for duplicate index names ending in _2, _3, etc.
    const [indexes] = await sequelize.query(`
      SELECT TABLE_NAME, INDEX_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND INDEX_NAME REGEXP '_[0-9]+$' 
        AND INDEX_NAME != 'PRIMARY'
      GROUP BY TABLE_NAME, INDEX_NAME;
    `);

    if (indexes.length === 0) {
      console.log('No duplicate index names (e.g., email_2, email_3...) found in the database.');
      process.exit(0);
    }

    console.log(`Found ${indexes.length} duplicate index(es) to remove:`);
    indexes.forEach(i => console.log(` - Table: ${i.TABLE_NAME}, Index: ${i.INDEX_NAME}`));

    for (const idx of indexes) {
      console.log(`Dropping index \`${idx.INDEX_NAME}\` from table \`${idx.TABLE_NAME}\`...`);
      await sequelize.query(`ALTER TABLE \`${idx.TABLE_NAME}\` DROP INDEX \`${idx.INDEX_NAME}\`;`);
    }

    console.log('\nSuccessfully cleaned up all duplicate indexes!');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up duplicate indexes:', error);
    process.exit(1);
  }
}

cleanupDuplicateIndexes();
