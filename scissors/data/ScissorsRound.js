const { generateScissorHash, randomNumber } = require('../../helper/mainHelper');
const socketManager = require('../manager/SocketManager');
const scissorsController = require('../controller/ScissorsController');
const { v4: uuidv4 } = require('uuid');
const { checkWinnerInfluenceScissors } = require('./scissors_influence');

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
        const resulPrediction = checkWinnerInfluenceScissors(playerNumber, betAmount, coinType.coinType);


        var dealerNumber = resulPrediction.dealerNumber;


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
                    payout: response.roundData.roundResult === 'draw' || response.roundData.roundResult === 'lost' ? 1 : response.roundData.payout,
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
