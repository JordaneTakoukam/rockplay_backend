// TurtleRaceRound.js
const constant = require('../constant');
const { v4: uuidv4 } = require('uuid');
const socketManager = require('../manager/SocketManager');
const dataManager = require('../manager/DataManager');
const turtleController = require('../controllers/TurtleController');
const { winnerLogicInfluence } = require('./turtle_influence');

module.exports = class TurtleRaceRound {
    countDownTime
    countDownInterval

    roundNumber
    roundState
    roundDate
    roundStartTime

    winnerInfo
    betUsers
    serverSeed

    constructor() {
        this.countDownTime = constant.turtleraceInfo.countDown.time;
        this.roundState = constant.round.state.countDown;
        this.roundNumber = uuidv4();
        this.setServerSeed();
        this.roundDate = new Date();
        this.betUsers = [];

        this.countDownInterval = setInterval(() => {
            this.countDown(response => {
                if (response.state === 'start') {
                    this.startRound();
                } else {
                    this.countDownRound(response.count);
                }
            });
        }, constant.turtleraceInfo.countDown.interval * 1000);
    }

    setServerSeed = async () => {
        const seedData = await turtleController.getSeedData();
        this.serverSeed = seedData.serverSeedData.seed;
    }

    currentRound = async (socket) => {
        const historyData = await turtleController.getLastRounds();
        const betHistoryData = await turtleController.getBetHistory();
        const response = { history: historyData, betHistory: betHistoryData };

        if (this.roundState === constant.round.state.started) {
            response.stateData = {
                state: this.roundState,
                startTime: this.roundStartTime,
                winnerInfo: this.winnerInfo
            };
        } else {
            response.stateData = { state: this.roundState };
        }

        socketManager.currentRoundResult(response, socket);
    }

    countDown = (callback) => {
        if (this.countDownTime < 0) {
            clearInterval(this.countDownInterval);
            this.roundState = constant.round.state.started;
            callback({ state: 'start' });
        } else {
            callback({ state: 'count', count: this.countDownTime.toFixed(2) });
            this.countDownTime -= constant.turtleraceInfo.countDown.interval;
        }
    }

    async addBetUser(data, socket) {
        if (this.roundState !== constant.round.state.countDown) {
            return socketManager.joinBetResult({ state: false, data }, socket);
        }
        if (!this.checkBetUser(data)) {
            const betUser = {
                userId:        data.userId,
                betAmount:     data.betAmount,
                coinType:      data.coinType,
                xFactor:       constant.turtleraceInfo.xFactor,
                profit:        0,
                turtleNum:     data.turtleNum,
                isWin:         false,
                userNickName:  ''
            };
            const response = await turtleController.updateMyBalance({
                userId: data.userId,
                balance: data.betAmount,
                coinType: data.coinType
            });
            if (response.status) {
                betUser.userNickName = response.userData.userNickName;
                this.betUsers.push(betUser);
            }
            socketManager.joinBetResult({ state: true, data: response }, socket);
            socketManager.newBetUser({ betUser });
        }
    }

    async removeBetUser(data, socket) {
        let cancelUser;
        this.betUsers = this.betUsers.filter(item => {
            if (item.userId !== data.userId) return true;
            cancelUser = item;
            return false;
        });
        const response = await turtleController.updateMyBalance({
            userId: cancelUser.userId,
            balance: -cancelUser.betAmount,
            coinType: cancelUser.coinType
        });
        socketManager.cancelBetResult({ state: true, data: response }, socket);
        socketManager.removeBetUser({ cancelUser });
    }

    checkBetUser(data) {
        return this.betUsers.some(item => item.userId === data.userId);
    }

    countDownRound(count) {
        socketManager.sendRoundCountDown(count);
    }

    startRound() {
        // 1) Déterminer l’ordre selon la chance
        this.winnerInfo = winnerLogicInfluence(this.betUsers);

        // 2) Enregistrer l’heure et renvoyer l’historique
        this.roundStartTime = new Date();
        this.currentRound();

        // 3) Annoncer le départ
        socketManager.sendRoundStart(this.winnerInfo);

        // 4) Calcul des gains/pertes
        this.betUsers.forEach(betUser => {
            const betAmount = parseFloat(betUser.betAmount);
            const playNumber = betUser.turtleNum;
            const topWinner = this.winnerInfo[0];
            if (topWinner === playNumber) {
                betUser.isWin  = true;
                betUser.profit = betAmount * betUser.xFactor;
            }
        });

        // 5) Sauvegarde et fin de round
        setTimeout(() => {
            turtleController.saveTurtleRound({
                roundNumber: this.roundNumber,
                winnerInfo:  this.winnerInfo,
                roundDate:   this.roundDate,
                betUsers:    this.betUsers,
                serverSeed:  this.serverSeed
            })
            .then(result => {
                if (result) {
                    const historyData = result.map(item => ({
                        userId:      item.betUserId,
                        gameType:    'turtle',
                        roundNumber: this.roundNumber,
                        betAmount:   item.betAmount,
                        coinType:    item.coinType,
                        payout:      item.xFactor,
                        roundResult: item.isWin ? 'win' : 'lost',
                        roundState:  true
                    }));
                    socketManager.sendBetHistory(historyData);
                }
                this.roundState = constant.round.state.finished;
                socketManager.sendRoundStop(this.winnerInfo);
                return turtleController.updateBalances(this.betUsers);
            })
            .then(() => socketManager.balanceUpdated())
            .catch(err => console.error('Error saving/updating balances:', err))
            .finally(() => {
                setTimeout(() => {
                    socketManager.sendRoundFinished();
                    dataManager.createRound();
                }, constant.turtleraceInfo.completeRound.time * 1000);
            });
        }, constant.turtleraceInfo.runRound.time * 1000);
    }
}
