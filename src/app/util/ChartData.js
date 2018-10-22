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
        'Koala.util.Filter'
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
            var featureStyle = chartConfig.featureStyle;

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
        }

    }

});
