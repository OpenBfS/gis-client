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
 * @class Koala.view.panel.MobileRouting
 */
Ext.define('Koala.view.panel.MobileRouting',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobilerouting',

    requires: [
        'Ext.Button',
        'Ext.SegmentedButton',
        'Ext.grid.Grid',
        'Ext.Toolbar',
        'Ext.Spacer',
        'Koala.util.AppContext',
        'BasiGX.view.component.Map',
        'Koala.view.panel.MobileRoutingController',
        'Koala.view.window.ClassicRoutingModel',
        'Koala.view.form.ClassicRoutingSettings'
    ],

    controller: 'k-panel-mobilerouting',
    viewModel: {
        type: 'k-window-classic-routing'
    },

    layout: 'vbox',

    bind: {
        title: '{i18n.title}'
    },

    scrollable: 'y',

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

    tools: [{
        type: 'left',
        docked: 'left',
        handler: 'onCloseToolClicked'
    }],

    listeners: {
        painted: 'onPainted',
        updateWayPointLayer: 'updateWayPointLayer',
        clearRouting: 'onCloseToolClicked'
    },

    items: [{
        xtype: 'segmentedbutton',
        defaults: {
            flex: 1
        },
        bind: {
            value: '{routingProfile}'
        },
        items: [{
            iconCls: 'x-fa fa-car',
            value: 'driving-car',
            bind: {
                pressed: '{routingProfile === "driving-car"}'
            }
        }, {
            iconCls: 'x-fa fa-bicycle',
            value: 'cycling-regular',
            bind: {
                pressed: '{routingProfile === "cycling-regular"}'
            }
        }, {
            iconCls: 'x-fa fa-male',
            value: 'foot-walking',
            bind: {
                pressed: '{routingProfile === "foot-walking"}'
            }
        }]
    }, {
        xtype: 'k-form-classic-routing-settings',
        maxHeight: '40%'
    }, {
        xtype: 'button',
        bind: {
            text: '{i18n.addViaPoint}'
        },
        handler: 'addEmptyViaPoint'
    },{
        xtype: 'grid',
        flex: 1,
        hideHeaders: true,
        bind: {
            store: '{geocodingsuggestions}'
        },
        listeners: {
            select: 'applySuggestion'
        },
        columns: [{
            dataIndex: 'address',
            flex: 1,
            cell: {
                height: 50
            }
        }]
    }, {
        xtype: 'toolbar',
        docked: 'bottom',
        items: [{
            xtype: 'spacer'
        }, {
            xtype: 'button',
            iconCls: 'fa fa-arrow-right',
            iconAlign: 'right',
            style: {
                fontSize: 'large'
            },
            bind: {
                text: '{i18n.computeRouteButtonText}'
            },
            handler: 'onComputeRouteClick'
        }]
    }],

    initialize: function() {
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

        var resultPanel = Ext.ComponentQuery.query('[name' + me.routingResultPanelName + ']')[0];
        if (resultPanel) {
            resultPanel.setViewModel(vm);
        }
    }

});
