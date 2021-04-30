/* Copyright (c) 2021-present terrestris GmbH & Co. KG
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
 * @class Koala.view.button.ElevationProfileSwitcher
 */
Ext.define('Koala.view.button.ElevationProfileSwitcher', {
    extend: 'Ext.button.Button',
    xtype: 'k-button-elevationprofileswitcher',

    requires: [
        'Koala.view.button.ElevationProfileSwitcherController'
    ],

    controller: 'k-button-elevationprofileswitcher',

    listeners: {
        updateMenu: 'updateMenu'
    },

    text: 'Verschneiden',

    blacklist: [],

    initComponent: function() {
        this.callParent(arguments);

        this.fireUpdateMenu();

        var treeStore = this.getController().getLegendTreeStore();
        if (treeStore) {
            treeStore.on('datachanged', this.fireUpdateMenu.bind(this));
        }
    },

    /**
     * Fire the updateMenu event.
     */
    fireUpdateMenu: function() {
        this.fireEvent('updateMenu');
    }
});
