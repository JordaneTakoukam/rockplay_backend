require('dotenv').config();

const DEV_MODE = process.env.REACT_APP_MODE === 'dev';

// block bee 




const configWithdraw = {
  withdraw_fee: 1, // en pourcentage

  // Blockbee min = 0.00008 BTC (~7.58 $)
  btc: {
    minDeposit: 0.00012, // ~11.34 $
    min: 0.00018,        // ~17.01 $
    max: 0.0032,         // ~301.95 $
    precision: 8
  },

  // Blockbee min = 0.0045 ETH (~8.18 $)
  eth: {
    minDeposit: 0.0055,  // ~10.05 $
    min: 0.00825,        // ~15.08 $
    max: 0.17,           // ~310.62 $
    precision: 6
  },

  // Blockbee min = 10 TRX (~2.50 $)
  trx: {
    minDeposit: 12,      // ~3.00 $
    min: 18,             // ~4.50 $
    max: 1200,           // ~300.00 $
    precision: 2
  },

  // Blockbee min = 0.001 BNB (~0.59 $)
  bnb: {
    minDeposit: 0.002,   // ~1.18 $
    min: 0.003,          // ~1.77 $
    max: 0.51,           // ~301.90 $
    precision: 5
  },

  // Blockbee min = 0.0005 BCH (~0.18 $)
  bch: {
    minDeposit: 0.001,   // ~0.36 $
    min: 0.0015,         // ~0.54 $
    max: 0.8,            // ~288.06 $
    precision: 4
  },

  // Blockbee min = 0.002 LTC (~0.18 $)
  ltc: {
    minDeposit: 0.003,   // ~0.26 $
    min: 0.0045,         // ~0.39 $
    max: 3.5,            // ~304.37 $
    precision: 4
  },

  // Blockbee min = 10 DOGE (~1.73 $)
  doge: {
    minDeposit: 12,      // ~2.08 $
    min: 18,             // ~3.12 $
    max: 1800,           // ~312.30 $
    precision: 2
  },

  // Blockbee min = 0.004 SOL (~0.59 $)
  sol: {
    minDeposit: 0.006,   // ~0.88 $
    min: 0.009,          // ~1.32 $
    max: 2,              // ~294.00 $
    precision: 4
  }
};


const depositBonuns = [
  {
    min: 10.0,      // 10 $
    max: 29.9,      // 29.9 $
    pourcentage: 120,
  },
  {
    min: 30.0,      // 30 $
    max: 49.9,      // 49.9 $
    pourcentage: 150,
  },
  {
    min: 50.0,      // 50 $
    max: 79.9,      // 79.9 $
    pourcentage: 180,
  },
  {
    min: 80.0,      // 80 $
    max: 99.9,      // 99.9 $
    pourcentage: 200,
  },
];



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
    DEV_MODE ? "https://0392-109-245-36-21.ngrok-free.app/api/v0/payment/webhook-handler" :
      "https://api-root.rockplay.fun/api/v0/payment/webhook-handler",



  DEV_MODE,
  configWithdraw,
  adminEmail: process.env.ADMIN_EMAIL,
  depositBonuns,
};
