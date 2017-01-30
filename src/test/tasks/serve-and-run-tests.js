/**
 * Ensures that the source code is served (via `serve-sourcecode.js`) and that
 * the testsuite is executed (via `run-tests.js`), which needs the source code
 * server.
 *
 * Once the testsuite finished, the serving of sourcecode is stopped, so that
 * we cannot end with a stale source code server.
 *
 * This script is being executed when one runs `npm test` in the root of the
 * package.
 *
 * @author Marc Jansen <jansen@terrestris.de
 */
var path = require('path');
var spawn = require('child_process').spawn;
// with inherit we see the output of any spawned prcesses as expected
var spawnOptions = { stdio: 'inherit' };

var taskDir = path.join(__dirname, '..', '..', 'test', 'tasks');
var serveScript = path.normalize(path.join(taskDir, 'serve-sourcecode.js'));
var testScript = path.normalize(path.join(taskDir, 'run-tests.js'));

var serve = spawn('node', [ serveScript ], spawnOptions);
var test = spawn('node', [ testScript ], spawnOptions);

// stop serving source code once the testsuite is closed
test.on('close', function(code) {
    serve.kill();
    process.exit(code);
});
