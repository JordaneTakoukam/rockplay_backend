const routerx = require('express-promise-router');
const cryptoController = require('../controllers/cryptoController');
const cryptoBlockbeeController = require('../controllers/blockbee/cryptoControllerBlockbee');
const Router = routerx();


// new update for blockbee
Router.post('/deposit-blockbee-address', cryptoBlockbeeController.getClientDepositBlockbeeAddress);
Router.post('/withdraw-blockbee-init', cryptoBlockbeeController.initWithDrawClient);

// Router.post('/admin/get-pending-withdraw', cryptoBlockbeeController.getPendingTransactionsAdmin);
// Router.post('/admin/sending-crypto', cryptoBlockbeeController.payoutCrypto);

Router.post('/webhook/deposit', cryptoBlockbeeController.webHookDeposit);



// Router.post('/deposit-address', cryptoController.getDepositAddressFromAccount);
// Router.post('/webhook-handler', cryptoController.tatumWebhook);




Router.post('/get-balance', cryptoController.getBalanceFromAccount);
Router.post('/withdraw', cryptoController.withdrawFromAccount);
Router.post('/btc-withdraw', cryptoController.withdrawBTCFromAccount);
Router.post('/eth-withdraw', cryptoController.withdrawETHFromAccount);
Router.post('/tron-withdraw', cryptoController.withdrawTRONFromAccount);



// new add blockbee
// Router.post('/blockbee/webhook-handler', cryptoControllerBlockbee.blockbeeWebhook);
// Router.post('/blockbee/deposit-address', cryptoControllerBlockbee.generateDepositAddress);
// Router.post('/blockbee/withdraw', cryptoControllerBlockbee.processWithdrawal);


Router.post('/get-daily-reward', cryptoController.getDailyReward);
Router.post('/getCurrencies', cryptoController.getCurrencies);
Router.post('/getExchangeRate', cryptoController.getExchangeRate);
Router.post('/swapCoin', cryptoController.swapCoin);

module.exports = Router;