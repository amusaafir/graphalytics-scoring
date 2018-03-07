const _ = require('lodash');

/**
 * This class represents a single (benchmark) result file.
 * An instance of this class contains only the relevant information which is required to compute the scoring of for
 * a given type of competition.
 */
class BenchmarkResultsFile {
    /**
     * Declare and initialize the resultsFile.
     * @param resultsFile - JSON of the (benchmark) results file.
     */
    constructor(resultsFile) {
        this.resultsFile = resultsFile;
    }

    /**
     * Get the relevant data from the results file.
     *
     * @returns {id: string, jobs: Array, runs: Array, scale: string, platform: string, datasets: Array, algorithms: Array}
     */
    getDetails() {
        return {
            id: this.getId(),
            pricing: this.getPricing(),
            jobs: this.getJobs(),
            runs: this.getRuns(),
            scale: this.getScale(),
            platform: this.getPlatform(),
            datasets: this.getUniqueDatasets(),
            algorithms: this.getUniqueAlgorithms()
        };
    }

    /**
     *
     * @param {string} - resultsFile.
     * @returns {string} - Target scale of the result.
     */
    getScale() {
        let scale = this.resultsFile['benchmark']['target_scale'];

        if (scale)
            return scale;

        console.error('Result %s doesn\'t contain target_scale property.', this.resultsFile.id);
    }

    /**
     * @returns {string} - The platform acronym.
     */
    getPlatform() {
        let platformAcronym = this.resultsFile['system']['platform']['acronym'];

        if (platformAcronym)
            return platformAcronym;

        console.error('Results %s doesn\'t contain required platform details.', this.resultsFile.id);
    }

    /**
     * Obtains the (unique) names of the set of datasets used from the results file.
     * @param resultsFile - Benchmark results file
     * @returns {Array} - Dataset names
     */
    getUniqueDatasets() {
        let jobs = _.values(this.resultsFile['result']['jobs']);

        return _.uniq(_.map(jobs, 'dataset'));
    }

    /**
     * Obtains the (unique) names of the algorithms used from the results file.
     * @param resultsFile - Benchmark results file
     * @returns {Array} - Algorithm names
     */
    getUniqueAlgorithms() {
        let jobs = _.values(this.resultsFile['result']['jobs']);

        return _.uniq(_.map(jobs, 'algorithm'));
    }

    /**
     * @returns {Array} - Runs where each run contains TM, TP and TL values.
     */
    getRuns() {
        let runs = this.resultsFile['result']['runs'];

        if (runs)
            return runs;

        console.error('Results %s doesn\'t contain any runs.', this.resultsFile.id);
    }

    /**
     * @returns {Array} - Jobs where each job contains the algorithm and dataset and a reference
     * to the run.
     */
    getJobs() {
        let jobs = this.resultsFile['result']['jobs'];

        if (jobs)
            return jobs;

        console.error('Results %s doesn\'t contain any jobs.', this.resultsFile.id);
    }

    /**
     * @returns {string} - Id of the benchmark result.
     */
    getId() {
        let id = this.resultsFile['id'];

        if (id)
            return id;

        console.error('No id exists for a given platform.');
    }

    /**
     *
     * @returns {*} - Pricing of the benchmark.
     */
    getPricing() {
        let pricing = this.resultsFile['system']['pricing'];

        if (pricing)
            return pricing;

        console.info('No pricing set for platform %s - using 0 for pricing now.', this.resultsFile['id']);

        return 0;
    }
}

module.exports = BenchmarkResultsFile;