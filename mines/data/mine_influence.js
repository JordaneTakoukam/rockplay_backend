// mine_influence.js
const { calculateWinChance } = require('../../betUtils/betUtils');

function influenceMines(MinesRound) {
    // Override pickCell
    MinesRound.prototype.pickCell = function (i, j) {
        // premier clic
        if (!this._firstPickDone) {
            this._firstPickDone = true;
            // calculer la probabilité
            const chance = calculateWinChance(this.betAmount, this.coinType.coinType);
            // conserver pour le deuxième tour
            this._nextChance = chance;

            // tirage
            const r = Math.random();
            const win = r < chance;
            this.cellPicked = true;
            this.selectBoard[i][j] = true;
            if (win) {
                this.diamondCount++;
                this.currentPayout = this.nextPayout;
                this.nextPayout = this.generateNextMultiplier(this.minesCount, this.diamondCount + 1);
            } else {
                this.lostRound();
            }
            console.log(`First pick, chance=${chance}, rand=${r}, win=${win}`);
            return { status: true, info: !win };
        }

        // deuxième clic
        if (!this._secondPickDone) {
            this._secondPickDone = true;
            const chance = this._nextChance;
            const r = Math.random();
            const win = r < chance;
            this.cellPicked = true;
            this.selectBoard[i][j] = true;
            if (win) {
                this.diamondCount++;
                this.currentPayout = this.nextPayout;
                this.nextPayout = this.generateNextMultiplier(this.minesCount, this.diamondCount + 1);
            } else {
                this.lostRound();
            }
            console.log(`Second pick, chance=${chance}, rand=${r}, win=${win}`);
            return { status: true, info: !win };
        }

        // tous les suivants => perte
        this.cellPicked = true;
        this.selectBoard[i][j] = true;
        this.lostRound();
        console.log(`Pick >2 forced loss`);
        return { status: true, info: true };
    };
}

module.exports = { influenceMines };
