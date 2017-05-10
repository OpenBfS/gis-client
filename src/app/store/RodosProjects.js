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
 * @class Koala.store.RodosProjects
 */
Ext.define('Koala.store.RodosProjects', {
    extend: 'Ext.data.Store',

    alias: 'store.k-rodosprojects',

    fields: [{
        name: 'modelchainname',
        type: 'string'
    }, {
        name: 'name',
        type: 'string'
    }, {
        name: 'project_uid',
        type: 'string'
    }, {
        name: 'comment',
        type: 'string'
    }, {
        name: 'calculationDate',
        type: 'date'
    }, {
        name: 'user',
        type: 'string'
    }],

    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            rootProperty: 'rodos_projects'
        }
    }
});
