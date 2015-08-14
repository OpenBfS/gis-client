
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
    layout: 'form',

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
        format: null
    },

    initComponent: function(){
        this.callParent();
        var metadata = this.getMetadata();
        var filter = metadata.filter;

        if(!filter){
            this.html = 'No Filterobject provided!';
            this.callParent();
            return;
        }

        switch(filter.type){
            case "timerange":
                this.createTimeRangeFilter(filter);
                break;
            case "pointintime":
                this.createPointInTimeFilter(filter);
                break;
            case "rodos":
                break;
            case "value":
                this.createValueFilter(filter);
                break;
            default:
        }

        var submitButton = Ext.create('Ext.button.Button', {
            bind: {
                text: '{buttonText}'
            },
            handler: 'submitFilter',
            formBind: true
        });
        this.add(submitButton);

    },

    createPointInTimeFilter: function(filter) {
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

        var container = Ext.create("Ext.container.Container", {
            name: 'pointintimecontainer',
            layout: 'hbox',
            items: [dateField, hourSpinner, minuteSpinner]
        });

        var fieldSet = Ext.create('Ext.form.FieldSet', {
            bind: {
                title: '{pointInTimeFilter}'
            },
            items: [container]
        });
        me.add(fieldSet);
    },

    createRODOSFilter: function(){

    },

    createTimeRangeFilter: function(filter){
        var me = this;
        var names = filter.param.split(",");
        var startName = names[0];
        var endName = names[1];
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
            labelWidth: 35,
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

        var minContainer = Ext.create("Ext.container.Container", {
            name: 'mincontainer',
            layout: 'hbox',
            items: [minDateField, minHourSpinner, minMinuteSpinner]
        });
        var maxDateField = Ext.create("Ext.form.field.Date", {
            name: endName,
            editable: false,
            bind: {
                fieldLabel: '{endLabel}'
            },
            labelWidth: 35,
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
        var maxContainer = Ext.create("Ext.container.Container", {
            name: 'maxcontainer',
            layout: 'hbox',
            items: [maxDateField, maxHourSpinner, maxMinuteSpinner]
        });
        var fieldSet = Ext.create('Ext.form.FieldSet', {
            bind: {
                title: '{timeRangeFilter}'
            },
            items: [minContainer, maxContainer]
        });
        this.add(fieldSet);
    },

    createValueFilter: function(filter) {
        var fieldSet = Ext.create('Ext.form.FieldSet', {
            bind: {
                title: '{valueFilter}'
            },
            items: [
                {
                    xtype: 'textfield',
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
