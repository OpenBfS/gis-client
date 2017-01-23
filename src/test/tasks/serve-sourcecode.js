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
var serveStatic = require('serve-static');

var rootDir = path.join(__dirname, '..', '..');

// The path where the classic view source code lives
var classicDir = path.normalize(path.join(rootDir, 'classic', 'src'));
// The path where the classic view source code lives
var modernDir = path.normalize(path.join(rootDir, 'modern', 'src'));
// The path where shared code lives e.g. controller etc.
var appDir = path.normalize(path.join(rootDir, 'app'));

var classicServer = express();

var enableCors = function(req, res, next) {
        var allowOrigin = "*"; // any origin, baby.
        var allowHeaders = "Origin, X-Requested-With, Content-Type, Accept";
        res.header("Access-Control-Allow-Origin", allowOrigin);
        res.header("Access-Control-Allow-Headers", allowHeaders);
        next();
    };

// make the JavaScript usable from another URL (our testsuite)
classicServer.use(enableCors);

// make sure both classic and app files are being served
classicServer.use(serveStatic(classicDir));
classicServer.use(serveStatic(appDir));

classicServer.listen(3000);

var modernServer = express();

// make the JavaScript usable from another URL (our testsuite)
modernServer.use(enableCors);

// make sure both modern and app files are being served
modernServer.use(serveStatic(modernDir));
modernServer.use(serveStatic(appDir));

modernServer.listen(3001);
