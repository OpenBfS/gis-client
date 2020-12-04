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
 * @class Koala.view.form.RoutingSettings
 */
Ext.define('Koala.view.form.RoutingSettings', {
    extend: 'Ext.form.Panel',
    xtype: 'k-form-routing-settings',
    controller: 'k-form-routing-settings',

    requires: [
        'Koala.view.form.RoutingSettingsController'
    ],

    width: '100%',

    fbar: [
        {
            xtype: 'segmentedbutton',
            defaults: {
                handler: 'onRoutingButtonPressed',
                padding: '3 10'
            },
            bind: {
                value: '{routingProfile}'
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
                    tooltip: '{i18n.profileBycicleText}'
                }
            }, {
                iconCls: 'x-fa fa-male',
                value: 'foot-walking',
                bind: {
                    pressed: '{routingProfile === "foot-walking"}',
                    tooltip: '{i18n.profileWalkingText}'
                }
            }]
        }, {
            xtype: 'tbspacer',
            flex: 1
        },
        {
            type: 'button',
            iconCls: 'x-fa fa-plus-circle',
            bind: {
                tooltip: '{i18n.addEmptyPoint}'
            },
            handler: 'addEmptyViaPoint'
        }
    ],

    bodyPadding: 10,
    items: [],
    listeners: {
        boxReady: 'onBoxReady'
    }
});
