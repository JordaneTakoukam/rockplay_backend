const cryptoPrices = {
    btc: 108066.12,      // Bitcoin (BTC)
    eth: 2726.62,        // Ethereum (ETH)
    bnb: 681.72,         // Binance Coin (BNB)
    trx: 0.2745,         // TRON (TRX)
    btc_ln: 108066.12,   // Bitcoin Lightning (identique à BTC)
    bch: 417.96,         // Bitcoin Cash (BCH)
    ltc: 96.90,          // Litecoin (LTC)
    doge: 0.2243,        // Dogecoin (DOGE)
    sol: 171.92,         // Solana (SOL)
    rp: 1                // Crypto du jeu (valeur fictive)
};


module.exports = {
    // Prix des devises en USD 
    // Currency prices in USD
    prices: cryptoPrices,

    // Seuils de mise et chances de gagner 
    // Betting thresholds and chances to win
    betChances: [
        // amount in usd
        { min: 0.01, max: 4.99, chance: 0.05 }, // 50%

        // 3% 
        { min: 5, max: 49.99, chance: 0.03 }, // 30%

        // 2%
        { min: 50, max: 99.99, chance: 0.02 }, // 20%

        // 1% 
        { min: 100, max: Infinity, chance: 0 }, // 0 %
    ]
};
