
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
 * @class Koala.view.button.RoutingProfile
 */
Ext.define('Koala.view.button.RoutingProfile', {
    extend: 'Ext.button.Segmented',
    xtype: 'k-button-routing-profile',
    requires: [
    ],

    viewModel: {
        data: {
            i18n: {
                profileCarText: '',
                profileBicycleText: '',
                profileWalkingText: ''
            },
            routingProfile: undefined
        }
    },

    defaults: {
        padding: '3 10'
    },

    items: [{
        iconCls: 'x-fa fa-car',
        value: 'driving-car',
        bind: {
            pressed: '{routingProfile === "driving-car"}',
            tooltip: '{i18n.profileCarText}'
        }
    }, {
        iconCls: 'x-fa fa-bicycle',
        value: 'cycling-regular',
        bind: {
            pressed: '{routingProfile === "cycling-regular"}',
            tooltip: '{i18n.profileBicycleText}'
        }
    }, {
        iconCls: 'x-fa fa-male',
        value: 'foot-walking',
        bind: {
            pressed: '{routingProfile === "foot-walking"}',
            tooltip: '{i18n.profileWalkingText}'
        }
    }]
});
