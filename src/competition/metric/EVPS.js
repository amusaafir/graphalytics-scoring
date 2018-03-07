const Metric = require('./Metric');

/**
 * Edges and vertices per second.
 */
class EVPS extends Metric {
    constructor() {
        super();
    }

    getName() {
        return 'EVPS';
    }

    isHigherValueBetter() {
        return true;
    }
}

module.exports = EVPS;