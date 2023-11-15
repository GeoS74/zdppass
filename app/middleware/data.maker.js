module.exports = async (ctx, next) => {
  ctx.data = {
    hostkey: ctx.hostkey || null,
    login: ctx.request.body?.login || null,
    pass: ctx.request.body?.pass || null,
  };

  await next();
};
