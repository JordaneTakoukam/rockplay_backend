const constant = require('../constant');
const { v4: uuidv4 } = require('uuid');
const { randomNumber, generateTurtleHash } = require('../../helper/mainHelper');
const socketManager = require('../manager/SocketManager');
const dataManager = require('../manager/DataManager');
const turtleController = require('../controllers/TurtleController');
const { calculateWinChance } = require('../../betUtils/betUtils');

TURTLE_YELLOW = 0;
TURTLE_RED = 1;
TURTLE_BLUE = 2;

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

        this.betUsers = new Array();

        let self = this;
        this.countDownInterval = setInterval(() => {
            this.countDown(response => {
                if (response.state === 'start') {
                    self.startRound();
                }
                else if (response.state === 'count') {
                    self.countDownRound(response.count);
                }
            });
        }, constant.turtleraceInfo.countDown.interval * 1000);
    }

    setServerSeed = async () => {
        let seedData = await turtleController.getSeedData();
        this.serverSeed = seedData.serverSeedData.seed;
    }

    currentRound = async (socket) => {
        const historyData = await turtleController.getLastRounds();
        const betHistoryData = await turtleController.getBetHistory();
        let response = { history: historyData, betHistory: betHistoryData };
        if (this.roundState === constant.round.state.started)
            response['stateData'] = {
                state: this.roundState,
                startTime: this.roundStartTime,
                winnerInfo: this.winnerInfo
            };
        else
            response['stateData'] = {
                state: this.roundState
            };
        socketManager.currentRoundResult(response, socket);
    }

    countDown = (callback) => {
        if (this.countDownTime < 0.0) {
            clearInterval(this.countDownInterval);
            this.roundState = constant.round.state.started;
            callback({ state: 'start' });
        }
        else {
            callback({ state: 'count', count: this.countDownTime.toFixed(2) });
            this.countDownTime -= constant.turtleraceInfo.countDown.interval;
        }
    }

    winnerLogic() {
        let betAmount = 0;
        this.betUsers.map((betUser) => {
            betAmount += betUser.betAmount
        });



        const hash = generateTurtleHash(this.serverSeed, this.roundNumber, betAmount);
        const value = parseInt(hash[0], 16);

        let winTurtle;
        if (value <= 5)
            winTurtle = 0;
        else if (value > 5 && value <= 10)
            winTurtle = 1;
        else
            winTurtle = 2;

        let resultTurtle = [];
        while (resultTurtle.length < constant.turtleraceInfo.turtleCount) {
            let number = randomNumber(constant.turtleraceInfo.turtleCount)
            let index = resultTurtle.findIndex((item) => item === number)
            if (index < 0) resultTurtle.push(number);
        }

        let topIndex = resultTurtle.findIndex((item) => item === 0);
        resultTurtle[topIndex] = resultTurtle[winTurtle];
        resultTurtle[winTurtle] = 0;

        console.log("result return = ", resultTurtle);

        return resultTurtle;
    }




    winnerLogicInfluence() {
        let betAmount = 0;

        // Calculer le montant total des mises (si des utilisateurs jouent)
        if (this.betUsers.length > 0) {
            this.betUsers.forEach((betUser) => {
                betAmount += parseFloat(betUser.betAmount);
            });
        }

        // Générer un hash basé sur les seeds et le montant total des mises
        const hash = generateTurtleHash(this.serverSeed, this.roundNumber, betAmount);
        const value = parseInt(hash[0], 16);

        // Tortue gagnante initialement déterminée par le hash
        let winTurtle;
        if (value <= 5) {
            winTurtle = 0;
        } else if (value > 5 && value <= 10) {
            winTurtle = 1;
        } else {
            winTurtle = 2;
        }
        console.log("Initial winner turtle based on hash:", winTurtle);

        // Si aucun utilisateur ne participe, retourner simplement le résultat basé sur le hash
        if (this.betUsers.length === 0) {
            console.log("No users played in this round. Returning default winner logic.");
            return this.generateResultTurtle(winTurtle);
        }

        // Résultat final
        let resultTurtle = [];

        // Traiter chaque utilisateur
        this.betUsers.forEach((betUser) => {
            const coinType = betUser.coinType?.coinType || 'undefined';
            const winChance = calculateWinChance(betUser.betAmount, coinType);
            const playNumber = betUser.turtleNum;

            console.log("coinType = ", coinType);
            console.log("playNumber = ", playNumber);
            console.log("win chance = ", winChance);

            // Si winChance est de 100%, placer automatiquement la tortue de l'utilisateur en première position
            if (winChance === 1) {
                console.log(`User ${betUser.userId} has a 100% win chance. Automatically placing turtle ${playNumber} in first position.`);
                resultTurtle = [playNumber];
                winTurtle = playNumber; // Mettre à jour winTurtle pour ce cas
                return; // Arrêter le traitement pour cet utilisateur
            }

            // Générer un nombre aléatoire pour influencer le résultat
            const randomPick = Math.random();
            console.log(`User ${betUser.userId} | winChance: ${winChance} | randomPick: ${randomPick}`);

            if (randomPick <= winChance) {
                // Si l'utilisateur gagne, sa tortue est placée en première position
                console.log(`User ${betUser.userId} wins and places turtle ${playNumber} in first position.`);
                resultTurtle = [playNumber]; // Placer la tortue gagnante en tête
                winTurtle = playNumber; // Mettre à jour winTurtle
            }
        });

        // Compléter le tableau avec les tortues restantes
        const allTurtles = [0, 1, 2];
        const remainingTurtles = allTurtles.filter((turtle) => !resultTurtle.includes(turtle));
        resultTurtle = [...resultTurtle, ...remainingTurtles];

        console.log("Final turtle positions:", resultTurtle);

        // Retourner le résultat final
        return resultTurtle;
    }












    // Fonction utilitaire pour générer l'ordre des tortues
    generateResultTurtle(winTurtle) {
        let resultTurtle = [];

        // Générer une liste aléatoire des tortues
        while (resultTurtle.length < constant.turtleraceInfo.turtleCount) {
            let number = randomNumber(constant.turtleraceInfo.turtleCount);
            if (!resultTurtle.includes(number)) resultTurtle.push(number);
        }

        // Mettre la tortue gagnante en première position
        let topIndex = resultTurtle.findIndex((item) => item === winTurtle);
        [resultTurtle[0], resultTurtle[topIndex]] = [resultTurtle[topIndex], resultTurtle[0]];

        console.log("Final turtle positions:", resultTurtle);
        return resultTurtle;
    }





    async addBetUser(data, socket) {
        if (this.roundState === constant.round.state.countDown) {
            if (!this.checkBetUser(data)) {
                let betUser = {
                    userId: data.userId,
                    betAmount: data.betAmount,
                    coinType: data.coinType,
                    xFactor: constant.turtleraceInfo.xFactor,
                    profit: 0,
                    turtleNum: data.turtleNum,
                    isWin: false,
                    userNickName: ''
                };
                const response = await turtleController.updateMyBalance({ userId: data.userId, balance: data.betAmount, coinType: data.coinType });
                if (response.status) {
                    betUser.userNickName = response.userData.userNickName;
                    this.betUsers.push(betUser);
                }
                socketManager.joinBetResult({ state: true, data: response }, socket);
                socketManager.newBetUser({ betUser });
            }
        }
        else {
            socketManager.joinBetResult({ state: false, data: data }, socket);
        }
    }

    async removeBetUser(data, socket) {
        let cancelUser;
        this.betUsers = this.betUsers.filter(item => {
            if (item.userId !== data.userId) {
                return true;
            }
            else {
                cancelUser = item;
                return false;
            }
        });
        const response = await turtleController.updateMyBalance({ userId: cancelUser.userId, balance: -cancelUser.betAmount, coinType: cancelUser.coinType });
        socketManager.cancelBetResult({ state: true, data: response }, socket);
        socketManager.removeBetUser({ cancelUser });
    }

    checkBetUser(data) {
        this.betUsers.map((item) => {
            if (item.userId === data.userId)
                return true
        });
        return false;
    }

    countDownRound(count) {
        socketManager.sendRoundCountDown(count);
    }

    startRound() {
        let self = this;
        this.winnerInfo = this.winnerLogicInfluence();
        socketManager.sendRoundStart(this.winnerInfo);
        this.roundStartTime = new Date();



        // influence configurer ici --------------
        this.betUsers.map((betUser) => {
            console.log("betUser = ", JSON.stringify(betUser));

            // Montant parié par l'utilisateur
            const betAmount = parseFloat(betUser.betAmount);
            const coinType = betUser.coinType?.coinType || 'undefined';

            // Calcul de la probabilité de gagner

            // Numéro choisi par l'utilisateur
            const playNumber = betUser.turtleNum;

            // Numéro gagnant (déterminé par winnerInfo)
            let topWinner = this.winnerInfo[0];

            // console.log("coinType = ", coinType);
            // console.log("playNumber = ", playNumber);
            // console.log("win chance = ", winChance);
            // console.log("winner number = ", topWinner);

            // Générer un nombre aléatoire entre 0 et 1 pour simuler la probabilité
            // const randomPick = Math.random();
            // console.log(`Random pick for winChance: ${randomPick}`);

            // Déterminer si l'utilisateur gagne ou non
            if (topWinner === playNumber) {
                // Utilisateur gagne (winChance = 1 garantit la victoire)
                betUser.isWin = true;
                betUser.profit = betAmount * betUser.xFactor; // Calcul du profit
                console.log(`User ${betUser.userId} won! Profit: ${betUser.profit}`);
            } else {
                // Utilisateur perd
                betUser.isWin = false;
                betUser.profit = 0;
                console.log(`User ${betUser.userId} lost.`);
            }
        });



        setTimeout(() => {
            turtleController.saveTurtleRound({ roundNumber: this.roundNumber, winnerInfo: this.winnerInfo, roundDate: this.roundDate, betUsers: this.betUsers, serverSeed: this.serverSeed })
                .then((result) => {
                    if (result) {
                        let historyData = [];
                        result.map((item) => {
                            const history = {
                                userId: item.betUserId,
                                gameType: 'turtle',
                                roundNumber: this.roundNumber,
                                betAmount: item.betAmount,
                                coinType: item.coinType,
                                payout: item.xFactor,
                                roundResult: item.isWin ? 'win' : 'lost',
                                roundState: true
                            };
                            historyData.push(history);
                        });
                        socketManager.sendBetHistory(historyData);
                    }

                    self.roundState = constant.round.state.finished;
                    socketManager.sendRoundStop(self.winnerInfo);
                    turtleController.updateBalances(self.betUsers)
                        .then(() => {
                            socketManager.balanceUpdated();
                        })
                        .catch((err) => {
                            console.error({ title: 'startRound => updateBalances', message: err.message });
                        });
                    setTimeout(() => {
                        socketManager.sendRoundFinished();
                        dataManager.createRound();
                    }, constant.turtleraceInfo.completeRound.time * 1000);
                })
                .catch((err) => {
                    console.error({ title: 'startRound => saveTurtleRound', message: err.message });
                });
        }, constant.turtleraceInfo.runRound.time * 1000);
    }
}






