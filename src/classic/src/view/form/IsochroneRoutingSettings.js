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
        xtype: 'segmentedbutton',
        name: 'range_type',
        defaults: {
            padding: '3 10'
        },
        // default value
        bind: {
            value: '{rangeType}'
        },
        items: [{
            iconCls: 'x-fa fa-clock-o',
            value: 'time',
            bind: {
                tooltip: '{i18n.timeTooltip}'
            }
        }, {
            iconCls: 'x-fa fa-arrows-h',
            value: 'distance',
            bind: {
                tooltip: '{i18n.distanceTooltip}'
            }
        }],
        listeners: {
            toggle: 'activateSubmitButtonIfValid'
        }
    }, {
        xtype: 'k-button-avoidarea'
    }, {
        xtype: 'tbspacer',
        flex: 1
    },{
        // TODO: disable if form not valid
        xtype: 'button',
        bind: {
            text: '{i18n.submitButtonText}',
            disabled: '{disableSubmitButton}'
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
            select: 'onCenterSelect',
            change: 'activateSubmitButtonIfValid'
        }
    },{
        xtype: 'numberfield',
        name: 'range_distance',
        bind: {
            hidden: '{rangeType !== "distance"}',
            fieldLabel: '{i18n.rangeFieldText}',
            emptyText: '{i18n.placeHolderKilometer}',
            maxValue: '{maxIntervalKilometers}'
        },
        allowBlank: false,
        labelSeparator: ': *',
        hideTrigger: true,
        listeners: {
            change: 'activateSubmitButtonIfValid'
        }
    },
    {
        xtype: 'numberfield',
        name: 'interval_distance',
        bind: {
            hidden: '{rangeType !== "distance"}',
            fieldLabel: '{i18n.intervalFieldText}',
            emptyText: '{i18n.placeHolderKilometer}'
        },
        hideTrigger: true,
        listeners: {
            change: 'activateSubmitButtonIfValid'
        },
        // TODO: extract function for both validations
        validator: function(interval) {
            var isochroneWindow = this.up('k-window-isochrone-routing');
            var vm = isochroneWindow.getViewModel();

            var rangeTimeField = this.up().down('[name="range_distance"]');
            var rangeTime = rangeTimeField.getValue();

            // empty interval is allowed
            if (!interval) {
                return true;
            }

            // interval must not be bigger than range
            if (interval > rangeTime) {
                return vm.get('i18n.intervalTooBigErrorText');
            }

            // we ensure the number of intervals is not higher than allowed
            var smallestAllowedInterval = rangeTime / vm.get('maxNumberIntervals');
            if (interval < smallestAllowedInterval) {
                return vm.get('i18n.intervalTooSmallErrorText') + smallestAllowedInterval;
            }

            return true;
        }
    },{
        xtype: 'numberfield',
        name: 'range_time',
        bind: {
            hidden: '{rangeType !== "time"}',
            fieldLabel: '{i18n.rangeFieldText}',
            emptyText: '{i18n.placeHolderMinutes}',
            maxValue: '{maxIntervalMinutes}'
        },
        allowBlank: false,
        labelSeparator: ': *',
        hideTrigger: true,
        listeners: {
            change: 'activateSubmitButtonIfValid'
        }
    },
    {
        xtype: 'numberfield',
        name: 'interval_time',
        bind: {
            hidden: '{rangeType !== "time"}',
            fieldLabel: '{i18n.intervalFieldText}',
            emptyText: '{i18n.placeHolderMinutes}'
        },
        hideTrigger: true,
        listeners: {
            change: 'activateSubmitButtonIfValid'
        },
        validator: function(interval) {
            var isochroneWindow = this.up('k-window-isochrone-routing');
            var vm = isochroneWindow.getViewModel();

            var rangeTimeField = this.up().down('[name="range_time"]');
            var rangeTime = rangeTimeField.getValue();

            // empty interval is allowed
            if (!interval) {
                return true;
            }

            // interval must not be bigger than range
            if (interval > rangeTime) {
                return vm.get('i18n.intervalTooBigErrorText');
            }

            // we ensure the number of intervals is not higher than allowed
            var smallestAllowedInterval = rangeTime / vm.get('maxNumberIntervals');
            if (interval < smallestAllowedInterval) {
                return vm.get('i18n.intervalTooSmallErrorText') + smallestAllowedInterval;
            }

            return true;
        }
    }
    ]
});
