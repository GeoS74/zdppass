const db = require('../libs/db');
const mapper = require('../mappers/credentials.mapper');

module.exports.get = async (ctx) => {
  const credentials = await db.client.get(ctx.data.hostkey);
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
  await db.client.set(ctx.data.hostkey, JSON.stringify(ctx.data));
  ctx.status = 201;
  ctx.body = mapper(ctx.data);
};

module.exports.upd = async (ctx) => {
  const credentials = await db.client.get(ctx.data.hostkey);

  if (!credentials) {
    ctx.throw(404, 'credentials not found');
  }

  const updateCredentials = __updateData(credentials, ctx.data);

  await db.client.set(ctx.data.hostkey, JSON.stringify(updateCredentials));

  ctx.status = 200;
  ctx.body = mapper(updateCredentials);
};

module.exports.del = async (ctx) => {
  const result = await db.client.del(ctx.data.hostkey);

  if (result === 0) {
    ctx.throw(404, 'credentials not found');
  }

  ctx.status = 200;
  ctx.body = {
    info: `credentials for ${ctx.data.hostkey} delete`,
  };
};

function __updateData(oldData, newData) {
  return {
    hostkey: newData.hostkey || oldData.hostkey,
    login: newData.login || oldData.login,
    pass: newData.pass || oldData.pass,
  };
}
