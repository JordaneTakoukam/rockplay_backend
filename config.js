require('dotenv').config();

const DEV_MODE = process.env.REACT_APP_MODE === 'dev';

// block bee 


const configWithdraw = {
    btc: {
        // fee: 0.000003, // from blockbee
        fee: 0.000004, // from blockbee
        min: 0.00008, // minimum blockbee
        max: 0.00485,  // ~ 4,823.59$
        precision: 8
    },
    eth: {
        // fee: 0.00023, // from blockbee ~ 0.61
        fee: 0.00025, // from blockbee ~ 0.61
        min: 0.0045, // from blockbee
        max: 0.15, // ~ 5,154.87$
        precision: 8

    },
    trx: {
        // fee: 3,  // from blockbee ~ 0.29$
        fee: 4,  // from blockbee ~ 0.29$
        min: 10, // from blockbee
        max: 2025, // ~500$
        precision: 8

    },
    bnb: {
        // fee: 0.000084, // ~ 0.053$
        fee: 0.000085, // ~ 0.053$
        min: 0.002,
        max: 0.5, // ~ 500$
        precision: 5
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

    SUBSCRIBE_URL:
        DEV_MODE ? "https://33e6-109-245-95-235.ngrok-free.app/api/v0/payment/webhook-handler" :
            "https://api-root.rockplay.fun/api/v0/payment/webhook-handler",



    DEV_MODE,
    configWithdraw,
    adminEmail: process.env.ADMIN_EMAIL,
};
