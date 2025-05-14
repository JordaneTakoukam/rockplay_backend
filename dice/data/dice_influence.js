// dice_influence.js
const { calculateWinChance } = require('../../betUtils/betUtils');
const diceController = require('../controller/DiceController');
const socketManager = require('../manager/SocketManager');
const { v4: uuidv4 } = require('uuid');

/**
 * Applique l'influence sur getDiceResult de DiceRound
 *  - Jeu en un seul pari : victoire possible selon calculateWinChance, sinon perte forcée
 *  - Logs détaillés à chaque étape
 */
function influenceDice(DiceRound) {
  const originalGet = DiceRound.getDiceResult;

  DiceRound.getDiceResult = async function(data, socket) {
    const { userId, betAmount, coinType, difficulty, isOver } = data;
    const winChance = calculateWinChance(betAmount, coinType.coinType);
    console.log(`User ${userId} | Bet ${betAmount} ${coinType.coinType} | winChance=${winChance}`);

    const rand = Math.random();
    console.log(`Random draw=${rand}`);

    if (rand < winChance) {
      console.log(`User ${userId} win by influence. Proceeding with fair spin.`);
      await originalGet.call(this, data, socket);
      console.log(`Fair spin completed for user ${userId}`);
    } else {
      console.log(`User ${userId} loss by influence. Forcing loss.`);
      const roundNumber = uuidv4();
      const payout = 0;
      const roundResult = 'lost';

      // Générer fairData cohérent avec un échec de pari
      const ChanceData = [
        { over: 7, under: 7 },
        { over: 8, under: 6 },
        { over: 9, under: 5 },
        { over: 10, under: 4 },
        { over: 11, under: 3 }
      ];
      const threshold = isOver ? ChanceData[difficulty].over : ChanceData[difficulty].under;
      let l, r;
      do {
        l = Math.floor(Math.random() * 6) + 1;
        r = Math.floor(Math.random() * 6) + 1;
      } while (isOver ? (l + r > threshold) : (l + r < threshold));
      const fairDataLoss = { l, r };
      console.log(`Forced fairData for loss:`, fairDataLoss);

      // Sauvegarde forcée de la perte
      const response = await diceController.saveDiceRound({
        roundNumber,
        userId,
        betAmount,
        coinType,
        difficulty,
        isOver,
        payout,
        fairData: fairDataLoss,
        roundResult,
        serverSeed: null,
        clientSeed: null
      });

      if (response.status) {
        socketManager.sendBetResult(response, socket);
        socketManager.sendBetHistory({
          userId,
          gameType: 'dice',
          roundNumber,
          betAmount,
          coinType,
          payout,
          roundResult,
          roundState: true
        });
        console.log(`Sent forced loss and history for user ${userId}`);
      } else {
        socketManager.sendBetResult(response, socket);
        console.log(`Error saving forced loss for user ${userId}:`, response.message);
      }
    }
  };
}

module.exports = { influenceDice };
