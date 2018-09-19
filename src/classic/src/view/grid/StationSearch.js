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
 * @class Koala.view.grid.StationSearch
 */
Ext.define('Koala.view.grid.StationSearch', {
    extend: 'Ext.grid.Panel',
    xtype: 'k-grid-stationsearch',

    requires: [
        'Koala.view.grid.StationSearchController',
        'Koala.view.grid.StationSearchModel',

        'Koala.store.StationSearch'
    ],

    controller: 'k-grid-stationsearch',
    viewModel: {
        type: 'k-grid-stationsearch'
    },

    store: {
        type: 'k-stationsearch'
    },

    bind: {
        title: '{stationSearchTitle}'
    },

    hideHeaders: true,

    columns: {
        items: [{
            text: 'Name',
            dataIndex: 'name'
        }],
        defaults: {
            flex: 1
        }
    },

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        name: 'footer',
        items: [
            { xtype: 'tbfill' },
            {
                xtype: 'tbtext',
                name: 'status-line',
                html: ''
            },
            { xtype: 'tbfill' }
        ]
    }],

    listeners: {
        boxready: 'setupStatusLineListeners',
        beforedestroy: 'teardownStatusLineListeners',
        itemmouseenter: 'onItemMouseEnter',
        itemmouseleave: 'onItemMouseLeave',
        itemclick: 'onItemClick'
    }
});
