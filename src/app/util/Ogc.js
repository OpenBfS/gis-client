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
        }

    }

});
