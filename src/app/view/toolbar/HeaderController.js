Ext.define('Koala.view.toolbar.HeaderController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-toolbar-header',

    statics: (function(){
        var doc = document;
        var canonicalNames = [
            'requestFullscreen', 'exitFullscreen',
            'fullscreenElement', 'fullscreenEnabled'
        ];
        var lookups = [
            doc.documentElement,
            doc,
            doc,
            doc
        ];
        var variantNameGroups = [
             Ext.Array.clone(canonicalNames), // standardized
             [   // new WebKit-variants
                 'webkitRequestFullscreen', 'webkitExitFullscreen',
                 'webkitFullscreenElement', 'webkitFullscreenEnabled'
             ],
             [   // old WebKit-variants (Safari 5.1)
                 'webkitRequestFullScreen', 'webkitCancelFullScreen',
                 'webkitCurrentFullScreenElement', 'webkitCancelFullScreen'
             ],
             [    // Mozilla prefixed variants
                 'mozRequestFullScreen', 'mozCancelFullScreen',
                 'mozFullScreenElement', 'mozFullScreenEnabled'
             ],
             [    // Microsoft
                 'msRequestFullscreen', 'msExitFullscreen',
                 'msFullscreenElement', 'msFullscreenEnabled'
             ]
        ];

        var staticsToExport = {
            propertyNames: {}
        };

        Ext.each(canonicalNames, function(canonicalName, idx){
            var lookup = lookups[idx];
            var propertyFound = false;
            Ext.each(variantNameGroups, function(variantNameGroup) {
                var variantName = variantNameGroup[idx];
                if (variantName in lookup) {
                    propertyFound = true;
                    staticsToExport.propertyNames[canonicalName] = variantName;
                }
                // stop once we found the property
                return !propertyFound;
            });
        });

        // Add certain helpers
        /**
         * Return whether we are currently in fullscreenmode
         * @static
         * @return {boolean} Whether we are curently in fullscreen mode
         */
        staticsToExport.isInFullscreen = function(){
            return !!doc[this.propertyNames.fullscreenElement];
        };

        /**
         * Tries to switch to fullscreen mode.
         * @static
         */
        staticsToExport.requestFullscreen = function(){
            doc.documentElement[this.propertyNames.requestFullscreen]();
        };

        /**
         * Tries to exit from fullscreen mode.
         * @static
         */
        staticsToExport.exitFullscreen = function(){
            doc[this.propertyNames.exitFullscreen]();
        };

        /**
         * Tries to toggle between standard and fullscreenmode.
         * @static
         */
        staticsToExport.toggleFullscreen = function(){
            if (!this.isInFullscreen()) {
                this.requestFullscreen();
            } else {
                this.exitFullscreen();
            }
        };

        // actually return the gathered information from the closure
        return staticsToExport;
    }()),
    
    /**
     * TODO find a way to use a static method as handler.
     * TODO doesn't work imn IE11
     */
    toggleFullscreen: function(){
        this.self.toggleFullscreen();
    }
});
