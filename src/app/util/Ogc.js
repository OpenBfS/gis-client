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
 * @class Koala.util.Ogc
 */
Ext.define('Koala.util.Ogc', {

    requires: [
        'Koala.util.String',
        'Koala.util.Object'
    ],

    statics: {

        /**
         * Create a ogc-filter for a datetime range.
         *
         * @param {String} startDateString The start date as an ISO_8601 date string.
         * @param {String} endDateString The end date as an ISO_8601 date string.
         * @param {String} timeField The name of the timestamp field in the layer.
         * @return {String} The ogc-filter as a string.
         */
        getDateTimeRangeFilter: function(startDateString, endDateString, timeField) {
            var filter;

            filter = '' +
                '<a:Filter xmlns:a="http://www.opengis.net/ogc">' +
                  '<a:PropertyIsBetween>' +
                    '<a:PropertyName>' + timeField + '</a:PropertyName>' +
                    '<a:LowerBoundary>'+
                      '<a:Literal>' + startDateString + '</a:Literal>' +
                    '</a:LowerBoundary>' +
                    '<a:UpperBoundary>' +
                      '<a:Literal>' + endDateString + '</a:Literal>' +
                    '</a:UpperBoundary>' +
                  '</a:PropertyIsBetween>' +
                '</a:Filter>';

            return filter;
        },

        /**
         * Create a ogc-filter for a point in time.
         *
         * @param {String} dateString An ISO_8601 date string.
         * @param {String} timeField The name of the timestamp field in the layer.
         * @return {String} The ogc-filter as a string.
         */
        getPointInTimeFilter: function(dateString, timeField) {
            var filter;

            filter = '' +
                '<a:Filter xmlns:a="http://www.opengis.net/ogc">' +
                    '<a:PropertyIsEqualTo>' +
                        '<a:PropertyName>' + timeField + '</a:PropertyName>' +
                        '<a:Literal>' + dateString + '</a:Literal>' +
                    '</a:PropertyIsEqualTo>' +
                '</a:Filter>';

            return filter;
        },

        /**
         * Get an OGC WFS-Filter for the ChartData. It adds a timeRangeFilter
         * and an additional value-filter for rodosLayer.
         *
         * @param {ol.Feature} station The clicked feature.
         * @param {String} startString ISO 8601 representation of the startDate.
         * @param {String} endString ISO 8601 representation of the endDate.
         * @param {String} timeField The field which contains the date information.
         * @param {ol.Layer} layer the layer to request
         * @return {String} The xml representation of the OGC WFS-Filter.
         */
        getWfsFilter: function(station, startString, endString, timeField, layer) {
            var me = this;
            var chartingMetadata = layer.get('timeSeriesChartProperties');
            var identifyField = chartingMetadata.featureIdentifyField || 'id';
            var timeRangeFilter = me.getPropertyIsBetweenFilter(
                startString, endString, timeField);
            var propertyFilter;
            var rodosProperty = Koala.util.Object.getPathStrOr(layer.metadata,
                'layerConfig/olProperties/rodosLayer', false);
            var isRodosLayer = Koala.util.String.coerce(rodosProperty);
            if (isRodosLayer) {
                propertyFilter = me.getPropertyIsEqualToFilter(identifyField,
                    station.get(identifyField));
            }

            var filter = '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
            if (Ext.isString(timeRangeFilter) && Ext.isString(propertyFilter)) {
                filter += '<And>';
                filter += timeRangeFilter;
                filter += propertyFilter;
                filter += '</And>';
            } else if (timeRangeFilter) {
                filter += timeRangeFilter;
            } else if (propertyFilter) {
                filter += propertyFilter;
            }
            filter += '</Filter>';
            return filter;
        },

        /**
         * Get an OGC 'PropertyIsBetween' WFS-Filter for the ChartData.
         *
         * @param {String} lowerBoundary The lowerBoundary of the filter.
         * @param {String} upperBoundary The upperBoundary of the filter.
         * @param {String} field The field on which the filter should look.
         * @return {String} The xml representation of the OGC 'PropertyIsBetween'
         *                  WFS-Filter.
         */
        getPropertyIsBetweenFilter: function(lowerBoundary, upperBoundary, field) {
            var filter = '' +
                '<PropertyIsBetween>' +
                    '<PropertyName>' + field + '</PropertyName>' +
                        '<LowerBoundary>'+
                        '<Literal>' + lowerBoundary + '</Literal>' +
                    '</LowerBoundary>' +
                    '<UpperBoundary>' +
                        '<Literal>' + upperBoundary + '</Literal>' +
                    '</UpperBoundary>' +
                '</PropertyIsBetween>';
            return filter;
        },

        /**
         * Get an OGC 'PropertyIsEqualTo' WFS-Filter for the ChartData.
         *
         * @param {String} field The field on which the filter should look.
         * @param {String} value The value the field should have.
         * @return {String} The xml representation of the OGC 'PropertyIsEqualTo'
         *                  WFS-Filter.
         */
        getPropertyIsEqualToFilter: function(field, value) {
            var filter = '' +
                '<PropertyIsEqualTo>' +
                  '<PropertyName>' + field + '</PropertyName>' +
                  '<Literal>' + value + '</Literal>' +
                '</PropertyIsEqualTo>';
            return filter;
        }

    }

});
