const _ = require('lodash');
const yargs = require('yargs');
const TL = require('./metric/TL');
const TM = require('./metric/TM');
const TP = require('./metric/TP');
const EVPS = require('./metric/EVPS');
const PPP = require('./metric/PPP');
const ResultsInScale = require('../benchmark/ResultsInScale');
const MetricResult = require('./component/MetricResult');
const PADValuesCollector = require('../benchmark/PADValuesCollector');
const RelativePerformance = require('./scoring/RelativePerformance');
const Tournament = require('./scoring/Tournament');

/**
 * Orchestrates the process of computing the results of a competition.
 */
class Competition {
    /**
     * @param benchmarkResultsPerScale - Results of the benchmark, per scale (as key).
     */
    constructor(benchmarkResultsPerScale) {
        this.benchmarkResultsPerScale = benchmarkResultsPerScale;
        this.scoring = this.getScoringType();
    }

    /**
     * Initiates the computation of the competition results.
     *
     * @returns {{entries: {results information per scale}, resultsPerMetricScale: {contains result values and scores}}}
     */
    computeResults() {
        // This object holds the entries (available PAD's) in a single scale
        // and the actual results (PAD values + scores) for each metric per scale.
        let competitionResults = {
            entries: {},
            resultsPerMetricScale: {}
        };

        // Compute the results per scale and append the results to the competitionResults object.
        _.forEach(this.getAvailableScales(), scale => {
            this.computeResultsForScale(scale, competitionResults);
        });

        return competitionResults;
    }

    /**
     * Computes the results for a single scale.
     *
     * @param scale
     * @param competitionResults
     */
    computeResultsForScale(scale, competitionResults) {
        // Get the results for the specified scale.
        let resultsInScale = new ResultsInScale(this.benchmarkResultsPerScale[scale]);

        // Add the available PADs of this scale to the entries property with as key the scale itself.
        // This way, we can easily fetch the available PADs in a single scale.
        competitionResults.entries[scale] = resultsInScale.availablePADs;

        // Compute for the results for each metric.
        let resultsPerMetric = this.createResultsPerMetric(resultsInScale);

        // Since we want to render the results of each scale for every metric, we'll have to move
        // the results for the entire scale per metric to its corresponding metric property.
        this.moveScaleToMetricResult(resultsPerMetric, scale, competitionResults.resultsPerMetricScale);
    }

    /**
     * Obtains the scoring type of the competition based on the given commandline option.
     * @returns {Scoring type object}
     */
    getScoringType() {
        const optionName = 'scoring';

        if (yargs.argv[optionName] == 'tournament') {
            return new Tournament();
        } else if (yargs.argv[optionName] == 'relativeperformance') {
            return new RelativePerformance();
        } else {
            console.error('Unknown competition scoring type specified.');
        }
    }

    /**
     *
     * @object ScaleValuesInPad - Collect PAD values (values + scoring) in a single scale for each metric.
     * @param availablePADs
     * @returns {{}}
     */
    createResultsPerMetric(resultsInScale) {
        // Collect the benchmark PAD values (from each job/runs).
        let padValuesCollector = new PADValuesCollector(resultsInScale);
        let padValuesInScale = padValuesCollector.collect();
        let resultsPerMetric = {};

        // Iterate through the metrics and obtain the results for each.
        _.forEach(this.getMetrics(), (metric) => {
            let metricResult = new MetricResult(this.scoring, metric, padValuesInScale, resultsInScale.availablePADs);

            // Append the results to the resultsPerMetric object with as key the metric name itself.
            resultsPerMetric[metric.getName()] = metricResult.getResults();
        });

        return resultsPerMetric;
    }

    /**
     * Move the results for the entire scale per metric to its corresponding metric property, as we want
     * to obtain the results per scale inside each metric.
     *
     * @param resultsPerMetric
     * @param scale
     * @param resultsPerMetricScale
     */
    moveScaleToMetricResult(resultsPerMetric, scale, resultsPerMetricScale) {
        // Iterate through each metric.
        _.forEach(this.getMetrics(), metric => {
            let metricName = metric.getName();

            // Create the metric object that holds the results per scale in case it has not been created yet.
            if (!resultsPerMetricScale[metricName])
                resultsPerMetricScale[metricName] = {};

            // If the scale does not exist, create the object that will hold the metric results.
            if (!resultsPerMetricScale[metricName].hasOwnProperty(scale))
                resultsPerMetricScale[metricName][scale] = {};

            // Append the metric results for the given scale.
            resultsPerMetricScale[metricName][scale] = {
                scale: scale,
                results: resultsPerMetric[metricName]
            };
        });
    }

    /**
     * Returns a list of scales (graph sizes) available in the results.
     * @returns {Array} - List of scales
     */
    getAvailableScales() {
        return _.keys(this.benchmarkResultsPerScale);
    }

    /**
     * Returns a list of metric objects that are used in the competition.
     *
     * @returns {[null,null,null,null,null]}
     */
    getMetrics() {
        return [new TL(), new TM(), new TP(), new EVPS(), new PPP()];
    }
}

module.exports = Competition;