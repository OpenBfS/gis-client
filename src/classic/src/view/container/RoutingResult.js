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
 * @class Koala.view.container.RoutingResult
 */
Ext.define('Koala.view.container.RoutingResult', {
    extend: 'Ext.container.Container',

    xtype: 'k-container-routingresult',

    requires: [
        'Koala.view.container.RoutingResultController',
        'Koala.view.panel.ElevationProfile',
    ],

    controller: 'k-container-routingresult',

    layout: 'fit',

    width: '100%',

    defaults: {
        flex: 1,
        width: '100%'
    },

    bind: {
        hidden: '{!showRoutingResults}'
    },

    map: null,

    /** The name of the elevationProfilePanel*/
    elevationProfilePanelName: 'routing-elevationprofile-panel',

    /** The name of the layer that contains the route */
    routeLayerName: 'routing-route-layer',

    /** The name of the layer for elevation interaction */
    elevationLayerName: 'routing-elevation-layer',

    listeners: {
        onboxready: 'onBoxReady',
        resultChanged: 'onRoutingResultChanged',
        beforedestroy: 'onDestroy'
    },

    // add routing summary component
    // add routing instructions component
    items: [
        {
            xtype: 'container',
            layout: 'hbox',
            items: [
                {
                    xtype: 'button',
                    name: 'routing-elevation-trigger',
                    flex: 1,
                    handler: 'onElevationBtnClick',
                    enableToggle: true,
                    bind: {
                        text: '{i18n.elevationBtnText}'
                    }
                }, {
                    xtype: 'button',
                    flex: 1,
                    glyph: 'xf019@FontAwesome',
                    bind: {
                        text: '{i18n.downloadButtonText}'
                    },
                    arrowAlign: 'right',
                    menu: [
                        {
                            downloadType: 'gpx',
                            text: '.gpx',
                            listeners: {
                                click: 'onDownloadButtonClicked'
                            }
                        }, {
                            downloadType: 'geojson',
                            text: '.geojson',
                            listeners: {
                                click: 'onDownloadButtonClicked'
                            }
                        }
                    ]
                }

            ]
        }
    ],

    initComponent: function() {
        var me = this;
        me.callParent(arguments);

        var elevationPanel = Ext.create('Koala.view.panel.ElevationProfile', {
            name: me.elevationProfilePanelName,
            elevationLayerName: me.elevationLayerName
        });

        var southContainer = Ext.ComponentQuery.query('[name=south-container]')[0];
        if (southContainer) {
            southContainer.add(elevationPanel);
        }
    }

});
