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

















//
//
//
// //

const { calculateWinChance } = require('../../betUtils/betUtils');

function influenceMines(MinesRound) {
    MinesRound.prototype.pickCell = function (i, j) {
        if (this.selectBoard[i][j]) {
            console.log(`Cell already picked: [${i}, ${j}]`);
            return { status: false, info: false };
        }

        this.cellPicked = true;
        this.selectBoard[i][j] = true;

        if (typeof this._picksCount === 'undefined') {
            this._picksCount = 0;
            this._firstPickDone = false;
        }
        this._picksCount++;

        if (!this._firstPickDone) {
            this._firstPickDone = true;
            this._nextChance = calculateWinChance(this.betAmount, this.coinType.coinType);
        }
        const chance = this._nextChance;

        const r = Math.random();
        const win = r < chance;

        // Fonction qui compte les cases libres (ni pickées, ni mines révélées)
        const countEmptySpaces = () => {
            let count = 0;
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (!this.selectBoard[row][col] && !this.resultBoard[row][col]) {
                        count++;
                    }
                }
            }
            return count;
        };

        if (win) {
            this.diamondCount++;
            this.currentPayout = this.nextPayout;
            this.nextPayout = this.generateNextMultiplier(this.minesCount, this.diamondCount);

            const emptySpaces = countEmptySpaces();
            const totalCases = this.rows * this.cols;
            const totalCalc = this.diamondCount + this.minesCount + emptySpaces;
            console.log(`Pick #${this._picksCount} [${i}, ${j}] WIN — diamonds=${this.diamondCount}, emptySpaces=${emptySpaces}, chance=${chance}, rand=${r}`);
            console.log(`Total cases: ${totalCases}, diamonds + mines + emptySpaces = ${totalCalc}`);

            return { status: true, info: false };
        } else {
            // Perdu => décrémenter minesCount pour la mine révélée
            this.minesCount = Math.max(0, this.minesCount - 1);

            // Marquer la case jouée comme mine révélée (perdu ici)
            this.resultBoard[i][j] = true;

            // Trouver toutes les cases vides possibles (cases non jouées et sans mine révélée)
            const possiblePositions = [];
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (!this.selectBoard[row][col] && !this.resultBoard[row][col]) {
                        possiblePositions.push([row, col]);
                    }
                }
            }

            if (possiblePositions.length > 0) {
                // Choisir une case au hasard parmi les cases vides pour remplacer par une mine forcée
                const randomIndex = Math.floor(Math.random() * possiblePositions.length);
                const [mineRow, mineCol] = possiblePositions[randomIndex];

                // Placer la mine forcée
                this.resultBoard[mineRow][mineCol] = true;

                console.log(`Forced mine placed at [${mineRow}, ${mineCol}]`);
            } else {
                console.log('No position available to place forced mine.');
            }

            this.lostRound();

            const emptySpaces = countEmptySpaces();
            const totalCases = this.rows * this.cols;
            const totalCalc = this.diamondCount + this.minesCount + emptySpaces;
            console.log(`Pick #${this._picksCount} [${i}, ${j}] LOSS — diamonds=${this.diamondCount}, emptySpaces=${emptySpaces}, chance=${chance}, rand=${r}, minesCount=${this.minesCount}`);
            console.log(`Total cases: ${totalCases}, diamonds + mines + emptySpaces = ${totalCalc}`);

            return { status: true, info: true };
        }
    };
}

module.exports = { influenceMines };
