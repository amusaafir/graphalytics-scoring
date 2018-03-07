const _ = require('lodash');
const AlgorithmTable = require('./AlgorithmTable');
const RankingTable = require('./RankingTable');

/**
 * Represents the results (values + scores) for a single metric and scale.
 */
class MetricResult {
    constructor(scoring, metric, padValuesInScale, availablePADs) {
        this.scoring = scoring;
        this.metric = metric;
        this.padValuesInScale = padValuesInScale;
        this.availablePADs = availablePADs;
    }

    /**
     * Creates the algorithm tables and ranking table for the current metric and target scale.
     *
     * @returns {{rankingTable: *, algorithmTables: *}}
     */
    getResults() {
        // Create the algorithm tables.
        let algorithmTables = this.createAlgorithmTables();
        // Create the ranking table using the algorithm tables.
        let rankingTable = new RankingTable(algorithmTables, this.availablePADs).create();

        // Sort the algorithm tables after the creation of the ranking table, since we don't have to bother
        // any longer with selecting data directly from an object version of AlgorithmTables. This can be done
        // however when creating the algorithm tables, but we should keep in mind that we'll need the keys of
        // the algorithms returned as well.
        this.sortAlgorithmTablesByScore(algorithmTables);

        // Create the metric results object, containing the ranking and algorithm tables.
        let metricResults = {
            rankingTable: rankingTable,
            algorithmTables: algorithmTables
        };

        return metricResults;
    }

    /**
     * Create all the algorithm tables inside a metric.
     * @returns {{algorithmTable}} - Tables are accessible by using the name of the algorithm as key.
     */
    createAlgorithmTables() {
        let algorithmTables = {};

        _.forEach(this.availablePADs['algorithms'], (algorithm) => {
            this.createAlgorithmTable(algorithm, algorithmTables);
        });

        return algorithmTables;
    }

    /**
     * Create a single AlgorithmTable and add its data directly into the object with the algorithm name as key.
     * @param algorithm
     * @param algorithmTables
     */
    createAlgorithmTable(algorithm, algorithmTables) {
        // Construct the algorithm table and add the values only.
        let algorithmTable = new AlgorithmTable(this.metric, this.padValuesInScale[algorithm], this.availablePADs).create();

        // Compute the scores of the algorithm table.
        let algorithmTableWithScores = this.scoring.computeAlgorithmTableScore(this.metric, this.availablePADs, algorithmTable);

        // Select the highest score (from all the platforms) per dataset.
        let maxScorePerDataset = this.getMaxScorePerDataset(algorithmTableWithScores);

        // Construct the algorithm table data directly.
        algorithmTables[algorithm] = {
            maxScorePerDataset: maxScorePerDataset,
            rows: algorithmTableWithScores
        };
    }

    /**
     * Sorts the rows of each algorithm table (descending).
     * @param algorithmTables
     */
    sortAlgorithmTablesByScore(algorithmTables) {
        _.forEach(this.availablePADs['algorithms'], algorithm => {
            algorithmTables[algorithm]['rows'] = _.orderBy(algorithmTables[algorithm]['rows'], ['totalScore'], ['desc']);
        });
    }

    /**
     * Get the maximum score, per dataset, in a single algorithm table from all the platforms.
     * @param algorithmTable
     * @returns {{object}} - With as keys the datasets and as value its maximum score from all the platforms.
     */
    getMaxScorePerDataset(algorithmTable) {
        let maxScorePerDataset = {};

        _.forEach(this.availablePADs['datasets'], dataset => {
            maxScorePerDataset[dataset] = _.max(_.map(algorithmTable, platform => { return platform['datasets'][dataset].score; }));
        });

        return maxScorePerDataset;
    }
}

module.exports = MetricResult;