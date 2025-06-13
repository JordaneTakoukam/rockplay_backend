// 13 - 06 - 2025 a 14h56
const cryptoPrices = {
    btc: 104989.00,     // Bitcoin (BTC)
    eth: 2547.47,       // Ethereum (ETH)
    bnb: 652.18,        // Binance Coin (BNB)
    trx: 0.27361,       // TRON (TRX)
    btc_ln: 0.00006067, // Bitcoin Lightning (LBTC) – très faible valeur actuelle (~0.00006 USD) :contentReference[oaicite:10]{index=10}
    bch: 418.92,        // Bitcoin Cash (BCH)
    ltc: 84.06,         // Litecoin (LTC)
    doge: 0.175117,     // Dogecoin (DOGE)
    sol: 145.57,        // Solana (SOL)
    rp: 1               // Crypto du jeu (valeur fictive)
};



module.exports = {
    // Prix des devises en USD 
    // Currency prices in USD
    prices: cryptoPrices,

    // Seuils de mise et chances de gagner 
    // Betting thresholds and chances to win
    betChances: [
        // amount in usd
        { min: 0.01, max: 4.99, chance: 0.05 },

        // 3% 
        { min: 5, max: 49.99, chance: 0.03 },

        // 2%
        { min: 50, max: 99.99, chance: 0.02 },

        // 1% 
        { min: 100, max: Infinity, chance: 0 },
    ]
};
