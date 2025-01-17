const routerx = require('express-promise-router');
const paymentRouter = require('./paymentRouter');
const paymentBlockbeeRouter = require('./paymentBlockbeeRouter');
const authRouter = require('./authRouter');
const Router = routerx();

Router.use('/api/v0/payment', paymentRouter);
Router.use('/api/v0/blockbee/payment', paymentBlockbeeRouter);
Router.use('/api/auth', authRouter);

module.exports = Router;