const Metric = require('./Metric');

/**
 * Price per performance.
 */
class PPP extends Metric {
    constructor() {
        super();
    }

    getName() {
        return 'PPP';
    }

    isHigherValueBetter() {
        return false;
    }
}

module.exports = PPP;