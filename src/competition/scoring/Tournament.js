const _ = require('lodash');
const Scoring = require('./Scoring');
const UnknownValue = require('../../benchmark/UnknownValue');

/**
 * Scoring scheme for the Tournament competition.
 */
class Tournament extends Scoring {
    constructor() {
        super();
        this.score = {
            winner: 1,
            loser: 0,
            draw: 0.5
        }
    }

    /**
     * Computes ths scores for the algorithm table.
     * @param metric
     * @param availablePADs
     * @param tableRows
     * @returns {*}
     */
    computeAlgorithmTableScore(metric, availablePADs, tableRows) {
        let tableRowsArray = _.values(tableRows);

        _.forEach(availablePADs.datasets, dataset => {
            for (let i = 0; i < tableRowsArray.length; i++) {
                for (let p = (i+1); p < tableRowsArray.length; p++) {
                    let cellA = tableRowsArray[i].datasets[dataset];
                    let cellB = tableRowsArray[p].datasets[dataset];

                    // Determine if the metric where the algorithm table belongs to is better if it is higher.
                    if (metric.isHigherValueBetter()) {
                        this.matchHigherValIsBetter(cellA, cellB);
                    } else {
                        this.matchLowerValIsBetter(cellA, cellB);
                    }
                }
            }
        });

        this.computeTotalScore(tableRows);

        return tableRows;
    }

    /**
     * Assign points to the cell that has a higher value.
     * @param cellA
     * @param cellB
     */
    matchHigherValIsBetter(cellA, cellB) {
        let cellValA = cellA.value;
        let cellValB = cellB.value;

        if (cellValA > cellValB) {
            cellA.score += this.score.winner;
        } else if (cellValA < cellValB) {
            cellB.score += this.score.winner;
        } else {
            // In case both values are unknown, don't assign any points.
            if (cellValA == UnknownValue && cellValB == UnknownValue) {
                return;
            }

            cellA.score += this.score.draw;
            cellB.score += this.score.draw;
        }
    }

    /**
     * Assign points to the cell that has a lower value.
     * @param cellA
     * @param cellB
     */
    matchLowerValIsBetter(cellA, cellB) {
        let cellValA = cellA.value;
        let cellValB = cellB.value;

        if (cellValA == UnknownValue)
            cellValA = Number.MAX_SAFE_INTEGER;

        if (cellValB == UnknownValue)
            cellValB = Number.MAX_SAFE_INTEGER;

        if (cellValA > cellValB) {
            cellB.score += this.score.winner;
        } else if (cellValA < cellValB) {
            cellA.score += this.score.winner;
        } else {
            // In case both values are unknown, don't assign any points.
            if (cellValA == Number.MAX_SAFE_INTEGER && cellValB == Number.MAX_SAFE_INTEGER) {
                return;
            }

            cellA.score += this.score.draw;
            cellB.score += this.score.draw;
        }
    }

}

module.exports = Tournament;