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
        'BasiGX.view.component.Map',
        'Koala.view.window.RoutingModel',
        'Koala.view.window.RoutingController',
        'Koala.view.window.ElevationProfileWindow'
    ],

    controller: 'k-window-routing',
    viewModel: {
        type: 'k-window-routing'
    },

    waypointLayerName: 'routing-waypoint-layer',

    routeLayerName: 'routing-route-layer',

    map: null,

    bind: {
        title: '{i18n.title}'
    },

    height: 300,
    width: 300,

    layout: 'fit',

    items: [
        {
            xtype: 'form',
            bodyPadding: 10,
            items: [
                {
                    xtype: 'textfield',
                    bind: {
                        fieldLabel: '{i18n.startFieldTitle}'
                    },
                    name: 'startField',
                    allowBlank: false
                },
                {
                    xtype: 'textfield',
                    bind: {
                        fieldLabel: '{i18n.endFieldTitle}'
                    },
                    name: 'endField',
                    allowBlank: false
                }
            ],
            fbar: [
                {
                    type: 'button',
                    bind: {
                        text: '{i18n.computeRouteButtonText}'
                    },
                    handler: 'makeRoutingRequest'
                }
            ]
        }
    ],

    fbar: [
        {
            xtype: 'button',
            name: 'routing-elevation-trigger',
            handler: 'onElevationBtnClick',
            enableToggle: true,
            bind: {
                text: '{i18n.elevationBtnText}'
            }
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
        onWaypointAdded: 'onWaypointAdded',
        boxReady: 'onBoxReady',
        close: 'onWindowClose',
        setFormEntries: 'setFormEntries',
        makeRoutingRequest: 'makeRoutingRequest'
    },

    constructor: function() {
        var me = this;
        this.callParent(arguments);

        var vm = me.lookupViewModel();

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
            vm.set('routeStyle', routeStyle);
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

        var wayPointStore = vm.get('waypoints');

        wayPointStore.on('datachanged',
            function() {
                me.fireEvent('setFormEntries');

                // trigger routing
                // TODO: add a `routing_possible` event to the ViewModel
                //       and bind it to the button or the automatic routing request
                me.fireEvent('makeRoutingRequest');
            }
        );

        if (!me.map) {
            me.map = BasiGX.view.component.Map.guess().getMap();
        }

    }
});
