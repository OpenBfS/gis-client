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
        'BasiGX.view.component.Map',
        'Koala.view.container.ModernRoutingResultController',
        'Koala.view.window.RoutingModel'
    ],

    controller: 'k-container-modernroutingresult',

    viewModel: {
        type: 'k-window-routing'
    },

    statics: {
        /**
         * Get the proper icon for given instruction type.
         *
         * Instruction types are defined by OpenRouteService on
         * https://github.com/GIScience/openrouteservice-docs#instruction-types
         *
         * Since FontAwesome 4 does not provite arbitrary rotations of icons,
         * we have to create custom rotation classes in RoutingResult.scss.
         *
         * @param {Number} type The instruction type.
         * @returns {String} The html string representation of the icon.
         */
        getIconFromType: function(type) {
            var iconCls = '';
            switch (type) {
                case 0:
                    // left turn
                    iconCls = 'fa-arrow-left';
                    break;
                case 1:
                    // right turn
                    iconCls = 'fa-arrow-right';
                    break;
                case 2:
                    // sharp left
                    iconCls = 'fa-arrow-up fa-rotate-225';
                    break;
                case 3:
                    // sharp right
                    iconCls = 'fa-arrow-up fa-rotate-135';
                    break;
                case 4:
                    // slight left
                    iconCls = 'fa-arrow-up fa-rotate-315';
                    break;
                case 5:
                    // slight right
                    iconCls = 'fa-arrow-up fa-rotate-45';
                    break;
                case 6:
                    // straight
                    iconCls = 'fa-arrow-up';
                    break;
                case 7:
                    // enter roundabout
                    iconCls = 'fa-rotate-left';
                    break;
                case 8:
                    // exit roundabout
                    iconCls = 'fa-rotate-left';
                    break;
                case 9:
                    // u-turn
                    iconCls = 'fa-rotate-left';
                    break;
                case 10:
                    // goal
                    iconCls = 'fa-flag';
                    break;
                case 11:
                    // depart
                    iconCls = 'fa-home';
                    break;
                case 12:
                    // keep left
                    iconCls = 'fa-arrow-up fa-rotate-315';
                    break;
                case 13:
                    // keep right
                    iconCls = 'fa-arrow-up fa-rotate-45';
                    break;
                default:
                    break;
            }

            return '<i class="fa ' + iconCls + '" aria-hidden="true"></i>';
        },

        /**
         * Get the icon for given routing profile.
         *
         * @param {String} profile The routing profile.
         */
        getIconFromProfile: function(profile) {
            var iconCls = '';

            switch (profile) {
                case 'foot-walking':
                    iconCls = 'fa-male';
                    break;
                case 'cycling-regular':
                    iconCls = 'fa-bicycle';
                    break;
                case 'driving-car':
                    iconCls = 'fa-car';
                    break;
                default:
                    return;
            }

            return '<i class="fa ' + iconCls + '" aria-hidden="true"></i>';
        },

        /**
         * Format duration.
         *
         * Formats the duration as human readable durations (e.g. 15 minutes).
         *
         * @param {Number} duration The duration to format in seconds.
         * @param {Boolean} plainText If true, just returns the plain text.
         * @returns {String} The formatted duration html string.
         */
        getFormattedDuration: function(duration, plainText) {
            var durationFormatted = moment.duration(duration, 'seconds').humanize();
            if (plainText) {
                return durationFormatted;
            }
            return '<b>' + durationFormatted + '</b>';
        },

        /**
         * Format distance.
         *
         * Rounds the distance to a proper metric unit (e.g. km).
         *
         * @param {Number} distance The distance to format in meters.
         * @param {Boolean} plainText If true, just returns the plain text.
         * @returns {String} The formatted distance html string.
         */
        getFormattedDistance: function(distance, plainText) {
            var distanceFormatted = D3Util.d3.format('.2~s')(distance);
            var lastChar = distanceFormatted.slice(-1);

            if (plainText) {
                return distanceFormatted + 'm';
            }

            // check if last character is a SI unit suffix
            if (isNaN(parseInt(lastChar, 10))) {
                return '<b>' + distanceFormatted.slice(0, -1) + '</b>' + lastChar + 'm';
            } else {
                return '<b>' + distanceFormatted + '</b>m';
            }
        }
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

    map: null,

    /** The name of the layer that contains the route */
    routeLayerName: 'routing-route-layer',

    /** The name of the layer that contains the route */
    routeSegmentLayerName: 'routing-route-segment-layer',

    /** The name of the layer for elevation interaction */
    elevationLayerName: 'routing-elevation-layer',

    listeners: {
        resultChanged: 'onRoutingResultChanged'
    },

    items: [{
        xtype: 'grid',
        name: 'routing-test',
        hideHeaders: true,
        bind: {
            store: '{routingsummaries}'
        },
        height: 100,
        minHeight: 100,
        maxHeight: '50%',
        columns: [{
            dataIndex: 'profile',
            cell: {
                xtype: 'gridcell',
                encodeHtml: false,
                align: 'center'
            },
            renderer: function(profile) {
                var staticMe = Koala.view.container.RoutingResult;
                return staticMe.getIconFromProfile(profile);
            }
        }, {
            dataIndex: 'duration',
            flex: 1,
            cell: {
                type: 'gridcell',
                encodeHtml: false,
                align: 'left'
            },
            renderer: function(val, rec) {
                var staticMe = Koala.view.container.RoutingResult;
                var duration = rec.get('duration');
                var distance = rec.get('distance');
                var ascent = rec.get('ascent');
                var descent = rec.get('descent');

                var durationFormatted = staticMe.getFormattedDuration(duration, true);
                var distanceFormatted = staticMe.getFormattedDistance(distance, true);
                var ascentFormatted = staticMe.getFormattedDistance(ascent, true);
                var descentFormatted = staticMe.getFormattedDistance(descent, true);

                var content = '<div class="routing-summary-cell"><div>';
                content += '<span><i class="fa fa-clock-o" aria-hidden="true"></i> ' + durationFormatted + '</span>';
                content += '<span><i class="fa fa-arrows-h" aria-hidden="true"></i> ' + distanceFormatted + '</span>';
                content += '</div><div>';
                content += '<span><i class="fa fa-long-arrow-up" aria-hidden="true"></i> ' + ascentFormatted + '</span>';
                content += '<span><i class="fa fa-long-arrow-down" aria-hidden="true"></i> ' + descentFormatted + '</span>';
                content += '</div></div>';

                return content;
            }
        }]
    }, {
        xtype: 'lockable-carousel',
        name: 'routingcarousel',
        width: '100%',
        flex: 1,
        items: [{
        //     xtype: 'k-panel-routinginstructions'
        // }, {
        //     xtype: 'k-panel-routingelevation'
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
