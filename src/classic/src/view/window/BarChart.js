
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
    }

});