/*  Copyright (c) 2015-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * A utility class with chart manipulation functions.
 *
 * @class Koala.util.ChartData
 */
Ext.define('Koala.util.ChartData', {

    requires: [
        'Koala.util.Date',
        'Koala.util.Filter',
        'Koala.util.Object'
    ],

    statics: {

        /**
         * We create an object of the features where the key is a timestamp.
         * You can then easily access the feature of a given date.
         *
         * @param startDate {Date}
         * @param intervalInSeconds {Integer}
         * @param features {Array[ol.Feature]}
         * @param xAxisAttr {String}
         */
        getTimeStampSnapObject: function(startDate, intervalInSeconds, features,
            xAxisAttr) {
            var obj = {};

            Ext.each(features, function(feat) {
                // Dates in features are always in UTC, `new Date` seems to be
                // respecting the format
                var featDate = Koala.util.Date.getUtcMoment(feat.properties[xAxisAttr]);

                var featDateSeconds = featDate.unix();

                obj[featDateSeconds] = feat;
            });

            return obj;
        },

        /**
         * Normalize interval and unit to seconds.
         *
         * @param interval {Integer}
         * @param unit {String["seconds", "minutes", "hours", "days"]}
         */
        getIntervalInSeconds: function(interval, unit) {
            var multiplier = 0;

            switch (unit.toLowerCase()) {
                case 'seconds':
                    multiplier = 1;
                    break;
                case 'minutes':
                    multiplier = 60;
                    break;
                case 'hours':
                    multiplier = 3600;
                    break;
                case 'days':
                    multiplier = 86400;
                    break;
                default:
                    break;
            }
            return multiplier * interval;
        },

        /**
         * Returns the normalized interval based on the time filter attributes
         * (interval and units) of the current target layer.
         *
         * @return {Integer} The normalized interval.
         */
        getIntervalInSecondsForTargetLayer: function(targetLayer) {
            // TODO refactor this gathering of the needed filter attribute
            var filters = targetLayer.metadata.filters;
            var timeFilter;
            var intervalInSeconds;

            Ext.each(filters, function(filter) {
                var fType = (filter && filter.type) || '';
                if (fType === 'timerange' || fType === 'pointintime' || fType === 'rodostime') {
                    timeFilter = filter;
                    return false;
                }
            });

            if (!timeFilter) {
                Ext.log.warn('Failed to determine a time filter');
            }

            // don't accidently overwrite the configured filter…
            timeFilter = Ext.clone(timeFilter);

            intervalInSeconds = this.getIntervalInSeconds(
                timeFilter.interval, timeFilter.unit
            );

            return intervalInSeconds;
        },

        /**
         * Converts a geojson feature collection to timeseries data.
         * @param  {Object} chartConfig                     chart config
         * @param  {Object} data                            the features
         * @param  {Object} metadata                        gnos metadata
         * @param  {Object} station                         original feature
         * @param  {moment} startDate                       chart start date
         * @param  {moment} endDate                         chart end date
         * @param  {Boolean} showIdentificationThresholdData flag from view showDetectionLimitsBtnState
         * @return {Array}                                 the converted data
         */
        convertToTimeseriesData: function(
            chartConfig,
            data,
            targetLayer,
            station,
            startDate,
            endDate,
            showIdentificationThresholdData
        ) {
            var xAxisAttr = chartConfig.xAxisAttribute;
            var yAxisAttr = chartConfig.yAxisAttribute;
            var valueField = chartConfig.yAxisAttribute;
            var attachedSeries = chartConfig.attachedSeries ?
                JSON.parse(chartConfig.attachedSeries) : [];
            var featureStyle;

            if (chartConfig.featureStyle) {
                try {
                    featureStyle = JSON.parse(chartConfig.featureStyle);
                } catch (e) {
                    Ext.log.error('Error on parsing the featureStyle');
                }
            }

            var filterConfig = Koala.util.Filter.getStartEndFilterFromMetadata(
                targetLayer.metadata);
            var timeField = filterConfig.parameter;
            var intervalInSeconds = this.getIntervalInSecondsForTargetLayer(targetLayer);
            var snapObject = this.getTimeStampSnapObject(
                startDate, intervalInSeconds, data.features, timeField);

            var compareableDate;
            var matchingFeature;
            var seriesData = [];

            var firstDiffSeconds;
            if (data.features[0]) {
                var startSeconds = startDate.unix();
                var firstFeatDate = Koala.util.Date.getUtcMoment(data.features[0].properties[xAxisAttr]);
                var firstFeatSeconds = firstFeatDate.unix();
                firstDiffSeconds = Math.abs(firstFeatSeconds - startSeconds);
            }

            function valueExtractor(rawData, feature) {
                return function(config) {
                    rawData[config.yAxisAttribute] =
                        feature.properties[config.yAxisAttribute];
                };
            }

            // Iterate until startDate <= endDate
            while (startDate.diff(endDate) <= 0) {
                var newRawData = {};

                compareableDate = startDate.unix() + firstDiffSeconds;
                matchingFeature = snapObject[compareableDate];

                if (matchingFeature) {
                    newRawData[xAxisAttr] = Koala.util.Date.getUtcMoment(matchingFeature.properties[xAxisAttr]);

                    if (matchingFeature.properties.value_constraint === '<' &&
                        !showIdentificationThresholdData) {
                        newRawData.drawAsZero = true;
                        newRawData.minValue = chartConfig.yAxisMin || 0;
                    }
                    newRawData[valueField] = matchingFeature.properties[yAxisAttr];
                    Ext.each(attachedSeries, valueExtractor(newRawData, matchingFeature));

                    if (featureStyle) {
                        newRawData = this.appendStyleToShape(
                            featureStyle, matchingFeature, newRawData);
                    }

                    seriesData.push(newRawData);
                } else {
                    seriesData.push({});
                }
                startDate.add(intervalInSeconds, 'seconds');
            }
            return seriesData;
        },

        /**
         * Appends a possible given featurestyle to the chart shape
         * @param {Object} featureStyle The featureStyle object.
         * @param {ol.Feature} matchingFeature The matchingFeature.
         * @param {Object} newRawData The rawData object the style will get appended to.
         */
        appendStyleToShape: function(featureStyle, matchingFeature, newRawData) {
            Ext.each(featureStyle, function(style) {
                var val = matchingFeature.properties[style.attribute];
                if (val) {
                    val = Koala.util.String.coerce(val);
                    var styleVal = Koala.util.String.coerce(style.value);
                    var op = style.operator;
                    var min;
                    var max;
                    if (Ext.isString(styleVal)) {
                        var split = styleVal.split(',');
                        if (split.length === 2) {
                            min = split[0];
                            max = split[1];
                        }
                    }

                    if ((op === 'eq' && val === styleVal) ||
                        (op === 'ne' && val !== styleVal) ||
                        (op === 'gt' && val > styleVal) ||
                        (op === 'lt' && val < styleVal) ||
                        (op === 'lte' && val <= styleVal) ||
                        (op === 'gte' && val >= styleVal) ||
                        (op === 'between' && Ext.isDefined(min) && Ext.isDefined(max) && val >= min && val <= max)) {
                        newRawData.style = style.style;
                        return false;
                    }
                }
            }, this);
            return newRawData;
        },

        /**
         * Converts the GNOS chart configuration to be used by the d3-util
         * @param {Object} layerConfig The layerConfig of the layer which contains the chart config.
         * @return {Object} The chart configuration object to be used with the d3-util components
         */
        getChartConfiguration: function(layerConfig, chartSize, type, data) {
        /* timeseries props
        {
            "dataFeatureType": "imis:odl_brutto_10min_timeseries_9",
            "param_viewparams": "locality_code:[[id]]",
            "shapeType": "line",
            "curveType": "curveStepBefore",
            "xAxisAttribute": "end_measure",
            "yAxisAttribute": "value",
            "xAxisScale": "time",
            "end_timestamp": "2018-01-22T12:00:00",
            "end_timestamp_format": "Y-m-d H:i:s",
            "duration": "PT4H",
            "yAxisMax": "0.4",
            "colorSequence": "#312783,#e4003a,#65b32e,#f39200,#6b4796,#009dd1,#b0348b,#00823f,#564a44,#312783,#e4003a,#65b32e,#f39200,#6b4796,#009dd1,#b0348b,#00823f,#564a44",
            "seriesTitleTpl": "[[locality_name]]",
            "tooltipTpl": "<b>[[locality_name]]</b><br>Datum: [[end_measure]]<br>Messwert in µSv/h: [[value]]",
            "yAxis_grid": "\\{\\\"odd\\\":\\{\\\"opacity\\\":1,\\\"fill\\\":\\\"#ddd\\\",\\\"stroke\\\":\\\"#bbb\\\",\\\"lineWidth\\\":1]]",
            "featureIdentifyField": "id",
            "featureIdentifyFieldDataType": "string",
            "featureShortDspField": "locality_name",
            "allowAddSeries": "true",
            "allowZoom": "true",
            "allowFilterForm": "true",
            "showGrid": "true",
            "backgroundColor": "#EEEBEB",
            "gridStrokeColor": "#d3d3d3",
            "gridStrokeWidth": "1",
            "gridStrokeOpacity": "0.5",
            "labelColor": "#294d71",
            "labelPadding": "50",
            "yAxisFormat": ",.3f",
            "chartMargin": "30,200,60,80",
            "labelSize": "13",
            "legendEntryMaxLength": "20",
            "tickPadding": "0",
            "tickSize": "3",
            "strokeWidth": "2",
            "strokeOpacity": "1",
            "titlePadding": "10",
            "titleSize": "12",
            "rotateXAxisLabel": "true",
            "yAxisLabel": "µSv/h",
            "xAxisMax": "2018-01-22 12:00:00",
            "xAxisMin": "2012-01-01 00:00:00",
            "showTimeseriesGrid": "true",
            "thresholds_off": [
                {
                    "value": 0.4,
                    "tooltip": "Tooltip 1",
                    "stroke": "#ff0000",
                    "lineWidth": 1,
                    "dasharray": "3, 3",
                    "label": "Schwellenwert 1"
                },
                {
                    "value": 0.05,
                    "stroke": "#00ff00",
                    "lineWidth": 1,
                    "dasharray": "3, 3",
                    "label": "Schwellenwert 2",
                    "tooltip": "Tooltip 2"
                }
            ],
            "attachedSeries": "[{\"yAxisAttribute\":\"value_oberergw\",\"showYAxis\":\"true\",\"yAxisMin\":\"0\",\"yAxisMax\":\"0.4\",\"yAxisFormat\":\",.3f\",\"axisWidth\":60,\"labelPadding\":40,\"dspUnit\":\"Ob. Grenzwert (mSv/h)\"},{\"yAxisAttribute\":\"value_unterergw\",\"showYAxis\":\"true\",\"yAxisMin\":\"0\",\"yAxisMax\":\"0.4\",\"yAxisFormat\":\",.3f\",\"axisWidth\":60,\"labelPadding\":40,\"dspUnit\":\"Unt. Grenzwert (mSv/h)\",\"color\":\"#00ff00\"}]",
            "featureStyle_off": [
                {
                    "attribute": "value",
                    "operator": "lt",
                    "value": 0.085,
                    "style": {
                        "type": "circle",
                        "radius": "10"
                    }
                },
                {
                    "attribute": "value",
                    "operator": "eq",
                    "value": 0.085,
                    "style": {
                        "type": "star",
                        "sides": 5,
                        "radius": 10
                    }
                },
                {
                    "attribute": "value",
                    "operator": "gt",
                    "value": 0.085,
                    "style": {
                        "type": "rect",
                        "width": 15,
                        "height": 20
                    }
                }
            ]
        }
        */
            // create a default config object
            var config = {
                chartRendererConfig: {
                    size: chartSize || [200,200],
                    zoomType: 'none',
                    chartMargin: [],
                    title: '',
                    titleColor: '#000',
                    titlePadding: 18,
                    titleSize: 20
                },
                legendComponentConfig: {
                    legendEntryMaxLength: 20,
                    position: chartSize[0] - 80,
                    margin: undefined,
                    offset: undefined,
                    items: [{
                        type: 'line',
                        title: 'Legende',
                        customRenderer: function() {},
                        style: {
                            color: 'cyan'
                        }
                    }]
                },
                barComponentConfig: {},
                timeseriesComponentConfig: {
                    backgroundColor: '#EEE'
                }
            };
            var gnosConfig;
            var componentConfig;
            if (type === 'timeSeries') {
                gnosConfig = layerConfig.targetLayer.metadata.layerConfig.timeSeriesChartProperties;
                if (gnosConfig && !Ext.Object.isEmpty(gnosConfig)) {
                    componentConfig = config.timeseriesComponentConfig;
                }
            } else {
                gnosConfig = layerConfig.targetLayer.metadata.layerConfig.barChartProperties;
                if (gnosConfig && !Ext.Object.isEmpty(gnosConfig)) {
                    componentConfig = config.barComponentConfig;
                }
            }

            if (!componentConfig) {
                return config;
            }

            // apply values from config
            gnosConfig = Koala.util.Object.coerceAll(gnosConfig);

            config.chartRendererConfig.zoomType = gnosConfig.allowZoom ? 'transform' : 'none';
            config.chartRendererConfig.chartMargin = gnosConfig.chartMargin ? gnosConfig.chartMargin.split(',') : [];
            config.chartRendererConfig.title = gnosConfig.title || '';
            config.chartRendererConfig.titleColor = gnosConfig.titleColor || '#000';
            config.chartRendererConfig.titlePadding = gnosConfig.titlePadding || 18;
            config.chartRendererConfig.titleSize = gnosConfig.titleSize || 20;

            config.legendComponentConfig.legendEntryMaxLength = gnosConfig.legendEntryMaxLength || 300;

            // try to convert the x and y axis min and max values to a moment object, if they are no number
            var xMin;
            var xMax;
            var yMin;
            var yMax;
            if (!gnosConfig.xAxisScale || gnosConfig.xAxisScale === 'time' &&
                gnosConfig.xAxisMin && !Ext.isNumeric(gnosConfig.xAxisMin)) {
                xMin = moment(gnosConfig.xAxisMin).unix() * 1000;
            } else {
                xMin = gnosConfig.xAxisMin;
            }
            if (!gnosConfig.xAxisScale || gnosConfig.xAxisScale === 'time' &&
                gnosConfig.xAxisMax && !Ext.isNumeric(gnosConfig.xAxisMax)) {
                xMax = moment(gnosConfig.xAxisMax).unix() * 1000;
            } else {
                xMax = gnosConfig.xAxisMax;
            }
            if (!gnosConfig.yAxisScale || gnosConfig.yAxisScale === 'time' &&
                gnosConfig.yAxisMin && !Ext.isNumeric(gnosConfig.yAxisMin)) {
                yMin = moment(gnosConfig.yAxisMin).unix() * 1000;
            } else {
                yMin = gnosConfig.yAxisMin;
            }
            if (!gnosConfig.yAxisScale || gnosConfig.yAxisScale === 'time' &&
                gnosConfig.yAxisMax && !Ext.isNumeric(gnosConfig.yAxisMax)) {
                yMax = moment(gnosConfig.yAxisMax).unix() * 1000;
            } else {
                yMax = gnosConfig.yAxisMax;
            }

            if (type === 'timeSeries') {
                // set the size
                componentConfig.size = [chartSize[0] - 80, chartSize[1] - 20];
                componentConfig.backgroundColor = gnosConfig.backgroundColor;
                var seriesAndLegends = Koala.util.ChartData.generateTimeSeriesAndLegends(data, layerConfig);
                // append series
                componentConfig.series = seriesAndLegends.series;
                // append legends
                config.legendComponentConfig.items.push(seriesAndLegends.legends);
                // append axes
                componentConfig.axes = {
                    x: {
                        orientation: 'x',
                        display: true,
                        labelColor: gnosConfig.labelColor || '#000',
                        labelPadding: gnosConfig.labelPadding || 25,
                        labelSize: gnosConfig.labelSize || 12,
                        tickPadding: gnosConfig.tickPadding || 3,
                        tickSize: gnosConfig.tickSize || 6,
                        format: gnosConfig.xAxisFormat || ',.0f',
                        label: gnosConfig.xAxisLabel || '',
                        labelRotation: gnosConfig.rotateXAxisLabel === true ? 45 : 0,
                        scale: gnosConfig.xAxisScale || 'time',
                        min: xMin || undefined,
                        max: xMax || undefined,
                        showGrid: gnosConfig.showGrid || false,
                        gridColor: gnosConfig.gridStrokeColor,
                        gridWidth: gnosConfig.gridStrokeWidth,
                        gridOpacity: gnosConfig.gridStrokeOpacity
                    },
                    y: {
                        orientation: 'y',
                        display: true,
                        labelColor: gnosConfig.labelColor || '#000',
                        labelPadding: gnosConfig.labelPadding || 25,
                        labelSize: gnosConfig.labelSize || 12,
                        tickPadding: gnosConfig.tickPadding || 3,
                        tickSize: gnosConfig.tickSize || 6,
                        format: gnosConfig.yAxisFormat || ',.0f',
                        label: gnosConfig.yAxisLabel || '',
                        labelRotation: gnosConfig.rotateYAxisLabel === true ? 45 : 0,
                        scale: gnosConfig.yAxisScale || 'linear',
                        min: yMin || undefined,
                        max: yMax || undefined,
                        showGrid: gnosConfig.showGrid || false,
                        gridColor: gnosConfig.gridStrokeColor,
                        gridWidth: gnosConfig.gridStrokeWidth,
                        gridOpacity: gnosConfig.gridStrokeOpacity
                    }
                };
                // handle attachedSeries axes
                if (gnosConfig.attachedSeries) {
                    var series = gnosConfig.attachedSeries;
                    if (Ext.isString(series)) {
                        try {
                            series = JSON.parse(series);
                        } catch (e) {
                            return;
                        }
                    }
                    Ext.each(series, function(serie, index) {
                        if (!serie.showYAxis) {
                            return;
                        }
                        var additionalYMin;
                        var additionalYMax;
                        if (!gnosConfig.yAxisScale || gnosConfig.yAxisScale === 'time' &&
                            gnosConfig.yAxisMin && !Ext.isNumeric(gnosConfig.yAxisMin)) {
                            additionalYMin = moment(gnosConfig.yAxisMin).unix() * 1000;
                        } else {
                            additionalYMin = gnosConfig.yAxisMin;
                        }
                        if (!gnosConfig.yAxisScale || gnosConfig.yAxisScale === 'time' &&
                            gnosConfig.yAxisMax && !Ext.isNumeric(gnosConfig.yAxisMax)) {
                            additionalYMax = moment(gnosConfig.yAxisMax).unix() * 1000;
                        } else {
                            additionalYMax = gnosConfig.yAxisMax;
                        }
                        componentConfig.axes['y' + index] = {
                            // TODO: axisWidth prop should get used?!
                            orientation: 'y',
                            display: true,
                            labelColor: serie.labelColor || '#000',
                            labelPadding: serie.labelPadding || 25,
                            labelSize: serie.labelSize || 12,
                            tickPadding: serie.tickPadding || 3,
                            tickSize: serie.tickSize || 6,
                            format: serie.yAxisFormat || ',.0f',
                            label: serie.dspUnit || serie.yAxisLabel || '',
                            labelRotation: serie.rotateYAxisLabel === true ? 45 : 0,
                            scale: serie.yAxisScale || 'linear',
                            min: additionalYMin || undefined,
                            max: additionalYMax || undefined
                        };
                    });
                }
            } else { // type is barchart
                // TODO: finish this...
                componentConfig.axes = {};
                componentConfig.bars = {};
            }
            return config;
        },

        /**
         * Generates series and legends for a timeseries
         * @param {Object} data The input data
         * @param {Object} layerConfig the config for the layer
         */
        generateTimeSeriesAndLegends: function(data, layerConfig) {
            var gnosConfig = layerConfig.targetLayer.metadata.layerConfig.timeSeriesChartProperties;
            var colors = gnosConfig.colorSequence ? gnosConfig.colorSequence.split(',') : [];
            var series = [];
            var legends = [];
            var index = 0;
            Ext.iterate(data, function(id, elementData) {
                var chartData = Ext.Array.map(elementData, function(item) {
                    if (!item[gnosConfig.xAxisAttribute]) {
                        return undefined;
                    }
                    return [item[gnosConfig.xAxisAttribute].unix() * 1000, item[gnosConfig.yAxisAttribute]];
                });
                var seriesConfig = {
                    data: chartData,
                    style: function() {} || {}, // TODO, enthält u.a. colorSequence, colorMapping, strokeOpacity, strokeWidth, color
                    tooltipConfig: function() {} || {}, // TODO ?! ersetzt tooltipTpl
                    curveType: gnosConfig.curveType || 'linear',
                    shapeType: gnosConfig.shapeType || 'line',
                    axes: ['x', 'y']
                };
                if (colors[index]) {
                    seriesConfig.color = colors[index];
                    ++index;
                }
                series.push(seriesConfig);
                legends.push({
                    type: 'line',
                    title: 'Legende', // TODO
                    customRenderer: function() {}, // TODO
                    style: {
                        color: seriesConfig.color
                    }
                });
            });
            // handle attached series
            if (gnosConfig.attachedSeries) {
                var attachedSeries = gnosConfig.attachedSeries;
                if (Ext.isString(attachedSeries)) {
                    try {
                        attachedSeries = JSON.parse(attachedSeries);
                    } catch (e) {
                        return;
                    }
                }
                Ext.each(attachedSeries, function(serie, idx) {
                    if (!serie.showYAxis) {
                        return;
                    }
                    Ext.iterate(data, function(id, elementData) {
                        var chartData = Ext.Array.map(elementData, function(item) {
                            if (!item[gnosConfig.xAxisAttribute]) {
                                return undefined;
                            }
                            return [item[gnosConfig.xAxisAttribute].unix() * 1000, item[serie.yAxisAttribute]];
                        });
                        var seriesConfig = {
                            data: chartData,
                            style: function() {} || {}, // TODO, enthält u.a. colorSequence, colorMapping, strokeOpacity, strokeWidth, color
                            tooltipConfig: function() {} || {}, // TODO ?! ersetzt tooltipTpl
                            curveType: serie.curveType || 'linear',
                            shapeType: serie.shapeType || 'line',
                            axes: ['x', 'y' + idx]
                        };
                        if (colors[index]) {
                            seriesConfig.color = colors[index];
                            ++index;
                        }
                        series.push(seriesConfig);
                    });
                });
            }
            return {
                series: series,
                legends: legends
            };
        }
    }
});
