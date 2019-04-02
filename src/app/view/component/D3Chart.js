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
        resize: 'handleResize',
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
        },
        useExactInterval: false,
        alwaysRenderChart: false,
        showIdentificationThresholdData: false
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
            var staticMe = Koala.view.component.D3Chart;

            var DEFAULTS = Koala.view.component.D3Base.DEFAULTS.CHART;
            var chartConfig = olLayer.get('timeSeriesChartProperties');
            var StringUtil = Koala.util.String;
            var valFromSeq = StringUtil.getValueFromSequence;
            // don't evaluate 'titleTpl' here, since it is evaluated on window-level already
            //var titleTpl = 'titleTpl' in chartConfig ? chartConfig.titleTpl : '';
            // var title = Koala.util.String.replaceTemplateStrings(titleTpl, olLayer);
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
                        chartConfig.seriesTitleTpl, olFeat) : '';
                var color = valFromSeq(chartConfig.colorSequence, 0, '');
                if (!color) {
                    color = Koala.view.component.D3BaseController.getRandomColor();
                }
                // if an attached series is given and has no color defined,
                // apply the base color to it
                if (chartConfig.attachedSeries) {
                    var as = Koala.util.String.coerce(chartConfig.attachedSeries);
                    if (Ext.isArray(as)) {
                        chartConfig.attachedSeries = JSON.stringify(as);
                    }
                }
                shapes = [{
                    type: chartConfig.shapeType || DEFAULTS.LEFT_AXIS_TYPE,
                    curve: chartConfig.curveType || DEFAULTS.LEFT_AXIS_CURVE,
                    xField: chartConfig.xAxisAttribute,
                    yField: chartConfig.yAxisAttribute,
                    name: stationName,
                    id: olFeat.get(chartConfig.featureIdentifyField || 'id'),
                    color: color,
                    opacity: chartConfig.strokeOpacity || DEFAULTS.STROKE_OPACITY,
                    width: chartConfig.strokeWidth || DEFAULTS.STROKE_WIDTH,
                    tooltipTpl: chartConfig.tooltipTpl,
                    attachedSeries: chartConfig.attachedSeries
                }];

                selectedStations = [olFeat];
            }

            /* use relevant filter text to label chart */
            var filters = Ext.clone(Koala.util.Layer.getFiltersFromMetadata(olLayer.metadata));
            var excludedTypes = ['pointintime', 'timerange'];
            var excludedParams = ['styles','order'];
            if (filters !== null) {
                var filtersForTimeseriesLabel = filters.filter(function(filter) {
                    return !Ext.Array.contains(excludedTypes, (filter.type || '').toLowerCase()) &&
                        !Ext.Array.contains(excludedParams, (filter.param || '').toLowerCase());
                });
            }
            var cqlFilterTextHTML = Koala.util.Layer.getFiltersTextFromMetadata(filtersForTimeseriesLabel);
            //transform HTML to text, since it will be added as SVG-'text'
            var cqlFilterText = cqlFilterTextHTML.replace(/<br \/>/g, ', ');

            var leftAxisLabel = Koala.util.String.replaceTemplateStrings(yLabel, olFeat) + ' ' + (chartConfig.dspUnit || '');
            var leftAxis = staticMe.extractLeftAxisConfig(chartConfig, leftAxisLabel);

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
                renderTo: config.renderTo,
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
                    left: leftAxis,
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
        },

        extractLeftAxisConfig: function(chartConfig, label) {
            var chartUtil = Koala.util.Chart;
            var yAxisTickValues = chartUtil.recalculateAxisTicks(chartConfig);

            return {
                scale: chartConfig.yAxisScale,
                dataIndex: chartConfig.yAxisAttribute,
                format: chartConfig.yAxisFormat,
                label: label,
                labelPadding: chartConfig.labelPadding,
                labelColor: chartConfig.labelColor,
                labelSize: chartConfig.labelSize,
                ticks: chartConfig.yAxisTicks,
                tickValues: yAxisTickValues,
                tickSize: chartConfig.tickSize,
                tickPadding: chartConfig.tickPadding,
                min: Koala.util.String.coerce(chartConfig.yAxisMin),
                max: Koala.util.String.coerce(chartConfig.yAxisMax)
            };
        }
    }
});
