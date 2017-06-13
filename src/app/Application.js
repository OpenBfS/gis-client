/* global window, location */
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
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 *
 * @class Koala.Application Koala.Application
 */
Ext.define('Koala.Application', {
    extend: 'Ext.app.Application',
    xtype: 'k-application',

    name: 'Koala',

    statics: {
        /**
         * Return the current timereference for the application or null if
         * we cannot determine the desired.
         */
        getTimereference: function() {
            var btn = Ext.ComponentQuery.query('k-button-timereference')[0];
            if (!btn) {
                Ext.log.error('Could not find a timereference button');
                return null;
            }
            return btn.getCurrent();
        },
        /**
         * Return whether the current time reference is UTC.
         */
        isUtc: function() {
            if (Ext.isModern) {
                return Ext.ComponentQuery.query('app-main')[0].getViewModel().get('useUtc');
            } else {
                return this.getTimereference() === Koala.view.button.TimeReference.UTC;
            }
        },
        /**
         * Return whether the current time reference is local.
         */
        isLocal: function() {
            return !this.isUtc();
        }
    },

    routes: {
        'map/:lon/:lat/:zoom': {
            action: 'onMapRoute'
        },
        'layers/:layers': {
            action: 'onLayerTreeRoute',
            before: 'beforeLayerTreeRoute',
            conditions: {
                ':layers': '(.*)'
            }
        },
        'rodosproject/:rodosproject': {
            action: 'onRodosProjectRoute'
        }
    },

    stores: [
        // TODO: add global / shared stores here
    ],

    listen: {
        controller: {
            '#': {
                unmatchedroute: 'onUnmatchedRoute'
            }
        }
    },

    /**
     * Listens to the map route. See Koala.util.Routing.onMapRoute for
     * detailed implementation docs.
     * @type {function}
     */
    onMapRoute: Koala.util.Routing.onMapRoute,

    /**
     * Listens to the layers route and does some prechecks. See
     * Koala.util.Routing.beforeLayerTreeRoute for detailed implementation docs.
     * @type {function}
     */
    beforeLayerTreeRoute: Koala.util.Routing.beforeLayerTreeRoute,

    /**
     * Listens to the layers route after beforeLayerTreeRoute. See
     * Koala.util.Routing.onLayerTreeRoute for detailed implementation docs.
     * @type {function}
     */
    onLayerTreeRoute: Koala.util.Routing.onLayerTreeRoute,

    /**
     * Listens to the rodosproject route. See
     * Koala.util.Routing.onRodosProjectRoute for detailed implementation docs.
     * @type {function}
     */
    onRodosProjectRoute: Koala.util.Routing.onRodosProjectRoute,

    /**
     * Gets called on an unmatched route. See Koala.util.Routing.onMapRoute
     * for detailed implementation docs.
     * @type {function}
     */
    onUnmatchedRoute: Koala.util.Routing.onUnmatchedRoute,

    /**
     * Gets called if the appCache signals an app update. It shows a confirm
     * dialog which reloads the page on confirmation.
     */
    onAppUpdate: function() {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function(choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    },

    launch: function() {
        var loadmask = Ext.get('loadmask');
        if (loadmask) {
            loadmask.destroy();
        }

        // Update the global moment locale formats with the one configured above.
        moment.updateLocale('en', {
            longDateFormat: Koala.util.Date.DATE_FORMAT_LOCALES.en
        });
        moment.updateLocale('de', {
            longDateFormat: Koala.util.Date.DATE_FORMAT_LOCALES.de
        });
        moment.updateLocale('fr', {
            longDateFormat: Koala.util.Date.DATE_FORMAT_LOCALES.fr
        });
    }

});
