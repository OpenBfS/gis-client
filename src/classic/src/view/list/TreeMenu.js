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
 * @class Koala.view.list.TreeMenu
 */
Ext.define('Koala.view.list.TreeMenu', {
    extend: 'Ext.list.Tree',
    xtype: 'k-treemenu',

    statics: {
        /* i18n */
        txtUntil: ''
        /* i18n */
    },

    requires: [
        'Koala.util.AppContext',
        'Koala.util.LocalStorage',
        'Koala.view.list.TreeMenuModel',
        'Koala.view.list.TreeMenuController'
    ],

    ui: 'tree-menu',

    controller: 'k-list-treemenu',
    viewModel: {
        type: 'k-list-treemenu'
    },

    expanderFirst: false,
    expanderOnly: false,

    bind: {
        micro: '{micro}',
        store: '{menuStore}'
    },

    listeners: {
        itemclick: 'onItemClick'
    },

    /**
     * Sets some flags in the viewModel based on localStorage and appContext contents.
     */
    constructor: function() {
        this.callParent(arguments);
        var viewModel = this.getViewModel();
        viewModel.set('showLayersetChooser', Koala.util.LocalStorage.showLayersetChooserWindowOnStartup());
        viewModel.set('showHelp', Koala.util.LocalStorage.showHelpWindowOnStartup());
        var ctx = Koala.util.AppContext.getAppContext().data.merge;
        var roles = ctx.imis_user.userroles;
        var isPublic = roles.indexOf('public') !== -1;
        viewModel.set('publicRole', isPublic);
    }

});
