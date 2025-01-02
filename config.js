
require('dotenv').config();
const DEV_MODE = process.env.REACT_APP_MODE === 'dev' ? true : false;

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
        // ----------- Environnement de test (fausses cryptos pour simulations).
        testnet: {
            apikey: process.env.TATUM_TESTNET_API_KEY,
            virtualAccount: 'MinusplayPaymentTestnet',
            withdrawFee: '0.000005'
        },
        // -------- Environnement réel pour les transactions avec des cryptos réelles.
        mainnet: {
            apikey: process.env.TATUM_MAINNET_API_KEY,
            virtualAccount: 'MinusplayPaymentMainnet',
            // withdrawFee: '0.00001'
        }
    },




    // -------- blockchains Ethereum
    // INFURA_OPTION: {
    //     testnet: {
    //         providerUrl: 'https://sepolia.infura.io/v3/69b01f7c51d044c0a7883220a2104df3'
    //     },
    //     // mainnet: {
    //     //     providerUrl: 'https://mainnet.infura.io/v3/69b01f7c51d044c0a7883220a2104df3'
    //     // }
    // },



    // -------- blockchains tron
    // TRONWEB_OPTION: {
    //     testnet: {
    //         providerUrl: 'https://api.shasta.trongrid.io'
    //     },
    //     // mainnet: {
    //     //     providerUrl: 'https://api.trongrid.io'
    //     // }
    // },


    SUBSCRIBE_URL: 'https://api-root.minusplay.com/api/v0/payment/webhook-handler',
    // DEV_MODE ?
    // 'http://localhost:5000/api/v0/payment/webhook-handler'
    // :


    DEV_MODE: DEV_MODE,
};