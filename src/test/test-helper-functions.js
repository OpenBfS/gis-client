// This file is taken from GeoExt3
(function(global) {
    /**
     * A helper method that'll return a HTML script tag for loading
     * an external JavaScript file.
     *
     * @param {string} src The `src` of the external JavaScript file.
     * @return {string} The script tag with given `src`
     */
    function getExternalScriptTag(src) {
        return '<scr' + 'ipt src="' + src + '"></scr' + 'ipt>';
    }

    /**
     * A helper method that'll return a HTML script tag for executing
     * some given JavaScript code.
     *
     * @param {string} code The code to execute.
     * @return {string} The script tag with given content.
     */
    function getInlineScriptTag(code) {
        return '<scr' + 'ipt>' + code + '</scr' + 'ipt>';
    }

    /**
     * A utility function that creates and adds a `<div>` to the `<body>` of the
     * document. The div is positioned absolutely off the screen and configured
     * with fixed dimensions to never be visible to the user (e.g. when the
     * test suite is viewed in a browser).
     *
     * Use this method in `beforeEach` if you need a `<div>` (e.g. to render
     * ExtJS components with their `renderTo` configuration).
     *
     * The created `<div>` is returned, so that it can easily be used in
     * `afterEach`-calls to cleanup. Most of the time you'll be using the helper
     * function #teardownTestDiv in such a case.
     *
     * @return {HTMLDivElement} The created `<div>`.
     */
    function setupTestDiv() {
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.top = 0;
        div.style.left = -500;
        div.style.width = 256;
        div.style.height = 128;
        document.body.appendChild(div);
        return div;
    }

    global.TestUtil = {
        getExternalScriptTag: getExternalScriptTag,
        getInlineScriptTag: getInlineScriptTag,
        setupTestDiv: setupTestDiv
    };
}(this));
