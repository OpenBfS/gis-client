/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * @class Koala.view.menu.LayerSettingsMenu
 */
Ext.define('Koala.view.menu.LayerSettingsMenu', {
    extend: 'Ext.menu.Menu',
    xtype: 'k-menu-layersettings',

    requires: [
        'Koala.view.menu.LayerSettingsMenuController',
        'Koala.view.menu.LayerSettingsMenuModel',
        'Koala.view.form.field.TemplateEditor',
        'Koala.util.Clone',
        'Koala.view.window.CloneWindow'
    ],

    controller: 'k-menu-layersettings',
    viewModel: {
        type: 'k-menu-layersettings'
    },

    config: {
        layer: null
    },

    items: [{
        bind: {
            text: '{minimize}',
            hidden: '{!showCartoWindow}'
        },
        handler: 'toggleMinimize',
        glyph: 'xf2d1@FontAwesome'
    }, {
        bind: {
            text: '{cloneLayer}',
            hidden: '{!allowClone}'
        },
        handler: 'cloneLayer',
        glyph: 'xf0c5@FontAwesome'
    }, {
        bind: {
            text: '{hoverInfo}',
            hidden: '{!external || !queryable || !hoverable}'
        },
        handler: 'toggleHoverInfo',
        glyph: 'xf129@FontAwesome',
        xtype: 'menucheckitem',
        checked: false
    }, {
        bind: {
            text: '{editTemplates}',
            hidden: '{external || !hoverable}'
        },
        handler: 'editTemplates',
        glyph: 'xf0e5@FontAwesome'
    }]

});
