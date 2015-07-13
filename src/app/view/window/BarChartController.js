Ext.define('Koala.view.window.BarChartController', {
    extend : 'Ext.app.ViewController',
    alias : 'controller.k-window-barchart',

    /**
     * 
     */
    createBarChart : function(olLayer) {
        var chart = {
            xtype : 'k-chart-bar',
            name : olLayer.get('name'),
            height : 200,
            width : 700
        };
        return chart;
    },

    /**
     * 
     */
    createBarCombo : function(olLayer) {
        var me = this;
        // TODO: insert real data given by the layer
        var store = Ext.create('Ext.data.Store', {
            fields : [ 'abbr', 'name' ],
            data : [ {
                "abbr" : "AL",
                "name" : "Alabama"
            }, {
                "abbr" : "AK",
                "name" : "Alaska"
            }, {
                "abbr" : "AZ",
                "name" : "Arizona"
            } ]
        });
        var combo = {
            xtype : 'combo',
            name : 'add-series-combo-' + olLayer.get('name'),
            store : store,
            displayField : 'name',
            queryMode : 'local',
            emptyText : 'Serie hinzufügen',
            listeners : {
                select : Ext.Function.bind(me.onBarComboSelect, me,
                        [ olLayer ], true)
            }
        };
        return combo;
    },

    /**
     * 
     */
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

    /**
     * 
     */
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

        chart.selectedStations.push(olFeat);

        Ext.each(chart.selectedStations, function(station) {
            var stationId = station.get('id') ? station.get('id') : null;
            stationIds.push(stationId);
        });

        chartStore.getProxy().setExtraParam('id', stationIds.toString());
        chartStore.getProxy().setExtraParam('typeName',
                olLayer.getSource().getParams().LAYERS);
        chartStore.load();
    },

    /**
     * 
     */
    createBarChartPanel : function(olLayer) {
        var me = this;
        var chart = me.createBarChart(olLayer);
        var combo = me.createBarCombo(olLayer);
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
            items : [ chart, combo ]
        };
        return panel;
    },

    /**
     * 
     */
    createOrUpdateChart : function(olLayer, olFeat) {
        var me = this;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var layerChartRendered = me.isLayerChartRendered(layerName);

        if (layerChartRendered) {
            me.updateBarChartStore(olLayer, olFeat);
        } else {
            view.add(me.createBarChartPanel(olLayer));
            me.updateBarChartStore(olLayer, olFeat);
        }
    }
});
