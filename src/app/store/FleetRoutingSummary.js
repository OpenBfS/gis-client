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
 * Store the summary of the fleet routing optimization API:
 * https://github.com/VROOM-Project/vroom/blob/master/docs/API.md#summary
 *
 * @class Koala.store.FleetRoutingSummary
 */
Ext.define('Koala.store.FleetRoutingSummary', {
    extend: 'Ext.data.Store',

    alias: 'store.k-fleetroutingsummary',

    storeId: 'k-fleetroutingsummary',

    fields: [
        {name: 'cost', type: 'int'},
        {name: 'unassigned', type: 'int'},
        {name: 'service', type: 'int'},
        {name: 'duration', type: 'int'},
        {name: 'waiting_time', type: 'int'}
    ]
});
