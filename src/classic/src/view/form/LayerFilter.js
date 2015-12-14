/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 * @class Koala.view.form.LayerFilter
 */
Ext.define("Koala.view.form.LayerFilter", {
    extend: "Ext.form.Panel",
    xtype: "k-form-layerfilter",

    requires: [
        "Koala.view.form.LayerFilterController",
        "Koala.view.form.LayerFilterModel",

        "Koala.util.Date",

        "Ext.form.field.Date",
        "Ext.form.ComboBox",
        "Ext.ux.form.MultiSelect"
    ],

    controller: "k-form-layerfilter",
    viewModel: {
        type: "k-form-layerfilter"
    },
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },
    padding: 5,

    ignoreFields: [
        'minutespinner',
        'hourspinner',
        'minminutespinner',
        'minhourspinner',
        'maxminutespinner',
        'maxhourspinner'
    ],

    listeners: {
        beforerender: 'onBeforeRenderLayerFilterForm',
        beforedestroy: 'onBeforeDestroyLayerFilterForm'
    },

    config: {
        metadata: null,
        filters: null,
        format: null
    },

    statics: {
        /**
         * The field configured as displayField for combos when only a number
         * of values are allowed for selection.
         */
        COMBO_DSP_FIELD: "dsp",

        /**
         * The field configured as valueField for combos when only a number
         * of values are allowed for selection.
         */
        COMBO_VAL_FIELD: "val",

        /**
         * Turns various ways of specifying a list of allowed values (coming
         * from the GNOS) into a store suitable for a combo box. There are
         * currently two possibilities:
         *
         * * string separated values to display and submit,
         * * an array with objects that have "val" and "dsp" keys
         *
         * @param {string} rawAllowedValues A string with the raw allowed
         *     values, must conform to any of the above mentioned formats.
         * @return {Ext.data.Store} The created store.
         */
        getStoreFromAllowedValues: function(rawAllowedValues) {
            var staticMe = this;

            var data = null;
            var VAL_FIELD = staticMe.COMBO_VAL_FIELD;
            var DSP_FIELD = staticMe.COMBO_DSP_FIELD;
            var allowedValues = Koala.util.String.coerce(rawAllowedValues);
            if (Ext.isString(allowedValues)) {
                data = [];
                var arr = allowedValues.split(',');
                Ext.each(arr, function(val) {
                    var entry = {};
                    entry[VAL_FIELD] = val;
                    entry[DSP_FIELD] = val;
                    data.push(entry);
                });
            } else if (Ext.isArray(allowedValues)) {
                // validate structure
                Ext.each(allowedValues, function(entry) {
                    if(!(VAL_FIELD in entry) || !(DSP_FIELD in entry)) {
                        Ext.log.warn("Missing any of the required keys (" +
                            VAL_FIELD + ", " + DSP_FIELD + ") in " +
                            "allowedValues configuration");
                    }
                });
                data = allowedValues;
            } else {
                Ext.log.warn("Illegal 'allowedValues' configured: ",
                    allowedValues);
            }

            var store = Ext.create("Ext.data.Store", {
                fields: [VAL_FIELD, DSP_FIELD],
                data : data
            });
            return store;
        },

        getComboFromAllowedValues: function(allowedValues, rawMulti) {
            var staticMe = this;
            var store = staticMe.getStoreFromAllowedValues(allowedValues);
            var multi = Koala.util.String.coerce(rawMulti);
            var xtype = multi ? "multiselect" : "combo";
            var combo = {
                xtype: xtype,
                store: store,
                queryMode: "local",
                editable: false,
                allowBlank: true,
                forceSelection: true,
                displayField: staticMe.COMBO_DSP_FIELD,
                valueField: staticMe.COMBO_VAL_FIELD
            };
            return combo;
        }
    },

    initComponent: function(){
        var me = this;
        me.callParent();
        // var metadata = me.getMetadata();
        var filters = me.getFilters();

        if(!filters || filters.length < 1){
            me.update('No valid filters provided!');
            return;
        }

        Ext.each(filters, function(filter, idx) {
            var type = (filter.type || "").toLowerCase();
            switch(type){
                case "timerange":
                    me.createTimeRangeFilter(filter, idx);
                    break;
                case "pointintime":
                    me.createPointInTimeFilter(filter, idx);
                    break;
                case "rodos":
                    break;
                case "value":
                    me.createValueFilter(filter, idx);
                    break;
                default:
                    Ext.log.warn('Unexpected filter type: ' + filter.type);
                    break;
            }
        });

        var submitButton = Ext.create('Ext.button.Button', {
            bind: {
                text: '{buttonText}'
            },
            handler: 'submitFilter',
            formBind: true
        });
        me.add(submitButton);

    },

    createPointInTimeFilter: function(filter, idx) {
        var me = this;
        var format = Koala.util.Date.ISO_FORMAT;

        var value = Ext.Date.parse(
                filter.defaulttimeinstant,
                filter.defaulttimeformat
            );

        if (Koala.Application.isLocal()) {
            value = Koala.util.Date.makeLocal(value);
        }

        // TODO check minimum / maximums?

        var dateField = Ext.create("Ext.form.field.Date", {
            bind: {
                fieldLabel: '{timestampLabel}'
            },
            editable: false,
            labelWidth: 70,
            name: filter.param,
            flex: 1,
            value: value,
            format: me.getFormat(),
            submitFormat: format,
            listeners: {
                select: me.resetNumberFields
            }
        });

        // TODO double check interval / step size etc.
        var hourSpinner = Ext.create("Ext.form.field.Number", {
            visible: true,
            name: 'hourspinner',
            value: value ? value.getHours() : 0,
            minValue: 0,
            maxValue: 23,
            step: 1,
            width: 50,
            editable: false,
            listeners: {
                change: function(field, val, prevVal) {
                    var df = this.up('container[name=pointintimecontainer]').down('datefield');
                    if (prevVal < val) {
                        df.setValue(Ext.Date.add(df.getValue(), Ext.Date.HOUR, 1));
                    } else {
                        df.setValue(Ext.Date.subtract(df.getValue(), Ext.Date.HOUR, 1));
                    }
                }
            }
        });

        var minuteSpinner = Ext.create("Ext.form.field.Number", {
            visible: true,
            name: 'minutespinner',
            value: value ? value.getMinutes() : 0,
            minValue: 0,
            maxValue: 59,
            step: 1,
            width: 50,
            editable: false,
            listeners: {
                change: function(field, val, prevVal) {
                    var df = this.up('container[name=pointintimecontainer]').down('datefield');
                    if (prevVal < val) {
                        df.setValue(Ext.Date.add(df.getValue(), Ext.Date.MINUTE, 1));
                    } else {
                        df.setValue(Ext.Date.subtract(df.getValue(), Ext.Date.MINUTE, 1));
                    }
                }
            }
        });

        var container = Ext.create("Ext.form.FieldContainer", {
            name: 'pointintimecontainer',
            anchor: '100%',
            layout: 'hbox',
            items: [dateField, hourSpinner, minuteSpinner]
        });

        var fieldSet = Ext.create('Ext.form.FieldSet', {
            padding: 5,
            // defaults: {anchor: '100%'},
            layout: 'anchor',
            filterIdx: idx,
            bind: {
                title: '{pointInTimeFilter}'
            },
            items: [container]
        });
        me.add(fieldSet);
    },

    /**
     */
    createRODOSFilter: function(){
        // TODO specify and implement
    },

    /**
     *
     */
    startAndEndFieldnamesFromMetadataParam: function(param){
        var names = {
            startName: '',
            endName: ''
        };
        var differentiateSuffix = "__make-distinguishable__";

        if (!param) {
            Ext.log.warn('Illegal configuration for timerange filter');
            return names;
        }

        var trimmedParam = Ext.String.trim(param);
        if (trimmedParam === "," || trimmedParam === "") {
            Ext.log.warn('Illegal configuration for timerange filter');
            return names;
        }

        var params = trimmedParam.split(",");

        // When we were configured with only one parameter, or if the two
        // parameters have the same name, we need to create a unique fieldname
        // for end…
        if (params.length === 1 || params[0] === params[1]) {
            params[1] = params[0] + differentiateSuffix;
        }

        names.startName = params[0];
        names.endName = params[1];

        return names;
    },

    createTimeRangeFilter: function(filter, idx){
        var me = this;
        var format = Koala.util.Date.ISO_FORMAT;

        var names = me.startAndEndFieldnamesFromMetadataParam(filter.param);
        var startName = names.startName;
        var endName = names.endName;

        var minValue = Ext.Date.parse(
                filter.mindatetimeinstant,
                filter.mindatetimeformat
            );
        var maxValue = Ext.Date.parse(
                filter.maxdatetimeinstant,
                filter.maxdatetimeformat
            );
        var defaultMinValue = Ext.Date.parse(
                filter.defaultstarttimeinstant,
                filter.defaultstarttimeformat
            );
        var defaultMaxValue = Ext.Date.parse(
                filter.defaultendtimeinstant,
                filter.defaultendtimeformat
            );

        if (Koala.Application.isLocal()) {
            minValue = Koala.util.Date.makeLocal(minValue);
            maxValue = Koala.util.Date.makeLocal(maxValue);
            defaultMinValue = Koala.util.Date.makeLocal(defaultMinValue);
            defaultMaxValue = Koala.util.Date.makeLocal(defaultMaxValue);
        }

        var minDateField = Ext.create("Ext.form.field.Date", {
            bind: {
                fieldLabel: '{startLabel}'
            },
            name: startName,
            editable: false,
            labelWidth: 70,
            flex: 1,
            value: defaultMinValue,
            minValue: minValue,
            maxValue: maxValue,
            format: me.getFormat(),
            submitFormat: format,
            listeners: {
                select: me.resetNumberFields
            }
        });

        var hourStep = (filter.unit === 'hours') ? parseInt(filter.interval, 10) : 1;
        var minuteStep = (filter.unit === 'minutes') ? parseInt(filter.interval, 10) : 1;

        var minHourSpinner = Ext.create("Ext.form.field.Number", {
            visible: true,
            name: 'minhourspinner',
            value: defaultMinValue ? defaultMinValue.getHours() : 0,
            minValue: 0,
            maxValue: 23,
            step: hourStep,
            width: 50,
            editable: false,
            validator: function(val) {
                return val % hourStep === 0;
            },
            listeners: {
                change: function(field, val, prevVal) {
                    var df = this.up('container[name=mincontainer]').down('datefield');
                    if (prevVal < val) {
                        df.setValue(Ext.Date.add(df.getValue(), Ext.Date.HOUR, hourStep));
                    } else {
                        df.setValue(Ext.Date.subtract(df.getValue(), Ext.Date.HOUR, hourStep));
                    }
                }
            }
        });

        var minMinuteSpinner = Ext.create("Ext.form.field.Number", {
            visible: true,
            name: 'minminutespinner',
            value: defaultMinValue ? defaultMinValue.getMinutes() : 0,
            minValue: 0,
            maxValue: 59,
            step: minuteStep,
            width: 50,
            editable: false,
            validator: function(val) {
                return val % minuteStep === 0;
            },
            listeners: {
                change: function(field, val, prevVal) {
                    var df = this.up('container[name=mincontainer]').down('datefield');
                    if (prevVal < val) {
                        df.setValue(Ext.Date.add(df.getValue(), Ext.Date.MINUTE, minuteStep));
                    } else {
                        df.setValue(Ext.Date.subtract(df.getValue(), Ext.Date.MINUTE, minuteStep));
                    }
                }
            }
        });

        var minContainer = Ext.create("Ext.form.FieldContainer", { // Ext.container.Container
            name: 'mincontainer',
            anchor: '100%',
            layout: 'hbox',
            items: [minDateField, minHourSpinner, minMinuteSpinner]
        });
        var maxDateField = Ext.create("Ext.form.field.Date", {
            name: endName,
            editable: false,
            bind: {
                fieldLabel: '{endLabel}'
            },
            labelWidth: 70,
            flex: 1,
            value: defaultMaxValue,
            minValue: minValue,
            maxValue: maxValue,
            format: me.getFormat(),
            submitFormat: format,
            listeners: {
                select: me.resetNumberFields
            }
        });
        var maxHourSpinner = Ext.create("Ext.form.field.Number", {
            visible: true,
            name: 'maxhourspinner',
            value: defaultMaxValue ? defaultMaxValue.getHours() : 0,
            minValue: 0,
            maxValue: 23,
            step: hourStep,
            width: 50,
            editable: false,
            validator: function(val) {
                return val % hourStep === 0;
            },
            listeners: {
                change: function(field, val, prevVal) {
                    var df = this.up('container[name=maxcontainer]').down('datefield');
                    if (prevVal < val) {
                        df.setValue(Ext.Date.add(df.getValue(), Ext.Date.HOUR, hourStep));
                    } else {
                        df.setValue(Ext.Date.subtract(df.getValue(), Ext.Date.HOUR, hourStep));
                    }
                }
            }
        });
        var maxMinuteSpinner = Ext.create("Ext.form.field.Number", {
            visible: true,
            name: 'maxminutespinner',
            value: defaultMaxValue ? defaultMaxValue.getMinutes() : 0,
            minValue: 0,
            maxValue: 59,
            step: minuteStep,
            width: 50,
            editable: false,
            validator: function(val) {
                return val % minuteStep === 0;
            },
            listeners: {
                change: function(field, val, prevVal) {
                    var df = this.up('container[name=maxcontainer]').down('datefield');
                    if (prevVal < val) {
                        df.setValue(Ext.Date.add(df.getValue(), Ext.Date.MINUTE, hourStep));
                    } else {
                        df.setValue(Ext.Date.subtract(df.getValue(), Ext.Date.MINUTE, hourStep));
                    }
                }
            }
        });
        var maxContainer = Ext.create("Ext.form.FieldContainer", { // Ext.container.Container
            name: 'maxcontainer',
            anchor: '100%',
            layout: 'hbox',
            items: [maxDateField, maxHourSpinner, maxMinuteSpinner]
        });
        var fieldSet = Ext.create('Ext.form.FieldSet', {
            padding: 5,
            // defaults: {anchor: '100%'},
            layout: 'anchor',
            filterIdx: idx,
            bind: {
                title: '{timeRangeFilter}'
            },
            items: [minContainer, maxContainer]
        });
        this.add(fieldSet);
    },

    /**
     */
    createValueFilter: function(filter, idx) {
        var staticMe = this.self;
        var field = null;
        var sharedCfg = {
            labelWidth: 70,
            name: filter.param,
            fieldLabel: filter.alias,
            value: filter.value || filter.defaultValue,
            emptyText: filter.defaultValue
        };
        if (filter.allowedValues) {
            field = staticMe.getComboFromAllowedValues(
                filter.allowedValues,
                filter.allowMultipleSelect
            );
        } else {
            field = {
                xtype: 'textfield'
            };
        }

        field = Ext.apply(field, sharedCfg);

        var fieldSet = Ext.create('Ext.form.FieldSet', {
            padding: 5,
            defaults: {anchor: '100%'},
            layout: 'anchor',
            filterIdx: idx,
            bind: {
                title: '{valueFilter}'
            },
            items: [
                field
            ]
        });
        this.add(fieldSet);
    },

    /**
     *
     */
    resetNumberFields: function(datefield) {

        var numberFields = datefield.up('container').query('numberfield');

        Ext.each(numberFields, function(field) {
            field.suspendEvents(false);
            field.setValue(0);
            field.resumeEvents(true);
        });
    }
});
