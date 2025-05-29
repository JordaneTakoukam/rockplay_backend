// // mine_influence.js
// const { calculateWinChance } = require('../../betUtils/betUtils');

// function influenceMines(MinesRound) {
//     // Override pickCell
//     MinesRound.prototype.pickCell = function (i, j) {
//         // Premier clic
//         if (!this._firstPickDone) {
//             this._firstPickDone = true;

//             const chance = calculateWinChance(this.betAmount, this.coinType.coinType);
//             this._nextChance = chance;

//             const r = Math.random();
//             const win = r < chance;

//             this.cellPicked = true;
//             this.selectBoard[i][j] = true;

//             if (win) {
//                 this.diamondCount++;
//                 this.currentPayout = this.nextPayout;
//                 this.nextPayout = this.generateNextMultiplier(this.minesCount, this.diamondCount + 1);
//             } else {
//                 this.resultBoard[i][j] = true; // 🔥 Affiche une mine
//                 this.lostRound();
//             }

//             console.log(`First pick, chance=${chance}, rand=${r}, win=${win}`);
//             return { status: true, info: !win };
//         }

//         // Deuxième clic
//         if (!this._secondPickDone) {
//             this._secondPickDone = true;

//             const chance = this._nextChance;
//             const r = Math.random();
//             const win = r < chance;

//             this.cellPicked = true;
//             this.selectBoard[i][j] = true;

//             if (win) {
//                 this.diamondCount++;
//                 this.currentPayout = this.nextPayout;
//                 this.nextPayout = this.generateNextMultiplier(this.minesCount, this.diamondCount + 1);
//             } else {
//                 this.resultBoard[i][j] = true; // 🔥 Affiche une mine
//                 this.lostRound();
//             }

//             console.log(`Second pick, chance=${chance}, rand=${r}, win=${win}`);
//             return { status: true, info: !win };
//         }

//         // Tous les suivants => perte automatique
//         this.cellPicked = true;
//         this.selectBoard[i][j] = true;

//         this.resultBoard[i][j] = true; // 🔥 Affiche une mine même en perte forcée

//         this.lostRound();
//         console.log(`Pick >2 forced loss`);
//         return { status: true, info: true };
//     };
// }

// module.exports = { influenceMines };









// const { calculateWinChance } = require('../../betUtils/betUtils');

// function influenceMines(MinesRound) {
//     MinesRound.prototype.pickCell = function (i, j) {
//         if (this.selectBoard[i][j]) {
//             return { status: false, info: false };
//         }

//         this.cellPicked = true;
//         this.selectBoard[i][j] = true;

//         if (typeof this._picksCount === 'undefined') {
//             this._picksCount = 0;
//             this._firstPickDone = false;

//             // 💡 Log initial : état du plateau
//             const totalCases = this.rows * this.cols;
//             const maxDiamonds = totalCases - this.minesCount;
//             const maxEmptySpaces = totalCases - this.minesCount - maxDiamonds;

//             console.log(`--- Initial Board State ---`);
//             console.log(`Total cases: ${totalCases}`);
//             console.log(`Mines: ${this.minesCount}`);
//             console.log(`Max diamonds possible: ${maxDiamonds}`);
//             console.log(`Max empty spaces possible: ${maxEmptySpaces}`);
//         }

//         this._picksCount++;

//         if (!this._firstPickDone) {
//             this._firstPickDone = true;
//             this._nextChance = calculateWinChance(this.betAmount, this.coinType.coinType);
//         }

//         const chance = this._nextChance;
//         const r = Math.random();
//         const win = r < chance;

//         if (win) {
//             this.diamondCount++;
//             this.currentPayout = this.nextPayout;
//             this.nextPayout = this.generateNextMultiplier(this.minesCount, this.diamondCount);

//             // 💎 Ajouter un diamant supplémentaire dans une case vide aléatoire
//             const possibleDiamondPositions = [];
//             for (let row = 0; row < this.rows; row++) {
//                 for (let col = 0; col < this.cols; col++) {
//                     if (!this.selectBoard[row][col] && !this.resultBoard[row][col]) {
//                         possibleDiamondPositions.push([row, col]);
//                     }
//                 }
//             }

//             if (possibleDiamondPositions.length > 0) {
//                 const randomIndex = Math.floor(Math.random() * possibleDiamondPositions.length);
//                 const [diamondRow, diamondCol] = possibleDiamondPositions[randomIndex];

