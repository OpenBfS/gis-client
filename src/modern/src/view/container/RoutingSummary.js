/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * @class Koala.view.container.RoutingSummary
 */
Ext.define('Koala.view.container.RoutingSummary', {
    extend: 'Ext.Container',
    xtype: 'k-container-routingsummary',

    requires: [
        'Koala.view.container.RoutingResultController',
        'Koala.view.window.RoutingModel'
    ],

    controller: 'k-container-routingresult',

    viewModel: {
        type: 'k-window-routing'
    },

    layout: 'vbox',

    items: [{
        xtype: 'grid',
        name: 'routingsummarygrid',
        flex: 1,
        bind: {
            store: '{routingsummaries}'
        },
        columns: [{
            dataIndex: 'profile'
        }, {
            dataIndex: 'duration'
        }]
    }]

});
