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
 * @class Koala.view.window.ClassicRouting
 */
Ext.define('Koala.view.window.ClassicRouting', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-classic-routing',

    requires: [
        'Ext.container.Container',
        'Ext.form.field.ComboBox',
        'Ext.button.Button',
        'Ext.drag.Target',
        'Ext.drag.Source',
        'Ext.menu.Menu',
        'Koala.util.Help',
        'BasiGX.view.component.Map',
        'Koala.view.window.ClassicRoutingModel',
        'Koala.view.window.ClassicRoutingController',
        'Koala.view.container.RoutingResult',
        'Koala.view.panel.ElevationProfile',
        'Koala.view.form.ClassicRoutingSettings'
    ],

    controller: 'k-window-classic-routing',
    viewModel: {
        type: 'k-window-classic-routing'
    },

    waypointLayerName: 'routing-waypoint-layer',

    routeLayerName: 'routing-route-layer',

    routeSegmentLayerName: 'routing-route-segment-layer',

    avoidAreaLayerName: 'routing-avoid-area-layer',

    map: null,

    /** The interaction for drawing the avoid area */
    avoidAreaDrawInteraction: null,

    /** The name of the routingResultPanel */
    routingResultPanelName: 'routing-result-panel',

    /** The name of the elevationProfilePanel*/
    elevationProfilePanelName: 'routing-elevationprofile-panel',

    /** The name of the layer for elevation interaction */
    elevationLayerName: 'routing-elevation-layer',

    minHeight: 100,
    maxHeight: 600,
    width: 500,

    layout: 'vbox',

    bind: {
        title: '{i18n.classicRoutingtitle}'
    },

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
        boxready: 'onBoxReady',
        close: 'onWindowClose',
        makeRoutingRequest: 'makeRoutingRequest',
        updateWayPointLayer: 'updateWayPointLayer'
    },

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        if (!me.map) {
            me.map = BasiGX.view.component.Map.guess().getMap();
        }

        me.add({
            xtype: 'k-form-classic-routing-settings'
        });
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
