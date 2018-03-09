const _ = require('lodash');
const BenchmarkJob = require('./BenchmarkJob')
const UnknownValue = require('./UnknownValue.js');

/**
 * Collects Platform, Algorithm, Dataset (PAD) values for the given ResultsInScale.
 * The actual collection is placed in the order of: Algorithm -> Dataset -> Platform as this is more convenient
 * to obtain the results from later.
 */
class PADValuesCollector {
    constructor(resultsInScale) {
        this.resultsInScale = resultsInScale;
    }

    /**
     * Collect metric values for each PAD combination.
     *
     *  @returns {PAD values for the ResultsInScale}
     */
    collect() {
        // This object shall keep our PAD values in the order of padValues[algorithm][platformId][dataset].
        // Given the specific PAD as keys, the value of each metric can be obtained.
        let padValues = {};

        // Iterate through all the available algorithms, platforms and datasets in a single target scale.
        // Notice that we're keeping track of them by inserting each as key to the padValues object.
        _.forEach(this.resultsInScale.availablePADs.algorithms, (algorithm) => {
            padValues[algorithm] = {};

            _.forEach(this.resultsInScale.platformResults, (platform) => {
                padValues[algorithm][platform.id] = {};

                _.forEach(this.resultsInScale.availablePADs.datasets, (dataset) => {
                    // Pass our padValues object as it will collect the relevant values per metric.
                    this.collectPADValues(platform, algorithm, dataset, padValues);
                });
            });
        });

        return padValues;
    }

    /**
     *
     * @param platform - contains platformId, jobs and runs.
     * @param algorithm
     * @param dataset
     * @param values - Holds the metric values per PAD.
     */
    collectPADValues(platform, algorithm, dataset, padValues) {
        let platformId = platform.id;
        let valuesPerMetric = {
            TL: UnknownValue,
            TM : UnknownValue,
            TP: UnknownValue,
            EVPS: UnknownValue,
            PPP: UnknownValue
        };

        // Obtain the benchmark job.
        let benchmarkJob = this.getBenchmarkJob(platform, algorithm, dataset);

        // In case the job is not found, add the 'not found' values to the values object.
        if (!benchmarkJob) {
            console.log('Job not found for PAD: %s, %s, %s.', platformId, algorithm, dataset);
            padValues[algorithm][platformId][dataset] = valuesPerMetric;

            return;
        }

        // Collect the values from the benchmark job (and its runs inclusively).
        valuesPerMetric.TL = benchmarkJob.loadTime;
        valuesPerMetric.TM = benchmarkJob.makespan;
        valuesPerMetric.TP = benchmarkJob.processingTime;
        valuesPerMetric.EVPS = benchmarkJob.edgesVerticesPerSecond;
        valuesPerMetric.PPP = benchmarkJob.pricePerUnit;

        // Insert these values for a single platform + algorithm + dataset
        padValues[algorithm][platformId][dataset] = valuesPerMetric;
    }

    /**
     *
     * @param platform
     * @param algorithm
     * @param dataset
     * @returns {BenchmarkJob}
     */
    getBenchmarkJob(platform, algorithm, dataset) {
        // Find the job from the given platform, algorithm and dataset.
        let job = _.find(platform.jobs, job => {
            return job.algorithm === algorithm && job.dataset === dataset;
        });

        // In case it is empty, it does not exist and we'll return null as the caller function will handle
        // the missing values for us.
        if (_.isEmpty(job)) {
            return null;
        }

        // If it is found, return it as BenchmarkJob by extracting its relevant (id and runs) data.
        return new BenchmarkJob(job.id, job.runs, platform, dataset);
    }
}

module.exports = PADValuesCollector;