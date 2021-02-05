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
 * @class Koala.view.container.FleetRoutingResult
 */
Ext.define('Koala.view.container.FleetRoutingResult', {
    extend: 'Ext.container.Container',

    xtype: 'k-container-fleetroutingresult',

    requires: [
        'Ext.grid.Panel',
        'Ext.grid.column.Widget',
        'Ext.button.Button',
        'Koala.view.container.FleetRoutingResultController',
        'Koala.view.panel.ElevationProfile',
        'Koala.util.OpenRouteService'
    ],

    controller: 'k-container-fleetroutingresult',

    layout: 'vbox',

    width: '100%',

    defaults: {
        width: '100%'
    },

    bind: {
        hidden: '{!showRoutingResults}'
    },

    map: null,

    waypointLayerName: 'routing-waypoint-layer',

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
                itemclick: 'zoomToWayPointLayer'
            },
            columns: [
                {
                    flex: 1,
                    renderer: function(val, metaData, rec) {
                        var vm = this.lookupViewModel();

                        var totalDuration = rec.get('duration') +
                                            rec.get('service') +
                                            rec.get('waiting_time');
                        var orsUtil = Koala.util.OpenRouteService;
                        var durationFormatted = orsUtil.getFormattedDuration(totalDuration, true);

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
                        var orsUtil = Koala.util.OpenRouteService;
                        var durationFormatted = orsUtil.getFormattedDuration(duration, true);

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
                    // TODO maybe add tooltip with vehicle description
                    dataIndex: 'vehicle',
                    width: 40,
                    sortable: false
                }, {
                    flex: 2,
                    sortable: false,
                    renderer: function(val, metaData, rec) {
                        var vm = this.lookupViewModel();

                        var jobsStore = this.up('k-window-fleet-routing')
                            .down('k-grid-routing-jobs')
                            .getStore();

                        var vehiclesStore = this.up('k-window-fleet-routing')
                            .down('k-grid-routing-vehicles')
                            .getStore();

                        var vehicle = vehiclesStore.getById(rec.get('vehicle'));

                        var steps = rec.get('steps');
                        var targets = Ext.Array.filter(steps, function(step) {
                            return step.type === 'job' || step.type === 'start' || step.type === 'end';
                        });
                        var content = Ext.Array.map(targets, function(target, i) {
                            var targetDescription;
                            if (target.type === 'job') {
                                var job = jobsStore.getById(target.id);
                                var label = vm.get('i18n.viaText');
                                if (i === 0) {
                                    // Use the start label
                                    // if job is the first step.
                                    label = vm.get('i18n.startText');
                                }
                                targetDescription = '' +
                                    '<i>' + label + '</i>: <b>' + job.get('address').address + '</b>';
                            } else if (target.type === 'start' && vehicle.get('start')) {
                                targetDescription = '' +
                                    '<i>' + vm.get('i18n.startText') + '</i>: ' + vehicle.get('start').address;
                            } else if (target.type === 'end' && vehicle.get('end')) {
                                targetDescription = '' +
                                    '<i>' + vm.get('i18n.viaText') + '</i>: ' + vehicle.get('end').address;
                            }
                            return targetDescription;
                        });

                        return '<div data-qtip="' + content.join('<br />') +'">' + content.join('<br />') + '</div>';
                    }
                }, {
                    sortable: false,
                    flex: 1,
                    renderer: function(val, metaData, rec) {
                        var orsUtil = Koala.util.OpenRouteService;

                        var duration = rec.get('duration');
                        var distance = rec.get('distance');

                        duration = rec.get('duration') + rec.get('service') + rec.get('waiting_time');

                        var durationFormatted = orsUtil.getFormattedDuration(duration, true);
                        var distanceFormatted = orsUtil.getFormattedDistance(distance, true);

                        var content = '<div class="routing-summary-cell">';
                        content += '<span><i class="fa fa-clock-o" aria-hidden="true"></i> ' + durationFormatted + '</span><br />';
                        content += '<span><i class="fa fa-arrows-h" aria-hidden="true"></i> ' + distanceFormatted + '</span>';
                        content += '</div>';

                        return content;
                    }
                },{
                    xtype: 'widgetcolumn',
                    flex: 1,
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
                        var orsUtil = Koala.util.OpenRouteService;
                        return orsUtil.getIconFromType(type);
                    }
                }, {
                    dataIndex: 'instruction',
                    flex: 10,
                    tdCls: 'routing-icon-cell',
                    sortable: false,
                    hideable: false,
                    renderer: function(instruction, metaData, rec) {
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
        }
    ],

    initComponent: function() {
        var me = this;
        me.callParent(arguments);

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
