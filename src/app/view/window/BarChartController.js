Ext.define('Koala.view.window.BarChartController', {
    extend : 'Ext.app.ViewController',
    alias : 'controller.k-window-barchart',

    createBarChart : function(olLayer) {
        var chart = {
            xtype : 'k-chart-bar',
            name : olLayer.get('name'),
            height : 350,
            width : 500
        };
        return chart;
    },

    createBarChartPanel : function(olLayer) {
        var me = this;
        var chart = me.createBarChart(olLayer);
        var panel = {
            xtype : 'panel',
            title : olLayer.get('name'),
            collapsible : true,
            hideCollapseTool : true,
            titleCollapse : true,
            closable : true,
            titleAlign : 'center',
            layout : {
                type : 'hbox',
                align : 'middle'
            },
            items : [ chart ]
        };
        return panel;
    },

    updateBarChartStore : function(olLayer, olFeat) {
        if (!olFeat) {
            return false;
        }

        var me = this;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var chart = view.down('chart[name=' + layerName + ']');
        var chartStore = chart.getStore();
        var stationIds = [];

        chart.selectedStation = olFeat;

        var dtUser = new Date(olFeat.get('end_measure'));
        dtUser.setTime(dtUser.getTime() + dtUser.getTimezoneOffset()*60*1000);
        var dtFormatted = Ext.Date.format(dtUser, 'Y-m-d H:i:s');
        
        var viewParams = 'locality_code:' + olFeat.get('locality_code')
                          + ';end_measure:' + dtFormatted;
        chartStore.getProxy().setExtraParam('viewParams', viewParams);
        chartStore.load({
            addRecords: true
        });
    },

    isLayerChartRendered : function(layerName) {
        var me = this;
        var view = me.getView();
        var existingCharts = view ? view.query('chart') : [];
        var isRendered = false;

        Ext.each(existingCharts, function(chart) {
            if (chart.name === layerName) {
                isRendered = true;
                return;
            }
        });

        return isRendered;
    },

    createOrUpdateChart : function(olLayer, olFeat) {
        var me = this;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var layerChartRendered = me.isLayerChartRendered(layerName);

        if (layerChartRendered) {   
        } else {
            view.add(me.createBarChartPanel(olLayer));
            me.updateBarChartStore(olLayer, olFeat);
        }
    }
});
