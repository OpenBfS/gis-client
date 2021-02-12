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
 * @class Koala.store.Isochrones
 */
Ext.define('Koala.store.Isochrones', {
    extend: 'Ext.data.Store',

    alias: 'store.k-isochrones',

    fields: [
        { name: 'value', type: 'int', convert: null },
        { name: 'center', convert: null },
        { name: 'area', type: 'number' },
        { name: 'reachfactor', type: 'number' },
        // TODO currently our api does not return the population
        { name: 'population', type: 'int', convert: null},
        { name: 'group_index', type: 'number', convert: null },
        { name: 'geometry', convert: null },
        // TODO value is either seconds or metres, depending on range_type
        { name: 'range_type', type: 'string', default: 'time' }
    ]
    // TODO check if we have to add a method to transform the coordinates in 'center'

});
