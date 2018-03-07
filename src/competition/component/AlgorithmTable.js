const _ = require('lodash');
const AlgorithmTableCell = require('./AlgorithmTableCell');

/**
 * Represents a single algorithm table in a particular metric.
 */
class AlgorithmTable {

    /**
     *
     * @param metric
     * @param valuesPD - Pre-selected data of the platform and dataset values.
     * @param availablePADs
     */
    constructor(metric, valuesPD, availablePADs) {
        this.metric = metric;
        this.valuesPD = valuesPD;
        this.availablePADs = availablePADs;
    }

    /**
     * Creates the table rows without their scores.
     * @returns {{rows}} - Algorithm table rows.
     */
    create() {
        let rows = {};

        _.forEach(_.keys(this.availablePADs.platforms), platform => {
            rows[platform] = this.createRow(platform);
        });

        return rows;
    }

    /**
     * Creates a single row of the algorithm table for a given metric and the platform and dataset.
     * @param platform
     * @returns {row} - Single algorithm table row.
     */
    createRow(platform) {
        let row = {
            platform: platform,
            totalScore: 0,
            datasets: {}
        };

        // Collect the values of each dataset in the AlgorithmTableCell.
        _.forEach(this.availablePADs.datasets, dataset => {
            let value = this.valuesPD[platform][dataset][this.metric.getName()];
            let score = 0;
            row.datasets[dataset] = new AlgorithmTableCell(value, score);
        });

        return row;
    }
}

module.exports = AlgorithmTable;