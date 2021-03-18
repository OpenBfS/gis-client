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
 * @class Koala.view.form.IsochroneRoutingSettings
 */
Ext.define('Koala.view.form.IsochroneRoutingSettings', {
    extend: 'Ext.form.Panel',
    xtype: 'k-form-isochrone-routing-settings',

    requires: [
        'Koala.view.form.field.GeocodingCombo',
        'Koala.view.button.RoutingProfile',
        'Koala.view.form.IsochroneRoutingSettingsController',
        'Koala.view.button.AvoidArea',
        'Ext.button.Segmented',
        'Ext.slider.Single'
    ],

    controller: 'k-form-isochrone-routing-settings',

    width: '100%',

    bodyPadding: '10 5 0 5',

    defaults: {
        anchor: '100%'
    },

    fbar: [{
        xtype: 'k-button-routing-profile'
    }, {
        // TODO: set default value
        xtype: 'segmentedbutton',
        defaults: {
            padding: '3 10'
        },
        items: [{
            iconCls: 'x-fa fa-clock-o',
            bind: {
                tooltip: '{i18n.timeTooltip}'
            }
        }, {
            iconCls: 'x-fa fa-arrows-h',
            bind: {
                tooltip: '{i18n.distanceTooltip}'
            }
        }]
    }, {
        xtype: 'k-button-avoidarea'
    }, {
        xtype: 'tbspacer',
        flex: 1
    },{
        // TODO: disable if form not valid
        xtype: 'button',
        bind: {
            text: '{i18n.submitButtonText}'
        },
        handler: 'onSubmit'
    }],

    items: [{
        xtype: 'k-form-field-geocodingcombo',
        name: 'center',
        bind: {
            fieldLabel: '{i18n.addressLabel}',
            emptyText: '{i18n.addressPlaceholder}'
        },
        labelSeparator: ': *',
        flex: 1,
        listeners: {
            select: 'onCenterSelect'
        }
    },{
        xtype: 'slider',
        bind: {
            fieldLabel: '{i18n.rangeSliderText}'
        },
        labelWidth: 125,
        // TODO: set proper values for properties below
        value: 50,
        increment: 10,
        minValue: 0,
        maxValue: 100
        // TODO: add (interactive) numberfield
        // TOOD: show min/max, show current value
    }, {
        xtype: 'slider',
        bind: {
            fieldLabel: '{i18n.intervalSliderText}'
        },
        labelWidth: 125,
        // TODO: set proper values for properties below
        value: 50,
        increment: 10,
        minValue: 0,
        maxValue: 100
        // TODO: add (interactive) numberfield
        // TOOD: show min/max, show current value
    }
    ]
});
