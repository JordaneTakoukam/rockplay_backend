// mine_influence.js
const { calculateWinChance } = require('../../betUtils/betUtils');

function influenceMines(MinesRound) {
    // Override pickCell
    MinesRound.prototype.pickCell = function (i, j) {
        // Premier clic
        if (!this._firstPickDone) {
            this._firstPickDone = true;

            const chance = calculateWinChance(this.betAmount, this.coinType.coinType);
            this._nextChance = chance;

            const r = Math.random();
            const win = r < chance;

            this.cellPicked = true;
            this.selectBoard[i][j] = true;

            if (win) {
                this.diamondCount++;
                this.currentPayout = this.nextPayout;
                this.nextPayout = this.generateNextMultiplier(this.minesCount, this.diamondCount + 1);
            } else {
                this.resultBoard[i][j] = true; // 🔥 Affiche une mine
                this.lostRound();
            }

            console.log(`First pick, chance=${chance}, rand=${r}, win=${win}`);
            return { status: true, info: !win };
        }

        // Deuxième clic
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
                this.resultBoard[i][j] = true; // 🔥 Affiche une mine
                this.lostRound();
            }

            console.log(`Second pick, chance=${chance}, rand=${r}, win=${win}`);
            return { status: true, info: !win };
        }

        // Tous les suivants => perte automatique
        this.cellPicked = true;
        this.selectBoard[i][j] = true;

        this.resultBoard[i][j] = true; // 🔥 Affiche une mine même en perte forcée

        this.lostRound();
        console.log(`Pick >2 forced loss`);
        return { status: true, info: true };
    };
}

module.exports = { influenceMines };
