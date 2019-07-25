/* Copyright (c) 2015-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class Koala.util.Fullscreen
 */
Ext.define('Koala.util.Fullscreen', {

    statics: (function() {
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
            [ // new WebKit-variants
                'webkitRequestFullscreen', 'webkitExitFullscreen',
                'webkitFullscreenElement', 'webkitFullscreenEnabled'
            ],
            [ // old WebKit-variants (Safari 5.1)
                'webkitRequestFullScreen', 'webkitCancelFullScreen',
                'webkitCurrentFullScreenElement', 'webkitCancelFullScreen'
            ],
            [ // Mozilla prefixed variants
                'mozRequestFullScreen', 'mozCancelFullScreen',
                'mozFullScreenElement', 'mozFullScreenEnabled'
            ],
            [ // Microsoft
                'msRequestFullscreen', 'msExitFullscreen',
                'msFullscreenElement', 'msFullscreenEnabled'
            ]
        ];

        var staticsToExport = {
            propertyNames: {}
        };

        Ext.each(canonicalNames, function(canonicalName, idx) {
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
         * Return whether we are currently in fullscreenmode.
         * WARNING: This does not respect the fullscreenmode toggled by F11 but
         * just from javascript side.
         *
         * @static
         * @return {boolean} Whether we are curently in fullscreen mode
         */
        staticsToExport.isInFullscreen = function() {
            return !!doc[this.propertyNames.fullscreenElement];
        };

        /**
         * Tries to switch to fullscreen mode.
         * @static
         */
        staticsToExport.requestFullscreen = function() {
            doc.documentElement[this.propertyNames.requestFullscreen]();
        };

        /**
         * Tries to exit from fullscreen mode.
         * @static
         */
        staticsToExport.exitFullscreen = function() {
            doc[this.propertyNames.exitFullscreen]();
        };

        /**
         * Tries to toggle between standard and fullscreenmode.
         * @static
         */
        staticsToExport.toggleFullscreen = function() {
            if (!this.isInFullscreen()) {
                this.requestFullscreen();
            } else {
                this.exitFullscreen();
            }
        };

        /**
         * Checks if the FullScreenApi is supported by the browser the method
         * is called with.
         * @return {Boolean} Returns if FullScreen is supported.
         */
        staticsToExport.isFullscreenSupported = function() {
            var isSupported = true;

            // Disable if api not found
            if (Ext.Object.isEmpty(this.propertyNames)) {
                isSupported = false;
            }

            return isSupported;
        };

        // actually return the gathered information from the closure
        return staticsToExport;
    }()),

    /**
     * TODO find a way to use a static method as handler.
     * TODO doesn't work in IE11
     */
    toggleFullscreen: function() {
        this.self.toggleFullscreen();
    }
});
