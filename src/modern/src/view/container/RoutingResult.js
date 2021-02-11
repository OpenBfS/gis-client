/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
    extend: 'Ext.Container',
    xtype: 'k-container-routingresult',

    requires: [
        'Ext.grid.Grid',
        'BasiGX.view.component.Map',
        'Koala.view.container.ModernRoutingResultController',
        'Koala.view.container.LockableCarousel',
        'Koala.view.window.ClassicRoutingModel',
        'Koala.view.container.ElevationProfile',
        'Koala.util.OpenRouteService'
    ],

    controller: 'k-container-modernroutingresult',

    viewModel: {
        type: 'k-window-classic-routing'
    },

    name: 'routing-result-panel',

    width: '100%',

    height: '50%',

    docked: 'bottom',

    layout: 'vbox',

    zIndex: 9998,

    showAnimation: {
        type: 'slide',
        direction: 'up'
    },

    hideAnimation: {
        type: 'slideOut',
        direction: 'down'
    },

    map: null,

    /** The name of the layer that contains the route */
    routeLayerName: 'routing-route-layer',

    // TODO: is this layer needed in the modern view?
    /** The name of the layer that contains the route */
    routeSegmentLayerName: 'routing-route-segment-layer',

    /** The name of the layer for elevation interaction */
    elevationLayerName: 'routing-elevation-layer',

    elevationProfilePanelName: 'routing-elevation-panel',

    listeners: {
        resultChanged: 'onRoutingResultChanged',
        painted: 'onPainted',
        hideViews: 'hideViews'
    },

    items: [{
        xtype: 'grid',
        name: 'routing-summary-grid',
        hideHeaders: true,
        bind: {
            store: '{routingsummaries}'
        },
        height: 82,
        columns: [{
            dataIndex: 'profile',
            cell: {
                xtype: 'gridcell',
                encodeHtml: false,
                align: 'center'
            },
            renderer: function(profile) {
                var orsUtil = Koala.util.OpenRouteService;
                return orsUtil.getIconFromProfile(profile);
            }
        }, {
            // we have to set dataIndex to a field,
            // otherwise the column will not be rerendered.
            dataIndex: 'duration',
            flex: 1,
            cell: {
                type: 'gridcell',
                encodeHtml: false,
                align: 'left'
            },
            renderer: function(val, rec) {
                var orsUtil = Koala.util.OpenRouteService;

                var duration = rec.get('duration');
                var distance = rec.get('distance');
                var ascent = rec.get('ascent');
                var descent = rec.get('descent');

                var durationFormatted = orsUtil.getFormattedDuration(duration, true);
                var distanceFormatted = orsUtil.getFormattedDistance(distance, true, 1000);
                var ascentFormatted = orsUtil.getFormattedDistance(ascent, true);
                var descentFormatted = orsUtil.getFormattedDistance(descent, true);

                var content = '<div class="routing-summary-cell routing-modern"><div>';
                content += '<span><i class="fa fa-clock-o" aria-hidden="true"></i> ' + durationFormatted + '</span>';
                content += '<span><i class="fa fa-arrows-h" aria-hidden="true"></i> ' + distanceFormatted + '</span>';
                content += '</div><div>';
                content += '<span><i class="fa fa-long-arrow-up" aria-hidden="true"></i> ' + ascentFormatted + '</span>';
                content += '<span><i class="fa fa-long-arrow-down" aria-hidden="true"></i> ' + descentFormatted + '</span>';
                content += '</div></div>';

                return content;
            }
        }, {
            cell: {
                xtype: 'widgetcell',
                widget: {
                    xtype: 'button',
                    iconCls: 'fa fa-cog',
                    handler: 'onSettingsButtonClick'
                }
            }
        }]
    }, {
        xtype: 'lockable-carousel',
        name: 'routingcarousel',
        width: '100%',
        flex: 5,
        items: [{
            xtype: 'grid',
            flex: 1,
            hideHeaders: true,
            padding: '0 0 15 0',
            bind: {
                store: '{routinginstructions}'
            },
            columns: [
                {
                    dataIndex: 'type',
                    flex: 1,
                    sortable: false,
                    hideable: false,
                    align: 'center',
                    cell: {
                        type: 'gridcell',
                        encodeHtml: false,
                        align: 'center'
                    },
                    renderer: function(type) {
                        var orsUtil = Koala.util.OpenRouteService;
                        return orsUtil.getIconFromType(type);
                    }
                }, {
                    dataIndex: 'instruction',
                    flex: 10,
                    sortable: false,
                    hideable: false,
                    cell: {
                        type: 'gridcell',
                        encodeHtml: false,
                        align: 'left'
                    },
                    renderer: function(instruction, rec) {
                        var orsUtil = Koala.util.OpenRouteService;
                        var distance = rec.get('distance');
                        var duration = rec.get('duration');

                        var distanceFormatted = orsUtil.getFormattedDistance(distance);
                        var durationFormatted = orsUtil.getFormattedDuration(duration);
                        var instructionFormatted = '';
                        var content = '<div>';

                        // Do not show distance and duration on destination field.
                        if (rec.get('type') === 10) {
                            instructionFormatted = '<div style="padding-bottom: 10px; padding-top: 10px">' + instruction + '</div>';
                            content += instructionFormatted;
                        } else {
                            instructionFormatted = '<div style="padding-bottom: 10px">' + instruction + '</div>';
                            content += instructionFormatted;
                            content += distanceFormatted + ' | ';
                            content += durationFormatted;
                        }
                        content += '</div>';

                        return content;
                    }
                }
            ]
        }, {
            xtype: 'k-container-elevationprofile',
            name: 'routing-elevation-panel',
            padding: '15 10'
        }]
    }],

    initialize: function() {
        var me = this;
        me.callParent(arguments);

        if (me.map === null) {
            me.map = BasiGX.view.component.Map.guess().getMap();
        }
    }

});
