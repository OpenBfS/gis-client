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
 * @class Koala.view.window.IsochroneRouting
 */
Ext.define('Koala.view.window.IsochroneRouting', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-isochrone-routing',

    requires: [
        'BasiGX.view.component.Map',
        'Koala.view.window.IsochroneRoutingController',
        'Koala.view.window.IsochroneRoutingModel',
        'Koala.view.form.IsochroneRoutingSettings',
        'Koala.view.container.IsochroneRoutingResult',
        'Koala.view.button.AvoidArea'
    ],

    controller: 'k-window-isochrone-routing',

    viewModel: {
        type: 'k-window-isochrone-routing'
    },

    waypointLayerName: 'routing-waypoint-layer',

    avoidAreaLayerName: 'routing-avoid-area-layer',

    isochroneLayerName: 'routing-isochrone-layer',

    map: null,

    /** The interaction for drawing the avoid area */
    avoidAreaDrawInteraction: null,

    maxHeight: 900,
    width: 500,

    items: [{
        xtype: 'k-form-isochrone-routing-settings',
        flex: 1
    }, {
        xtype: 'k-container-isochroneroutingresult',
        name: 'isochronerouting-result-panel',
        bind: {
            hidden: '{!showRoutingResults}'
        }
    }
    ],

    layout: 'vbox',

    bind: {
        title: '{i18n.isochroneRoutingTitle}'
    },

    collapsible: true,
    resizable: true,
    constrainHeader: true,

    listeners: {
        expand: function() {
            // HBD: after collapse/expand extjs thinks the user manually
            // resized the window and stops automatic window resize if
            // child component sizes are updated. We can apparently
            // reset this by setting the sizes to null...
            this.setSize(null, null);
        },
        makeRoutingRequest: 'makeRoutingRequest',
        onRouteLoaded: 'onRouteLoaded',
        boxready: 'onBoxReady',
        updateWayPointLayer: 'updateWayPointLayer',
        close: 'onWindowClose'
    },

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        if (!me.map) {
            me.map = BasiGX.view.component.Map.guess().getMap();
        }
    }
});
