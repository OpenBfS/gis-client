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
        'Ext.grid.Panel',
        'Ext.grid.column.Widget',
        'Ext.button.Button',
        'Koala.view.container.RoutingResultController',
        'Koala.view.panel.ElevationProfile'
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

    layout: 'vbox',

    width: '100%',

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
        resultChanged: 'onRoutingResultChanged',
        beforedestroy: 'onDestroy',
        optimizationResultAvailable: 'onOptimizationResultAvailable'
    },

    items: [
        {
            xtype: 'grid',
            name: 'fleet-summary-grid',
            // hidden by default, will become visible in case of fleet routing
            hidden: true,
            tbar: [
                {
                    xtype: 'tbtext',
                    style: {
                        fontSize: 'medium'
                    },
                    bind: {
                        html: '<b>{i18n.fleetRoutingSummary}</b>'
                    }
                }
            ],
            bind: {
                store: '{fleetroutingsummary}'
            },
            disableSelection: true,
            listeners: {
                // TODO: add click to zoom to all
            },
            columns: [
                {
                    flex: 1,
                    renderer: function(val, metaData, rec) {
                        var vm = this.lookupViewModel();

                        var totalDuration = rec.get('duration') +
                                            rec.get('service') +
                                            rec.get('waiting_time');
                        var staticMe = Koala.view.container.RoutingResult;
                        var durationFormatted = staticMe.getFormattedDuration(totalDuration, true);

                        return ' ' +
                        '<div class="fleet-routing-summary-cell">' +
                        '    <div><b>' + vm.get('i18n.totalDuration') + '</b></div>' +
                        '    <div>' +
                        '        <span>' +
                        '            <i class="fa fa-clock-o" aria-hidden="true"></i> ' + durationFormatted +
                        '        </span>' +
                        '    </div>' +
                        '</div>';
                    }
                },
                {
                    flex: 1,
                    renderer: function(val, metaData, rec) {
                        var vm = this.lookupViewModel();

                        var duration = rec.get('duration');
                        var staticMe = Koala.view.container.RoutingResult;
                        var durationFormatted = staticMe.getFormattedDuration(duration, true);

                        return ' ' +
                        '<div class="fleet-routing-summary-cell">' +
                        '    <div><b>' + vm.get('i18n.totalDrivingDuration') + '</b></div>' +
                        '    <div>' +
                        '        <span>' +
                        '            <i class="fa fa-clock-o" aria-hidden="true"></i> ' + durationFormatted +
                        '        </span>' +
                        '    </div>' +
                        '</div>';
                    }
                },
                {
                    flex: 1,
                    renderer: function(val, metaData, rec) {
                        var vm = this.lookupViewModel();

                        var service = rec.get('service');
                        var staticMe = Koala.view.container.RoutingResult;
                        var serviceFormatted = service;
                        if (service !== 0) {
                            serviceFormatted = staticMe.getFormattedDuration(service, true);
                        }

                        return ' ' +
                        '<div class="fleet-routing-summary-cell">' +
                        '    <div><b>' + vm.get('i18n.totalServiceDuration') + '</b></div>' +
                        '    <div>' +
                        '        <span>' +
                        '            <i class="fa fa-clock-o" aria-hidden="true"></i> ' + serviceFormatted +
                        '        </span>' +
                        '    </div>' +
                        '</div>';
                    }
                },
                {
                    flex: 1,
                    renderer: function(val, metaData, rec) {
                        var vm = this.lookupViewModel();

                        var waiting_time = rec.get('waiting_time');
                        var staticMe = Koala.view.container.RoutingResult;
                        var waitingFormatted = waiting_time;
                        if (waiting_time !== 0) {
                            waitingFormatted = staticMe.getFormattedDuration(waiting_time, true);
                        }

                        return ' ' +
                        '<div class="fleet-routing-summary-cell">' +
                        '    <div><b>' + vm.get('i18n.totalWaitingDuration') + '</b></div>' +
                        '    <div>' +
                        '        <span>' +
                        '            <i class="fa fa-clock-o" aria-hidden="true"></i> ' + waitingFormatted +
                        '        </span>' +
                        '    </div>' +
                        '</div>';
                    }
                },
                {
                    flex: 1,
                    renderer: function(val, metaData, rec) {
                        var vm = this.lookupViewModel();
                        var unassigned = rec.get('unassigned');

                        return ' ' +
                        '<div class="fleet-routing-summary-cell">' +
                        '    <div><b>' + vm.get('i18n.numberjobsMissing') + '</b></div>' +
                        '    <div>' +
                        '        <span>' +
                        '            ' + unassigned + ' ' + vm.get('i18n.jobsName') +
                        '        </span>' +
                        '    </div>' +
                        '</div>';
                    }
                }
            ]
        },{
            xtype: 'grid',
            name: 'routing-summary-grid',
            tbar: [
                {
                    xtype: 'tbtext',
                    style: {
                        fontSize: 'medium'
                    },
                    bind: {
                        html: '<b>{i18n.routesHeading}</b>'
                    }
                }
            ],
            defaults: {
                flex: 1
            },
            bind: {
                store: '{routingsummaries}'
            },
            listeners: {
                itemmouseenter: 'onSummaryMouseEnter',
                itemmouseleave: 'onSummaryMouseLeave'
            },
            allowDeselect: true,
            columns: [
                {
                    dataIndex: 'profile',
                    sortable: false,
                    hideable: false,
                    flex: 1,
                    align: 'center',
                    tdCls: 'routing-summary-icon-cell',
                    renderer: function(profile) {
                        var staticMe = Koala.view.container.RoutingResult;
                        return staticMe.getIconFromProfile(profile);
                    }
                }, {
                    sortable: false,
                    hideable: false,
                    flex: 3,
                    renderer: function(val, metaData, rec) {
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
                }, {
                    xtype: 'widgetcolumn',
                    flex: 2,
                    align: 'right',
                    tdCls: 'routing-icon-cell',
                    widget: {
                        xtype: 'container',
                        defaults: {
                            flex: 1,
                            margin: '0 2'
                        },
                        bind: {
                            data: '{record}'
                        },
                        items: [
                            {
                                xtype: 'button',
                                name: 'routing-elevation-trigger',
                                glyph: 'f1fe@FontAwesome',
                                handler: 'onElevationBtnClick',
                                enableToggle: true,
                                bind: {
                                    tooltip: '{i18n.elevationBtnText}'
                                }
                            }, {
                                xtype: 'button',
                                glyph: 'xf019@FontAwesome',
                                bind: {
                                    tooltip: '{i18n.downloadButtonText}'
                                },
                                arrowAlign: false,
                                menu: [
                                    {
                                        downloadType: 'gpx',
                                        text: '.gpx',
                                        listeners: {
                                            // TODO update method if we want to support
                                            // alternative routes
                                            click: 'onDownloadButtonClicked'
                                        }
                                    }, {
                                        downloadType: 'geojson',
                                        text: '.geojson',
                                        listeners: {
                                            // TODO update method if we want to support
                                            // alternative routes
                                            click: 'onDownloadButtonClicked'
                                        }
                                    }
                                ]
                            } , {
                                xtype: 'button',
                                enableToggle: true,
                                glyph: 'xf05a@FontAwesome',
                                bind: {
                                    tooltip: '{i18n.routingSummaryDetailsButton}'
                                },
                                handler: 'onDetailsButtonClicked'
                            }
                        ]
                    }
                }
            ]
        },
        {
            xtype: 'grid',
            flex: 5,
            bind: {
                store: '{routinginstructions}',
                hidden: '{!showRoutingInstructions}'
            },
            listeners: {
                itemmouseenter: 'onInstructionMouseEnter',
                itemmouseleave: 'onInstructionMouseLeave',
                select: 'onInstructionSelect'
            },
            allowDeselect: true,
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

        // if fleet routing, show fleet summary
        if (me.isFleetRouting) {
            var fleetSummaryGrid = me.down('[name=fleet-summary-grid]');
            if (fleetSummaryGrid) {
                fleetSummaryGrid.setHidden(false);
            }
        }

        var elevationPanel = Ext.create('Koala.view.panel.ElevationProfile', {
            name: me.elevationProfilePanelName,
            routeLayerName: me.routeLayerName,
            elevationLayerName: me.elevationLayerName
        });

        var southContainer = Ext.ComponentQuery.query('[name=south-container]')[0];
        if (southContainer) {
            southContainer.add(elevationPanel);
        }

        if (!me.map) {
            me.map = BasiGX.view.component.Map.guess().getMap();
        }
    }

});
