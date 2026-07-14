require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/db');
const Template = require('../modules/templates/template.model');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Wait for models to sync, in case the new column hasn't been created yet
    // This alters the table to add the JSON column if it doesn't exist
    await Template.sync({ alter: true });

    const templates = await Template.findAll();
    let count = 0;

    for (const t of templates) {
      // If faces array is empty but we have a baseImageUrl, migrate it
      if ((!t.faces || t.faces.length === 0) && t.baseImageUrl) {
        t.faces = [
          {
            id: uuidv4(),
            name: 'Face 1',
            baseImageUrl: t.baseImageUrl,
            shadingMapUrl: t.shadingMapUrl,
            printArea: t.printArea,
            constraints: t.constraints
          }
        ];
        await t.save();
        count++;
        console.log(`Migrated template: ${t.name}`);
      }
    }

    console.log(`Migration complete. Migrated ${count} templates.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
