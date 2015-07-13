
Ext.define("Koala.view.window.TimeSeriesWindow", {
    extend: "Ext.window.Window",
    xtype: "k-window-timeserieswindow",

    requires: [
        "Koala.view.window.TimeSeriesWindowController",
        "Koala.view.window.TimeSeriesWindowModel",

        "Ext.form.field.Date"
    ],

    controller: "k-window-timeserieswindow",

    viewModel: {
        type: "k-window-timeserieswindow"
    },

    bind: {
        title: '{title}'
    },

    config: {
        name: 'timeserieswin',
        constrainHeader: true,
        collapsible: true,
        layout: 'vbox'
    },

    items: [{
        xtype: 'form',
        layout: {
            type: 'hbox',
            align: 'middle'
        },
        padding: 5,
        defaults: {
            padding: '0 10 0 10'
        },
        items: [{
            // https://github.com/gportela85/DateTimeField
            xtype: 'datefield',
            bind: {
                fieldLabel: '{dateFieldStartLabel}',
                value: '{startDateValue}',
                maxValue: '{startDateMaxValue}'
            },
            labelWidth: 35,
            name: 'datestart',
            format: 'j F Y, H:i'
        }, {
            xtype: 'datefield',
            bind: {
                fieldLabel: '{dateFieldEndLabel}',
                value: '{endDateValue}'
            },
            labelWidth: 38,
            name: 'dateend',
            format: 'j F Y, H:i'
        }, {
            xtype: 'button',
            bind: {
                text: '{setFilterBtnText}'
            },
            handler: 'onSetFilterBtnClick'
        }, {
            xtype: 'button',
            bind: {
                text: '{resetFilterBtnText}'
            },
            handler: 'onResetFilterBtnClick'
        }, {
            xtype: 'combo',
            displayField: 'text',
            queryMode: 'local',
            emptyText: 'Chart hinzufügen',
            bind: {
                fieldLabel: '{selectChartLayerComboLabel}'
            },
            listeners: {
                select: 'onSelectChartLayerComboSelect',
                beforerender: 'bindSelectChartLayerStore'
            }
        }]
    }]
});