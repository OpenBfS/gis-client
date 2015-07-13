Ext.define("Koala.view.chart.TimeSeries",{
    extend: "Ext.chart.CartesianChart",
    xtype: "k-chart-timeseries",

    requires: [
        "Koala.view.chart.TimeSeriesController",
        "Koala.view.chart.TimeSeriesModel",

        "Koala.store.TimeSeries",

        "Ext.chart.interactions.ItemHighlight",
        "Ext.chart.interactions.CrossZoom",
        "Ext.chart.axis.Numeric",
        "Ext.chart.axis.Time",
        "Ext.chart.series.Line"
    ],

    controller: "k-chart-timeseries",

    viewModel: {
        type: "k-chart-timeseries"
    },

    store: {
        type: 'k-timeseries'
    },

    config: {
        seriesType: 'line',
        showStep: true
    },

//    selectedStations: [],
    selectedStation: null,

    width: '100%',

    interactions: {
        type: 'crosszoom',
        axes: {
            bottom: {
                maxZoom: 5,
                allowPan: true
            }
        }
    },

    legend: {
        docked: 'right'
    },

    axes: [{
        type: 'numeric',
        position: 'left',
        grid: true,
        minimum: 0,
        maximum: 0.2,
        renderer: function (v, layoutContext) {
            return layoutContext.renderer(v) + ' µSv/h';
        }
    }, {
        type: 'time',
        position: 'bottom',
        grid: true,
        label: {
            rotate: {
                degrees: -45
            }
        }
    }],

    /**
     *
     */
    initComponent: function() {
        var me = this;
        var controller = me.getController();
        var store = me.getStore();

        store.on({
            beforeload: controller.onTimeSeriesBeforeLoad,
            load: controller.onTimeSeriesStoreLoad,
            scope: controller
        });

        me.callParent();
    }

});
