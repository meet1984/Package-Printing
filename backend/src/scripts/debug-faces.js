require('dotenv').config();
const sequelize = require('../config/db');
const Template = require('../modules/templates/template.model');

async function debug() {
  await sequelize.authenticate();
  const t = await Template.findOne();
  if (t) {
    console.log(JSON.stringify(t.toJSON(), null, 2));
  } else {
    console.log('No templates found.');
  }
  process.exit(0);
}

debug();
