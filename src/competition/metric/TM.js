const Metric = require('./Metric');

/**
 * Makespan.
 */
class TM extends Metric {
    constructor() {
        super();
    }

    getName() {
        return 'TM';
    }

    isHigherValueBetter() {
        return false;
    }
}

module.exports = TM;