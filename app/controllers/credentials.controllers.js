const db = require('../libs/db');
const mapper = require('../mappers/credentials.mapper');

module.exports.get = async (ctx) => {
  const credentials = await (await db).get(ctx.data.hostkey);
  if (!credentials) {
    ctx.throw(404, 'credentials not found');
  }
  ctx.status = 200;
  ctx.body = mapper(JSON.parse(credentials));
};

module.exports.getAll = async (ctx) => {
  ctx.throw(501, 'not implemented');
};

module.exports.add = async (ctx) => {
  await (await db).set(ctx.data.hostkey, JSON.stringify(ctx.data));
  ctx.status = 201;
  ctx.body = mapper(ctx.data);
};

module.exports.upd = async (ctx) => {
  ctx.status = 200;
  ctx.body = 'upd';
};

module.exports.del = async (ctx) => {
  ctx.status = 200;
  ctx.body = 'del';
};
