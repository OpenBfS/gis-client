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

    listeners: {
        resize: 'redrawChart',
        boxready: 'onBoxReady',
        initialize: 'onInitialize'
    },

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
        create: function(olLayer, olFeat, config) {
            var DEFAULTS = Koala.view.component.D3Base.DEFAULTS.CHART;
            var chartConfig = olLayer.get('timeSeriesChartProperties');
            var StringUtil = Koala.util.String;
            var valFromSeq = StringUtil.getValueFromSequence;
/*don't evaluate 'titleTpl' here, since it is evaluated on window-level already
            var titleTpl = 'titleTpl' in chartConfig ? chartConfig.titleTpl : '';
            var title = Koala.util.String.replaceTemplateStrings(titleTpl, olLayer);
*/
            var yLabel = chartConfig.yAxisLabel || '';
            var xLabel = chartConfig.xAxisLabel || '';
            var chartMargin = chartConfig.chartMargin ? chartConfig.chartMargin.split(',') : [];
            var chartMarginObj;
            var stationName;
            var shapes = [];
            var selectedStations = [];

            config = config || {};

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
                var color = valFromSeq(chartConfig.colorSequence, 0, "");
                if (!color) {
                    color = Koala.view.component.D3BaseController.getRandomColor();
                }
                shapes = [{
                    type: chartConfig.shapeType || DEFAULTS.LEFT_AXIS_TYPE,
                    curve: chartConfig.curveType || DEFAULTS.LEFT_AXIS_CURVE,
                    xField: chartConfig.xAxisAttribute,
                    yField: chartConfig.yAxisAttribute,
                    name: stationName,
                    id: olFeat.get('id'),
                    color: color,
                    opacity: chartConfig.strokeOpacity || DEFAULTS.STROKE_OPACITY,
                    width: chartConfig.strokeWidth || DEFAULTS.STROKE_WIDTH,
                    tooltipTpl: chartConfig.tooltipTpl
                }];

                selectedStations = [olFeat];
            }

            // There are four ways and combinations of defining the ticks and
            // the min and max values on the y axis based on the chart configs
            // yAxisTicks, yAxisMin, yAxisMax and yTickValues:
            // 1. Fully automatically: If neither yAxisTicks, yAxisMin,
            // yAxisMax or yTickValues are set in the chartConfig object, the
            // min and max values are determined by the chart data and will be
            // fit into a "nice" range with a a proper count of ticks.
            // 2. Fully automatically (hinted): If yAxisTicks is set, the min
            // and max values are determined by the chart data (as above), but
            // the number of ticks will be set by the parameter. Note: The count
            // is only a hint for d3 and is just a approximate value.
            // 3. Automatic step size: If yAxisTicks, yAxisMin and yAxisMax are
            // set, the min and max axis values are rendered as given and the
            // tick count is the number of additional ticks to be set between
            // the min an max ticks.
            // 4. Fully manual: If yTickValues is given, only the ticks in
            // this parameter are shown on the axis.
            var yAxisTickValues;
            if (chartConfig.yAxisTicks && chartConfig.yAxisMin &&
                    chartConfig.yAxisMax) {
                var rangeMin = StringUtil.coerce(chartConfig.yAxisMin);
                var rangeMax = StringUtil.coerce(chartConfig.yAxisMax);
                var tickCnt = StringUtil.coerce(chartConfig.yAxisTicks);

                // Tick count must be greater than 0
                if (tickCnt < 0) {
                    tickCnt = 0;
                }

                // Logarithmic scales with min/max values of 0 are
                // not possible.
                if (chartConfig.yAxisScale === 'log' && (rangeMin === 0 ||
                        rangeMax === 0)) {
                    if (rangeMin === 0) {
                        rangeMin = 0.00000001;
                    }
                    if (rangeMax === 0) {
                        rangeMax = 0.00000001;
                    }
                }

                var rangeStep = Math.abs(rangeMax - rangeMin) / (tickCnt + 1);
                yAxisTickValues = d3.range(rangeMin, rangeMax + rangeStep,
                        rangeStep);
            }

            if (chartConfig.yTickValues) {
                yAxisTickValues = [];
                Ext.each(chartConfig.yTickValues.split(','), function(val) {
                    yAxisTickValues.push(StringUtil.coerce(val));
                });
            }

            /* use relevant filter text to label chart */
            var filters = Ext.clone(Koala.util.Layer.getFiltersFromMetadata(olLayer.metadata));
            var excludedTypes = ['pointintime', 'timerange'];
            var excludedParams = ['styles','order'];
            if (filters !== null) {
                var filtersForTimeseriesLabel = filters.filter(function (filter){return !Ext.Array.contains(excludedTypes, (filter.type || '').toLowerCase())&&!Ext.Array.contains(excludedParams, (filter.param || '').toLowerCase())})
            }
            var cqlFilterTextHTML = Koala.util.Layer.getFiltersTextFromMetadata(filtersForTimeseriesLabel);
            //transform HTML to text, since it will be added as SVG-'text'
            //ToDo: introduce wrapping function to handle linebreaks in D3BaseController
            var cqlFilterText = cqlFilterTextHTML.replace(/<br \/>/g, ', ');


            var chart = {
                xtype: 'd3-chart',
                name: olLayer.get('name'),
                zoomEnabled: StringUtil.coerce(chartConfig.allowZoom),
                showLoadMask: false,
                minHeight: 100,
                minWidth: 100,
                height: config.height || '100%',
                width: config.width || '100%',
                margin: config.margin || 0,
                flex: config.flex,
                autoScroll: false,
                startDate: config.startDate,
                endDate: config.endDate,
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
                        label: Koala.util.String.replaceTemplateStrings(yLabel, olFeat) + ' ' + (chartConfig.dspUnit || ''),
                        labelPadding: chartConfig.labelPadding,
                        labelColor: chartConfig.labelColor,
                        labelSize: chartConfig.labelSize,
                        ticks: chartConfig.yAxisTicks,
                        tickValues: yAxisTickValues,
                        tickSize: chartConfig.tickSize,
                        tickPadding: chartConfig.tickPadding,
                        min: Koala.util.String.coerce(chartConfig.yAxisMin),
                        max: Koala.util.String.coerce(chartConfig.yAxisMax)
                    },
                    bottom: {
                        scale: chartConfig.xAxisScale,
                        dataIndex: chartConfig.xAxisAttribute,
                        format: chartConfig.xAxisFormat,
                        label: Koala.util.String.replaceTemplateStrings(xLabel, olFeat),
                        labelPadding: chartConfig.labelPadding,
                        labelColor: chartConfig.labelColor,
                        labelSize: chartConfig.labelSize,
                        tickSize: chartConfig.tickSize,
                        tickPadding: chartConfig.tickPadding,
                        rotateXAxisLabel: StringUtil.coerce(chartConfig.rotateXAxisLabel)
                    }
                },
                legend: {
                    legendEntryMaxLength: StringUtil.coerce(chartConfig.legendEntryMaxLength)
                },
                title: {
                    //label: title,
                    label: cqlFilterText,
                    labelSize: chartConfig.titleSize || 12,
                    labelColor: chartConfig.titleColor || '#294d71',
                    labelPadding: chartConfig.titlePadding || 5
                }
            };
            return chart;
        }
    }
});
