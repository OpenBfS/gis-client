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
 * @class Koala.view.menu.ChartSettingsMenu
 */
Ext.define('Koala.view.menu.ChartSettingsMenu', {
    extend: 'Ext.menu.Menu',
    xtype: 'k-menu-chartsettings',

    requires: [
        'Koala.view.menu.ChartSettingsMenuController',
        'Koala.view.menu.ChartSettingsMenuModel'
    ],

    controller: 'k-menu-chartsettings',
    viewModel: {
        type: 'k-menu-chartsettings'
    },

    items: [{
        bind: {
            text: '{toggleScaleText}',
            hidden: '{!isTimeseries}'
        },
        handler: 'toggleScale',
        glyph: 'xf07d@FontAwesome'
    }, {
        xtype: 'menucheckitem',
        bind: {
            text: '{showIdentificationThresholdText}',
            hidden: '{!isTimeseries || !maySeeIdThresholdButton}'
        },
        handler: 'showIdentificationThreshold',
        glyph: 'xf201@FontAwesome'
    }, {
        xtype: 'menucheckitem',
        bind: {
            text: '{toggleLegendText}'
        },
        handler: 'toggleLegend',
        glyph: 'xf151@FontAwesome'
    }],

    config: {
        isTimeseries: true
    }

});
