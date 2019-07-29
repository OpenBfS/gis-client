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

                if (featDate) {
                    var featDateSeconds = featDate.unix();
                    obj[featDateSeconds] = feat;
                }
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

            if (!interval || !unit) {
                return false;
            }

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

            if (timeFilter) {
                intervalInSeconds = this.getIntervalInSeconds(
                    timeFilter.interval, timeFilter.unit
                );
            } else { //some layers may not have timefilter but the ability to show timeseries
                var chartProps = targetLayer.metadata.layerConfig.timeSeriesChartProperties;
                var interval = chartProps.interval;
                var unit = chartProps.unit;
                if (!interval || !unit) {
                    if (!(targetLayer instanceof ol.layer.Vector)) {
                        return;
                    }
                    return false;
                } else {
                    intervalInSeconds = this.getIntervalInSeconds(
                        interval, unit
                    );
                }
            }

            return intervalInSeconds;
        },

        /**
         * Converts a geojson feature collection to non uniform timeseries data.
         * @param  {Object} chartConfig                     chart config
         * @param  {Object} data                            the features
         * @param  {Boolean} showIdentificationThresholdData flag from view showDetectionLimitsBtnState
         * @return {Array}                                 the converted data
         */
        convertToNonUniformTimeseriesData: function(
            chartConfig,
            data,
            showIdentificationThresholdData
        ) {
            var xAxisAttr = chartConfig.xAxisAttribute;
            var attachedSeries = chartConfig.attachedSeries ?
                JSON.parse(chartConfig.attachedSeries) : [];
            var featureStyle;

            if (chartConfig.featureStyle) {
                featureStyle = chartConfig.featureStyle;
            }

            var seriesData = [];
            var features = data.features.slice();
            features.sort(function(a, b) {
                var first = moment(a.properties[xAxisAttr]).unix();
                var second = moment(b.properties[xAxisAttr]).unix();
                return first - second;
            });

            function valueExtractor(rawData, feature) {
                return function(config) {
                    rawData[config.yAxisAttribute] =
                        feature.properties[config.yAxisAttribute];
                };
            }

            // Iterate until startDate <= endDate
            Ext.each(features, function(feature) {
                var newRawData = {};

                // add all available properties in order
                // to use them for timeseriesTooltip
                // ToDo: check if this has any side effects for "download", "timeseriesChart" ...
                // eslint-disable-next-line no-loop-func
                Object.keys(feature.properties).forEach(function(key) {
                    newRawData[key] = feature.properties[key];
                });

                newRawData[xAxisAttr] = Koala.util.Date.getUtcMoment(feature.properties[xAxisAttr]);

                if (feature.properties.value_constraint === '<' &&
                    !showIdentificationThresholdData) {
                    newRawData.drawAsZero = true;
                    newRawData.minValue = chartConfig.yAxisMin || 0;
                }
                //replaced by adding all properties
                //newRawData[valueField] = matchingFeature.properties[yAxisAttr];

                Ext.each(attachedSeries, valueExtractor(newRawData, feature));

                if (featureStyle) {
                    newRawData = this.appendStyleToShape(
                        featureStyle, feature, newRawData);
                }

                seriesData.push(newRawData);
            });

            return seriesData;
        },

        /**
         * Converts a geojson feature collection to timeseries data.
         * @param  {Object} chartConfig                     chart config
         * @param  {Object} data                            the features
         * @param  {Object} metadata                        gnos metadata
         * @param  {moment} startDate                       chart start date
         * @param  {moment} endDate                         chart end date
         * @param  {Boolean} showIdentificationThresholdData flag from view showDetectionLimitsBtnState
         * @return {Array}                                 the converted data
         */
        convertToTimeseriesData: function(
            chartConfig,
            data,
            targetLayer,
            startDate,
            endDate,
            showIdentificationThresholdData
        ) {
            var xAxisAttr = chartConfig.xAxisAttribute;
            var attachedSeries = chartConfig.attachedSeries ?
                JSON.parse(chartConfig.attachedSeries) : [];
            var featureStyle;

            if (chartConfig.featureStyle) {
                featureStyle = chartConfig.featureStyle;
            }

            var filterConfig = Koala.util.Filter.getStartEndFilterFromMetadata(
                targetLayer.metadata);
            var timeField = filterConfig.parameter;
            var intervalInSeconds = this.getIntervalInSecondsForTargetLayer(targetLayer);
            var snapObject = this.getTimeStampSnapObject(
                startDate, intervalInSeconds, data.features, timeField);
            if (intervalInSeconds === false) {
                return Koala.util.ChartData.convertToNonUniformTimeseriesData(chartConfig, data, showIdentificationThresholdData);
            }
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
            while (startDate.diff(endDate) < 0) {
                var newRawData = {};

                compareableDate = startDate.unix() + firstDiffSeconds;
                matchingFeature = snapObject[compareableDate];

                if (matchingFeature) {
                    // add all available properties in order
                    // to use them for timeseriesTooltip
                    // ToDo: check if this has any side effects for "download", "timeseriesChart" ...
                    // eslint-disable-next-line no-loop-func
                    Object.keys(matchingFeature.properties).forEach(function(key) {
                        newRawData[key] = matchingFeature.properties[key];
                    });

                    newRawData[xAxisAttr] = Koala.util.Date.getUtcMoment(matchingFeature.properties[xAxisAttr]);

                    if (matchingFeature.properties.value_constraint === '<' &&
                        !showIdentificationThresholdData) {
                        newRawData.drawAsZero = true;
                        newRawData.minValue = chartConfig.yAxisMin || 0;
                    }
                    //replaced by adding all properties
                    //newRawData[valueField] = matchingFeature.properties[yAxisAttr];

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
        getChartConfiguration: function(layerConfig, chartSize, type, data, labels, stations, chartOverrides) {
            // create a default config object
            var config = {
                chartRendererConfig: {
                    size: chartSize || [200, 200],
                    zoomType: 'none',
                    chartMargin: []
                },
                legendComponentConfig: {
                    legendEntryMaxLength: 200,
                    position: chartSize[0] - 80,
                    margin: undefined,
                    offset: undefined,
                    items: []
                },
                barComponentConfig: {},
                timeseriesComponentConfig: {
                    backgroundColor: '#EEE',
                    title: '',
                    titleColor: '#000',
                    titlePadding: 18,
                    titleSize: 20
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

            config.chartRendererConfig.zoomType = gnosConfig.allowZoom ? 'rerender' : 'none';
            config.chartRendererConfig.chartMargin = gnosConfig.chartMargin ? gnosConfig.chartMargin.split(',') : [];

            config.legendComponentConfig.legendEntryMaxLength = gnosConfig.legendEntryMaxLength || 200;
            config.legendComponentConfig.legendEntryMaxLength -= 60;

            if (type === 'timeSeries') {
                this.createTimeseriesConfig(componentConfig, gnosConfig, layerConfig, config, chartSize, data, stations, chartOverrides);
            } else { // type is barchart
                this.createBarConfig(componentConfig, gnosConfig, layerConfig, config, chartSize, data, labels, stations, chartOverrides);
            }
            return config;
        },

        /**
         * Extract and coerce the min/max values from the config.
         * @param  {Object} gnosConfig the metadata
         * @return {Number[]} [xmin, xmax, ymin, ymax]
         */
        extractMinMax: function(gnosConfig) {
            // try to convert the x and y axis min and max values to a moment object, if they are no number
            var xMin;
            var xMax;
            var yMin;
            var yMax;
            if (!gnosConfig.xAxisScale && !gnosConfig.xAxisMax || gnosConfig.xAxisScale === 'time' &&
                gnosConfig.xAxisMax && !Ext.isNumeric(gnosConfig.xAxisMax)) {
                xMax = moment(gnosConfig.xAxisMax).unix() * 1000;
            } else {
                xMax = gnosConfig.xAxisMax;
            }
            if (!gnosConfig.xAxisScale && !gnosConfig.xAxisMin || gnosConfig.xAxisScale === 'time' &&
                gnosConfig.xAxisMin && !Ext.isNumeric(gnosConfig.xAxisMin)) {
                if (gnosConfig.duration) {
                    xMin = moment(xMax).subtract(moment.duration(gnosConfig.duration)).unix() * 1000;
                } else {
                    xMin = moment(gnosConfig.xAxisMin).unix() * 1000;
                }
            } else {
                xMin = gnosConfig.xAxisMin;
            }
            yMin = gnosConfig.yAxisMin;
            yMax = gnosConfig.yAxisMax;

            return [xMin, xMax, yMin, yMax];
        },

        /**
         * Creates the bar chart component config.
         * @param  {Object} componentConfig the bar chart component config to
         * manipulate
         * @param  {Object} gnosConfig the metadata
         * @param  {Object} layerConfig the layer configuration
         * @param  {Object} config the chart configuration
         * @param  {Number[]} chartSize the chart size
         * @param  {Object} data the chart data
         * @param  {Array} labels the group labels
         */
        createBarConfig: function(componentConfig, gnosConfig, layerConfig, config, chartSize, data, labels, stations, chartOverrides) {
            var minMax = this.extractMinMax(gnosConfig);
            var margin = gnosConfig.chartMargin.split(',');
            margin = Ext.Array.map(margin, function(w) {
                return parseInt(w, 10);
            });
            // set the size
            componentConfig.size = [chartSize[0] - margin[1] - margin[3], chartSize[1] - margin[0] * 2 - margin[2]];
            componentConfig.position = [margin[3], 0];
            componentConfig.extraClasses = 'k-d3-shape-group';
            componentConfig.backgroundColor = gnosConfig.backgroundColor;
            componentConfig.title = layerConfig.title.label || '';
            componentConfig.titleColor = layerConfig.title.labelColor || '#000';
            componentConfig.titlePadding = (layerConfig.title.labelPadding || 18) - margin[0];
            componentConfig.titleSize = layerConfig.title.labelSize || 20;
            componentConfig.maxTitleLength = gnosConfig.maxTitleLength || 100;
            componentConfig.rotateBarLabel = gnosConfig.rotateBarLabel;
            componentConfig.yOffset = margin[0];
            config.legendComponentConfig.position = [chartSize[0] - margin[1], 0];
            config.legendComponentConfig.extraClasses = 'k-d3-shape-group-legend';
            // append axes
            componentConfig.axes = {
                groupx: this.createAxisConfig(gnosConfig, 'x', minMax[0], minMax[1], true, stations[0], chartOverrides && chartOverrides.groupx),
                groupedx: this.createAxisConfig(gnosConfig, 'x', minMax[0], minMax[1], false, stations[0], chartOverrides && chartOverrides.groupedx),
                y: this.createAxisConfig(gnosConfig, 'y', minMax[2], minMax[3], true, stations[0], chartOverrides && chartOverrides.y)
            };
            componentConfig.axes.groupx.scale = 'band';
            componentConfig.axes.groupedx.scale = 'band';
            componentConfig.data = this.extractBarData(data, config.legendComponentConfig.items, labels, gnosConfig, stations[0]);
        },

        /**
         * Converts the bar chart data to a compliant format.
         * @param  {Object} data the chart data
         * @param  {Array} legends an array to store legend entries in
         * @param  {Array} labels the group labels
         * @param  {Object} gnosConfig the GNOS configuration
         * @return {Object} the d3-util compliant data
         */
        extractBarData: function(data, legends, labels, gnosConfig, station) {
            var result = [];
            var grouped = [];
            var extraLegends = {};
            var tooltipCmp = Ext.create('Ext.tip.ToolTip');

            Ext.each(data, function(group, groupIndex) {
                var item = {
                    value: group.key,
                    values: []
                };
                legends.push({
                    type: 'bar',
                    title: labels[groupIndex],
                    groupIndex: item.value,
                    style: {
                        fill: 'black'
                    }
                });
                Ext.iterate(group, function(idx, value) {
                    if (idx === 'key') {
                        return;
                    }
                    if (grouped.indexOf(idx) < 0) {
                        grouped.push(idx);
                        extraLegends[idx] = {
                            type: 'background',
                            style: {
                                fill: value.color
                            },
                            title: idx,
                            groupedIndex: idx
                        };
                    }
                    item.values.push({
                        index: idx,
                        value: value.value,
                        uncertainty: value.uncertainty,
                        color: value.color,
                        label: value.label,
                        belowThreshold: value.detection_limit === '<',
                        tooltipFunc: function(target) {
                            var tooltipTpl = gnosConfig.tooltipTpl;
                            // Only proceed and show tooltip if a tooltipTpl is
                            // given in the chartConfig.
                            if (tooltipTpl) {
                                var html = Koala.util.String.replaceTemplateStrings(tooltipTpl, {
                                    xAxisAttribute: idx,
                                    yAxisAttribute: value.value,
                                    key: labels[groupIndex],
                                    group: idx
                                });

                                if (Ext.String.startsWith(html, 'eval:')) {
                                    html = eval(html.substr(5)); // eslint-disable-line no-eval
                                    html = html(station);
                                }

                                html = Koala.util.String.replaceTemplateStrings(html, data);
                                html = Koala.util.String.replaceTemplateStrings(html, station);
                                tooltipCmp.setHtml(html);
                                tooltipCmp.setTarget(target);
                                tooltipCmp.show();
                            }
                        }
                    });
                });
                result.push(item);
            });

            Ext.each(grouped, function(item) {
                legends.push(extraLegends[item]);
            });

            return {
                data: result,
                grouped: grouped
            };
        },

        /**
         * Creates the timeseries component config.
         * @param  {Object} componentConfig the timeseries component config to
         * manipulate
         * @param  {Object} gnosConfig the metadata
         * @param  {Object} layerConfig the layer configuration
         * @param  {Object} config the chart configuration
         * @param  {Number[]} chartSize the chart size
         * @param  {Object} data the chart data
         * @param  {Object} chartOverrides info about gnos overrides like log axis scales
         * chart controller
         */
        createTimeseriesConfig: function(componentConfig, gnosConfig, layerConfig, config, chartSize, data, stations, chartOverrides) {
            var minMax = this.extractMinMax(gnosConfig);
            var margin = gnosConfig.chartMargin.split(',');
            margin = Ext.Array.map(margin, function(w) {
                return parseInt(w, 10);
            });
            var legendMaxLength = gnosConfig.legendEntryMaxLength || 0;
            // set the size
            componentConfig.size = [chartSize[0] - margin[1] - margin[3] - legendMaxLength, chartSize[1] - margin[0] - margin[2]];
            componentConfig.position = [margin[3], margin[0]];
            componentConfig.backgroundColor = gnosConfig.backgroundColor;
            componentConfig.title = layerConfig.title.label || '';
            componentConfig.titleColor = layerConfig.title.labelColor || '#000';
            componentConfig.titlePadding = layerConfig.title.labelPadding || 18;
            componentConfig.titleSize = layerConfig.title.labelSize || 20;
            componentConfig.maxTitleLength = gnosConfig.maxTitleLength || 100;
            componentConfig.extraClasses = 'k-d3-shape-group';
            var seriesAndLegends = Koala.util.ChartData.generateTimeSeriesAndLegends(data, layerConfig, stations);
            // append series
            componentConfig.series = seriesAndLegends.series;
            // append legends
            config.legendComponentConfig.items = seriesAndLegends.legends;
            config.legendComponentConfig.position = [chartSize[0] + margin[1] - legendMaxLength, margin[0]];
            config.legendComponentConfig.extraClasses = 'k-d3-shape-group-legend';
            // append axes
            componentConfig.axes = {
                x: this.createAxisConfig(gnosConfig, 'x', layerConfig.startDate.unix() * 1000, layerConfig.endDate.unix() * 1000, true, stations[0], chartOverrides && chartOverrides.x || undefined),
                y: this.createAxisConfig(gnosConfig, 'y', minMax[2], minMax[3], true, stations[0], chartOverrides && chartOverrides.y || undefined)
            };
            // handle attachedSeries axes
            if (gnosConfig.attachedSeries) {
                this.parseAttachedSeries(gnosConfig, componentConfig, stations, chartOverrides);
            }
            if (gnosConfig.thresholds) {
                var min = componentConfig.series[0].data.reduce(function(acc, val) {
                    if (!val) {
                        return acc;
                    }
                    return Math.min(acc, val[0]);
                }, Number.MAX_VALUE);
                var max = componentConfig.series[0].data.reduce(function(acc, val) {
                    if (!val) {
                        return acc;
                    }
                    return Math.max(acc, val[0]);
                }, Number.MIN_VALUE);
                Ext.each(gnosConfig.thresholds, function(threshold) {
                    componentConfig.series.push({
                        data: [
                            [min, threshold.value],
                            [max, threshold.value]
                        ],
                        axes: ['x', 'y'],
                        color: threshold.stroke,
                        style: {
                            stroke: threshold.stroke,
                            'stroke-dasharray': threshold.dasharray,
                            'stroke-width': threshold.lineWidth
                        },
                        skipDots: true,
                        belongsTo: componentConfig.series.length
                    });
                    config.legendComponentConfig.items.push({
                        type: 'line',
                        style: {
                            stroke: threshold.stroke,
                            'stroke-dasharray': threshold.dasharray,
                            'stroke-width': threshold.lineWidth
                        },
                        title: threshold.label,
                        tooltip: threshold.tooltip,
                        seriesIndex: componentConfig.series.length - 1
                    });
                });
            }
        },

        /**
         * Parses the attached series axis config.
         * @param  {Object} gnosConfig the metadata
         * @param  {Object} componentConfig the d3-util config to manipulate
         * @param  {ol.Feature[]} stations the selected stations
         * @param  {Object} chartOverrides gnos overrides like custom axis scales
         */
        parseAttachedSeries: function(gnosConfig, componentConfig, stations, chartOverrides) {
            var me = this;
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
                if (gnosConfig.yAxisScale === 'time' &&
                    gnosConfig.yAxisMin && !Ext.isNumeric(gnosConfig.yAxisMin)) {
                    additionalYMin = moment(gnosConfig.yAxisMin).unix() * 1000;
                } else {
                    additionalYMin = gnosConfig.yAxisMin;
                }
                if (gnosConfig.yAxisScale === 'time' &&
                    gnosConfig.yAxisMax && !Ext.isNumeric(gnosConfig.yAxisMax)) {
                    additionalYMax = moment(gnosConfig.yAxisMax).unix() * 1000;
                } else {
                    additionalYMax = gnosConfig.yAxisMax;
                }
                var overrides = chartOverrides ? chartOverrides['y' + index] : undefined;
                componentConfig.axes['y' + index] = me.createAxisConfig(gnosConfig, 'y', additionalYMin, additionalYMax, false, stations[0], overrides);
            });
        },

        /**
         * Creates an axis configuration.
         * @param  {Object} gnosConfig the metadata config
         * @param  {String} orient 'x' or 'y'
         * @param  {String|Number} min the min value
         * @param  {String|NUmber} max the max value
         * @param  {Boolean} withGrid whether to consider the grid config
         * @param  {ol.Feature} station the station feature for context
         * @param  {Object} chartOverrides gnos overrides like custom axis scales
         * @return {Object} the axis configuration for d3-util
         */
        createAxisConfig: function(gnosConfig, orient, min, max, withGrid, station, chartOverrides) {
            var label = Koala.util.String.replaceTemplateStrings(gnosConfig[orient + 'AxisLabel'] || '', station);
            var scale = gnosConfig[orient + 'AxisScale'] || (orient === 'x' ? 'time' : 'linear');
            if (chartOverrides && chartOverrides.scale) {
                scale = chartOverrides.scale;
            }
            if (chartOverrides) {
                min = chartOverrides.min || min;
                max = chartOverrides.max || max;
            }

            var languageSelect = Ext.ComponentQuery.query('k-form-field-languagecombo')[0];
            if (!languageSelect && Ext.isModern) {
                // modern
                languageSelect = Ext.ComponentQuery.query('k-field-languageselect')[0];
            }

            var powerOfTen = this.powerOfTen;

            var config = {
                orientation: orient,
                display: true,
                labelColor: gnosConfig.labelColor || '#000',
                labelPadding: gnosConfig.labelPadding || 25,
                labelSize: gnosConfig.labelSize || 12,
                tickPadding: gnosConfig.tickPadding || 3,
                tickSize: gnosConfig.tickSize || 6,
                format: gnosConfig[orient + 'AxisFormat'] || ',.0f',
                label: label,
                labelRotation: gnosConfig['rotate' + orient.toUpperCase() + 'AxisLabel'] === true ? -55 : 0,
                scale: scale,
                min: min,
                max: max,
                harmonize: scale === 'log',
                tickFormatter: scale === 'log' ? function(val) {
                    return !powerOfTen(val) ? ''
                        : val > 1000 || val < 0.0001
                            ? val.toExponential()
                            : val;
                } : undefined,
                epsilon: scale === 'log' ? 0.01 : undefined,
                sanitizeLabels: true,
                factor: orient === 'y' && scale !== 'log' ? 0.8 : undefined,
                locale: languageSelect.getValue()
            };
            if (withGrid) {
                config.showGrid = gnosConfig.showGrid || false;
                config.gridColor = gnosConfig.gridStrokeColor;
                config.gridWidth = gnosConfig.gridStrokeWidth;
                config.gridOpacity = gnosConfig.gridStrokeOpacity;
            }
            return config;
        },

        /**
         * Generates series and legends for a timeseries
         * @param {Object} data The input data
         * @param {Object} layerConfig the config for the layer
         * chart controller
         * @param {Object[]} stations the selected stations
         */
        generateTimeSeriesAndLegends: function(data, layerConfig, stations) {
            var gnosConfig = layerConfig.targetLayer.metadata.layerConfig.timeSeriesChartProperties;
            var colors = gnosConfig.colorSequence ? gnosConfig.colorSequence.split(',') : [];
            var series = [];
            var legends = [];
            var index = 0;
            var tooltipCmp = Ext.create('Ext.tip.ToolTip');
            var attachedSeries = gnosConfig.attachedSeries;
            if (Ext.isString(attachedSeries)) {
                try {
                    attachedSeries = JSON.parse(attachedSeries);
                } catch (e) {
                    return;
                }
            }
            Ext.iterate(data, function(id, elementData) {
                var chartData = Ext.Array.map(elementData, function(item) {
                    if (!item[gnosConfig.xAxisAttribute]) {
                        return undefined;
                    }
                    var value = item[gnosConfig.yAxisAttribute];
                    if (item.drawAsZero) {
                        value = 0;
                    }

                    return [item[gnosConfig.xAxisAttribute].unix() * 1000, value, function(target) {
                        var tooltipTpl = gnosConfig.tooltipTpl;
                        if (!tooltipTpl) {
                            return value;
                        }
                        var selectedStation = Ext.Array.findBy(stations, function(station) {
                            return station.get(gnosConfig.featureIdentifyField || 'id') === id;
                        });

                        if (Ext.String.startsWith(tooltipTpl, 'eval:')) {
                            tooltipTpl = eval(tooltipTpl.substr(5)); // eslint-disable-line no-eval
                            tooltipTpl = tooltipTpl(selectedStation);
                        }

                        var html = Koala.util.String.replaceTemplateStrings(tooltipTpl, item);
                        html = Koala.util.String.replaceTemplateStrings(html, selectedStation);
                        tooltipCmp.setHtml(html);
                        tooltipCmp.setTarget(target);
                        tooltipCmp.show();
                    }, item.style];
                });
                var seriesConfig = {
                    data: chartData,
                    style: function() {}, // TODO, enthält u.a. colorSequence, colorMapping, strokeOpacity, strokeWidth, color
                    useTooltipFunc: true,
                    curveType: gnosConfig.curveType || 'linear',
                    shapeType: gnosConfig.shapeType || 'line',
                    axes: ['x', 'y'],
                    belongsTo: series.length
                };
                if (colors[index]) {
                    seriesConfig.color = colors[index];
                    ++index;
                }
                series.push(seriesConfig);
                var seriesIndex = series.length - 1;
                // handle attached series
                if (gnosConfig.attachedSeries) {
                    Ext.each(attachedSeries, function(serie, idx) {
                        if (!serie.showYAxis) {
                            return;
                        }
                        chartData = Ext.Array.map(elementData, function(item) {
                            if (!item[gnosConfig.xAxisAttribute]) {
                                return undefined;
                            }
                            return [item[gnosConfig.xAxisAttribute].unix() * 1000, item[serie.yAxisAttribute], function(target) {
                                var tooltipTpl = gnosConfig.tooltipTpl;
                                var selectedStation = Ext.Array.findBy(stations, function(station) {
                                    return station.get(gnosConfig.featureIdentifyField || 'id') === id;
                                });

                                if (Ext.String.startsWith(tooltipTpl, 'eval:')) {
                                    tooltipTpl = eval(tooltipTpl.substr(5)); // eslint-disable-line no-eval
                                    tooltipTpl = tooltipTpl(selectedStation);
                                }

                                var html = Koala.util.String.replaceTemplateStrings(tooltipTpl, selectedStation);
                                tooltipCmp.setHtml(html);
                                tooltipCmp.setTarget(target);
                                tooltipCmp.show();
                            }];
                        });
                        var attachedSeriesConfig = {
                            data: chartData,
                            style: function() {}, // TODO, enthält u.a. colorSequence, colorMapping, strokeOpacity, strokeWidth, color
                            useTooltipFunc: true,
                            initiallyVisible: false,
                            curveType: serie.curveType || 'linear',
                            shapeType: serie.shapeType || 'line',
                            axes: ['x', 'y' + idx],
                            belongsTo: seriesIndex
                        };
                        attachedSeriesConfig.color = serie.color;
                        if (!attachedSeriesConfig.color) {
                            var c = Ext.util.Color.fromString(seriesConfig.color);
                            c.darken(0.1 * (idx + 1));
                            attachedSeriesConfig.color = c.toString();
                        }
                        series.push(attachedSeriesConfig);
                    });
                }
                var legendConfig = {
                    type: 'line',
                    title: '',
                    style: {
                        stroke: seriesConfig.color,
                        'stroke-width': 2
                    },
                    seriesIndex: seriesIndex,
                    seriesId: id
                };
                legends.push(legendConfig);
            });
            return {
                series: series,
                legends: legends
            };
        },

        /**
         * Checks if a number is a power of ten
         *
         * @param {number} d
         */
        powerOfTen: function(d) {
            return d / Math.pow(10, Math.ceil(Math.log(d) / Math.LN10 - 1e-12)) === 1;
        }
    }
});
