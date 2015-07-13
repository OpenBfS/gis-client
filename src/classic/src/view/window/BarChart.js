
Ext.define("Koala.view.window.BarChart", {
    extend: "Ext.window.Window",
    xtype: "k-window-barchart",

    requires: [
        "Koala.view.window.BarChartController",
        "Koala.view.window.BarChartModel",

        "Ext.form.field.Date"
    ],

    controller: "k-window-barchart",

    viewModel: {
        type: "k-window-barchart"
    },

    bind: {
        title: '{title}'
    },

    config: {
        name: 'barchartwin',
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
            xtype: 'combo',
            displayField: 'text',
            queryMode: 'local',
            emptyText: 'Chart hinzufügen'
        }]
    }]
});