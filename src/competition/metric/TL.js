const Metric = require('./Metric');

/**
 * Loading time.
 */
class TL extends Metric {
    constructor() {
        super();
    }

    getName() {
        return 'TL';
    }

    isHigherValueBetter() {
        return false;
    }
}

module.exports = TL;