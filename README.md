# Graphalytics Competition Scoring


Please refer to the [Graphalytics competition specification](http://beta.graphalytics.org/assets/spec-graphalytics-competitions.pdf) for a detailed explanation of each competition.

### Requirements

* Node.js (tested using v8.6.0).
* Graphalytics benchmark results output from 0.9.0 (similar as the one in `example-results` directory).

### Run

1.  `git clone https://github.com/amusaafir/graphalytics-scoring.git`
2. `cd graphalytics-scoring`
3. `npm install`
4. Run `Main.js` as follows:   

Specify the `scoring` parameter as **tournament** to compute the results for a tournament competition, or **relativeperformance** to compute the results for a relative performance competition. Example: 

`node src/Main.js --results=example-results --scoring=tournament`

`node src/Main.js --results=example-results --scoring=relativeperformance`

##### Note: 
* The `results` parameter specifies the folder (relative/absolute) path of the Graphalytics benchmark results.
* The competition results are placed in the `output` folder.
* You can ignore datasets and/or algorithms (i.e., not take their score into account by a competition for all platforms) in the `config.json` file.

### Tests

Run `npm test` to run all the tests.
