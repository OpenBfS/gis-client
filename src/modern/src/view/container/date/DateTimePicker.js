/* Copyright (c) 2015-2017 terrestris GmbH & Co. KG
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
 * @class Koala.view.container.date.DateTimePicker
 */
Ext.define('Koala.view.container.date.DateTimePicker', {
    extend: 'Ext.Container',
    xtype: 'k-container-datetimepicker',

    requires: [
    ],

    controller: 'k-container-datetimepicker',
    viewModel: {
        type: 'k-container-datetimepicker'
    },

    config: {
        value: null,
        minValue: null,
        maxValue: null,
        maxDuration: null,
        label: null,
        partnerFieldName: null,
        partnerType: null
    },

    privates: {
        allowedPartnerTypes: ['start', 'end']
    },

    layout: 'hbox',

    items: [{
        xtype: 'field',
        minWidth: 90,
        labelAlign: 'top',
        name: 'labelField'
    }, {
        xtype: 'datepickerfield',
        flex: 1,
        dateFormat: 'd.m.Y',
        bind: {
            value: '{date}'
        }
    }, {
        xtype: 'container',
        layout: 'hbox',
        defaults: {
            width: 60
        },
        items: [{
            xtype: 'selectfield',
            name: 'hourpicker',
            options: Koala.util.Filter.getSelectFieldOptionsData(23, 1),
            bind: {
                value: '{hours}'
            }
        }, {
            xtype: 'selectfield',
            name: 'minutepicker',
            options: Koala.util.Filter.getSelectFieldOptionsData(59, 1),
            bind: {
                value: '{minutes}'
            }
        }]
    }, {
        xtype: 'label',
        name: 'validateMessage',
        html: '<i class="fa fa-2x fa-exclamation-circle" aria-hidden="true" style="color:red;"></i>',
        padding: '0 0 0 5',
        bind: {
            hidden: '{isValidDateTime}'
        },
        listeners: {
            tap: {
                fn: 'onValidateMessageTap',
                element: 'element'
            }
        }
    }, {
        xtype: 'datepickerfield',
        name: 'valueField',
        hidden: true,
        bind: {
            value: '{value}'
        },
        listeners: {
            change: 'onFieldChange'
        }
    }],

    getValue: function() {
        return this.getViewModel().get('value');
    },

    setValue: function(value) {
        this.getViewModel().set('value', value);
    },

    getLabel: function() {
        return this.getViewModel().get('label');
    },

    setLabel: function(label) {
        this.down('field[name=labelField]').setBind({
            label: label
        });
    },

    setPartnerType: function(value) {
        if (!value) {
            return;
        }
        if (Ext.Array.contains(this.allowedPartnerTypes, value)) {
            this._partnerType = value;
        } else {
            Ext.Logger.warn('Unsupported partnerType: ' + value +
                    '. Allowed values are: ' + this.allowedPartnerTypes.join(','));
        }
    },

    isStartPartner: function() {
        return this.getPartnerType() === this.allowedPartnerTypes[0];
    },

    isEndPartner: function() {
        return this.getPartnerType() === this.allowedPartnerTypes[1];
    },

    isValidDateTime: function() {
        return this.getViewModel().get('isValidDateTime');
    }

});
