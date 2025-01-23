const { generateScissorHash, randomNumber } = require('../../helper/mainHelper');
const socketManager = require('../manager/SocketManager');
const scissorsController = require('../controller/ScissorsController');
const { v4: uuidv4 } = require('uuid');
const { calculateWinChance } = require('../../betUtils/betUtils');

//0: rock, 1: scissors, 2: paper
// 3 = random number

exports.getScissorsResult = async (data, socket) => {
    try {
        let { playerNumber, userId, betAmount, coinType } = data;

        if (playerNumber === 3) {
            playerNumber = randomNumber(3);
        }
        const seedData = await scissorsController.getSeedData(userId);
        const roundNumber = uuidv4();
        // const dealerNumber = scissorsWinner(seedData.serverSeedData.seed, seedData.clientSeedData.seed, roundNumber);

        // const result = checkWinner(playerNumber, dealerNumber);
        const resulPrediction = checkWinnerInfluence(playerNumber, betAmount, coinType.coinType);

        var dealerNumber = resulPrediction.dealerNumber;

        // console.log("player = ", playerNumber);
        // console.log("dealer = ", dealerNumber);

        const response = await scissorsController.saveScissorsRound({ userId, betAmount, playerNumber: playerNumber, dealerNumber: dealerNumber, result: resulPrediction.result, coinType, roundNumber, clientSeed: seedData.clientSeedData.seed, serverSeed: seedData.serverSeedData.seed });

        socketManager.sendBetResult({ playerNumber: playerNumber, dealerNumber, winResult: result = resulPrediction.result, result: response }, socket);
        if (response.status) {
            setTimeout(() => {
                socketManager.sendBetHistory({
                    userId: response.roundData.userId,
                    gameType: 'scissor',
                    roundNumber: response.roundData.roundNumber,
                    betAmount: response.roundData.betAmount,
                    coinType: response.roundData.coinType,
                    payout: response.roundData.payout,
                    roundResult: response.roundData.roundResult,
                    roundState: true
                });
                socketManager.sendNewRoundData(response);
            }, 7000);
        }
    }
    catch (err) {
        console.error({ title: 'ScissorsRound => getScissorsResult', message: err.message });
    }
}

exports.getHistory = async (data, socket) => {
    try {
        const { userId } = data;
        const response = await scissorsController.getHistory({ userId });
        socketManager.sendHistoryData({ history: response }, socket);
    }
    catch (err) {
        console.error({ title: 'ScissorsRound => getHistory', message: err.message });
    }
}

// const scissorsWinner = (serverSeed, clientSeed, roundNumber) => {
//     const hash = generateScissorHash(serverSeed, clientSeed, roundNumber);
//     const value = parseInt(hash[0], 16);
//     let winScissors;
//     if (value <= 5)
//         winScissors = 0;
//     else if (value > 5 && value <= 10)
//         winScissors = 1;
//     else
//         winScissors = 2;
//     return winScissors;
// }

// const checkWinner = (player, dealer) => {
//     switch (player) {
//         case 0:
//             if (dealer === 1) return 'win';
//             else if (dealer === 2) return 'lost';
//             else return 'draw';
//         case 1:
//             if (dealer === 2) return 'win';
//             else if (dealer === 0) return 'lost';
//             else return 'draw';
//         case 2:
//             if (dealer === 0) return 'win';
//             else if (dealer === 1) return 'lost';
//             else return 'draw';
//         default:
//             return '';
//     };
// }

const checkWinnerInfluence = (player, betAmount, coinType) => {
    // Calculer la chance de gagner en pourcentage (exemple : 0.1 = 10%)
    const winChance = calculateWinChance(betAmount, coinType);

    // Tableau des résultats de jeu : 'win' = victoire du joueur, 'lost' = défaite, 'draw' = égalité
    const gameResults = {
        0: { 1: 'win', 2: 'lost', 0: 'draw' },
        1: { 2: 'win', 0: 'lost', 1: 'draw' },
        2: { 0: 'win', 1: 'lost', 2: 'draw' },
    };

    // Tirer un nombre aléatoire pour décider du résultat (gagner ou perdre)
    const numberPick = Math.random();
    // console.log("Random Number Pick = ", numberPick);

    let result;
    let dealerNumber;

    // Déterminer si le joueur gagne ou perd selon winChance
    if ((winChance == 1) || (numberPick <= winChance)) {
        // Le joueur gagne
        result = 'win';
        dealerNumber = parseInt(Object.keys(gameResults[player]).find(
            (key) => gameResults[player][key] === 'win'
        ), 10);
    } else if (numberPick > winChance && numberPick <= winChance + (1 - winChance) / 2) {
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
