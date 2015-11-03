
Ext.define("Koala.view.form.LayerFilter", {
    extend: "Ext.form.Panel",
    xtype: "k-form-layerfilter",

    requires: [
        "Koala.view.form.LayerFilterController",
        "Koala.view.form.LayerFilterModel",

        "Ext.form.field.Date"
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
        var value = Ext.Date.parse(filter.timeinstant,
            "Y-m-d\\TH:i:s");

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
            submitFormat: "c",
            listeners: {
                select: me.resetNumberFields
            }
        });

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

        var container = Ext.create("Ext.form.FieldContainer", { // Ext.container.Container
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

    createRODOSFilter: function(){

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
            Ext.log.warn('Illegal configuartion for timerange filter');
            return names;
        }

        var trimmedParam = Ext.String.trim(param);
        if (trimmedParam === "," || trimmedParam === "") {
            Ext.log.warn('Illegal configuartion for timerange filter');
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
        // var names = filter.param.split(",");
        // var startName = names[0];
        // var endName = names[1];

        var names = me.startAndEndFieldnamesFromMetadataParam(filter.param);
        var startName = names.startName;
        var endName = names.endName;

        var minValue = Ext.Date.parse(filter.mindatetimeinstant,
            "Y-m-d\\TH:i:s");
        var maxValue = Ext.Date.parse(filter.maxdatetimeinstant,
            "Y-m-d\\TH:i:s");

        var minDateField = Ext.create("Ext.form.field.Date", {
            bind: {
                fieldLabel: '{startLabel}'
            },
            name: startName,
            editable: false,
            labelWidth: 70,
            flex: 1,
            value: minValue,
            minValue: minValue,
            maxValue: maxValue,
            format: me.getFormat(),
            submitFormat: "c",
            listeners: {
                select: me.resetNumberFields
            }
        });

        var hourStep = (filter.unit === 'hours') ? parseInt(filter.interval, 10) : 1;
        var minuteStep = (filter.unit === 'minutes') ? parseInt(filter.interval, 10) : 1;

        var minHourSpinner = Ext.create("Ext.form.field.Number", {
            visible: true,
            name: 'minhourspinner',
            value: minValue ? minValue.getHours() : 0,
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
            value: minValue ? minValue.getMinutes() : 0,
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
            value: maxValue,
            minValue: minValue,
            maxValue: maxValue,
            format: me.getFormat(),
            submitFormat: "c",
            listeners: {
                select: me.resetNumberFields
            }
        });
        var maxHourSpinner = Ext.create("Ext.form.field.Number", {
            visible: true,
            name: 'maxhourspinner',
            value: maxValue ? maxValue.getHours() : 0,
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
            value: maxValue ? maxValue.getMinutes() : 0,
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

    createValueFilter: function(filter, idx) {
        var fieldSet = Ext.create('Ext.form.FieldSet', {
            padding: 5,
            defaults: {anchor: '100%'},
            layout: 'anchor',
            filterIdx: idx,
            bind: {
                title: '{valueFilter}'
            },
            items: [
                {
                    xtype: 'textfield',
                    labelWidth: 70,
                    name: filter.param,
                    fieldLabel: filter.param,
                    value: filter.value,
                    emptyText: filter.defaultValue
                }
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
