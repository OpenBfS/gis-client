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
        'Ext.Array',
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

            var doReverseGeocoding = Koala.util.Geocoding.doReverseGeocoding;

            if (hasStart && hasEnd) {
                var res = [];
                return doReverseGeocoding(vehicle.start[0], vehicle.start[1], lang)
                    .catch(function() {
                        res[0] = null;
                        return doReverseGeocoding(vehicle.end[0], vehicle.end[1], lang);
                    })
                    .then(function(response) {
                        res[0] = response;
                        return doReverseGeocoding(vehicle.end[0], vehicle.end[1], lang);
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
                return doReverseGeocoding(vehicle.start[0], vehicle.start[1], lang)
                    .then(function(response) {
                        return Ext.Promise.resolve([response, undefined]);
                    });
            } else if (hasEnd) {
                return doReverseGeocoding(vehicle.end[0], vehicle.end[1], lang)
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
            var createPlaceString = Koala.util.Geocoding.createPlaceString;

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
                        createPlaceString(startLocation.features[0].properties);
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
                        createPlaceString(endLocation.features[0].properties);
                }
            }
        },

        /**
         * Filter vehicles that have a location.
         *
         * This filters the vehicles that either have a valid 'start'
         * or 'end' property.
         *
         * @param {Object[]} vehicles Array of vehicles to filter.
         * @returns {Object[]} The filtered vehicles.
         */
        filterLocations: function(vehicles) {
            return Ext.Array.filter(vehicles, function(vehicle) {
                var hasStart = Ext.isArray(vehicle.start) && vehicle.start.length === 2;
                var hasEnd = Ext.isArray(vehicle.end) && vehicle.end.length === 2;
                return hasStart || hasEnd;
            });
        },

        /**
         * Sets missing ids for break objects within vehicle upload files.
         *
         * @param {Object[]} config a routing vehicle file that was uploaded
         */
        fillBreakIds: function(config) {
            Ext.each(config, function(obj) {
                if (obj.breaks) {
                    Ext.each(obj.breaks, function(b, idx) {
                        if (!b.id) {
                            b.id = idx;
                        }
                    });
                }
            });
        }

    }
});
