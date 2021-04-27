/*  Copyright (c) 2021-present terrestris GmbH & Co. KG
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
 * A utility class to handle routing vehicles.
 *
 * @class Koala.util.RoutingVehicles
 */
Ext.define('Koala.util.RoutingVehicles', {

    requires: [
        'Ext.Promise',
        'Koala.util.Geocoding'
    ],

    statics: {
        /**
         * Get the geocoding locations for vehicles.
         *
         * Checks which location properties are specified for the
         * vehicle and creates the needed promises.
         *
         * @param {Object} vehicle The vehicle to get the locations for.
         * @param {String} lang The current language.
         * @returns {Ext.Promise} The location promise.
         */
        getGeocodingLocations: function(vehicle, lang) {
            var hasStart = Ext.isArray(vehicle.start) && vehicle.start.length === 2;
            var hasEnd = Ext.isArray(vehicle.end) && vehicle.end.length === 2;

            var GeocodingUtil = Koala.util.Geocoding;

            if (hasStart && hasEnd) {
                var res = [];
                return GeocodingUtil.doReverseGeocoding(vehicle.start[0], vehicle.start[1], lang)
                    .catch(function() {
                        res[0] = null;
                        return GeocodingUtil.doReverseGeocoding(vehicle.end[0], vehicle.end[1], lang);
                    })
                    .then(function(response) {
                        res[0] = response;
                        return GeocodingUtil.doReverseGeocoding(vehicle.end[0], vehicle.end[1], lang);
                    })
                    .catch(function() {
                        res[1] = null;
                        return Ext.Promise.resolve(res);
                    })
                    .then(function(response) {
                        res[1] = response;
                        return Ext.Promise.resolve(res);
                    });
            } else if (hasStart) {
                return GeocodingUtil.doReverseGeocoding(vehicle.start[0], vehicle.start[1], lang)
                    .then(function(response) {
                        return Ext.Promise.resolve([response, undefined]);
                    });
            } else if (hasEnd) {
                return GeocodingUtil.doReverseGeocoding(vehicle.end[0], vehicle.end[1], lang)
                    .then(function(response) {
                        return Ext.Promise.resolve([undefined, response]);
                    });
            }

            return Ext.Promise.reject('Vehicle has neither start nor end.');
        },

        /**
         * Set start and end objects for vehicle.
         *
         * @param {Object} vehicle The vehicle to set start and end for.
         * @param {Object[]} geocodingLocations Response objects of the geocoding request.
         */
        setStartEndFromGeocoding: function(vehicle, geocodingLocations) {
            var GeocodingUtil = Koala.util.Geocoding;

            var startLocation = geocodingLocations[0];
            var endLocation = geocodingLocations[1];
            if (Ext.isArray(vehicle.start)) {
                vehicle.start = {
                    address: vehicle.start[0] + ', ' + vehicle.start[1],
                    latitude: vehicle.start[1],
                    longitude: vehicle.start[0]
                };
                if (startLocation !== null) {
                    vehicle.start.address =
                        GeocodingUtil.createPlaceString(startLocation.features[0].properties);
                }
            }
            if (Ext.isArray(vehicle.end)) {
                vehicle.end = {
                    address: vehicle.end[0] + ', ' + vehicle.end[1],
                    latitude: vehicle.end[1],
                    longitude: vehicle.end[0]
                };
                if (endLocation !== null) {
                    vehicle.end.address =
                        GeocodingUtil.createPlaceString(endLocation.features[0].properties);
                }
            }
        }
    }
});
