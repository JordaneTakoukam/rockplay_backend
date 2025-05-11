const { calculateWinChance } = require('../../betUtils/betUtils');

exports.checkWinnerInfluenceScissors = (player, betAmount, coinType) => {
    // Calculer la chance de gagner (exemple : 0.1 = 10%)
    const winChance = calculateWinChance(betAmount, coinType);

    // Définir le coefficient pour la probabilité d'égalité (par exemple, 10% de la probabilité restante)
    const drawCoefficient = 0.1;

    // Calculer la probabilité d'égalité
    const drawChance = (1 - winChance) * drawCoefficient;

    // Calculer la probabilité de défaite
    const loseChance = 1 - winChance - drawChance;

    // Vérification que la somme des probabilités est égale à 1
    const totalProbability = winChance + drawChance + loseChance;
    if (Math.abs(totalProbability - 1) > 0.0001) {
        throw new Error('La somme des probabilités ne fait pas 1');
    }

    // Tableau des résultats de jeu : 'win' = victoire du joueur, 'lost' = défaite, 'draw' = égalité
    const gameResults = {
        0: { 1: 'win', 2: 'lost', 0: 'draw' },
        1: { 2: 'win', 0: 'lost', 1: 'draw' },
        2: { 0: 'win', 1: 'lost', 2: 'draw' },
    };

    // console.log(`WIN CHANCE = ${winChance}`);
    // console.log(`DRAW CHANCE = ${drawChance}`);
    // console.log(`LOST CHANCE = ${loseChance}`);

    // Tirer un nombre aléatoire pour décider du résultat
    const numberPick = Math.random();

    let result;
    let dealerNumber;

    // Déterminer le résultat en fonction des probabilités
    if (numberPick <= winChance) {
        // Le joueur gagne
        result = 'win';
        dealerNumber = parseInt(Object.keys(gameResults[player]).find(
            (key) => gameResults[player][key] === 'win'
        ), 10);
    } else if (numberPick <= winChance + drawChance) {
        // Égalité
        result = 'draw';
        dealerNumber = parseInt(Object.keys(gameResults[player]).find(
            (key) => gameResults[player][key] === 'draw'
        ), 10);
    } else {
        // Le joueur perd
        result = 'lost';
        dealerNumber = parseInt(Object.keys(gameResults[player]).find(
            (key) => gameResults[player][key] === 'lost'
        ), 10);
    }

    return { result, dealerNumber };
};
