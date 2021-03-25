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
 * @class Koala.view.button.RoutingPreference
 */
Ext.define('Koala.view.button.RoutingPreference', {
    extend: 'Ext.button.Segmented',
    xtype: 'k-button-routing-preference',
    requires: [
    ],

    viewModel: {
        data: {
            i18n: {
                fastestText: '',
                recommendedText: '',
                shortestText: ''
            },
            routingPreference: undefined
        }
    },

    defaults: {
        padding: '3 10'
    },

    items: [{
        iconCls: 'x-fa fa-user-plus',
        value: 'recommended',
        bind: {
            pressed: '{routingPreference === "recommended"}',
            tooltip: '{i18n.recommendedText}'
        }
    }, {
        iconCls: 'x-fa fa-tachometer',
        value: 'shortest',
        bind: {
            pressed: '{routingPreference === "shortest"}',
            tooltip: '{i18n.shortestText}'
        }
    }, {
        iconCls: 'x-fa fa-fast-forward',
        value: 'fastest',
        bind: {
            pressed: '{routingPreference === "fastest"}',
            tooltip: '{i18n.fastestText}'
        }
    }]
});
