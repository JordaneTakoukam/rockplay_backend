const { prices, betChances } = require('./price_config.js');

// Fonction pour calculer les chances de gagner en fonction du montant parié en USD
function calculateWinChance(betAmount, coinType) {
    // Convertir le montant du pari dans la monnaie USD
    let betAmountInUsd = parseFloat(betAmount);  // Assurez-vous que betAmount est un nombre, et non une chaîne
    let chanceEnd = 0.05;  // 5% chance par défaut si aucun autre seuil n'est applicable

    // Convertir coinType en minuscules pour la comparaison
    coinType = coinType ? coinType.toLowerCase() : '';

    // Vérifier si la devise est parmi celles avec un prix défini
    if (coinType && prices[coinType]) {
        betAmountInUsd *= prices[coinType];  // Conversion en USD en fonction du prix de la devise
    }

    // Trouver les chances de gagner en fonction du montant
    for (let i = 0; i < betChances.length; i++) {
        const { min, max, chance } = betChances[i];

        // S'assurer que la valeur est dans la plage définie
        if ((betAmountInUsd >= min) && (betAmountInUsd <= max)) {
            chanceEnd = chance;
        }
    }

    // console.log("prix en usd = ", betAmountInUsd);
    // console.log("Chance = ", chanceEnd);
    // console.log("coinType = ", coinType);
    return chanceEnd;
}

module.exports = {
    calculateWinChance
};
