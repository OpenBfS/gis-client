Ext.define("Koala.view.chart.Bar",{
    extend: "Ext.chart.CartesianChart",
    xtype: "k-chart-bar",

    requires: [
        "Koala.view.chart.BarController",
        "Koala.view.chart.BarModel",

        "Koala.store.Bar",

        "Ext.chart.interactions.ItemHighlight",
        "Ext.chart.interactions.CrossZoom",
        "Ext.chart.axis.Numeric",
        "Ext.chart.axis.Category",
        "Ext.chart.series.Bar"
    ],

    controller: "k-chart-bar",

    viewModel: {
        type: "k-chart-bar"
    },

    store: {
        type: 'k-bar'
    },

    config: {
        seriesType: 'bar',
        showStep: true,
        title: ''
    },

    selectedStation: null,
 
    width: '100%',

    legend: {
        docked: 'right'
    },

    axes: [{
        type: 'numeric',
        position: 'left',
        fields: [],
        grid: true,
        minimum: 0,
        renderer: function (v, layoutContext) {
            return layoutContext.renderer(v) + ' µSv/h';
        }
    }, {
        type: 'category',
        position: 'bottom',
        grid: true,
        label: {
            rotate: {
                degrees: -45
            }
        }
    }],

    initComponent: function() {
        var me = this;
        var controller = me.getController();
        var store = me.getStore();

        store.on({
            beforeload: controller.onBarBeforeLoad,
            load: controller.onBarStoreLoad,
            scope: controller
        });

        me.callParent();
    }

});
