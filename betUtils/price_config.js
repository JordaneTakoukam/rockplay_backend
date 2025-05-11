const cryptoPrices = {
    btc: 104674,     // Bitcoin (BTC)
    eth: 2532.97,    // Ethereum (ETH)
    bnb: 659.16,     // Binance Coin (BNB)
    trx: 0.2627,     // TRON (TRX)
    btc_ln: 104674,  // Bitcoin Lightning (même prix que BTC)
    bch: 481,        // Bitcoin Cash (valeur estimée)
    ltc: 97,         // Litecoin (valeur estimée)
    doge: 0.18,      // Dogecoin (valeur estimée)
    sol: 155,        // Solana (valeur estimée)
    rp: 1,        // crypto of the game

};


module.exports = {
    // Prix des devises en USD 
    // Currency prices in USD
    prices: cryptoPrices,

    // Seuils de mise et chances de gagner 
    // Betting thresholds and chances to win
    betChances: [
        // 50% 
        { min: 0.01, max: 4.99, chance: 0.03 }, // 3%

        // 5% 
        { min: 5, max: 49.99, chance: 0.02 }, // 0.02

        // 2%
        { min: 50, max: 99.99, chance: 0.02 }, // 0.02

        // 1% 
        { min: 100, max: Infinity, chance: 0.01 }, // 0.01
    ]
};
