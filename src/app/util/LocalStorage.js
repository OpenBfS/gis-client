/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * @class Koala.util.LocalStorage
 */
Ext.define('Koala.util.LocalStorage', {

    statics: {

        HIDE_LAYERSET_ON_STARTUP_KEY: 'koala-layerset-chooser-hide',
        HIDE_HELP_ON_STARTUP_KEY: 'koala-help-hide',
        DOKPOOL_EVENT_KEY: 'koala-dokpool-events',

        /**
         * Sets value (JSON encoded) in LocalStorage under given key
         *
         * @param {String} key Key of item in LocalStorage to set
         * @param {Object} value The value to persist
         */
        setProperty: function(key, value) {
            if (key) {
                var valueToPersist = JSON.stringify(value);
                window.localStorage.setItem(key, valueToPersist);
            }
        },

        /**
         * Gets value from LocalStorage of given key
         *
         * @param {String} key The key to retreive the value from
         *
         * @returns {Object} The (parsed) object from LocalStorage if available
         */
        getProperty: function(key) {
            if (key) {
                try {
                    var loadedValue = window.localStorage.getItem(key);
                    return JSON.parse(loadedValue);
                } catch (error) {
                    return null;
                }
            }
            return null;
        },

        /**
         * Updates koala-layerset-chooser-hide in LocalStorage
         *
         * @param {Boolean} hide Wheter the layerset chooser should be hidden
         * on startup, or not
         */
        updateHideLayersetChooserWindowOnStartup: function(hide) {
            this.setProperty(this.HIDE_LAYERSET_ON_STARTUP_KEY, hide);
        },

        /**
         * Returns the value of koala-layerset-chooser-hide from LocalStorage
         * @param {Object} true if layerset chooser window should be hidde,
         * false otherwise
         */
        showLayersetChooserWindowOnStartup: function() {
            return this.getProperty(this.HIDE_LAYERSET_ON_STARTUP_KEY);
        },

        /**
         * Updates koala-help-hide in LocalStorage
         *
         * @param {Boolean} hide Wheter the help window should be hidden
         * on startup, or not
         */
        updateHideHelpWindowOnStartup: function(hide) {
            this.setProperty(this.HIDE_HELP_ON_STARTUP_KEY, hide);
        },

        /**
         * Returns the value of oala-help-hide from LocalStorage
         * @param {Object} true if help window should be hidden, false otherwise
         */
        showHelpWindowOnStartup: function() {
            return this.getProperty(this.HIDE_HELP_ON_STARTUP_KEY);
        },

        /**
         * Updates koala-dokpool-scenario in LocalStorage
         *
         * @param {Object} the current state of scenario
         *                 used to check for changes later on
         */
        updateDokpoolEvents: function(scenarios) {
            this.setProperty(this.DOKPOOL_EVENT_KEY, scenarios);
        },

        /**
         * Returns the value of koala-dokpool-scenario from LocalStorage
         * @param {Object} the current state of scenario
         *                 used to check for changes later on
         */
        getDokpoolEvents: function() {
            return this.getProperty(this.DOKPOOL_EVENT_KEY);
        }
    }
});
