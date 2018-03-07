const Metric = require('./Metric');

/**
 * Processing time.
 */
class TP extends Metric {
    constructor() {
        super();
    }

    getName() {
        return 'TP';
    }

    isHigherValueBetter() {
        return false;
    }
}

module.exports = TP;