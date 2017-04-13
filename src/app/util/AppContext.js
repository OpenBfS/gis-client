/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * A utility class to work with a (possibly guessed) application context from
 * SHOGun.
 *
 * @class Koala.util.AppContext
 */
Ext.define('Koala.util.AppContext', {
    requires: [
        'BasiGX.view.component.Map'
    ],
    statics: {

        /**
         * Get the map context from a given map. If no map is given the map will
         * be guessed via BasiGX.view.component.Map.guess().
         * @param {BasiGX.view.component.Map} mapComponent A BasiGX mapComponent
         * @return {Object} The matched AppContext.
         */
        getAppContext: function(mapComponent) {
            if (!mapComponent) {
                mapComponent = BasiGX.view.component.Map.guess();
            }
            return mapComponent.appContext;
        },

        /**
         * Returns a callback that can be used to check and change the
         * visibility of a tool.
         *
         * E.g.:
         *
         *     // in a composition component …
         *     items: [{
         *       xtype: 'button',
         *       listeners: {
         *         boxready: Koala.util.AppContext.generateCheckToolVisibility('my-tool-id')
         *       }
         *     }]
         *     // more configuration …
         *
         * The above button will only be visible, if the appContext has a tool
         * with the name `'my-tool-id'`.
         *
         * @param {String} tool The key of the tool to check.
         * @return {Function} A handler that can e.g. be used as `boxready`
         *     listener.
         */
        generateCheckToolVisibility: function(tool) {
            var errTpl = 'Wanted to set visibility of instance of {0} to' +
                ' {1} but could not find method `{2}`.';
            return function() {
                var me = this;
                var visible = Koala.util.AppContext.hasTool(tool);
                // modern toolkit uses `setVisibility`, classic `setVisible`
                var fn = 'setVisible' in me ? 'setVisible' : 'setVisibility';

                if (fn in me && Ext.isFunction(me[fn])) {
                    me[fn](visible);
                } else {
                    var msg = Ext.String.format(
                        errTpl, me.$className, visible, fn
                    );
                    Ext.log.error(msg);
                }
            };
        },

        /**
         * Checks the passed (or a guessed) application context whether it has a
         * tool name identified by the given toolname.
         *
         * @param {String} tool The key of the tool to check.
         * @return {Boolean} Whether this tool is existant in the list of
         *     configured tools.
         */
        hasTool: function(tool, context) {
            var ctx = context || BasiGX.view.component.Map.guess().appContext;
            var staticMe = Koala.util.AppContext;
            var tools = staticMe.getMergedDataByKey('tools', ctx);
            var hasTool = false;
            if (tools && Ext.isArray(tools) && tools.length > 0) {
                hasTool = Ext.Array.contains(tools, tool);
            }
            return hasTool;
        },

        /**
         * Returns the value at the specified in key in the provided (or
         * guessed) application context by looking at the `'merge'` key under
         * `'data'`. Will return `undefined` if not found.
         *
         * @param {String} key The key we want to get.
         * @return {Mixed} The value at `key` or `undefined`.
         */
        getMergedDataByKey: function(key, context) {
            var ctx = context || BasiGX.view.component.Map.guess().appContext;
            var val;
            if ('data' in ctx && 'merge' in ctx.data && key in ctx.data.merge) {
                val = ctx.data.merge[key];
            }
            return val;
        }
    }
});
