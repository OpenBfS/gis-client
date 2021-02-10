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
 * @class Koala.view.container.ElevationProfile
 */
Ext.define('Koala.view.container.ElevationProfile', {
    extend: 'Ext.Container',

    xtype: 'k-container-elevationprofile',

    requires: [
        'Ext.Component',
        'Ext.Container',
        'Koala.view.panel.ElevationProfileController',
        'Koala.view.panel.ElevationProfileModel'
    ],

    controller: 'k-panel-elevationprofile',

    viewModel: {
        type: 'k-panel-elevationprofile'
    },

    listeners: {
        rerender: 'createChart',
        dataChanged: 'onDataChanged'
    },

    layout: 'vbox',

    elevationContainerName: 'elevationprofile-container',

    indicatorBoxName: 'elevationprofile-indicator-box',

    elevationLayerName: null,

    routeLayerName: 'routing-route-layer',

    defaults: {
        width: '100%'
    },

    items: [{
        xtype: 'component',
        name: 'elevationprofile-container',
        flex: 1
    }, {
        xtype: 'container',
        name: 'elevationprofile-indicator-box',
        height: 20,
        defaults: {
            padding: '0 10 0 0'
        },
        layout: 'hbox',
        bind: {
            hidden: '{!showIndicatorBox}'
        },
        items: [{
            xtype: 'container',
            bind: {
                html: '<b>{distanceLabel}:</b>{distance}km'
            }
        }, {
            xtype: 'container',
            bind: {
                html: '<b>{elevationLabel}:</b>{elevation}m'
            }
        }]
    }]
});
