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
 * @class Koala.view.window.ElevationProfileWindow
 */
Ext.define('Koala.view.window.ElevationProfileWindow', {
    extend: 'Ext.window.Window',

    xtype: 'k-window-elevationprofilewindow',

    requires: [
        'Koala.view.window.ElevationProfileWindowController',
        'Koala.view.window.ElevationProfileWindowModel'
    ],

    controller: 'k-window-elevationprofilewindow',

    viewModel: {
        type: 'k-window-elevationprofilewindow'
    },

    layout: 'fit',

    listeners: {
        show: 'onElevationProfileShow',
        close: 'onElevationProfileClose'
    },

    bind: {
        title: '{title}'
    },

    constrainHeader: true,
    collapsible: true,
    maxHeight: 800,
    height: 350,
    width: 900,

    defaults: {
        flex: 1,
        width: '100%'
    },

    items: [],

    initComponent: function() {
        var me = this;
        me.callParent();
    }
});
