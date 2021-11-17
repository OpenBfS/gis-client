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

    requires: [
        'BasiGX.util.Namespace',
        'Koala.util.Routing',
        'Koala.util.AppContext',
        'Koala.util.Wps'
        // //prepare for Session Timeout Handling
        // ,
        // 'Lada.override.RestProxy'
    ],

    controllers: [
        'Koala.view.controller.ElanScenarioController'
    ],

    statics: {

        timereferenceNotFound: '',
        applicationUpdateTitle: 'Anwendungsupdate',
        applicationUpdateText: 'Für diese Anwendung steht ein Update zur Verfügung!',
        reloadMessage: '',
        ssoExpiredTitle: '',
        ssoExpiredBody: '',
        ssoExpiredFailed: '',
        username: '',
        userId: '',
        userroles: '',
        logintime: '',
        wpsErrorText: 'WPS Server konnte nicht erreicht werden. Bitte kontaktieren Sie einen Seitenadministrator.',
        wpsErrorTitle: 'WPS Fehler',

        /**
         * Return the current timereference for the application or null if
         * we cannot determine the desired.
         */
        getTimereference: function() {
            var btn = Ext.ComponentQuery.query('k-button-timereference')[0];
            if (!btn) {
                Ext.log.error(this.timereferenceNotFound);
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
    onMapRoute: function() {
        if (this.routedAlready && !Ext.isModern) {
            window.location.reload();
        }
        this.routedAlready = true;
        Koala.util.Routing.onMapRoute.apply(null, arguments);
    },

    /**
     * Listens to the layers route and does some prechecks. See
     * Koala.util.Routing.beforeLayerTreeRoute for detailed implementation docs.
     * @type {function}
     */
    beforeLayerTreeRoute: function() {
        Koala.util.Routing.beforeLayerTreeRoute.apply(null, arguments);
    },

    /**
     * Listens to the layers route after beforeLayerTreeRoute. See
     * Koala.util.Routing.onLayerTreeRoute for detailed implementation docs.
     * @type {function}
     */
    onLayerTreeRoute: function() {
        Koala.util.Routing.onLayerTreeRoute.apply(null, arguments);
    },

    /**
     * Listens to the rodosproject route. See
     * Koala.util.Routing.onRodosProjectRoute for detailed implementation docs.
     * @type {function}
     */
    onRodosProjectRoute: function() {
        Koala.util.Routing.onRodosProjectRoute.apply(null, arguments);
    },

    /**
     * Gets called on an unmatched route. See Koala.util.Routing.onMapRoute
     * for detailed implementation docs.
     * @type {function}
     */
    onUnmatchedRoute: function() {
        Koala.util.Routing.onUnmatchedRoute.apply(null, arguments);
    },

    /**
     * Gets called if the appCache signals an app update. It shows a confirm
     * dialog which reloads the page on confirmation.
     */
    onAppUpdate: function() {
        //FIXME i18n does not work on Firefox on early load of appUpdate uses statics
        Ext.Msg.alert(Koala.Application.applicationUpdateTitle,
            Koala.Application.applicationUpdateText,
            function() {
                window.location.reload();
            }
        );
    },

    /**
     * Update the BasiGX namespace map with the namespaces from the GeoServer.
     *
     * @param {Object} ctx the application context
     */
    updateNamespaces: function(ctx) {
        var url = ctx.data.merge.urls['geoserver-base-url'] + '/rest/namespaces';
        Ext.Ajax.request({
            url: url,
            success: function(xhr) {
                var namespaces = JSON.parse(xhr.responseText).namespaces.namespace;
                Ext.each(namespaces, function(namespace) {
                    Ext.Ajax.request({
                        url: namespace.href.replace('bfs-docker', 'localhost'),
                        success: function(subXhr) {
                            var subNamespace = JSON.parse(subXhr.responseText).namespace;
                            BasiGX.util.Namespace.namespaces[subNamespace.prefix] = subNamespace.uri;
                        }
                    });
                });
            }
        });
    },

    loadProcesses: function(processingCfg) {
        if (!processingCfg) {
            return;
        }
        var whitelist = processingCfg.processes || [];
        whitelist = Ext.Array.map(whitelist, function(item) {
            return item.id;
        });
        var wpsService = Koala.util.Wps.createWpsService();
        wpsService.getCapabilities_GET(function(response) {
            var data = [];
            if (response.textStatus && response.errorThrown) {
                //FIXME i18n does not work on Firefox on early load of appUpdate uses statics
                Ext.Msg.alert(Koala.Application.wpsErrorTitle,
                    Koala.Application.wpsErrorText);
            } else {
                Ext.Array.each(response.capabilities.processes, function(process) {
                    if (whitelist.includes(process.identifier)) {
                        data.push({
                            processId: process.identifier,
                            title: process.title
                        });
                    }
                });
            }

            Ext.create('Ext.data.Store', {
                storeId: 'processes-store',
                data: data
            });
        });
    },

    loadProcessingConfig: function(ctx) {
        return Ext.Ajax.request({
            url: ctx.data.merge.urls.processing,
            success: function(xhr) {
                ctx.data.merge.processing = JSON.parse(xhr.responseText);
            }
        });
    },

    launch: function() {
        var me = this;
        var staticMe = Koala.util.AppContext;
        var ctx = staticMe.getAppContext();
        var imisUser = staticMe.getMergedDataByKey('imis_user', ctx);
        var imisRoles = (imisUser) ? imisUser.userroles : undefined;
        this.username = '';
        this.userId = imisUser;
        this.userroles = imisRoles;
        this.logintime = '';
        BasiGX.util.Namespace.namespaces = {
            opendata: 'www.imis.bfs.de/opendata',
            bfs: 'www.imis.bfs.de/bfs',
            imis: 'www.imis.bfs.de/imis',
            ruf: 'www.imis.bfs.de/ruf',
            rlz: 'www.imis.bfs.de/rlz',
            jrodos_res: 'www.imis.bfs.de/rodos'
        };
        this.updateNamespaces(ctx);
        var tools = staticMe.getMergedDataByKey('tools', ctx);
        if (Ext.isArray(tools) && tools.indexOf('wpsLayerBtn') !== -1) {
            this.loadProcessingConfig(ctx)
                .then(function() {
                    // only load processes if feature is enabled
                    var processingCtx = staticMe.getMergedDataByKey('processing', ctx);
                    me.loadProcesses(processingCtx);
                });
        }
        if (window.location.hash === '') {
            this.routedAlready = true;
        }
        var loadmask = Ext.get('loadmask');
        if (loadmask) {
            loadmask.destroy();
        }

        // Update the global moment locale formats with the one configured above.
        moment.updateLocale('fr', {
            longDateFormat: Koala.util.Date.DATE_FORMAT_LOCALES.fr
        });
        moment.updateLocale('en', {
            longDateFormat: Koala.util.Date.DATE_FORMAT_LOCALES.en
        });
        moment.updateLocale('de', {
            longDateFormat: Koala.util.Date.DATE_FORMAT_LOCALES.de
        });

        // //Set up an event handler to handle session timeouts
        // //code with slight adjustements from LADA project:
        // //see also: LADA Commit 8dddb5eb9b30894414b62eecf6fca23200756d75
        //
        // Ext.Ajax.on('requestexception', function(conn, response) {
        //     if (response.status === 0 && response.responseText === '') {
        //         Ext.MessageBox.confirm(
        //             Koala.Application.ssoExpiredTitle,
        //             Koala.Application.ssoExpiredBody,
        //             function(btn) {
        //                 if (btn === 'yes') {
        //                     window.location.reload();
        //                 }
        //             }
        //         );
        //     }
        // });

        // ask before closing/refreshing the window.
        // Not all browsers will respect this, depending on settings
        window.addEventListener('beforeunload', function(evt) {
            var context = Koala.util.AppContext.getAppContext();
            if (context.debug) {
                return;
            }
            // match different handling from different browsers
            var confirmMessage = me.leavePageText;
            evt.returnValue = confirmMessage;
            return confirmMessage;
        });

        // make sure we don't send the Access-Control-Request-Headers: x-requested-with
        // as it breaks feature info for external WMS
        Ext.Ajax.setUseDefaultXhrHeader(false);
    }
});
