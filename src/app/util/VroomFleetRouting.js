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
 * Util to interact with the VROOM route optimization endpoint.
 *
 * @class Koala.util.VroomFleetRouting
 */
Ext.define('Koala.util.VroomFleetRouting', {

    requires: [
        'Koala.util.AppContext',
        'Ext.Object',
        'Ext.Ajax'
    ],

    statics: {

        /** @private */
        getApiEndpoint: function() {
            var config = Koala.util.AppContext.getAppContext().data.merge;
            if (config.routing && config.routing.vroomUrl) {
                return config.routing.vroomUrl;
            }
        },

        /**
         * Perform a route optimization task.
         *
         * API specificiation: https://github.com/VROOM-Project/vroom/blob/master/docs/API.md
         *
         * @param {Array} vehicles An array of vehicle objects.
         * @param {Array} jobs An array of job objects.
         * @param {Object} avoidArea The geometry of the avoid area.
         * @returns {Ext.Promise} A promise resolving on succesful completion.
         * */
        performOptimization: function(vehicles, jobs, avoidArea) {
            return new Ext.Promise(function(resolve, reject) {

                var url = Koala.util.VroomFleetRouting.getApiEndpoint();
                if (!url) {
                    reject('API endpoint is not defined.');
                }

                if (!Ext.isArray(vehicles) || !Ext.isArray(jobs)) {
                    reject('Input data is invalid or undefined.');
                }

                var jsonData = {
                    vehicles: vehicles,
                    jobs: jobs
                };

                // add avoid area if available
                if (!Ext.Object.isEmpty(avoidArea)) {
                    jsonData.avoid_polygons = avoidArea;
                }
                Ext.Ajax.request({
                    url: url,
                    jsonData: jsonData,
                    success: function(response) {
                        var json = Ext.decode(response.responseText);
                        resolve(json);
                    },
                    failure: function(response) {
                        Ext.Logger.warn('Route Optimization failed');
                        reject(response.status);
                    }
                });
            });
        }
    }
});
