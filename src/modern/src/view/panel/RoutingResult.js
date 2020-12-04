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
Ext.define('Koala.view.panel.RoutingResult', {
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-routingresult',

    requires: [
        'Koala.view.container.RoutingResultController',
        // 'Koala.view.panel.ElevationProfile'
    ],

    controller: 'k-container-routingresult',

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
         * Format duration.
         *
         * Formats the duration as human readable durations (e.g. 15 minutes).
         *
         * @param {Number} duration The duration to format in seconds.
         * @returns {String} The formatted duration html string.
         */
        getFormattedDuration: function(duration) {
            var durationFormatted = moment.duration(duration, 'seconds').humanize();
            return '<b>' + durationFormatted + '</b>';
        },

        /**
         * Format distance.
         *
         * Rounds the distance to a proper metric unit (e.g. km).
         *
         * @param {Number} distance The distance to format in meters.
         * @returns {String} The formatted distance html string.
         */
        getFormattedDistance: function(distance) {
            var distanceFormatted = D3Util.d3.format('.2~s')(distance);
            var lastChar = distanceFormatted.slice(-1);

            // check if last character is a SI unit suffix
            if (isNaN(parseInt(lastChar, 10))) {
                return '<b>' + distanceFormatted.slice(0, -1) + '</b>' + lastChar + 'm';
            } else {
                return '<b>' + distanceFormatted + '</b>m';
            }
        }
    },

    layout: 'vbox',

    width: '100%',

    height: '50%',

    docked: 'bottom',

    hideOnMaskTap: 'false',

    masked: false,

    defaults: {
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

    /** The name of the layer that contains the route */
    routeSegmentLayerName: 'routing-route-segment-layer',

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
        }, {
            xtype: 'grid',
            flex: 1,
            bind: {
                store: '{routinginstructions}'
            },
            listeners: {
                itemmouseenter: 'onGridMouseEnter',
                itemmouseleave: 'onGridMouseLeave',
                select: 'onGridSelect'
            },
            columns: [
                {
                    dataIndex: 'type',
                    flex: 1,
                    sortable: false,
                    hideable: false,
                    align: 'center',
                    tdCls: 'routing-icon-cell',
                    renderer: function(type) {
                        var staticMe = Koala.view.container.RoutingResult;
                        return staticMe.getIconFromType(type);
                    }
                }, {
                    dataIndex: 'instruction',
                    flex: 10,
                    tdCls: 'routing-icon-cell',
                    sortable: false,
                    hideable: false,
                    renderer: function(instruction, metaData, rec) {
                        var staticMe = Koala.view.container.RoutingResult;
                        var distance = rec.get('distance');
                        var duration = rec.get('duration');

                        var distanceFormatted = staticMe.getFormattedDistance(distance);
                        var durationFormatted = staticMe.getFormattedDuration(duration);
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
        }
    ],

    initComponent: function() {
        var me = this;
        me.callParent(arguments);

        // TODO
        // var elevationPanel = Ext.create('Koala.view.panel.ElevationProfile', {
        //     name: me.elevationProfilePanelName,
        //     elevationLayerName: me.elevationLayerName
        // });

        // var southContainer = Ext.ComponentQuery.query('[name=south-container]')[0];
        // if (southContainer) {
        //     southContainer.add(elevationPanel);
        // }
    }

});
