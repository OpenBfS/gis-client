/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.view.component.D3Chart
 */
Ext.define('Koala.view.component.D3Chart',{
    extend: 'Koala.view.component.D3Base',
    xtype: 'd3-chart',

    requires: [
        'Koala.util.String',

        'Koala.view.component.D3ChartController',
        'Koala.view.component.D3ChartModel'
    ],

    controller: 'component-d3chart',
    viewModel: {
        type: 'component-d3chart'
    },

    width: 800,
    height: 500,
    margin: 5,

    name: null,

    config: {
        targetLayer: null,
        showLoadMask: true,
        zoomEnabled: false,
        backgroundColor: null,
        grid: {
            show: false,
            color: null,
            width: null,
            opacity: null
        },
        startDate: null,
        endDate: null,
        shapes: [],
        selectedStations: [],
        // TODO adjust dynamically in relation to axes/title label size
        chartMargin: {
            top: null,
            right: null,
            bottom: null,
            left: null
        },
        title: {
            label: null,
            labelSize: null,
            labelColor: null,
            labelPadding: null
        },
        legend: {
            legendEntryMaxLength: null,
            legendMargin: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        },
        axes: {
        }
    },

    statics: {
        /**
         * A factory function that creates a chart for the passed OpenLayers
         * Layer and the given OpenLayers feature.
         *
         * @param {ol.layer.Layer} olLayer The layer to create the chart for.
         * @param {ol.Feature} olFeat The feature of that layer to create a
         *     chart for.
         * @param {Date} startDate The start date.
         * @param {Date} endDate The end date.
         * @return {Koala.view.component.D3Chart} The created chart.
         */
        create: function(olLayer, olFeat, startDate, endDate) {
            var chartConfig = olLayer.get('timeSeriesChartProperties');
            var StringUtil = Koala.util.String;
            var valFromSeq = StringUtil.getValueFromSequence;
            var chartMargin = chartConfig.chartMargin ? chartConfig.chartMargin.split(',') : [];
            var chartMarginObj;
            var stationName;
            var shapes = [];
            var selectedStations = [];

            if (chartMargin.length > 0) {
                chartMarginObj = {
                    top: chartMargin[0],
                    right: chartMargin[1],
                    bottom: chartMargin[2],
                    left: chartMargin[3]
                };
            }

            if (olFeat) {
                stationName = !Ext.isEmpty(chartConfig.seriesTitleTpl) ?
                    StringUtil.replaceTemplateStrings(
                        chartConfig.seriesTitleTpl, olFeat) : "";

                shapes = [{
                    type: chartConfig.shapeType,
                    curve: chartConfig.curveType,
                    xField: chartConfig.xAxisAttribute,
                    yField: chartConfig.yAxisAttribute,
                    name: stationName,
                    id: olFeat.get('id'),
                    color: valFromSeq(chartConfig.colorSequence, 0, '#F00'),
                    opacity: valFromSeq(chartConfig.strokeOpacitySequence, 0, 1),
                    width: valFromSeq(chartConfig.strokeWidthSequence, 0, 1),
                    tooltipTpl: chartConfig.tooltipTpl
                }];

                selectedStations = [olFeat];
            }

            var chart = {
                xtype: 'd3-chart',
                name: olLayer.get('name'),
                zoomEnabled: StringUtil.coerce(chartConfig.allowZoom),
                showLoadMask: false,
                height: 200,
                width: 700,
                startDate: startDate,
                endDate: endDate,
                targetLayer: olLayer,
                selectedStations: selectedStations,
                backgroundColor: chartConfig.backgroundColor,
                chartMargin: chartMarginObj,
                shapes: shapes,
                grid: {
                    show: StringUtil.coerce(chartConfig.showGrid),
                    color: chartConfig.gridStrokeColor,
                    width: chartConfig.gridStrokeWidth,
                    opacity: chartConfig.gridStrokeOpacity
                },
                axes: {
                    left: {
                        scale: chartConfig.yAxisScale,
                        dataIndex: chartConfig.yAxisAttribute,
                        format: chartConfig.yAxisFormat,
                        label: (chartConfig.yAxisLabel || '') + ' ' + (chartConfig.dspUnit || ''),
                        labelPadding: chartConfig.labelPadding,
                        labelColor: chartConfig.labelColor,
                        labelSize: chartConfig.labelSize,
                        tickSize: chartConfig.tickSize,
                        tickPadding: chartConfig.tickPadding
                    },
                    bottom: {
                        scale: chartConfig.xAxisScale,
                        dataIndex: chartConfig.xAxisAttribute,
                        format: chartConfig.xAxisFormat,
                        label: (chartConfig.xAxisLabel || '') + ' ' + (chartConfig.dspUnit || ''),
                        labelPadding: chartConfig.labelPadding,
                        labelColor: chartConfig.labelColor,
                        labelSize: chartConfig.labelSize,
                        tickSize: chartConfig.tickSize,
                        tickPadding: chartConfig.tickPadding
                    }
                },
                legend: {
                    legendEntryMaxLength: StringUtil.coerce(chartConfig.legendEntryMaxLength)
                },
                title: {
                    label: stationName,
                    labelSize: chartConfig.titleSize,
                    labelColor: chartConfig.titleColor,
                    labelPadding: chartConfig.titlePadding
                }
            };
            return chart;
        }
    }
});
