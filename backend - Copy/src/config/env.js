require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.trim() === '') {
  console.error('\n[FATAL ERROR]: JWT_SECRET is not defined in the environment variables!');
  console.error('Please set it in your .env file to secure your application.\n');
  process.exit(1);
}

module.exports = {
  JWT_SECRET,
};
