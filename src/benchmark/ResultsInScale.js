const allDatasets = require('../../assets/dataset_meta.json');
const _ = require('lodash');

/**
 * An instance of this class contains all the results data in a single (target) scale, specified by
 * the 'platformResults' property. Furthermore, the 'availablePADs' property contains all the PAD's that are used
 * in this particular scale.
 */
class ResultsInScale {
    constructor(results) {
        this.platformResults = results['platformResults'];

        // Collect the Platform, Algorithm and Datasets (PAD) and add it to the current scale result.
        this.addUniquePADTriangle();
    }

    /**
     * Add all the platforms, algorithms and datasets (PAD) that are used in a particular scale to the parent.
     * This allows us to see which platforms, algorithms and datasets are used directly for an entire scale.
     * @param scale
     */
    addUniquePADTriangle() {
        // Get the all the unique PAD triangle data for the scale.
        let PAD = this.getUniquePADTriangle();

        // Add the unique platforms, algorithms and datasets that are used in this scale to the parent result data.
        this.availablePADs = {};
        this.availablePADs['platforms'] = PAD.platforms;
        this.availablePADs['algorithms'] = PAD.algorithms;
        this.availablePADs['datasets'] = PAD.datasets;
    }

    /**
     * Collect all the Platform, Algorithm and Dataset (PAD triangle) data for a given scale.
     * @returns {{platforms: Array, algorithms: Array, datasets: Array}} - PAD data
     */
    getUniquePADTriangle() {
        let PAD = {
            platforms: [],
            algorithms: [],
            datasets: []
        };

        // Collect all the platforms used in the results of the given scale.
        PAD.platforms = _.mapValues(this.platformResults, platformResult => {
            return {name: platformResult.platform};
        });

        // For each platform result in the given scale, collect the (unique) algorithms and datasets that are used.
        _.forEach(_.values(this.platformResults), (platformResult) => {
            PAD.datasets = _.union(PAD.datasets, platformResult['datasets']);
            PAD.algorithms = _.union(PAD.algorithms, platformResult['algorithms']);
        });

        // Sort algorithms and datasets.
        PAD.algorithms = PAD.algorithms.sort();
        PAD.datasets = this.sortDatasetsByGraphSize(PAD.datasets);

        return PAD;
    }

    /**
     * Sort the datasets by size, ascending. This is useful since we want to display the datasets column of every
     * AlgorithmTable using the order by their size.
     *
     * @param datasetsInScale
     * @returns {Array}
     */
    sortDatasetsByGraphSize(datasetsInScale) {
        // Sort all the datasets (in Graphalytics) from the assets file by their size.
        let allDatasetsSorted = _.sortBy(allDatasets, dataset => {
            return Number(dataset.vertex_size) + Number(dataset.edge_size);
        });

        // Select only the datasets that are in this target scale.
        let selectedDatasetsSorted = _.filter(allDatasetsSorted, dataset => {
            return _.includes(datasetsInScale, dataset.file_name);
        });

        // Only return the names of the datasets.
        return _.map(selectedDatasetsSorted, dataset => {
            return dataset.file_name;
        });
    }
}

module.exports = ResultsInScale;