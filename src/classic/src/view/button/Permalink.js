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
 * @class Koala.view.button.Permalink
 */
Ext.define('Koala.view.button.Permalink', {
    extend: 'Ext.button.Button',
    xtype: 'k-button-permalink',

    requires: [
        'Koala.view.button.PermalinkController',
        'Koala.view.button.PermalinkModel'
    ],

    controller: 'k-button-permalink',
    viewModel: {
        type: 'k-button-permalink'
    },

    glyph: 'xf0c1@FontAwesome',

    bind: {
        text: null,
        tooltip: '{tooltip}'
    },

    listeners: {
        click: 'onClick'
    }

});
