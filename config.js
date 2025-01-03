require('dotenv').config();

const DEV_MODE = process.env.REACT_APP_MODE === 'dev';

const configWithdraw = {
    btc: {
        fee: 0.00001,
        min: 0.0001, // ~ 10$
        max: 0.0001  // ~ 100$
    },
    eth: {
        fee: 0.00014,  // ~ 0.5$
        min: 0.0029, // ~ 10$
        max: 0.029 // ~ 100$
    },
    trx: {
        fee: 1.89,  // ~ 0.5$
        min: 37.79, // ~ 10$
        max: 377.9 // ~ 100$
    },
};

module.exports = {
    SERVER_PORT: 5000,
    NETWORK: 'testnet',

    JWT: {
        expireIn: '1h',
        secret: process.env.JWT_SECRET
    },

    DB: 'mongodb://127.0.0.1:27017/MinusPlay',

    MANAGEMENT_OPTION: {
        port: 4000
    },

    TATUM_OPTION: {
        // Test environment (simulated cryptos for testing)
        testnet: {
            apikey: process.env.TATUM_TESTNET_API_KEY,
            virtualAccount: 'MinusplayPaymentTestnet',
        },
        // Real environment for actual crypto transactions
        mainnet: {
            apikey: process.env.TATUM_MAINNET_API_KEY,
            virtualAccount: 'MinusplayPaymentMainnet',
        }
    },

    SUBSCRIBE_URL: DEV_MODE
        ? 'http://localhost:5000/api/v0/payment/webhook-handler'
        : 'https://api-root.minusplay.com/api/v0/payment/webhook-handler',

    DEV_MODE,
    configWithdraw,
};
