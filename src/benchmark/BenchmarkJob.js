const _ = require('lodash');
const math = require('mathjs');
const datasets = require('../../assets/dataset_meta.json');
const UnknownValue = require('./UnknownValue.js');

/**
 * An instance of this class contains a single benchmark job.
 * An instance of this class is obtained by filtering the jobs using the specified platform, algorithm and
 * dataset in the PADValuesCollector class.
 */
class BenchmarkJob {

    /**
     * @param id - Benchmark job ID
     * @param jobRuns - List of benchmark runs in the job.
     * @param platform - Platform (containing the results of the runs and pricing) of the job.
     * @param dataset - Dataset of the job.
     */
    constructor(id, jobRuns, platform, dataset) {
        this.id = id;
        this.jobRuns = jobRuns;
        this.platformRuns = platform.runs;
        this.platformPricing = platform.pricing;
        this.dataset = dataset;

        this.setValuesPerMetric()
    }

    /**
     * Set the values pet metric.
     */
    setValuesPerMetric() {
        // Obtain the times from the benchmark runs.
        let {loadTimes, makespans, processingTimes} = this.getTimeValues();

        // TL
        this.loadTime = this.computeMedian(loadTimes);

        // TM
        this.makespan = this.computeMedian(makespans);

        // TP
        this.processingTime = this.computeMedian(processingTimes);

        // EVPS
        this.edgesVerticesPerSecond = this.computeEVPS(this.processingTime, this.dataset);

        // PPP
        this.pricePerUnit = this.computePPP(this.edgesVerticesPerSecond);
    }

    /**
     * Get the time values by iterating through the runs of the job.
     *
     * @returns {{loadTimes: Array, makespans: Array, processingTimes: Array}}
     */
    getTimeValues() {
        let loadTimes = [];
        let makespans = [];
        let processingTimes = [];

        _.forEach(this.jobRuns, (runId) => {
            let run = this.platformRuns[runId];

            loadTimes.push(run['load_time']);
            makespans.push(run['makespan']);
            processingTimes.push(run['processing_time']);
        });

        return {loadTimes, makespans, processingTimes};
    }

    /**
     * Computes the median specifically for the time values as it filters any negative values and
     * returns an unknown value in case the list of time values is empty.
     * @param timeValues
     * @returns {median}
     */
    computeMedian(timeValues) {
        // Remove any value that is not found (-1 or NaN).
        timeValues = this.removeNegativeValues(timeValues);

        return (_.isEmpty(timeValues)) ? UnknownValue : math.median(timeValues);
    }

    /**
     * Compute the PPP. Currently not used in any competition, so return the unknown value to skip this entirely.
     *
     * @param edgesVerticesPerSecond
     * @returns {*}
     */
    computePPP(edgesVerticesPerSecond) {
        // return (edgesVerticesPerSecond == UnknownValue) ? UnknownValue : this.platformPricing / this.edgesVerticesPerSecond;

        // Temporarily overwrite PPP, since we are not calculating this at the moment.
        return UnknownValue;
    }

    /**
     * Computes the EVPS.
     *
     * @param processingTime
     * @param dataset
     * @returns {number}
     */
    computeEVPS(processingTime, dataset) {
        // Avoid division by zero  if the processing time is 0.
        if (processingTime === 0) {
            console.error('Processing time equals 0.');
            processingTime += 0.000001;
        }

        return (processingTime == UnknownValue) ? UnknownValue : (Number(datasets[dataset]['vertex_size']) + Number(datasets[dataset]['edge_size'])) / processingTime;
    }

    /**
     * Remove any negative values and invalid values (such as NaN).
     *
     * @param values
     * @returns {Array} - values.
     */
    removeNegativeValues(values) {
        return _.filter(values, (value) => {
            return value >= 0;
        });
    }
}

module.exports = BenchmarkJob;