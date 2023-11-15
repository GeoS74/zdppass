module.exports = async (ctx, next) => {
  ctx.data = {
    hostkey: ctx.request.body.hostkey,
    login: ctx.request.body.login,
    pass: ctx.request.body.pass,
  };

  await next();
};
