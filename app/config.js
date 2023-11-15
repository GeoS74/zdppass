require('dotenv').config({ path: './secret.env' });

module.exports = {
  node: {
    env: process.env.NODE_ENV || 'dev',
  },
  server: {
    host: process.env.SERVER_HOST || 'localhost',
    port: process.env.SERVER_PORT || 3800,
  },
  redis: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 6378,
    password: process.env.DB_PASS || 'secretpass',
  },
  log: {
    file: 'app.log',
  },
};
