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
 * @class Koala.store.RoutingVehicles
 */
Ext.define('Koala.store.RoutingVehicles', {
    extend: 'Ext.data.Store',

    requires: [
        'Ext.Object',
        'Koala.model.RoutingVehicle'
    ],

    alias: 'store.k-routingvehicles',

    model: 'Koala.model.RoutingVehicle',

    /**
     * Convert the records into an array
     * that works with the VROOM API.
     *
     * See https://github.com/VROOM-Project/vroom/blob/master/docs/API.md#input
     *
     * @param {String} vehicleProfile The routing profile for the vehicles.
     * @returns {Array} The vehicle array.
     */
    getVroomArray: function(vehicleProfile) {
        var me = this;
        var vehicles = [];
        me.each(function(vehicleRec) {
            var vehicle = Ext.clone(vehicleRec.getData());

            if (vehicle.start) {
                var startLat = vehicle.start.latitude;
                var startLon = vehicle.start.longitude;
                vehicle['start'] = [startLon, startLat];
            }

            if (vehicle.end) {
                var endLat = vehicle.end.latitude;
                var endLon = vehicle.end.longitude;
                vehicle['end'] = [endLon, endLat];
            }

            vehicle.profile = vehicleProfile;
            if (Ext.isEmpty(vehicle.profile)) {
                vehicle.profile = 'driving-car';
            }

            // Delete empty properties, because the API
            // cannot handle it
            Ext.Object.each(vehicle, function(prop) {
                if (Ext.isEmpty(vehicle[prop])) {
                    delete vehicle[prop];
                }
            });

            vehicles.push(vehicle);
        });

        return vehicles;
    }
});
