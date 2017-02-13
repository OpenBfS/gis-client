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
    cls: 'd3-barchart',

    requires: [
        'Koala.view.component.D3BarChartController',
        'Koala.view.component.D3BarChartModel'
    ],

    controller: 'component-d3barchart',
    viewModel: {
        type: 'component-d3barchart'
    },

    listeners: {
        boxready: 'onBoxReady',
        painted: 'onPainted',
        resize: 'redrawChart'
    },

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
        create: function(olLayer, olFeat, config) {
            var DEFAULTS = Koala.view.component.D3Base.DEFAULTS.BARCHART;
            var chartConfig = olLayer.get('barChartProperties');
            var StringUtil = Koala.util.String;
            var categoryCount = chartConfig.chartFieldSequence.split(",").length;
            var chartWidth = 200 + categoryCount * 50;
            var titleTpl = 'titleTpl' in chartConfig ? chartConfig.titleTpl : '';
            var title = Koala.util.String.replaceTemplateStrings(titleTpl, olFeat);
            var chartMargin = chartConfig.chartMargin ? chartConfig.chartMargin.split(',') : [];
            var chartMarginObj;

            config = config || {};

            if (chartMargin.length > 0) {
                chartMarginObj = {
                    top: chartMargin[0],
                    right: chartMargin[1],
                    bottom: chartMargin[2],
                    left: chartMargin[3]
                };
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
                    var coercedVal = StringUtil.coerce(val);
                    if (chartConfig.yAxisScale === 'log' && coercedVal === 0) {
                        coercedVal = 0.00000001;
                    }
                    yAxisTickValues.push(StringUtil.coerce(coercedVal));
                });
            }

            var chart = {
                xtype: 'd3-barchart',
                name: olLayer.get('name'),
                zoomEnabled: Koala.util.String.coerce(chartConfig.allowZoom),
                height: config.height || '100%',
                width: config.width || chartWidth,
                margin: config.margin || 0,
                flex: config.flex,
                startDate: olFeat.get('end_measure'),
                endDate: olFeat.get('end_measure'),
                targetLayer: olLayer,
                selectedStation: olFeat,
                backgroundColor: chartConfig.backgroundColor,
                chartMargin: chartMarginObj,
                labelFunc: Koala.util.String.coerce(chartConfig.labelFunc),
                chartFieldSequence: chartConfig.chartFieldSequence,
                shape: {
                    type: DEFAULTS.LEFT_AXIS_TYPE,
                    curve: DEFAULTS.LEFT_AXIS_CURVE,
                    id: olFeat.get('id'),
                    color: chartConfig.colorSequence,
                    tooltipTpl: chartConfig.tooltipTpl,
                    rotateBarLabel: Koala.util.String.coerce(chartConfig.rotateBarLabel),
                    // Note: No public config yet.
                    showLabelInsideBar: false
                },
                grid: {
                    show: Koala.util.String.coerce(chartConfig.showGrid),
                    color: chartConfig.gridStrokeColor,
                    width: chartConfig.gridStrokeWidth,
                    opacity: chartConfig.gridStrokeOpacity
                },
                axes: {
                    left: {
                        scale: chartConfig.yAxisScale || DEFAULTS.LEFT_AXIS_SCALE,
                        format: chartConfig.yAxisFormat || DEFAULTS.LEFT_AXIS_FORMAT,
                        label: (chartConfig.yAxisLabel || '') + ' ' + (chartConfig.dspUnit || ''),
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
                        scale: chartConfig.xAxisScale || DEFAULTS.BOTTOM_AXIS_SCALE,
                        format: chartConfig.xAxisFormat,
                        label: (chartConfig.xAxisLabel || ''),
                        labelPadding: chartConfig.labelPadding,
                        labelColor: chartConfig.labelColor,
                        labelSize: chartConfig.labelSize,
                        tickSize: chartConfig.tickSize,
                        tickPadding: chartConfig.tickPadding,
                        rotateXAxisLabel: StringUtil.coerce(chartConfig.rotateXAxisLabel)
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
