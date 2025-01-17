require('dotenv').config();

const DEV_MODE = process.env.REACT_APP_MODE === 'dev';

// block bee 


const configWithdraw = {
    btc: {
        // fee: 0.0001, // ~ 4.82$ after
        // min: 0.0001, // ~ 48.24$

        fee: 0.000005, // from blockbee
        min: 0.00008000, // minimum blockbee
        max: 0.00485  // ~ 4,823.59$
    },
    eth: {
        // fee: 0.003,  // ~ 10.31$
        // min: 0.03, // ~ 103.10$

        fee: 0.000433, // from blockbee
        min: 0.0045, // from blockbee
        max: 0.15, // ~ 5,154.87$
    },
    trx: {
        // fee: 1.89,  // ~ 0.5$
        // min: 37.79, // ~ 10$
        fee: 3,  // from blockbee
        min: 10, // from blockbee
        max: 2025 // ~500$

    },
    bnb: {
        fee: 0.000084,  //
        min: 0.00100000, //
        max: 0.5 // ~ 500$
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

    SUBSCRIBE_URL: 'https://api-root.minusplay.com/api/v0/payment/webhook-handler',
    //  DEV_MODE
    //     ? 'http://localhost:5000/api/v0/payment/webhook-handler'  // local url not work
    //     : 


    DEV_MODE,
    configWithdraw,
};
