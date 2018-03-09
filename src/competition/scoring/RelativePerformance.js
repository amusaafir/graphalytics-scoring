const _ = require('lodash');
const Scoring = require('./Scoring');
const UnknownValue = require('../../benchmark/UnknownValue')

/**
 * Scoring scheme for the RelativePerformance competition.
 */
class RelativePerformance extends Scoring {
    constructor() {
        super();
    }

    /**
     * Computes ths scores for the algorithm table.
     * @param metric
     * @param availablePADs
     * @param algorithmTable
     * @returns {algorithmTable} - Including the scores (along the values).
     */
    computeAlgorithmTableScore(metric, availablePADs, algorithmTable) {
        _.forEach(availablePADs.datasets, dataset => {
            // Values of a single (dataset) column of an algorithm table.
            let values = this.getAllValuesFromDatasetColumn(algorithmTable, dataset);

            if (_.isEmpty(values))
                return;

            // Determine if the metric where the algorithm table belongs to is better if it is higher.
            if (metric.isHigherValueBetter()) {
                this.matchHigherValIsBetter(algorithmTable, values, dataset);
            } else {
                this.matchLowerValIsBetter(algorithmTable, values, dataset);
            }

        });

        // Compute the total score column for the algorithm table.
        this.computeTotalScore(algorithmTable);

        return algorithmTable;
    }

    /**
     * Take the highest observed value max and map the values in range [0,max] to scores in range [0, 1].
     * @param tableRows
     * @param values
     * @param dataset
     */
    matchHigherValIsBetter(tableRows, values, dataset) {
        let maxVal = _.max(values);

        _.forEach(tableRows, row => {
            if (!(row.datasets[dataset].value == UnknownValue)) {
                row.datasets[dataset].score = Number(row.datasets[dataset].value) / maxVal;
            }
        });
    }

    /**
     * Take the lowest observed value per column min, take the multiplicative inverse (i.e. 1/value)
     * and map the resulting values in range [0, 1/min] to scores in range [0, 1].
     * @param tableRows
     * @param values
     * @param dataset
     */
    matchLowerValIsBetter(tableRows, values, dataset) {
        let minVal = _.min(values);

        _.forEach(tableRows, row => {
            if (!(row.datasets[dataset].value == UnknownValue)) {
                row.datasets[dataset].score = 1 / Number(row.datasets[dataset].value) / (1 / minVal);
            }
        });
    }

    /**
     * Removes any unknown value.
     * @param values
     * @returns {Array}
     */
    removeUnknownValues(values) {
        return _.filter(values, value => {
            return value >= 0;
        });
    }

    /**
     * Obtains the values for a single dataset (column).
     * @param tableRows
     * @param dataset
     * @returns {Array}
     */
    getAllValuesFromDatasetColumn(tableRows, dataset) {
        let datasetsPerPlatform = _.map(tableRows, row => {
            return row.datasets;
        });

        let valuesForDataset = _.map(_.map(datasetsPerPlatform, dataset), 'value');

        return this.removeUnknownValues(valuesForDataset);
    }
}

module.exports = RelativePerformance;