module.exports = {
    // Prix des devises en USD 
    // Currency prices in USD
    prices: {
        btc: 97111,
        eth: 3348,
        bnb: 625,
        trx: 0.21,
        mup: 1,
    },

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
