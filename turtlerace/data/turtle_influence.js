const constant = require('../constant');
const { randomNumber } = require('../../helper/mainHelper');
const { calculateWinChance } = require('../../betUtils/betUtils');

/**
 * Génère un ordre de tortues aléatoire
 * et place la tortue gagnante en première position.
 */
function generateResultTurtle(winTurtle) {
    const resultTurtle = [];
    while (resultTurtle.length < constant.turtleraceInfo.turtleCount) {
        const num = randomNumber(constant.turtleraceInfo.turtleCount);
        if (!resultTurtle.includes(num)) {
            resultTurtle.push(num);
        }
    }
    const idx = resultTurtle.indexOf(winTurtle);
    [resultTurtle[0], resultTurtle[idx]] = [resultTurtle[idx], resultTurtle[0]];
    console.log("Final turtle positions:", resultTurtle);
    return resultTurtle;
}

/**
 * Choisit la tortue gagnante de façon proportionnelle
 * à la winChance retournée pour chaque pari,
 * avec un second tirage **uniquement si** le premier tirage fait gagner un utilisateur
 * ayant une chance <= 0.03.
 * @param {Array} betUsers - liste des paris { userId, betAmount, coinType, turtleNum }
 * @returns {number[]} ordre final des tortues
 */
function winnerLogicInfluence(betUsers) {
    const turtleCount = constant.turtleraceInfo.turtleCount;

    // 1) Si aucun pari, tirage uniforme
    if (betUsers.length === 0) {
        const randWin = randomNumber(turtleCount);
        console.log("No bets - random winner:", randWin);
        return generateResultTurtle(randWin);
    }

    // 2) Agréger les chances par tortue
    const chanceMap = Array(turtleCount).fill(0);
    betUsers.forEach(user => {
        const amount   = parseFloat(user.betAmount);
        const coinType = user.coinType?.coinType || 'undefined';
        const chance   = calculateWinChance(amount, coinType);
        chanceMap[user.turtleNum] += chance;
        console.log(`User ${user.userId} | turtle ${user.turtleNum} | winChance ${chance}`);
    });

    // 3) Normaliser en poids et préparer le pick pondéré
    const totalChance   = chanceMap.reduce((sum, c) => sum + c, 0);
    const fallbackShare = Math.max(0, 1 - totalChance) / turtleCount;
    const weights       = chanceMap.map(c => c + fallbackShare);
    const weightedPick = () => {
        const r = Math.random();
        let cumulative = 0;
        for (let i = 0; i < turtleCount; i++) {
            cumulative += weights[i];
            if (r < cumulative) return i;
        }
        return turtleCount - 1;
    };

    // 4) Premier tirage pondéré
    let winTurtle = weightedPick();
    console.log("First weighted pick:", winTurtle, "chance:", chanceMap[winTurtle]);

    // 5) Si le gagnant est un utilisateur ayant une chance <= 0.03, on relance un second tirage
    const playerChance = chanceMap[winTurtle];
    const isUserWinner = betUsers.some(u => u.turtleNum === winTurtle);
    if (isUserWinner && playerChance <= 0.1) {
        console.log(`User wins with low chance (${playerChance}). Rerolling...`);
        winTurtle = weightedPick();
        console.log("Second weighted pick:", winTurtle, "chance:", chanceMap[winTurtle]);
    }

    return generateResultTurtle(winTurtle);
}

module.exports = { winnerLogicInfluence, generateResultTurtle };
