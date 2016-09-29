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
Ext.define('Koala.view.component.D3BarChart',{
    extend: 'Koala.view.component.D3Base',
    xtype: 'd3-barchart',

    requires: [
        'Koala.view.component.D3BarChartController',
        'Koala.view.component.D3BarChartModel'
    ],

    controller: 'component-d3barchart',
    viewModel: {
        type: 'component-d3barchart'
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
        labelFunc: null,
        chartFieldSequence: null,
        grid: {
            show: false,
            color: null,
            width: null,
            opacity: null
        },
        startDate: null,
        endDate: null,
        shape: {},
        selectedStation: null,
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
         * @return {Koala.view.component.D3BarChart} The created chart.
         */
        create: function(olLayer, olFeat) {
            var chartConfig = olLayer.get('barChartProperties');
            var categoryCount = chartConfig.chartFieldSequence.split(",").length;
            var chartWidth = 200 + categoryCount * 50;
            var titleTpl = 'titleTpl' in chartConfig ? chartConfig.titleTpl : '';
            var title = Koala.util.String.replaceTemplateStrings(titleTpl, olFeat);
            var chartMargin = chartConfig.chartMargin ? chartConfig.chartMargin.split(',') : [];
            var chartMarginObj;

            if (chartMargin.length > 0) {
                chartMarginObj = {
                    top: chartMargin[0],
                    right: chartMargin[1],
                    bottom: chartMargin[2],
                    left: chartMargin[3]
                };
            }

            var chart = {
                xtype: 'd3-barchart',
                name: olLayer.get('name'),
                zoomEnabled: Koala.util.String.coerce(chartConfig.allowZoom),
                height: 350,
                width: chartWidth,
                startDate: olFeat.get('end_measure'),
                endDate: olFeat.get('end_measure'),
                targetLayer: olLayer,
                selectedStation: olFeat,
                backgroundColor: chartConfig.backgroundColor,
                chartMargin: chartMarginObj,
                labelFunc: Koala.util.String.coerce(chartConfig.labelFunc),
                chartFieldSequence: chartConfig.chartFieldSequence,
                shape: {
                    type: 'bar',
                    curve: 'linear',
                    id: olFeat.get('id'),
                    color: chartConfig.colorSequence,
                    tooltipTpl: chartConfig.tooltipTpl
                },
                grid: {
                    show: Koala.util.String.coerce(chartConfig.showGrid),
                    color: chartConfig.gridStrokeColor,
                    width: chartConfig.gridStrokeWidth,
                    opacity: chartConfig.gridStrokeOpacity
                },
                axes: {
                    left: {
                        scale: chartConfig.yAxisScale || 'linear',
                        format: chartConfig.yAxisFormat,
                        label: (chartConfig.yAxisLabel || '') + ' ' + (chartConfig.dspUnit || ''),
                        labelPadding: chartConfig.labelPadding,
                        labelColor: chartConfig.labelColor,
                        labelSize: chartConfig.labelSize,
                        tickSize: chartConfig.tickSize,
                        tickPadding: chartConfig.tickPadding
                    },
                    bottom: {
                        scale: chartConfig.xAxisScale || 'ordinal',
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
                    legendEntryMaxLength: Koala.util.String.coerce(chartConfig.legendEntryMaxLength)
                },
                title: {
                    label: title,
                    labelSize: chartConfig.titleSize,
                    labelColor: chartConfig.titleColor,
                    labelPadding: chartConfig.titlePadding
                }
            };

            return chart;
        }
    }
});
