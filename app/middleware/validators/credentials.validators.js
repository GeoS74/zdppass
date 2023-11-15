module.exports.key = async (ctx, next) => {
  if (!_checkKey(ctx.params.key)) {
    ctx.throw(400, 'invalid key');
  }
  ctx.hostkey = ctx.params.key;
  await next();
};

module.exports.hostkey = async (ctx, next) => {
  if (!_checkHostKey(ctx.request.body?.hostkey)) {
    ctx.throw(400, 'invalid hostkey');
  }
  ctx.hostkey = new URL(ctx.request.body.hostkey).host;
  await next();
};

module.exports.login = async (ctx, next) => {
  if (!_checkLogin(ctx.request.body?.login)) {
    ctx.throw(400, 'invalid login');
  }
  await next();
};

module.exports.pass = async (ctx, next) => {
  if (!_checkPass(ctx.request.body?.pass)) {
    ctx.throw(400, 'invalid pass');
  }
  await next();
};

function _checkKey(key) {
  try {
    return new URL(`http://${key}`);
  } catch (error) {
    return null;
  }
}

function _checkHostKey(hostkey) {
  try {
    return new URL(hostkey);
  } catch (error) {
    return null;
  }
}

function _checkLogin(login) {
  return login && login.length > 3;
}

function _checkPass(pass) {
  return pass && pass.length > 3;
}
