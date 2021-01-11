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
 * @class Koala.view.form.ClassicRoutingSettings
 */
Ext.define('Koala.view.form.ClassicRoutingSettings', {
    extend: 'Ext.form.Panel',
    xtype: 'k-form-classic-routing-settings',
    controller: 'k-form-classic-routing-settings',

    requires: [
        'Ext.button.Segmented',
        'Ext.toolbar.Spacer',
        'Ext.button.Button',
        'Ext.form.field.FileButton',
        'Koala.view.form.ClassicRoutingSettingsController'
    ],

    width: '100%',

    avoidAreaLayerName: 'routing-avoid-area-layer',

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
            iconCls: 'x-fa fa-times',
            bind: {
                tooltip: '{i18n.deleteAvoidArea}',
                visible: '{deleteAvoidAreaButtonVisible}'
            },
            handler: 'clearAvoidAreaSource'
        },
        {
            type: 'button',
            iconCls: 'x-fa fa-ban',
            bind: {
                tooltip: '{i18n.addAvoidArea}'
            },
            menu: [
                {
                    bind: {
                        text: '{i18n.drawAvoidArea}'
                    },
                    handler: 'drawAvoidArea'
                },
                {
                    bind: {
                        text: '{i18n.selectAvoidAreaFromLayer}'
                    },
                    handler: 'selectAvoidAreaFromLayer'
                },
                {
                    // intentionally hidden button
                    // TODO: menu opens first time to top and not to bottom
                    xtype: 'filebutton',
                    listeners: {
                        afterrender: 'uploadButtonAfterRender'
                    },
                    accept: '.geojson,.json',
                    hidden: true
                },
                {
                    // triggers the hidden button
                    bind: {
                        text: '{i18n.uploadGeoJson}'
                    },
                    handler: function(item) {
                        var bb = item.up().down('filebutton');
                        bb.fileInputEl.dom.click();
                    }
                }
            ]
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
