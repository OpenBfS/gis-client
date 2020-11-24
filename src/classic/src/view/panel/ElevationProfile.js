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
 * @class Koala.view.panel.ElevationProfile
 */
Ext.define('Koala.view.panel.ElevationProfile', {
    extend: 'Ext.panel.Panel',

    xtype: 'k-panel-elevationprofile',

    requires: [
        'Koala.view.panel.ElevationProfileController',
        'Koala.view.panel.ElevationProfileModel'
    ],

    controller: 'k-panel-elevationprofile',

    viewModel: {
        type: 'k-panel-elevationprofile'
    },

    listeners: {
        mouseout: {
            element: 'el',
            fn: 'clearElevationProfile'
        },
        boxready: 'updateChart'
    },

    bind: {
        title: '{title}'
    },

    height: 200,
    width: 900,

    elevationContainerName: 'elevationprofile-container',

    indicatorBoxName: 'elevationprofile-indicator-box',

    elevationLayerName: null,

    defaults: {
        flex: 1,
        width: '100%'
    },

    config: {
        olLayer: null
    },

    updateOlLayer: function() {
        var me = this;
        var controller = me.getController();
        if (!controller) {
            return;
        }

        if (me.isVisible()) {
            controller.updateChart();
        }
    },

    items: [{
        xtype: 'component',
        name: 'elevationprofile-container',
        height: 143
    }, {
        xtype: 'container',
        name: 'elevationprofile-indicator-box',
        height: 20,
        padding: '0 0 0 5',
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
        }, {
            xtype: 'container',
            bind: {
                html: '<b>{durationLabel}:</b>{duration}h'
            }
        }]
    }]
});
