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
        'Koala.view.panel.ElevationProfile',
        'Koala.util.OpenRouteService'
    ],

    controller: 'k-container-routingresult',

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
        beforedestroy: 'onDestroy'
    },

    items: [
        {
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
            allowDeselect: true,
            listeners: {
                itemclick: 'zoomToRoute'
            },
            columns: [
                {
                    dataIndex: 'profile',
                    sortable: false,
                    hideable: false,
                    flex: 1,
                    align: 'center',
                    tdCls: 'routing-summary-icon-cell',
                    renderer: function(profile) {
                        var orsUtil = Koala.util.OpenRouteService;
                        return orsUtil.getIconFromProfile(profile);
                    }
                }, {
                    sortable: false,
                    hideable: false,
                    flex: 2,
                    renderer: function(val, metaData, rec) {
                        var orsUtil = Koala.util.OpenRouteService;

                        var duration = rec.get('duration');
                        var distance = rec.get('distance');
                        var ascent = rec.get('ascent');
                        var descent = rec.get('descent');

                        var durationFormatted = orsUtil.getFormattedDuration(duration, true);
                        var distanceFormatted = orsUtil.getFormattedDistance(distance, true, 1000);
                        var ascentFormatted = orsUtil.getFormattedDistance(ascent, true);
                        var descentFormatted = orsUtil.getFormattedDistance(descent, true);

                        var content = '<div class="routing-summary-cell"><div>';
                        content += '<span><i class="fa fa-clock-o" aria-hidden="true"></i> ' + durationFormatted + '</span>';
                        content += '<span><i class="fa fa-arrows-h" aria-hidden="true"></i> ' + distanceFormatted + '</span>';
                        content += '</div><div>';
                        content += '<span><i class="fa fa-long-arrow-up" aria-hidden="true"></i> ' + ascentFormatted + '</span>';
                        content += '<span><i class="fa fa-long-arrow-down" aria-hidden="true"></i> ' + descentFormatted + '</span>';
                        content += '</div></div>';

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

        // var ctrl = me.getController();
        // if (ctrl) {
        //     ctrl.addElevationPanel();
        // }

        if (!me.map) {
            me.map = BasiGX.view.component.Map.guess().getMap();
        }
    }

});
