Ext.define('Koala.view.window.TimeSeriesWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-timeserieswindow',

    /**
     *
     */
    createTimeSeriesChart: function(olLayer) {
        var chart = {
            xtype: 'k-chart-timeseries',
            name: olLayer.get('name'),
            height: 200,
            width: 700
        };
        return chart;
    },

    /**
     *
     */
    createTimeSeriesCombo: function(olLayer) {
        var me = this;
        // TODO: insert real data given by the layer
        var store = Ext.create('Ext.data.Store', {
            fields: ['abbr', 'name'],
            data: [
                {"abbr":"AL", "name":"Alabama"},
                {"abbr":"AK", "name":"Alaska"},
                {"abbr":"AZ", "name":"Arizona"}
            ]
        });
        var combo = {
            xtype: 'combo',
            name: 'add-series-combo-' + olLayer.get('name'),
            store: store,
            displayField: 'name',
            queryMode: 'local',
            emptyText: 'Serie hinzufügen',
            listeners: {
                select: Ext.Function.bind(me.onTimeSeriesComboSelect,
                    me, [olLayer], true)
            }
        };
        return combo;
    },

    /**
     *
     */
    onTimeSeriesComboSelect: function(combo, rec, evt, olLayer) {
        var me = this;
        var olFeat = rec;
        me.updateTimeSeriesChartStore(olLayer, olFeat);
    },

    /**
     *
     */
    createTimeSeriesChartPanel: function(olLayer) {
        var me = this;
        var chart = me.createTimeSeriesChart(olLayer);
        var combo = me.createTimeSeriesCombo(olLayer);
        var panel = {
            xtype: 'panel',
            title: olLayer.get('name'),
            collapsible: true,
            hideCollapseTool: true,
            titleCollapse: true,
            closable: true,
            titleAlign: 'center',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [chart, combo]
        };
        return panel;
    },

    /**
     *
     */
    updateTimeSeriesChartStore: function(olLayer, olFeat) {
        // don't proceed if we don't get a olFeat, e.g. if we were called
        // by the selectChartLayerCombo
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

        var viewParams = 'nuclide:' + '909;' + 'geo_id:' + olFeat.get('geo_id');

        chartStore.getProxy().setExtraParam('viewParams', viewParams);
        chartStore.load({
            addRecords: true
        });
    },

    /**
     *
     */
    isLayerChartRendered: function(layerName) {
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
    onSetFilterBtnClick: function(btn) {
        var me = this;
        var view = me.getView();
        var form = btn.up('form').getForm();
        var formValues = form.getValues();
        var charts = view.query('chart');

        Ext.each(charts, function(chart) {
            var minVal = Date.parse(formValues.datestart);
            var maxVal = Date.parse(formValues.dateend);
            me.setAbscissaRange(chart, minVal, maxVal);
        });
    },

    /**
     *
     */
    onResetFilterBtnClick: function(btn) {
        var me = this;
        var view = me.getView();
        var charts = view.query('chart');

        Ext.each(charts, function(chart) {
            var store = chart.getStore();
            var storeData = store.getData();
            var xField = chart.getSeries()[0].getXField();
            var minVal = Date.parse(storeData.minItem(xField).get(xField));
            var maxVal = Date.parse(storeData.maxItem(xField).get(xField));
            me.setAbscissaRange(chart, minVal, maxVal);
        });
    },

    /**
     *
     */
    setAbscissaRange: function(chart, minVal, maxVal) {
        var abscissa = chart.getAxis(1);
        abscissa.setMinimum(minVal);
        abscissa.setMaximum(maxVal);
        chart.redraw();
    },

    /**
     *
     */
    bindSelectChartLayerStore: function(combo) {
        combo.bindStore(Basepackage.view.component.Map.guess().getStore());
    },

    /**
     *
     */
    onSelectChartLayerComboSelect: function(combo, rec) {
        var me = this;
        var olLayer = rec.data;
        me.createOrUpdateChart(olLayer);
    },

    /**
     *
     */
    createOrUpdateChart: function(olLayer, olFeat) {
        var me = this;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var layerChartRendered = me.isLayerChartRendered(layerName);

        // if the window contains a chart rendered for a feature from the
        // same layer as the given olFeat already, load a new timeseries into
        // the existing chart
        if (layerChartRendered) {
            me.updateTimeSeriesChartStore(olLayer, olFeat);
        } else {
            // otherwise create a new chart for the olFeat and add it to the
            // window and update the store
            view.add(me.createTimeSeriesChartPanel(olLayer));
            me.updateTimeSeriesChartStore(olLayer, olFeat);
        }
    }

});
