/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * Util to interact with a photon geocoder / reverse geocoder backend.
 *
 * @class Koala.util.Geocoding
 */
Ext.define('Koala.util.Geocoding', {

    requires: [],

    statics: {

        /** */
        lang: 'de',

        /** */
        limit: 5,

        /** @private */
        baseUrl: function() {

            // avoid null pointer
            var baseUrl = 'https://photon.komoot.io';
            var config = Koala.util.AppContext.getAppContext().data.merge;
            if (config.routing && config.routing.photonUrl) {
                baseUrl = config.routing.photonUrl;
            }

            // TODO: add handling for trailing "/" and "?"

            return baseUrl;
        },

        /**
         * Perform a geocoding operation by an AJAX request.
         * Return a JS promise resolving on succesful completion of reverse
         * geocoding call.
         *
         * @param {String} queryStr
         * @param {String} lang
         * @param {Integer} limit
         */
        doGeocoding: function(queryStr, lang, limit) {
            return new Ext.Promise(function(resolve, reject) {
                Ext.Ajax.request({
                    url: Koala.util.Geocoding.baseUrl() + '/api',
                    method: 'GET',
                    params: {
                        q: queryStr,
                        lang: lang || Koala.util.Geocoding.lang,
                        limit: limit || Koala.util.Geocoding.limit
                    },
                    disableCaching: false, // avoids _dc param (breaks request)
                    success: function(response) {
                        var json = Ext.decode(response.responseText);
                        resolve(json);
                    },
                    failure: function(response) {
                        reject(response.status);
                    }
                });
            });
        },

        /**
         * Perform a reverse geocoding operation by an AJAX request.
         * Return a JS promise resolving on succesful completion of reverse
         * geocoding call.
         *
         * @param {Number} lon
         * @param {Number} lat
         */
        doReverseGeocoding: function(lon, lat, lang) {
            return new Ext.Promise(function(resolve, reject) {
                if (!Ext.isNumber(lon) || !Ext.isNumber(lat)) {
                    Ext.Logger.warn('Invalid input for reverse geocoding - skip');
                    reject('Invalid input for reverse geocoding');
                }
                Ext.Ajax.request({
                    url: Koala.util.Geocoding.baseUrl() + '/reverse',
                    method: 'GET',
                    params: {
                        lon: lon,
                        lat: lat,
                        lang: lang || Koala.util.Geocoding.lang
                    },
                    disableCaching: false, // avoids _dc param (breaks request)
                    success: function(response) {
                        var json = Ext.decode(response.responseText);
                        resolve(json);
                    },
                    failure: function(response) {
                        Ext.Logger.warn('Geocoding failed', response);
                        reject('Reverse geocoding failed with status ' +
                            response.status);
                    }
                });
            });
        },

        /**
         * Create a place description using the response of the Photon
         * API.
         *
         * @param {Object} props The location properties of one feature.
         */
        createPlaceString: function(props) {

            var placeString = '';

            // street and housenumber
            if (props.housenumber && props.street) {
                placeString += props.street + ' ' + props.housenumber;
            } else if (props.street) {
                placeString += ', ' + props.street;
            }

            if (props.name) {
                placeString += ', ' + props.name;
            }

            if (props.city) {
                placeString += ', ' + props.city;
            }

            if (props.country) {
                placeString += ', ' + props.country;
            }

            // remove redundant comma
            if (placeString.startsWith(', ')) {
                placeString = placeString.substring(2);
            }

            return placeString;
        }
    }
});
