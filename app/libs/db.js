const { createClient } = require('redis');
const config = require('../config');
const logger = require('./logger');

module.exports = createClient({
  url: `redis://default:${config.redis.pass}@${config.redis.host}:${config.redis.port}`,
})
  .on('error', (error) => {
    logger.error('Redis Client Error', error);
  })
  .connect();
