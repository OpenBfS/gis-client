/*global document*/
// This file is taken from GeoExt3
(function(doc, global) {
    var specPath = '../spec/',
        dependencies = [
            './app/basics.test.js',
            './app/util/Authentication.test.js',
            './app/util/AppContext.test.js',
            './app/util/Date.test.js',
            './app/util/Fullscreen.test.js',
            './app/util/Layer.test.js',
            './app/util/Object.test.js',
            './app/util/Routing.test.js',
            './app/util/String.test.js',
            './app/util/Style.test.js',
            './app/view/window/BarChartController.test.js',
            './classic/util/Filter.test.js',
            './classic/button/TimeReference.test.js',
            './classic/component/Map.test.js',
            './classic/component/TextTool.test.js'

        ],
        getScriptTag = global.TestUtil.getExternalScriptTag,
        dependencyCnt = dependencies.length,
        i = 0;

    for (; i < dependencyCnt; i++) {
        doc.write(getScriptTag(specPath + dependencies[i]));
    }
}(document, this));
