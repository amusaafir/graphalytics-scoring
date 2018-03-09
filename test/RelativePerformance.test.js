const RelativePerformance = require('../src/competition/scoring/RelativePerformance');
const UnknownValue = require('../src/benchmark/UnknownValue');
const expect = require('expect');

it('should remove unknown values - removeUnknownValues()', () => {
    // Arrange.
    let scoring = new RelativePerformance();
    let values = [1, UnknownValue, 4, 3, 8];

    // Act.
    let removedUnknownvalues = scoring.removeUnknownValues(values);

    // Assert.
    expect(removedUnknownvalues.sort()).toEqual([1, 3, 4, 8]);
});
