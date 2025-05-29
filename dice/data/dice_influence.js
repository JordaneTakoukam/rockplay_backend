// dice_influence.js
// const { calculateWinChance } = require('../../betUtils/betUtils');
// const diceController = require('../controller/DiceController');
// const socketManager = require('../manager/SocketManager');
// const { v4: uuidv4 } = require('uuid');

/**
 * Applique l'influence sur getDiceResult de DiceRoundc
 *  - Jeu en un seul pari : victoire possible selon calculateWinChance, sinon perte forcée
 *  - Logs détaillés à chaque étape
 */

// function influenceDice(DiceRound) {
//   const originalGet = DiceRound.getDiceResult;

//   DiceRound.getDiceResult = async function (data, socket) {
//     const { userId, betAmount, coinType, difficulty, isOver } = data;
//     const winChance = calculateWinChance(betAmount, coinType.coinType);
//     console.log(`User ${userId} | Bet ${betAmount} ${coinType.coinType} | winChance=${winChance}`);

//     const rand = Math.random();
//     console.log(`Random draw=${rand}`);

//     if (rand < winChance) {
//       console.log(`User ${userId} win by influence. Proceeding with fair spin.`);
//       await originalGet.call(this, data, socket);
//       console.log(`Fair spin completed for user ${userId}`);
//     } else {
//       console.log(`User ${userId} loss by influence. Forcing loss.`);
//       const roundNumber = uuidv4();
//       const payout = 0;
//       const roundResult = 'lost';

//       // Générer fairData cohérent avec un échec de pari
//       const ChanceData = [
//         { over: 3, under: 11 },
//         { over: 4, under: 10 },
//         { over: 5, under: 9 },
//         { over: 6, under: 8 },

//         { over: 7, under: 7 },
//         { over: 8, under: 6 },
//         { over: 9, under: 5 },
//         { over: 10, under: 4 },
//         { over: 11, under: 3 }
//       ];
//       const threshold = isOver ? ChanceData[difficulty].over : ChanceData[difficulty].under;
//       let l, r;
//       do {
//         l = Math.floor(Math.random() * 6) + 1;
//         r = Math.floor(Math.random() * 6) + 1;
//       } while (isOver ? (l + r > threshold) : (l + r < threshold));
//       const fairDataLoss = { l, r };
//       console.log(`Forced fairData for loss:`, fairDataLoss);

//       // Sauvegarde forcée de la perte
//       const response = await diceController.saveDiceRound({
//         roundNumber,
//         userId,
//         betAmount,
//         coinType,
//         difficulty,
//         isOver,
//         payout,
//         fairData: fairDataLoss,
//         roundResult,
//         serverSeed: null,
//         clientSeed: null
//       });

//       if (response.status) {
//         socketManager.sendBetResult(response, socket);
//         socketManager.sendBetHistory({
//           userId,
//           gameType: 'dice',
//           roundNumber,
//           betAmount,
//           coinType,
//           payout,
//           roundResult,
//           roundState: true
//         });
//         console.log(`Sent forced loss and history for user ${userId}`);
//       } else {
//         socketManager.sendBetResult(response, socket);
//         console.log(`Error saving forced loss for user ${userId}:`, response.message);
//       }
//     }
//   };
// }

// module.exports = { influenceDice };
const { calculateWinChance } = require('../../betUtils/betUtils');
const diceController = require('../controller/DiceController');
const socketManager = require('../manager/SocketManager');
const { v4: uuidv4 } = require('uuid');

function influenceDice(DiceRound) {
  DiceRound.getDiceResult = async function (data, socket) {
    const { userId, betAmount, coinType, difficulty, isOver } = data;

    const winChance = calculateWinChance(betAmount, coinType.coinType);
    const rand = Math.random();
    const win = rand < winChance;

    console.log(`User ${userId} | Bet ${betAmount} ${coinType.coinType} | winChance=${winChance.toFixed(2)} | rand=${rand.toFixed(2)} => ${win ? 'WIN' : 'LOSS'}`);

    const roundNumber = uuidv4();

    const ChanceData = [
      { over: 3, under: 11, payout: 1.03, percent: [91.67] },
      { over: 4, under: 10, payout: 1.14, percent: [83.33] },
      { over: 5, under: 9,  payout: 1.31, percent: [72.22] },
      { over: 6, under: 8,  payout: 1.62, percent: [58.33] },
      { over: 7, under: 7,  payout: 2.28, percent: [15, 30, 60, 90, 105, 120] },
      { over: 8, under: 6,  payout: 3.42, percent: [15, 30, 60, 90, 105, 120] },
      { over: 9, under: 5,  payout: 5.70, percent: [10, 30, 60, 90, 110, 120] },
      { over: 10, under: 4, payout: 11.40, percent: [10, 30, 60, 90, 110, 120] },
      { over: 11, under: 3, payout: 34.20, percent: [10, 30, 60, 90, 110, 120] },
    ];

    const { over, under, payout, percent } = ChanceData[difficulty];
    const threshold = isOver ? over : under;

    // Générer un fairData conforme aux "percent"
    const generateFairValue = () => {
      const getLevel = () => Math.floor(Math.random() * 6) + 1;
      return { l: getLevel(), r: getLevel() };
    };

    let fairData = generateFairValue();
    let sum = fairData.l + fairData.r;

    if (win) {
      while ((isOver && sum <= threshold) || (!isOver && sum >= threshold)) {
        fairData = generateFairValue();
        sum = fairData.l + fairData.r;
      }
    } else {
      while ((isOver && sum > threshold) || (!isOver && sum < threshold)) {
        fairData = generateFairValue();
        sum = fairData.l + fairData.r;
      }
    }

    const roundResult = win ? 'win' : 'lost';
    const finalPayout = win ? payout : 0;

    const response = await diceController.saveDiceRound({
      roundNumber,
      userId,
      betAmount,
      coinType,
      difficulty,
      isOver,
      payout: finalPayout,
      fairData,
      roundResult,
      serverSeed: null,
      clientSeed: null
    });

    socketManager.sendBetResult(response, socket);
    socketManager.sendBetHistory({
      userId,
      gameType: 'dice',
      roundNumber,
      betAmount,
      coinType,
      payout: finalPayout,
      roundResult,
      roundState: true
    });
  };
}

module.exports = { influenceDice };
