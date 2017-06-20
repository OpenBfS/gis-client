/**
 * Creates a tiny webserver which we use to serve the sourcecode of the
 * ExtJS application.
 *
 * We need this because we split the MVC componnets into various folders, e.g.
 * for view components and other components. When using the application with the
 * help of the sencha commmand, we do not have any problems, as the bootstrap.js
 * of ExtJS does black magic to resolve dependencies nonetheless.
 *
 * When testing, we do not have bootstrap.js and we have to make sure that the
 * `Ext.Loader` can fulfill our dependencies.
 *
 * Here is the strategy:
 *
 * * Set up a server on port 3000, that serves the static files of three combined
 *   directories.
 * * Configure `Ext.Loader` to resolve application code from the URL we provide,
 *   e.g. `http://localhost:3000/`
 * * A request for the `MapController.js` (living in the `app/`-dir) and another
 *   one for `Map.js` (living in the `classic`-dir) will both be satisfied
 *   by our server from `http://localhost:3000/view/component/`.
 *
 * @author Marc Jansen <jansen@terrestris.de>
 * @author Kai Volland <volland@terrestris.de>
 */
var express = require('express');
var path = require('path');

var im = require('istanbul-middleware');

var rootDir = path.join(__dirname, '..', '..');

// The path where the classic view source code lives
var classicDir = path.normalize(path.join(rootDir, 'classic', 'src'));
// The path where the modern view source code lives
var modernDir = path.normalize(path.join(rootDir, 'modern', 'src'));
// The path where shared code lives e.g. controller etc.
var appDir = path.normalize(path.join(rootDir, 'app'));

var classicServer = express();

var enableCors = function(req, res, next) {
        var allowOrigin = '*'; // any origin, baby.
        var allowHeaders = 'Origin, X-Requested-With, Content-Type, Accept';
        res.header('Access-Control-Allow-Origin', allowOrigin);
        res.header('Access-Control-Allow-Headers', allowHeaders);
        next();
    };

// the middleware will throw warnings about files in the other dir, but will
// serve the instrumented file nonetheless
im.hookLoader(classicDir);
im.hookLoader(appDir);
im.hookLoader(modernDir);

classicServer.use('/coverage', im.createHandler());
// make the JavaScript usable from another URL (our testsuite)
classicServer.use(enableCors);

// make sure both classic and app files are being served
classicServer.use(im.createClientHandler(appDir));
classicServer.use(im.createClientHandler(classicDir));

classicServer.listen(3000);

var modernServer = express();

modernServer.use('/coverage', im.createHandler());
// make the JavaScript usable from another URL (our testsuite)
modernServer.use(enableCors);

// make sure both modern and app files are being served
modernServer.use(im.createClientHandler(appDir));
modernServer.use(im.createClientHandler(modernDir));

modernServer.listen(3001);
