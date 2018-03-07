const _ = require('lodash');

/**
 * Represents the ranking table in a single metric.
 */
class RankingTable {
    /**
     * @param algorithmTables - Used to compute the total score per algorithm.
     * @param availablePADs - Used to compute the total score per algorithm.
     */
    constructor(algorithmTables, availablePADs) {
        this.algorithmTables = algorithmTables;
        this.availablePADs = availablePADs;
    }

    /**
     * Construct the RankingTable.
     * @returns {Array}
     */
    create() {
        let rows = [];

        // Create a row for each platform.
        _.forEach(_.keys(this.availablePADs['platforms']), platform => {
            rows.push(this.createRow(platform));
        });

        // Sort the overall ranking table.
        rows = _.orderBy(rows, ['totalScore'], ['desc']);

        // Add ranking.
        this.addTrophies(rows);

        return rows;
    }

    /**
     * Creates a row for a given platform.
     * @param platform
     * @returns {{ranking: string, platform: *, totalScore: number, totalAlgorithmScore: {}}}
     */
    createRow(platform) {
        let row = {
            ranking: '',
            platform: platform,
            totalScore: 0,
            totalAlgorithmScore: {}
        };

        // For each algorithm, collect the score that the platform has using the algorithm tables.
        _.forEach(this.availablePADs['algorithms'], algorithm => {
            let totalAlgorithmScore = this.algorithmTables[algorithm].rows[platform].totalScore;
            row.totalAlgorithmScore[algorithm] = totalAlgorithmScore;
            row.totalScore += totalAlgorithmScore;
        });

        return row;
    }

    /**
     * Determine whether a platform obtains a trophy.
     *
     * @param resultRows
     */
    addTrophies(resultRows) {
        const winner = 'trophy', draw = 'draw', drawWinner = 'draw-trophy';
        const thirdPlace = 2;

        for (let row = 0; row < resultRows.length; row++) {
            const hasNextRowEqualScore = (row !== resultRows.length - 1 && resultRows[row].totalScore === resultRows[row + 1].totalScore);
            if (hasNextRowEqualScore) {
                resultRows[row].ranking = draw;
                resultRows[row + 1].ranking = draw;
            }

            const hasScoreEqualToThirdRow = row > thirdPlace && resultRows[row].totalScore === resultRows[thirdPlace].totalScore;
            if (hasScoreEqualToThirdRow) {
                resultRows[row].ranking = drawWinner;
            }

            const isInTopThree = row <= thirdPlace && resultRows[row].ranking !== draw;
            if (isInTopThree) {
                resultRows[row].ranking = winner;
            }
        }
    }
}

module.exports = RankingTable;