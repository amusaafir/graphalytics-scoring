const yargs = require('yargs');
const filesystem = require('fs');
const _ = require('lodash');
const BenchmarkResultsFile = require('../benchmark/BenchmarkResultsFile.js');

/**
 * Reads the data from the benchmark results (json) files.
 * It combines the result per unique target scale.
 */
class BenchmarkResultsReader {

    /**
     * Orchestrates the process of loading the results.
     */
    loadResultsPerScale() {
        // Get the results directory path from the argument option.
        let resultsDir = yargs.argv['results'];

        // Get all the file names from the results directory.
        let filenames = this.getBenchmarkResultsFileNames(resultsDir);

        // Extract the relevant data from the all the benchmark results files.
        return this.getBenchmarkResultsPerScale(resultsDir, filenames);
    }

    /**
     * Extracts relevant data for computing the scores from a given set of benchmark results by their file names
     * per scale.
     *
     * @param resultsDir - Results directory.
     * @param filename - List of filenames inside the results directory.
     * @returns {Object} - ResultFiles
     */
    getBenchmarkResultsPerScale(resultsDir, fileNames) {
        // This object will hold all the relevant data separated by scale.
        let results = {};

        // Open each file (in a synchronous manner for now) and extract the relevant contents
        // into a BenchmarkResultsFile object.
        _.forEach(fileNames, fileName => {
            console.log('Loading results file: %s', fileName);

            let resultsFile = this.readBenchmarkResultsFile(resultsDir, fileName);
            let resultsDetails = resultsFile.getDetails();

            // In case we haven't come across this type of scale in our set of results files, create an object
            // to store the platform results in for that scale.
            if (!results[resultsDetails.scale])
                results[resultsDetails.scale] = {'platformResults': {}};

            // Add the result details to its corresponding scale.
            results[resultsDetails.scale]['platformResults'][resultsDetails.id] = resultsDetails;
        });

        return results;
    }

    /**
     * Reads a single benchmark results file, given by the file name, in a directory.
     *
     * @param resultsDir - Results directory.
     * @param filename - List of filenames inside the results directory.
     * @returns {BenchmarkResultsFile} - Relevant data per (benchmark) results file.
     */
    readBenchmarkResultsFile(resultsDir, filename) {
        let resultsFilePath = resultsDir + '/' + filename;
        let resultsFile = filesystem.readFileSync(resultsFilePath, 'utf8');

        try {
            return new BenchmarkResultsFile(JSON.parse(resultsFile));
        } catch (err) {
            console.error('Error parsing the results file to JSON.');
            throw err;
        }
    }

    /**
     * Gets all the file names from the directory containing the results.
     *
     * @param resultsDir: Directory containing the benchmark results.
     */
    getBenchmarkResultsFileNames(resultsDir) {
        try {
            return filesystem.readdirSync(resultsDir);
        } catch (err) {
            console.error('Unable to open the given results directory.');
            throw err;
        }
    }
}

module.exports = BenchmarkResultsReader;