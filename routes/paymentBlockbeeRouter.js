const routerx = require('express-promise-router');
const cryptoControllerBlockbee = require('../controllers/cryptoControllerBlockbee');

const Router = routerx();



Router.post('/webhook/deposit', cryptoControllerBlockbee.webHookDeposit);
Router.post('/webhook/withdraw', cryptoControllerBlockbee.webHookWithdraw);



Router.post('/deposit-address', cryptoControllerBlockbee.getDepositAdress);
Router.post('/withdraw', cryptoControllerBlockbee.processWithdrawal);


module.exports = Router;