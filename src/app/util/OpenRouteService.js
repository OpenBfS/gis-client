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
 * Util to interact with the OpenRouteService endpoint.
 *
 * @class Koala.util.OpenRouteService
 */
Ext.define('Koala.util.OpenRouteService', {

    requires: [
        'Koala.util.AppContext'
    ],

    statics: {

        /** @private */
        getApiEndpoint: function() {
            var config = Koala.util.AppContext.getAppContext().data.merge;
            if (config.routing && config.routing.openrouteserviceUrl) {
                return config.routing.openrouteserviceUrl;
            }
        },
        /** @private */
        getApiKey: function() {
            var config = Koala.util.AppContext.getAppContext().data.merge;
            if (config.routing && config.routing.openrouteserviceApiKey) {
                return config.routing.openrouteserviceApiKey;
            }
        },

        /**
         * Fire the http request to the OpenRouteService directions API.
         *
         * @param {Object} params The request params.
         * @returns {Promise} A promise resolving on succesful completion.
         */
        requestDirectionsApi: function(params) {
            var me = this;

            var Directions = new Openrouteservice.Directions({
                host: me.getApiEndpoint(),
                api_key: me.getApiKey()
            });

            return Directions.calculate(params);
        }
    }
});
