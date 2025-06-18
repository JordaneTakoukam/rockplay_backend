// betUtils/price_config.cjs

const cryptoPrices = {
  btc: 104184.00,     // Bitcoin (BTC)
  eth: 2488.66,       // Ethereum (ETH)
  bnb: 639.93,        // Binance Coin (BNB)
  trx: 0.270813,      // TRON (TRX)
  btc_ln: 0.00006067, // Bitcoin Lightning (BTC_LN)
  bch: 460.03,        // Bitcoin Cash (BCH)
  ltc: 84.43,         // Litecoin (LTC)
  doge: 0.167006,     // Dogecoin (DOGE)
  sol: 145.06,        // Solana (SOL)
  rp: 1               // Crypto du jeu (valeur fictive)
};


const precisionByCurrency = {
  btc: 6,
  bnb: 4,
  eth: 4,
  mup: 4,
  sol: 4,
  trx: 2,

};
const MIN_USD = 0.1;
const MAX_USD = 500;

const configPlayAmount = {
  btc: {
    min: parseFloat((MIN_USD / cryptoPrices.btc).toFixed(precisionByCurrency.btc)),
    max: parseFloat((MAX_USD / cryptoPrices.btc).toFixed(precisionByCurrency.btc)),
  },
  eth: {
    min: parseFloat((MIN_USD / cryptoPrices.eth).toFixed(precisionByCurrency.eth)),
    max: parseFloat((MAX_USD / cryptoPrices.eth).toFixed(precisionByCurrency.eth)),
  },
  bnb: {
    min: parseFloat((MIN_USD / cryptoPrices.bnb).toFixed(precisionByCurrency.bnb)),
    max: parseFloat((MAX_USD / cryptoPrices.bnb).toFixed(precisionByCurrency.bnb)),
  },
  trx: {
    min: parseFloat((MIN_USD / cryptoPrices.trx).toFixed(precisionByCurrency.trx)),
    max: parseFloat((MAX_USD / cryptoPrices.trx).toFixed(precisionByCurrency.trx)),
  },
  mup: {
    min: 0.1,
    max: parseFloat((MAX_USD / cryptoPrices.rp).toFixed(precisionByCurrency.mup)),
  },
  sol: {
    min: parseFloat((MIN_USD / cryptoPrices.sol).toFixed(precisionByCurrency.sol)),
    max: parseFloat((MAX_USD / cryptoPrices.sol).toFixed(precisionByCurrency.sol)),
  },
};

const betChances = [
  // amount in usd
  { min: 0.01, max: 4.99, chance: 0.05 },

  // 3% 
  { min: 5, max: 49.99, chance: 0.03 },

  // 2%
  { min: 50, max: 99.99, chance: 0.02 },

  // 1% 
  { min: 100, max: Infinity, chance: 0 },
];


module.exports = {
  prices: cryptoPrices,
  betChances: betChances,
  precisionByCurrency,
  configPlayAmount,
};
