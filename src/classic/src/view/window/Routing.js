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
 * @class Koala.view.window.Routing
 */
Ext.define('Koala.view.window.Routing', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-routing',

    requires: [
        'Koala.util.Help',
        'BasiGX.view.component.Map'
    ],

    controller: 'k-window-routing',
    viewModel: {
        type: 'k-window-routing'
    },

    routeLayer: null,

    map: null,

    bind: {
        title: '{title}'
    },

    items: [
        {
            xtype: 'panel',
            html: 'Hallo Welt Hallo Welt Hallo Welt Hallo Welt'
        }
    ],

    collapsible: true,
    resizable: false,
    constrainHeader: true,

    listeners: {
        expand: function() {
            this.down('k-form-print').addExtentInteractions();
            // HBD: after collapse/expand extjs thinks the user manually
            // resized the window and stops automatic window resize if
            // child component sizes are updated. We can apparently
            // reset this by setting the sizes to null...
            this.setSize(null, null);
        },
        resize: function(win) {
            win.center();
        },
        onRouteLoaded: 'onRouteLoaded',
        boxReady: 'onBoxReady',
        close: 'onWindowClose'
    },

    layout: 'fit',

    // tools: [{
    //     type: 'help',
    //     bind: {
    //         tooltip: '{helpTooltip}'
    //     },
    //     callback: function() {
    //         Koala.util.Help.showHelpWindow('toolsPrint', 'tools');
    //     }
    // }],

    // config: {
    //     chartPrint: false,
    //     chart: undefined,
    //     irixPrint: false
    // },

    constructor: function() {
        var me = this;
        this.callParent(arguments);

        var staticMe = Koala.util.AppContext;
        var ctx = staticMe.getAppContext();
        var routingOpts = staticMe.getMergedDataByKey('routing', ctx);

        if (routingOpts.routeStyle) {
            var routeStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: routingOpts.routeStyle.color,
                    width: routingOpts.routeStyle.width
                })
            });
            me.lookupViewModel().set('routeStyle', routeStyle);
        }

        if (!me.map) {
            me.map = BasiGX.view.component.Map.guess().getMap();
        }

        // var appContext = BasiGX.view.component.Map.guess().appContext;
        Ext.Ajax.request({
            url: '/ors/ors.json',

            success: function(response, opts) {
                content = Ext.decode(response.responseText);
                me.fireEvent('onRouteLoaded', content);
            }
        });
        // var urls = appContext.data.merge.urls;
        // this.add({
        //     xtype: 'k-form-print',
        //     maxHeight: Ext.getBody().getHeight() - 100,
        //     url: urls['print-servlet'],
        //     chartPrint: this.config.chartPrint,
        //     chart: this.config.chart,
        //     skipMapMode: this.config.irixPrint
        // });
    }
});
