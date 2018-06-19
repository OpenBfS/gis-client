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
 * @class Koala.view.button.BackgroundLayers
 */
Ext.define('Koala.view.button.BackgroundLayers', {
    extend: 'Ext.button.Button',
    xtype: 'k-button-backgroundlayers',

    requires: [
        'Koala.view.button.BackgroundLayersModelController',
        'Koala.view.button.BackgroundLayersModel'
    ],

    controller: 'k-button-backgroundlayers',
    viewModel: {
        type: 'k-button-backgroundlayers'
    },
    // Initially intented to use xf279 with the map glyph but the
    // Awesome font in Sencha is older than v4.4 and dosen't support the icon. The docs states that
    // Extjs 6.2 and higher are shipped with Awesome font 4.4 but this was not the case.
    // attmepting to upgrade the Awesome font to v5 in sencha also failed.
    // Therefore currently it is just a list glyph - couldn't find anything better
    glyph: 'xf0ca@FontAwesome',

    bind: {
        text: null,
        tooltip: '{tooltip}'
    },

    listeners: {
        click: 'onClick'
    }

});
