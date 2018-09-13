/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.PermalinkWindow
 */
Ext.define('Koala.view.window.PermalinkWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-permalink',
    cls: 'k-window-permalink',

    requires: [
        'Koala.util.Help'
    ],

    name: 'permalink-window',

    bind: {
        title: '{windowTitle}'
    },

    layout: 'fit',

    constrain: true,

    tools: [{
        type: 'help',
        bind: {
            tooltip: '{helpTooltip}'
        },
        callback: function() {
            Koala.util.Help.showHelpWindow('mapNavigationPermalink', 'mapNavigation');
        }
    }],

    items: [{
        xtype: 'k-form-permalink'
    }]

});
