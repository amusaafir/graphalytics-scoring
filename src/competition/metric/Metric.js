/**
 * Base class - used to determine the names of the metric and whether a higher value is better.
 */
class Metric {
    constructor() {
    }

    /**
     * Overridden by child class.
     */
    getName() {
    }

    /**
     * Overridden by child class.
     */
    isHigherValueBetter() {
    }
}

module.exports = Metric;