const _ = require('lodash');

/**
 * Base class for the scoring scheme.
 */
class Scoring {
    constructor() {
    }

    /**
     * Implemented per competition type: computes ths scores for the algorithm table.
     */
    computeAlgorithmTableScore(rows) {
    }

    /**
     * Compute total score of a given algorithm table.
     * @param algorithmTable
     */
    computeTotalScore(algorithmTable) {
        _.forEach(algorithmTable, row => {
            let scoresInRow = _.map(row['datasets'], 'score');

            row['totalScore'] = _.sum(scoresInRow);
        });
    }
}

module.exports = Scoring;