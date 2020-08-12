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
 * @class Koala.view.form.IrixFieldset
 */
Ext.define('Koala.view.form.IrixFieldSet',{
    extend: 'Ext.form.FieldSet',

    xtype: 'k-form-irixfieldset',

    requires: [
        'Koala.util.Filter',
        'Koala.view.form.IrixFieldSetModel',
        'Koala.util.Hooks'
    ],

    /**
     * Contains the response of the irixContext.json.
     */
    raw: null,

    title: 'DokPool',
    hidden: true,
    margin: '0 0 0 5px',
    name: 'irix',
    layout: 'anchor',
    viewModel: 'k-form-irixfieldset',
    defaults: {
        anchor: '100%'
    },

    config: {
        // can be overriden via appContext.json: urls/irixcontext
        irixContextUrl: 'resources/irixContext.json'
    },

    listeners: {
        show: function() {
            var print = this.up('k-form-print');
            var btn = print.down('button[name=createPrint]');
            btn.setBind();
            btn.setText('DokPool');
        },
        hide: function() {
            var print = this.up('k-form-print');
            var btn = print.down('button[name=createPrint]');
            btn.setBind({
                text: '{printFormat:uppercase} {printButtonSuffix}'
            });
        }
    },

    // listeners: {
    //     beforerender: function(){
    //         var DokpoolContentType = Ext.ComponentQuery.query('[name=DokpoolContentType]')[0];
    //         var dokpoolMetaFieldset = Ext.ComponentQuery.query('[name=DokpoolMeta]')[0];
    //         Koala.util.Hooks.onChangeDokpoolContentType(DokpoolContentType.value,dokpoolMetaFieldset);
    //     }
    // },

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

        // leave early, because irixContextUrl does not seem to be configured
        if (!me.getIrixContextUrl) {
            me.callParent(arguments);
            return;
        }

        me.irixFieldsetLoaded = new Ext.Promise(function(resolve) {
            Ext.Ajax.request({
                url: me.irixContextUrl,

                success: function(response) {
                    var json = Ext.decode(response.responseText);
                    me.raw = json;
                    me.add(me.createFields(json.data.fields));
                    resolve();

                    Koala.util.Hooks.beforeRender(me);
                },

                failure: function(response) {
                    Ext.raise('server-side failure with status code ' + response.status);
                }
            });
        });

        me.on('beforeattributefieldsadd', me.onBeforeAttributeFieldsAdd);
        me.callParent(arguments);
    },

    createFields: function(fieldsconfig) {
        var me = this;
        var returnFields = [];
        var myField;

        Ext.each(fieldsconfig, function(fieldconfig) {
            switch (fieldconfig.type) {
                case 'fieldset':
                    myField = me.createFieldSet(fieldconfig);
                    break;
                case 'text':
                    myField = me.createTextField(fieldconfig);
                    break;
                case 'string':
                    myField = me.createStringFieldContainer(fieldconfig);
                    break;
                case 'number':
                    myField = me.createNumberField(fieldconfig);
                    break;
                case 'combo':
                    myField = me.createCombo(fieldconfig);
                    break;
                case 'date':
                    myField = me.createDateField(fieldconfig);
                    break;
                case 'datetime':
                    myField = me.createPointInTimeField(fieldconfig);
                    break;
                case 'checkbox':
                    myField = me.createCheckbox(fieldconfig);
                    break;
                case 'tagfield':
                    myField = me.createTagField(fieldconfig);
                    break;
                default:
                    break;
            }//end switch
            if (myField) {
                me.fireEvent(
                    'beforeattributefieldsadd', me, returnFields, myField
                );
                returnFields.push(myField);
            }
        });//end each
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
            viewModel: me.getViewModel(),
            collapsible: config.collapsible | false,
            collapsed: config.collapsed | false ,
            items: me.createFields(config.fields)
        });
    },

    createTextField: function(config) {
        var me = this;
        return Ext.create('Ext.form.field.Text', {
            name: config.name,
            margin: '5px 0px',
            viewModel: me.getViewModel(),
            fieldLabel: config.label,
            value: config.defaultValue,
            allowBlank: config.allowBlank
        });
    },

    createStringFieldContainer: function(config) {
        var me = this;
        var formPrint = me.up('k-form-print');
        return Ext.create('Ext.Container', {
            xtype: 'container',
            layout: 'hbox',
            name: config.name,
            margin: '5px 0px',
            items: [{
                xtype: 'textfield',
                viewModel: me.getViewModel(),
                name: config.name,
                fieldLabel: config.label,
                value: config.defaultValue,
                allowBlank: config.allowBlank,
                editable: false
            }, {
                xtype: 'button',
                name: config.name + '_editbutton',
                handler: formPrint.onTextFieldEditButtonClicked,
                iconCls: 'fa fa-pencil'
            }]
        });
    },

    createNumberField: function(config) {
        var me = this;
        return Ext.create('Ext.form.field.Number', {
            name: config.name,
            margin: '5px 0px',
            viewModel: me.getViewModel(),
            fieldLabel: config.label,
            minValue: config.minValue,
            maxValue: config.maxValue,
            value: config.defaultValue,
            allowBlank: config.allowBlank
        });
    },

    createCombo: function(config) {
        var me = this;
        var combo = Ext.create('Ext.form.field.ComboBox', {
            name: config.name,
            margin: '5px 0px',
            viewModel: me.getViewModel(),
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
        var me = this;
        return Ext.create('Ext.form.field.Date', {
            name: config.name,
            margin: '5px 0px',
            viewModel: me.getViewModel(),
            fieldLabel: config.label,
            value: config.defaultValue
        });
    },

    createPointInTimeField: function(config) {
        var me = this;
        var now = new moment();
        var value = Koala.util.Date.getUtcMoment(config.defaultValue) || now;
        value = Koala.util.Date.getTimeReferenceAwareMomentDate(value);

        var dateField = Ext.create('Ext.form.field.Date', {
            name: config.name,
            viewModel: me.getViewModel(),
            fieldLabel: config.label,
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
            margin: '5px 0px',
            viewModel: me.getViewModel(),
            valueField: dateField,
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [dateField, hourSpinner, minuteSpinner]
        });
    },

    createCheckbox: function(config) {
        var me = this;
        return Ext.create('Ext.form.field.Checkbox', {
            name: config.name,
            margin: '5px 0px',
            viewModel: me.getViewModel(),
            fieldLabel: config.label,
            checked: config.defaultValue,
            boxLabel: ' '
        });
    },

    createTagField: function(config) {
        var me = this;
        var store = Ext.create('Ext.data.ArrayStore', {
            fields: [
                config.valueField,
                config.displayField || config.valueField
            ],
            idProperty: config.valueField,
            data: config.values
        });
        var tagfield = Ext.create('Ext.form.field.Tag', {
            name: config.name,
            margin: '5px 0px',
            viewModel: me.getViewModel(),
            fieldLabel: config.label,
            store: store,
            displayField: config.displayField || config.valueField,
            valueField: config.valueField,
            filterPickList: true,
            typeAhead: true,
            autoSelect: false,
            createNewOnEnter: config.createNewOnEnter || false,
            queryMode: 'local'
        });
        if (config.defaultValue) {
            tagfield.setValue(config.defaultValue);
        }

        return tagfield;
    },

    /**
     * Called before a `attributefields`-object is added to the fieldset. This
     * method will hide the legend_template and map_template fields, but also
     * set their respective value according to a convention.
     *
     * @param {BasiGX.view.form.Print} printForm The print form instance.
     * @param {Object} attributefields An `attributefields`-object, which often
     *     are formfields like `textfields`, `combos` etc.
     */
    onBeforeAttributeFieldsAdd: function(printForm, attributeFields, attributeRec) {
        Koala.util.Hooks.executeBeforeAddHook(
            printForm, attributeFields, attributeRec);
    }
});
