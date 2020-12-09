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
 * @class Koala.view.container.RoutingResult
 */
Ext.define('Koala.view.container.RoutingResult', {
    extend: 'Ext.Container',
    xtype: 'k-container-routingresult',

    requires: [
        'Koala.view.container.ModernRoutingResultController',
        'Koala.view.window.RoutingModel',
    ],

    controller: 'k-container-modernroutingresult',

    viewModel: {
        type: 'k-window-routing'
    },

    name: 'routing-result-panel',

    width: '100%',

    height: '50%',

    docked: 'bottom',

    zIndex: 9998,

    showAnimation: {
        type: 'slide',
        direction: 'up'
    },

    listeners: {
        resultChanged: 'onRoutingResultChanged'
    },

    items: [{
        xtype: 'k-container-routingsummary',
        name: 'routingsummary'
    }, {
        xtype: 'lockable-carousel',
        name: 'routingcarousel',
        width: '100%',
        flex: 1,
        items: [{
        // }, {
        //     xtype: 'k-panel-routinginstructions'
        // }, {
        //     xtype: 'k-panel-routingelevation'
        }]
    }]

});
