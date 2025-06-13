const { v4: uuidv4 } = require('uuid');
const { generateMinesHash, randomNumber, factorial } = require('../../helper/mainHelper');
const { RoundResult } = require('../constant');
const { calculateWinChance } = require('../../betUtils/betUtils');

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

    rows;
    cols;

    constructor(data) {
        this.rows = BoardRows;
        this.cols = BoardCols;
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
        this.selectBoard = Array.from(Array(this.rows), () => Array(this.cols).fill(false));
    }

    generateResultBoard() {
        let board = Array.from(Array(this.rows), () => Array(this.cols).fill(false));

        let randomIndices = [];
        while (randomIndices.length < this.minesCount) {
            const randomIndex = randomNumber(this.rows * this.cols);
            if (!randomIndices.includes(randomIndex)) {
                randomIndices.push(randomIndex);
            }
        }
        for (const index of randomIndices) {
            const row = Math.floor(index / this.cols);  // Correction ici
            const col = index % this.cols;
            board[row][col] = true;  // true = mine
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

    // avant l'influence 
    // pickCell(i, j) {
    //     this.cellPicked = true;
    //     this.selectBoard[i][j] = true;
    //     let cellInfo = this.resultBoard[i][j]; // true = mine, false = diamant
    //     if (!cellInfo) {
    //         this.diamondCount = this.diamondCount + 1;
    //         this.currentPayout = this.nextPayout;
    //         this.nextPayout = this.generateNextMultiplier(this.minesCount, this.diamondCount + 1);
    //     }
    //     return { status: true, info: cellInfo };
    // }


    // fonction influente
    pickCell(i, j) {
        this.cellPicked = true;
        this.selectBoard[i][j] = true;

        // Correction: utiliser this.coinType directement
        const currency = this.coinType.coinType;

        // Log des détails de la partie
        console.log("\n=== DÉTAILS DE LA PARTIE ===");
        console.log(`Utilisateur: ${this.userId}`);
        console.log(`Mise: ${this.betAmount} ${currency}`);
        console.log(`Mines: ${this.minesCount}`);
        console.log(`Diamants actuels: ${this.diamondCount}`);
        console.log(`Multiplicateur actuel: ${this.currentPayout}x`);
        console.log(`Prochain multiplicateur: ${this.nextPayout}x`);
        console.log(`Cases révélées: ${this.countRevealedCells()}/${this.rows * this.cols}`);

        // Calcul du gain potentiel
        const potentialWinAmount = this.betAmount * this.nextPayout;
        console.log(`Gain potentiel: ${potentialWinAmount} ${currency}`);

        let winChance;
        let loseChance;
        try {
            // CORRECTION: calculateWinChance retourne la probabilité de GAGNER
            winChance = calculateWinChance(potentialWinAmount, currency);

            // Calcul de la probabilité de perte (inverse de la probabilité de gain)
            loseChance = 1 - winChance;

            console.log(`Chance de gain calculée: ${(winChance * 100).toFixed(2)}%`);
            console.log(`Chance de perte calculée: ${(loseChance * 100).toFixed(2)}%`);
        } catch (err) {
            console.error('Erreur dans calculateWinChance:', err);
            // Valeurs par défaut en cas d'erreur
            winChance = 0.3;
            loseChance = 0.7;
        }

        // Décision basée sur la probabilité de PERTE
        const rand = Math.random();
        const shouldLose = rand < loseChance;
        const isActuallyMine = this.resultBoard[i][j];

        console.log(`Tirage aléatoire: ${rand.toFixed(4)}`);
        console.log(`Décision: ${shouldLose ? "DEVRAIT PERDRE" : "DEVRAIT GAGNER"}`);
        console.log(`Case actuelle: ${isActuallyMine ? "MINE" : "DIAMANT"}`);

        // Ajustement dynamique du plateau
        if (shouldLose && !isActuallyMine) {
            console.log(">> Transformation: DIAMANT -> MINE");
            this.makeCellMine(i, j);
        } else if (!shouldLose && isActuallyMine) {
            console.log(">> Transformation: MINE -> DIAMANT");
            this.makeCellSafe(i, j);
        }

        // Vérification finale de la case
        const finalCellState = this.resultBoard[i][j];
        if (!finalCellState) {
            this.diamondCount++;
            this.currentPayout = this.nextPayout;
            this.nextPayout = this.generateNextMultiplier(this.minesCount, this.diamondCount + 1);
            console.log(`>> DIAMANT TROUVÉ! Nouveau multiplicateur: ${this.nextPayout}x`);
        } else {
            console.log(">> MINE TROUVÉE! Partie terminée");
        }

        console.log(`=== FIN DU TOUR ===\n`);
        return { status: true, info: finalCellState };
    }

    // Fonction utilitaire pour compter les cases révélées
    countRevealedCells() {
        let count = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.selectBoard[i][j]) count++;
            }
        }
        return count;
    }
    // Transforme une case en mine et compense ailleurs
    makeCellMine(i, j) {
        // Trouver une mine existante à transformer en diamant
        for (let x = 0; x < this.rows; x++) {
            for (let y = 0; y < this.cols; y++) {
                if (this.resultBoard[x][y] && !this.selectBoard[x][y] && (x !== i || y !== j)) {
                    this.resultBoard[x][y] = false; // Transforme en diamant
                    this.resultBoard[i][j] = true;  // Transforme en mine
                    return;
                }
            }
        }
    }

    // Transforme une mine en diamant et compense ailleurs
    makeCellSafe(i, j) {
        // Trouver un diamant existant à transformer en mine
        for (let x = 0; x < this.rows; x++) {
            for (let y = 0; y < this.cols; y++) {
                if (!this.resultBoard[x][y] && !this.selectBoard[x][y] && (x !== i || y !== j)) {
                    this.resultBoard[x][y] = true;  // Transforme en mine
                    this.resultBoard[i][j] = false; // Transforme en diamant
                    return;
                }
            }
        }
    }

    generateNextMultiplier(mines, diamond) {
        if ((mines + diamond) > (this.rows * this.cols))
            return 0;

        let houseEdge = 0.01;
        return Number(Number((1 - houseEdge) * this.nCr(this.rows * this.cols, diamond) / this.nCr(this.rows * this.cols - mines, diamond)).toFixed(2));
    }

    nCr(n, r) {
        return factorial(n) / factorial(r) / factorial(n - r);
    }
}
