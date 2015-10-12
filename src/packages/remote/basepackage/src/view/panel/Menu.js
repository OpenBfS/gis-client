/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Menu Panel
 *
 * Used to show a menu containing different panels of your choice, e.g.
 * the print form panel
 *
 */
Ext.define("Basepackage.view.panel.Menu", {
    extend: "Ext.panel.Panel",
    xtype: "base-panel-menu",

    requires: [
        "Ext.layout.container.Accordion"
    ],

    viewModel: {
        data: {
            closedMenuTitle: 'Menu schließen',
            openedMenuTitle: 'Menu anzeigen'
        }
    },

    defaultListenerScope: true,

    headerPosition: 'bottom',

    collapsible: true,

    hideCollapseTool: true,

    titleCollapse: true,

    titleAlign: 'center',

    activeItem: 1,

    defaults: {
        // applied to each contained panel
        hideCollapseTool: true,
        titleCollapse: true
    },

    layout: {
        // layout-specific configs go here
        type: 'accordion',
        titleCollapse: false,
        animate: true
    },

    items: [],

    listeners: {
        collapse: 'setTitleAccordingToCollapsedState',
        expand: 'setTitleAccordingToCollapsedState',
        afterrender: 'setTitleAccordingToCollapsedState'
    },

    setTitleAccordingToCollapsedState: function(menu){
        if (menu.getCollapsed() === false) {
            menu.setBind({
                title: '{closedMenuTitle}'
            });
        } else {
            menu.setBind({
                title: '{openedMenuTitle}'
            });
        }
    }
});
