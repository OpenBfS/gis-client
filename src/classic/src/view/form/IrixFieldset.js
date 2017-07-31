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
 * @class Koala.view.form.IrixFieldSet
 */
Ext.define('Koala.view.form.IrixFieldSet',{
    extend: 'Ext.form.FieldSet',

    xtype: 'k-form-irixfieldset',

    requires: [
        'Koala.util.Filter'
    ],

    /**
     * Contains the response of the irixContext.json.
     */
    raw: null,

    title: 'IRIX',
    hidden: true,
    margin: '0 0 0 5px',
    name: 'irix',
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    config: {
        // can be overriden via appContext.json: urls/irixcontext
        irixContextUrl: 'resources/irixContext.json'
    },

    initComponent: function() {
        var me = this;

        var appContext = BasiGX.view.component.Map.guess().appContext;
        if (appContext) {
            var configuredIrixContext = Koala.util.Object.getPathStrOr(
                appContext, 'data/merge/urls/irix-context', false
            );
            if (configuredIrixContext) {
                me.setIrixContextUrl(configuredIrixContext);
            }
        }

        Ext.Ajax.request({
            url: me.irixContextUrl,

            success: function(response) {
                var json = Ext.decode(response.responseText);
                me.raw = json;
                me.add(me.createFields(json.data.fields));
            },

            failure: function(response) {
                Ext.raise('server-side failure with status code ' + response.status);
            }
        });
        me.callParent(arguments);
    },

    createFields: function(fieldsconfig) {
        var me = this;
        var returnFields = [];

        Ext.each(fieldsconfig, function(fieldconfig) {
            switch (fieldconfig.type) {
                case 'fieldset':
                    returnFields.push(me.createFieldSet(fieldconfig));
                    break;
                case 'text':
                    returnFields.push(me.createTextField(fieldconfig));
                    break;
                case 'number':
                    returnFields.push(me.createNumberField(fieldconfig));
                    break;
                case 'combo':
                    returnFields.push(me.createCombo(fieldconfig));
                    break;
                case 'date':
                    returnFields.push(me.createDateField(fieldconfig));
                    break;
                case 'datetime':
                    returnFields.push(me.createPointInTimeField(fieldconfig));
                    break;
                case 'checkbox':
                    returnFields.push(me.createCheckbox(fieldconfig));
                    break;
                default:
                    break;
            }
        });

        return returnFields;
    },

    createFieldSet: function(config) {
        var me = this;
        return Ext.create('Ext.form.FieldSet', {
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            name: config.name,
            title: config.label,
            items: me.createFields(config.fields)
        });
    },

    createTextField: function(config) {
        return Ext.create('Ext.form.field.Text', {
            name: config.name,
            fieldLabel: config.label,
            value: config.defaultValue,
            allowBlank: config.allowBlank
        });
    },

    createNumberField: function(config) {
        return Ext.create('Ext.form.field.Number', {
            name: config.name,
            fieldLabel: config.label,
            minValue: config.minValue,
            maxValue: config.maxValue,
            value: config.defaultValue,
            allowBlank: config.allowBlank
        });
    },

    createCombo: function(config) {
        var combo = Ext.create('Ext.form.field.ComboBox', {
            name: config.name,
            fieldLabel: config.label,
            store: config.values,
            value: config.defaultValue,
            allowBlank: config.allowBlank
        });
        // "field1" and "field2" are created when using an an 2-dimensional
        // array as store for the combo. "field1"=value "field2"=displayValue
        combo.getStore().sort('field2', 'ASC');
        return combo;
    },

    createDateField: function(config) {
        return Ext.create('Ext.form.field.Date', {
            name: config.name,
            fieldLabel: config.label,
            value: config.defaultValue
        });
    },

    createPointInTimeField: function(config) {
        var now = new moment();
        var value = Koala.util.Date.getUtcMoment(config.defaultValue) || now;
        value = Koala.util.Date.getTimeReferenceAwareMomentDate(value);

        var dateField = Ext.create('Ext.form.field.Date', {
            fieldLabel: config.label,
            name: config.name,
            editable: false,
            flex: 1,
            value: value,
            format: 'd.m.Y'
        });

        var hourSpinner = Koala.util.Filter.getSpinner(
            {
                unit: 'hours'
            }, 'hours', 'hourspinner', value
        );
        var minuteSpinner = Koala.util.Filter.getSpinner(
            {
                unit: 'minutes'
            }, 'minutes', 'minutespinner', value
        );

        return Ext.create('Ext.form.FieldContainer', {
            name: config.name,
            valueField: dateField,
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [dateField, hourSpinner, minuteSpinner]
        });
    },

    createCheckbox: function(config) {
        return Ext.create('Ext.form.field.Checkbox', {
            name: config.name,
            fieldLabel: config.label,
            checked: config.defaultValue,
            boxLabel: ' '
        });
    }
});
