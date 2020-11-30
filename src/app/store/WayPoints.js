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
 * @class Koala.store.WayPoints
 */
Ext.define('Koala.store.WayPoints', {
    extend: 'Ext.data.Store',

    alias: 'store.k-waypoints',

    fields: [
        {name: 'address', type: 'string'},
        {name: 'latitude', type: 'float', convert: null},
        {name: 'longitude', type: 'float', convert: null},
        {
            name: 'hasLatitude',
            type: 'bool',
            calculate: function(data) {
                return data.latitude !== null && data.latitude !== undefined;
            }
        },
        {
            name: 'hasLongitude',
            type: 'bool',
            calculate: function(data) {
                return data.longitude !== null && data.longitude !== undefined;
            }
        },
        {
            name: 'coordinate',
            calculate: function(data) {
                return [data.longitude, data.latitude];
            }
        }
    ],

    /**
     * It is necessary to have different dummy points,
     * because identical records are only stored once
     * in the wayPointStore.
     */
    dummyStartPoint: {
        address: '',
        latitude: undefined,
        longitude: null
    },

    dummyEndPoint: {
        address: '',
        latitude: null,
        longitude: undefined
    },

    dummyViaPoint: {
        address: '',
        latitude: null,
        longitude: null
    },

    /**
     * Get the coordinates of all waypoints as array.
     *
     * @returns {[Number, Number][]} Array of [long, lat] coordinates.
     */
    getCoordinatesArray: function() {
        var me = this;
        var coordinates = [];
        me.each(function(rec) {
            coordinates.push(rec.get('coordinate'));
        });
        return coordinates;
    },

    /**
     * Check if all records are valid.
     *
     * Records are invalid if either latitude or longitude
     * are null or undefined.
     */
    isValid: function() {
        var me = this;
        var idx = me.findBy(function(rec) {
            return !rec.get('hasLongitude') || !rec.get('hasLatitude');
        });
        return idx === -1;
    },

    /**
     * Replace a waypoint.
     *
     * @param {Object} point Waypoint.
     */
    replacePoint: function(index, point) {
        var me = this;
        me.removeAt(index);
        me.insert(index, point);
    },

    /**
     * Set the start point.
     *
     * @param {Object} point Waypoint.
     */
    setStartPoint: function(point) {
        var me = this;
        me.replacePoint(0, point);
    },

    /**
     * Add a via point.
     *
     * @param {Object} point Waypoint.
     */
    addViaPoint: function(point) {
        var me = this;
        me.insert(me.count() - 1, point);
    },

    /**
     * Set the end point.
     *
     * @param {Object} point Waypoint.
     */
    setEndPoint: function(point) {
        var me = this;
        me.replacePoint(me.count() - 1, point);
    }
});
