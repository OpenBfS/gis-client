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
 * @class Koala.view.form.field.GeocodingComboController
 */
Ext.define('Koala.view.form.field.GeocodingComboController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-field-geocodingcombo',

    requires: [
        'Koala.util.Geocoding'
    ],

    /**
     * Check if input is coordinate or place description.
     * Provide geocoding suggestions in the combobox for
     * both cases.
     *
     * TODO
     * Note: This does currently not support the usage of
     * recId, which is needed for the mobile view.
     *
     * @param {Ext.form.field.ComboBox} combo The comboBox.
     * @param {String} newValue The new value of the input field.
     */
    onComboChange: function(combo, newValue) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var geoCodingSuggestions = view.getStore();

        if (!geoCodingSuggestions) {
            return;
        }

        // return if input string is too short
        if (!newValue || newValue.length < 3) {
            return;
        }

        // check if input is coordinate or address string
        var split = newValue.split(',');

        var hasTwoParts = (split.length === 2);

        var longitude = parseFloat(split[0]);
        var latitude = parseFloat(split[1]);

        var isValidCoordinate = hasTwoParts && !isNaN(longitude) && !isNaN(latitude);

        if (isValidCoordinate) {

            // TODO: add language argument
            // find address of coordinate
            Koala.util.Geocoding.doReverseGeocoding(longitude, latitude)
                .then(function(resultJson) {
                    // clear geocoding suggestions
                    geoCodingSuggestions.removeAll();
                    me.createGeoCodingSuggestions(resultJson, geoCodingSuggestions);
                })
                .catch(function() {
                    // TODO: add user feedback
                    geoCodingSuggestions.removeAll();
                });
        } else {

            // return if input starts with number
            var firstChar = newValue[0];
            if (parseInt(firstChar, 10)) {
                return;
            }

            // TODO: add language argument
            Koala.util.Geocoding.doGeocoding(newValue)
                .then(function(resultJson) {
                    // clear geocoding suggestions
                    geoCodingSuggestions.removeAll();
                    me.createGeoCodingSuggestions(resultJson, geoCodingSuggestions);
                })
                .catch(function() {
                    // TODO: add user feedback
                    geoCodingSuggestions.removeAll();
                });
        }
    },

    /**
     * Convert the geocoding results to records and
     * add them to the store for the comboxbox.
     *
     * @param {object} resultJson The response of the Photon geocoding API.
     * @param {Ext.data.Store} geoCodingSuggestions The store that contains geocoding suggestions.
     */
    createGeoCodingSuggestions: function(resultJson, geoCodingSuggestions, recId) {

        // TODO check how to handle recId properly
        Ext.each(resultJson.features, function(feature) {

            var coords = feature.geometry.coordinates;
            var longitude = coords[0];
            var latitude = coords[1];

            var address = Koala.util.Geocoding.createPlaceString(feature.properties);

            var suggestion = {
                'address': address,
                'latitude': latitude,
                'longitude': longitude
            };

            if (recId !== undefined) {
                suggestion.waypointId = recId;
            }

            geoCodingSuggestions.add(suggestion);
        });
    },
});
