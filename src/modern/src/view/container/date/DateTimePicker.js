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
        label: null
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
        },
        maxValue: null,
        minValue: null,
        listeners: {
            // TODO: doesn't fire on value change
            // change: 'onFieldChange'
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
            // TODO check if validator is needed here!
        }]
    }],

    getValue: function() {
        return this.getViewModel().get('value');
    },

    setValue: function(value) {
        this.getViewModel().set('value', value);
    },

    setMaxValue: function(value) {
        this.down('datepickerfield').maxValue = value;
        this._maxValue = value;
    },

    setMinValue: function(value) {
        this.down('datepickerfield').minValue = value;
        this._minValue = value;
    },

    getLabel: function() {
        return this.getViewModel().get('label');
    },

    setLabel: function(label) {
        this.down('field[name=labelField]').setBind({
            label: label
        });
    }

});
