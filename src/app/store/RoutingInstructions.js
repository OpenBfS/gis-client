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
 * @class Koala.store.RoutingInstructions
 */
Ext.define('Koala.store.RoutingInstructions', {
    extend: 'Ext.data.Store',

    alias: 'store.k-routinginstructions',

    storeId: 'k-routinginstructions',

    fields: [
        {name: 'distance', type: 'float'},
        {name: 'duration', type: 'float'},
        {name: 'instruction', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'type', type: 'integer'},
        {name: 'waypoints', convert: null},
        {name: 'coordinates', convert: null}
    ]
});
