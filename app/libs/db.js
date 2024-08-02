const { createClient } = require('redis');
const config = require('../config');
const logger = require('./logger');

const client = createClient({
  // url: `redis://default:${config.redis.password}@${config.redis.host}:${config.redis.port}`,
  url: `redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}`,
})
  .on('error', (error) => {
    logger.error('Redis Client Error', error);
  });

module.exports = { client: null };
client.connect().then((conn) => {
  module.exports.client = conn;
});
