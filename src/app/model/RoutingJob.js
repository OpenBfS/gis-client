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
 * @class Koala.model.RoutingJob
 */
Ext.define('Koala.model.RoutingJob', {
    extend: 'Ext.data.Model',

    requires: [
        'Ext.data.identifier.Sequential',
        'Koala.model.WayPoint'
    ],

    identifier: {
        type: 'sequential'
    },

    fields: [
        {name: 'description', type: 'string'},
        {name: 'priority', type: 'int', convert: null},
        {name: 'service', type: 'int', convert: null},
        {name: 'time_windows', convert: null},
        {name: 'address', convert: null},
        // data from API response
        {name: 'waiting_time',type: 'int', convert: null},
        {name: 'arrival',type: 'int', convert: null}
    ]
});
