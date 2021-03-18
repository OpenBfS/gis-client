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
 * @class Koala.view.container.IsochroneRoutingResult
 */
Ext.define('Koala.view.container.IsochroneRoutingResult', {
    extend: 'Ext.container.Container',

    xtype: 'k-container-isochroneroutingresult',

    requires: [
        'Ext.grid.Panel',
        'BasiGX.view.component.Map',
        'Koala.view.container.IsochroneRoutingResultController',
        'Koala.util.OpenRouteService'
    ],

    controller: 'k-container-isochroneroutingresult',

    layout: 'vbox',

    width: '100%',

    defaults: {
        width: '100%'
    },

    map: null,

    waypointLayerName: 'routing-waypoint-layer',

    isochroneLayerName: 'routing-isochrone-layer',

    items: [{
        xtype: 'grid',
        name: 'isochrone-result-grid',
        bind: {
            store: '{isochrones}'
        },
        columns: [{
            dataIndex: 'value',
            flex: 1,
            align: 'end',
            bind: {
                text: '{i18n.valueColumn}'
            },
            renderer: function(value, metaData, rec) {
                var orsUtil = Koala.util.OpenRouteService;

                var range_type = rec.get('range_type');
                if (range_type === 'time') {
                    return orsUtil.getFormattedDuration(value, true);
                } else if (range_type === 'distance') {
                    return orsUtil.getFormattedDistance(value, true);
                }

                return;
            }
        }, {
            dataIndex: 'area',
            flex: 1,
            align: 'end',
            bind: {
                text: '{i18n.areaColumn}'
            },
            renderer: function(area) {
                var orsUtil = Koala.util.OpenRouteService;
                // we have to divide by 1000 as otherwise the
                // conversion to km² is incorrect.
                return orsUtil.getFormattedArea(area / 1000, true, 1000);
            }
        }, {
            dataIndex: 'reachfactor',
            flex: 1,
            align: 'end',
            bind: {
                text: '{i18n.reachfactorColumn}'
            },
            renderer: function(reachfactor) {
                if (reachfactor) {
                    return reachfactor.toFixed(2);
                }
                return reachfactor;
            }
        }, {
            dataIndex: 'population',
            flex: 1,
            align: 'end',
            bind: {
                text: '{i18n.populationColumn}'
            }
        }]
    }],

    listeners: {
        resultChanged: 'onRoutingResultChanged'
    },

    initComponent: function() {
        var me = this;
        me.callParent(arguments);

        if (!me.map) {
            me.map = BasiGX.view.component.Map.guess().getMap();
        }
    }

});
