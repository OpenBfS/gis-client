/* Copyright (c) 2016-present terrestris
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
 * ShowRedliningToolsContainer Button
 *
 * Button used to show and hide a Container with redlining tools for the map
 *
 * @class Koala.view.button.ShowRedliningToolsContainer
 */
Ext.define('Koala.view.button.ShowRedliningToolsContainer', {
    extend: 'Ext.button.Button',
    xtype: 'k-button-showredliningtoolscontainer',

    requires: [
        'Ext.app.ViewModel',

        'Koala.view.button.ShowRedliningToolsContainerController',
        'Koala.view.button.ShowRedliningToolsContainerModel'
    ],

    controller: 'k-button-showredliningtoolscontainer',

    viewModel: 'k-button-showredliningtoolscontainer',

    bind: {
        tooltip: '{tooltip}',
        text: '{text}'
    },

    glyph: 'xf105@Flaticon', //xf10b for a ruler

    enableToggle: true,

    toggleGroup: 'koala-common-tools',

    listeners: {
        toggle: 'onToggle'
    }
});
