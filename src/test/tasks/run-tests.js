/**
 * Calls `mocha-phantomjs` which executes our testsuite.
 *
 * We have a seperate node script for this, so that we can easily spawn this in
 * `serve-and-run-test.js`. That file ensures that the source code is served in
 * a way that our testsuite expects it.
 *
 * @author Marc Jansen <jansen@terrestris.de>
 * @author Kai Volland <volland@terrestris.de>
 */
var spawn = require('child_process').spawnSync;
// with inherit we see the output of `mocha-phantomjs` as expected
var spawnOptions = { stdio: 'inherit' };

var mochaBinary = 'mocha-phantomjs';

var classicArguments = [
    '--ssl-protocol=any',
    '--ignore-ssl-errors=true',
    'test/classic/index.html'
];
var modernArguments = [
    '--ssl-protocol=any',
    '--ignore-ssl-errors=true',
    'test/modern/index.html'
];

spawn(mochaBinary, classicArguments, spawnOptions);
spawn(mochaBinary, modernArguments, spawnOptions);
