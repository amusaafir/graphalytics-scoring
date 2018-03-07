const filesystem = require('fs');
const moment = require('moment');

/**
 * Writes the competition results to a file.
 */
class CompetitionResultsWriter {
    constructor(competitionResults) {
        this.competitionResults = competitionResults;
    }

    /**
     * Creates file name containing the date.
     * @returns {string}
     */
    createFileName() {
        return moment().format('YYYY MMMM Do, h-mm-ss a') + '_results';
    }

    /**
     * Write results to a JSON file.
     */
    write() {
        const extension = '.json';
        const filename = this.createFileName();

        filesystem.writeFile('output/' + filename + extension, JSON.stringify(this.competitionResults, null, 2), (err) => {
            if (err)
                throw err;

            console.log('Output saved to %s.', filename + extension);
        });
    }
}

module.exports = CompetitionResultsWriter;