const { prices, betChances } = require('./price_config.js');

const DEFAULT_CHANCE = 0.05;  // 5 % par défaut

/**
 * Calcule la probabilité de gain en fonction du montant parié.
 * Affiche des logs détaillés pour debug.
 * @param {number|string} betAmount – montant du pari (en USD ou en coins si coinType fourni)
 * @param {string} [coinType] – type de crypto (ex. "btc"), ou vide si pari en USD
 * @returns {number} – probabilité (entre 0 et 1)
 */
function calculateWinChance(betAmount, coinType = '') {

  // 1. Parsing et validation
  let amount = Number(betAmount);
  if (isNaN(amount) || amount < 0) {
    console.error(`Montant invalide : ${betAmount}`);
    throw new Error(`Montant invalide : ${betAmount}`);
  }

  // 2. Conversion en USD si nécessaire
  coinType = coinType.toLowerCase();
  let usdAmount = amount;
  if (coinType && prices[coinType] != null) {
    usdAmount = amount * prices[coinType];
  } else {
    console.log(`Pas de conversion crypto (on suppose déjà en USD): ${usdAmount} USD`);
  }

  // 3. Recherche de la tranche qui convient
  let chanceResult = DEFAULT_CHANCE;
  for (const { min, max, chance } of betChances) {
    const inRange = usdAmount >= min && usdAmount < max;
    if (inRange) {
      chanceResult = chance;
      break;
    }
  }

  console.log(`Chance finale renvoyée : ${chanceResult}`);
  return chanceResult;
}

module.exports = { calculateWinChance };


