const allDatasets = require('../../assets/dataset_meta.json');
const _ = require('lodash');
const config = require('../config.json');

/**
 * An instance of this class contains all the results data in a single (target) scale, specified by
 * the 'platformResults' property. Furthermore, the 'availablePADs' property contains all the PAD's that are used
 * in this particular scale.
 */
class ResultsInScale {
    constructor(results) {
        this.platformResults = results.platformResults;
        this.availablePADs = {
            platforms: null,
            algorithms: null,
            datasets: null
        };

        // Collect the Platform, Algorithm and Datasets (PAD) and add it to the current scale result.
        this.collectUniquePADs();
    }

    /**
     * Add all the platforms, algorithms and datasets (PAD) that are used in a particular scale to the parent.
     * This allows us to see which platforms, algorithms and datasets are used directly for an entire scale.
     * @returns {{platforms: Array, algorithms: Array, datasets: Array}} - PAD data
     */
    collectUniquePADs() {
        // Collect all the platforms used in the results of the given scale.
        this.availablePADs.platforms =  _.mapValues(this.platformResults, platformResult => {
            return {name: platformResult.platform};
        });

        // For each platform result in the given scale, collect the (unique) algorithms and datasets that are used.
        _.forEach(_.values(this.platformResults), (platformResult) => {
            this.availablePADs.datasets = _.union(this.availablePADs.datasets, platformResult.datasets);
            this.availablePADs.algorithms = _.union(this.availablePADs.algorithms, platformResult.algorithms);
        });

        // Remove any datasets that we do not want to take into consideration.
        this.skipUndesirablePadData();

        // Sort algorithms and datasets.
        this.sortUniquePadData();
    }

    /**
     * Skip undesirable Algorithm and Dataset data specified in the config.json file. These shall not be
     * taken into account when computing the competition results.
     *
     * TODO: Also allow platform to be skipped: to accomplish this, make sure to iterate over availablePADs.platform
     * rather than resultsScale.platforms in PADValuesCollector.
     */
    skipUndesirablePadData() {
        this.availablePADs.algorithms = this.skipUndesirableData(this.availablePADs.algorithms, config.algorithmsToSkip);
        this.availablePADs.datasets = this.skipUndesirableData(this.availablePADs.datasets, config.datasetsToSkip);
    }

    skipUndesirableData(values, undesirableValues) {
        let desirableValues = _.filter(values, value => {
            return !_.includes(undesirableValues, value);
        });

        if (_.isEmpty(desirableValues)) {
            console.error('Desirable values is empty when filtered by the following undesirable values: ');
            console.log(undesirableValues);
        }

        return desirableValues;
    }

    /**
     * Sort the unique algorithms and datasets. Notice that we do not sort the platforms as
     * they will be shuffled depending on their ranking anyway
     */
    sortUniquePadData() {
        // Sort the algorithms (alphabetic order).
        this.availablePADs.algorithms = this.availablePADs.algorithms.sort();

        // Sort the datasets by size.
        this.availablePADs.datasets = this.sortDatasetsByGraphSize();
    }

    /**
     * Sort the datasets by size, ascending. This is useful since we want to display the datasets column of every
     * AlgorithmTable using the order by their size.
     *
     * @param datasetsInScale
     * @returns {Array}
     */
    sortDatasetsByGraphSize() {
        // Sort all the datasets (in Graphalytics) from the assets file by their size.
        let allDatasetsSorted = _.sortBy(allDatasets, dataset => {
            return Number(dataset.vertex_size) + Number(dataset.edge_size);
        });

        // Select only the datasets that are in this target scale.
        let selectedDatasetsSorted = _.filter(allDatasetsSorted, dataset => {
            return _.includes(this.availablePADs.datasets, dataset.file_name);
        });

        // Only return the names of the datasets.
        return _.map(selectedDatasetsSorted, dataset => {
            return dataset.file_name;
        });
    }
}

module.exports = ResultsInScale;