//                 this.resultBoard[diamondRow][diamondCol] = 'diamond'; // valeur spécifique pour affichage
//                 this.selectBoard[diamondRow][diamondCol] = true;
//             }

//             return { status: true, info: false };
//         } else {
//             this.minesCount = Math.max(0, this.minesCount - 1);
//             this.resultBoard[i][j] = true;

//             const possibleMinePositions = [];
//             for (let row = 0; row < this.rows; row++) {
//                 for (let col = 0; col < this.cols; col++) {
//                     if (!this.selectBoard[row][col] && !this.resultBoard[row][col]) {
//                         possibleMinePositions.push([row, col]);
//                     }
//                 }
//             }

//             if (possibleMinePositions.length > 0) {
//                 const randomIndex = Math.floor(Math.random() * possibleMinePositions.length);
//                 const [mineRow, mineCol] = possibleMinePositions[randomIndex];

//                 this.resultBoard[mineRow][mineCol] = true;
//             }

//             this.lostRound();

//             return { status: true, info: true };
//         }
//     };
// }

// module.exports = { influenceMines };



const { v4: uuidv4 } = require('uuid');
const { generateMinesHash, randomNumber, factorial } = require('../../helper/mainHelper');
const { RoundResult } = require('../constant');

const MinMinesCount = 2;
const BoardRows = 5;
const BoardCols = 5;

module.exports = class MinesRound {
    roundNumber;
    roundResult;
    roundDate;
    minesCount;
    diamondCount;
    userId;
    betAmount;
    serverSeed;
    clientSeed;
    resultBoard;
    selectBoard;
    currentPayout;
    nextPayout;
    cellPicked;
    isFinished;

    constructor(data) {
        this.initMinesData(data);
    }

    initMinesData(data) {
        this.roundNumber = uuidv4();
        this.roundResult = RoundResult.none;
        this.roundDate = new Date();
        this.minesCount = data.minesCount;
        this.diamondCount = 0;
        this.userId = data.userId;
        this.betAmount = data.betAmount;
        this.coinType = data.coinType;
        this.serverSeed = data.serverSeed;
        this.clientSeed = data.clientSeed;
        this.cellPicked = false;
        this.isFinished = false;
        this.currentPayout = 1;
        this.nextPayout = this.generateNextMultiplier(this.minesCount, this.diamondCount + 1);
        this.resultBoard = this.generateResultBoard();
        this.selectBoard = Array.from(Array(BoardRows), () => Array(BoardCols).fill(false));
    }

    generateResultBoard() {
        let board = Array.from(Array(BoardRows), () => Array(BoardCols).fill(false));

        let randomIndices = [];
        while (randomIndices.length < this.minesCount) {
            const randomIndex = randomNumber(BoardCols * BoardRows);
            if (!randomIndices.includes(randomIndex)) {
                randomIndices.push(randomIndex);
            }
        }
        for (const index of randomIndices) {
            const row = Math.floor(index / BoardRows);
            const col = index % BoardCols;
            board[row][col] = true;
        }
        return board;
    }

    generatePayout(minesCount) {
        return PayoutList[minesCount - MinMinesCount];
    }

    payoutRound() {
        if (!this.isFinished) {
            this.roundResult = RoundResult.payout;
            this.isFinished = true;
        }
    }

    finishRound() {
        if (!this.isFinished) {
            this.roundResult = RoundResult.finish;
            this.isFinished = true;
        }
    }

    lostRound() {
        if (!this.isFinished) {
            this.roundResult = RoundResult.lost;
            this.isFinished = true;
        }
    }

    getFinished() {
        return this.isFinished;
    }

    getCellPicked() {
        return this.cellPicked;
    }

    isOwner(userId) {
        return this.userId === userId;
    }

    pickCell(i, j) {
        this.cellPicked = true;
        this.selectBoard[i][j] = true;
        let cellInfo = this.resultBoard[i][j];
        if (!cellInfo) {
            this.diamondCount = this.diamondCount + 1;
            this.currentPayout = this.nextPayout;
            this.nextPayout = this.generateNextMultiplier(this.minesCount, this.diamondCount + 1);
        }
        return { status: true, info: cellInfo };
    }

    generateNextMultiplier(mines, diamond) {
        if ((mines + diamond) > (BoardCols * BoardRows))
            return 0;

        let houseEdge = 0.01;
        return Number(Number((1 - houseEdge) * this.nCr(25, diamond) / this.nCr(25 - mines, diamond)).toFixed(2));
    }

    nCr(n, r) {
        return factorial(n) / factorial(r) / factorial(n - r);
    }
}