require('dotenv').config();

const PORT = process.env.PORT || 3080;
let { MONGODB_URI } = process.env;

if (process.env.NODE_ENV === 'test') {
  MONGODB_URI = process.env.TEST_MONGODB_URI;
}

module.exports = {
  PORT,
  MONGODB_URI,
};
