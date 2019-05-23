/*  Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * A utility class with data processing functions.
 *
 * @class Koala.util.Data
 */
Ext.define('Koala.util.Data', {

    statics: {

        /**
         * Extract the property names from the features.
         *
         * @param {ol.Feature[]} features the features
         * @return {String[]} the list of attributes
         */
        extractProperties: function(features) {
            var attributes = [];
            Ext.each(features, function(feat) {
                Ext.iterate(feat.getProperties(), function(key) {
                    if (attributes.indexOf(key) === -1 && key !== 'geometry') {
                        attributes.push(key);
                    }
                });
            });
            return attributes;
        },

        /**
         * Extract the dictinct values of the given property in the given
         * feature list.
         *
         * @param {ol.Feature[]} features the features
         * @param {String} name the attribute name
         * @return {String[]} the list of distinct values
         */
        extractDistinctValues: function(features, name) {
            var values = [];
            Ext.each(features, function(feature) {
                var value = feature.get(name);
                if (values.indexOf(value) === -1) {
                    values.push(value);
                }
            });
            return values;
        }

    }

});
