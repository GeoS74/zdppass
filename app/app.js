const Koa = require('koa');

const errorCatcher = require('./middleware/error.catcher');
const routes = require('./routes/credentials.routes');

const app = new Koa();

app.use(errorCatcher);
app.use(routes);

module.exports = app;
