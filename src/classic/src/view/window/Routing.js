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
        'Koala.util.AppContext',
        'BasiGX.view.component.Map',
        'Koala.view.window.RoutingModel',
        'Koala.view.window.RoutingController',
        'Koala.view.container.RoutingResult',
        'Koala.view.panel.ElevationProfile',
        'Koala.view.form.RoutingSettings'
    ],

    controller: 'k-window-routing',
    viewModel: {
        type: 'k-window-routing'
    },

    waypointLayerName: 'routing-waypoint-layer',

    routeLayerName: 'routing-route-layer',

    routeSegmentLayerName: 'routing-route-segment-layer',

    map: null,

    /** The name of the routingResultPanel */
    routingResultPanelName: 'routing-result-panel',

    /** The name of the elevationProfilePanel*/
    elevationProfilePanelName: 'routing-elevationprofile-panel',

    /** The name of the layer for elevation interaction */
    elevationLayerName: 'routing-elevation-layer',

    bind: {
        title: '{i18n.title}'
    },

    minHeight: 100,
    maxHeight: 600,
    width: 500,

    layout: 'vbox',

    items: [
        {
            xtype: 'k-form-routing-settings'
        }
    ],

    collapsible: true,
    resizable: true,
    constrainHeader: true,

    // TODO listen to language changes and trigger routing again
    //      to retrieve translated instructions.
    listeners: {
        expand: function() {
            // HBD: after collapse/expand extjs thinks the user manually
            // resized the window and stops automatic window resize if
            // child component sizes are updated. We can apparently
            // reset this by setting the sizes to null...
            this.setSize(null, null);
        },
        onRouteLoaded: 'onRouteLoaded',
        onWaypointAdded: 'onWaypointAdded',
        boxReady: 'onBoxReady',
        close: 'onWindowClose',
        makeRoutingRequest: 'makeRoutingRequest',
        updateWayPointLayer: 'updateWayPointLayer',
        makeDownloadRequest: 'makeDownloadRequest'
    },

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        var vm = me.lookupViewModel();

        var staticMe = Koala.util.AppContext;
        var ctx = staticMe.getAppContext();
        var routingOpts = staticMe.getMergedDataByKey('routing', ctx);
        vm.set('routingOpts', routingOpts);

        if (routingOpts.routeStyle) {
            var routeStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: routingOpts.routeStyle.color,
                    width: routingOpts.routeStyle.width
                })
            });
            vm.set('routeStyle', routeStyle);
        }

        if (routingOpts.routeSegmentStyle) {
            var routeSegmentStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: routingOpts.routeSegmentStyle.color,
                    width: routingOpts.routeSegmentStyle.width
                })
            });
            vm.set('routeSegmentStyle', routeSegmentStyle);
        }

        if (routingOpts.waypointStyle) {
            var waypointStyle = new ol.style.Style({
                text: new ol.style.Text({
                    // unicode for fontawesome map-marker
                    text: '\uf041',
                    font: 'normal ' + routingOpts.waypointStyle.markerSize + 'px FontAwesome',
                    fill: new ol.style.Fill({
                        color: routingOpts.waypointStyle.color
                    }),
                    textBaseline: 'bottom'
                })
            });
            vm.set('waypointStyle', waypointStyle);
            vm.set('waypointFontSize', routingOpts.waypointStyle.markerSize);
        }

        if (routingOpts.elevationStyle) {
            var elevationStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color: routingOpts.elevationStyle.fill
                    }),
                    radius: routingOpts.elevationStyle.radius,
                    stroke: new ol.style.Stroke({
                        color: routingOpts.elevationStyle.stroke
                    })
                })
            });
            vm.set('elevationStyle', elevationStyle);
        }

        if (!me.map) {
            me.map = BasiGX.view.component.Map.guess().getMap();
        }

        // TODO probably set all items of the view dynamically here
        me.add({
            xtype: 'k-container-routingresult',
            name: me.routingResultPanelName,
            routeLayerName: me.routeLayerName,
            routeSegmentLayerName: me.routeSegmentLayerName,
            elevationProfilePanelName: me.elevationProfilePanelName,
            elevationLayerName: me.elevationLayerName,
            map: me.map,
            flex: 1
        });

    }
});
