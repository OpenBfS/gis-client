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
 * @class Koala.model.WayPoint
 */
Ext.define('Koala.model.WayPoint', {
    extend: 'Ext.data.Model',
    requires: ['Ext.data.identifier.Sequential'],
    identifier: {
        type: 'sequential'
    },

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
    ]
});
