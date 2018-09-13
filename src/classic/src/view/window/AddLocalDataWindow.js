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
 * @class Koala.view.window.ImportLocalDataWindow
 */
Ext.define('Koala.view.window.ImportLocalDataWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-importlocaldata',
    cls: 'k-window-importlocaldata',

    requires: [
        'Koala.util.Help'
    ],

    bind: {
        title: '{importLocalDataButtonText}'
    },

    layout: 'fit',
    tools: [{
        type: 'help',
        bind: {
            tooltip: '{helpTooltip}'
        },
        callback: function() {
            Koala.util.Help.showHelpWindow('toolsImport', 'tools');
        }
    }],
    items: [{
        xtype: 'k-form-importLocalData'
    }]

});
