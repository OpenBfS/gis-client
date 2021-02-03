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
 * @class Koala.store.RoutingSummaries
 */
Ext.define('Koala.store.RoutingSummaries', {
    extend: 'Ext.data.Store',

    alias: 'store.k-routingsummaries',

    storeId: 'k-routingsummaries',

    fields: [
        // ORS properties
        {name: 'profile', type: 'string'},
        {name: 'distance', type: 'float'},
        {name: 'duration', type: 'float'},
        {name: 'ascent', type: 'float'},
        {name: 'descent', type: 'float'},
        {name: 'properties', convert: null},
        {name: 'geometry', convert: null},
        {name: 'query', convert: null},

        // VROOM properties
        {name: 'cost', type: 'int'},
        {name: 'waiting_time', type: 'int'},
        {name: 'arrival', type: 'int'},
        {name: 'service', type: 'int'},
        {name: 'start_arrival', type: 'int'},
        {name: 'end_arrival', type: 'int'}
    ]
});
