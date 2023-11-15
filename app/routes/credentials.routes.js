const Router = require('koa-router');
const { koaBody } = require('koa-body');

const validator = require('../middleware/validators/credentials.validators');
const controller = require('../controllers/credentials.controllers');
const dataMaker = require('../middleware/data.maker');

const router = new Router({ prefix: '/api' });

router.get('/', controller.getAll);
router.get(
  '/:key',
  validator.key,
  dataMaker,
  controller.get,
);
router.post(
  '/',
  koaBody({ multipart: true }),
  validator.hostkey,
  validator.login,
  validator.pass,
  dataMaker,
  controller.add,
);
router.patch(
  '/:key',
  koaBody({ multipart: true }),
  validator.key,
  validator.login,
  validator.pass,
  dataMaker,
  controller.upd,
);
router.delete(
  '/:key',
  validator.key,
  dataMaker,
  controller.del,
);

module.exports = router.routes();
