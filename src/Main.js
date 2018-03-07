const BenchmarkResultsReader = require('./io/BenchmarkResultsReader');
const Competition = require('./competition/Competition');
const CompetitionResultsWriter = require('./io/CompetitionResultsWriter');

/**
 * Invoke run to compute the results for the competition.
 */
class Main {
    constructor() {
    }

    /**
     * Runs the entire process of computing the competition results.
     */
    run() {
        // Load benchmark results per scale.
        let benchmarkResultsLoader = new BenchmarkResultsReader();
        let benchmarkResultsPerScale = benchmarkResultsLoader.loadResultsPerScale();

        // Compute the results for the competition.
        let competition = new Competition(benchmarkResultsPerScale);
        let competitionResults = competition.computeResults();

        // Write the results to the specified output folder.
        let competitionResultsWriter = new CompetitionResultsWriter(competitionResults);
        competitionResultsWriter.write();
    }
}

let main = new Main();

main.run();