/* Copyright (c) 2015 terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('Koala.view.window.TimeSeriesWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-timeserieswindow',
    requires: [
        'Koala.util.String',
        'Koala.model.Station'
    ],
    /**
     *
     */
    createTimeSeriesChart: function(olLayer) {
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var interactions = null;
        if (Ext.isEmpty(chartConfig.allowCrossZoom) ||
            Koala.util.String.getBool(chartConfig.allowCrossZoom)) {
            interactions = {
               type: 'crosszoom',
               axes: {
                   bottom: {
                       maxZoom: 5,
                       allowPan: true
                   }
               }
           };
        }
        var chart = {
            xtype: 'k-chart-timeseries',
            name: olLayer.get('name'),
            layer: olLayer,
            interactions: interactions,
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

        var url = (olLayer.getSource().getUrls()[0]).replace(/\/wms/g, "/wfs");

        var store = Ext.create('Ext.data.Store', {
            model: 'Koala.model.Station',
            proxy: {
                type: 'ajax',
                url: url,
                reader: {
                    type: 'json',
                    rootProperty: 'features'
                },
                noCache: false,
                extraParams: {
                    service: 'WFS',
                    version: '1.1.0',
                    request: 'GetFeature',
                    typeName: olLayer.getSource().getParams().LAYERS,
                    outputFormat: 'application/json'
                }
            }
        });

        var combo = {
            xtype: 'combo',
            name: 'add-series-combo-' + olLayer.get('name'),
            store: store,
            displayField: 'locality_name',
            emptyText: 'Serie hinzufügen',
            queryParam: 'CQL_FILTER',
            listeners: {
                select: Ext.Function.bind(me.onTimeSeriesComboSelect,
                    me, [olLayer], true),
                beforequery: function(queryPlan){
                    queryPlan.query = "locality_name ILIKE '%" +
                        queryPlan.query + "%'";
                }
            }
        };
        return combo;
    },

    /**
     *
     */
    onTimeSeriesComboSelect: function(combo, rec, evt, olLayer) {
        var me = this;
        var format = new ol.format.GeoJSON();
        var olFeat = format.readFeature(rec.data);
        olFeat.set('layer', olLayer);

        me.updateTimeSeriesChart(olLayer, olFeat);
    },

    /**
     *
     */
    createTimeSeriesChartPanel: function(olLayer) {
        var me = this;
        var chart = me.createTimeSeriesChart(olLayer);
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var combo;
        if (Ext.isEmpty(chartConfig.allowAddSeries) ||
            Koala.util.String.getBool(chartConfig.allowAddSeries)) {
                combo = me.createTimeSeriesCombo(olLayer);
        }
        var title = !Ext.isEmpty(chartConfig.titleTpl) ?
            Koala.util.String.replaceTemplateStrings(
            chartConfig.titleTpl, olLayer) : olLayer.get('name');
        var panel = {
            xtype: 'panel',
            title: title,
            collapsible: true,
            hideCollapseTool: true,
            titleCollapse: true,
            closable: true,
            titleAlign: 'center',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [chart]
        };
        if (!Ext.isEmpty(combo)) {
            panel.items.push(combo);
        }
        return panel;
    },

    /**
     *
     */
    updateTimeSeriesChart: function(olLayer, olFeat) {
        // don't proceed if we don't get a olFeat, e.g. if we were called
        // by the selectChartLayerCombo
        if (!olFeat) {
            return false;
        }

        var me = this;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var chart = view.down('chart[name=' + layerName + ']');
        var timeSeriesView = Ext.ComponentQuery.query('k-chart-timeseries')[0];
        var controller = timeSeriesView.getController();

        chart.selectedStation = olFeat;

        controller.prepareTimeSeriesLoad();
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
    onResetFilterBtnClick: function() {
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
        abscissa.setFromDate(minVal);
        abscissa.setToDate(maxVal);
        chart.redraw();
    },

    /**
     *
     */
    bindSelectChartLayerStore: function(combo) {
        var layerStore = BasiGX.view.component.Map.guess().getStore();
        var comboStore = Ext.clone(layerStore);
        comboStore.filterBy(function(record){
            if(record.data.get('timeSeriesChartProperties') &&
               !Ext.Object.isEmpty(record.data.get('timeSeriesChartProperties'))
               ){
                return true;
            } else {
                return false;
            }
        });
        combo.bindStore(comboStore);
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
            me.updateTimeSeriesChart(olLayer, olFeat);
        } else {
            // otherwise create a new chart for the olFeat and add it to the
            // window and update the store
            view.add(me.createTimeSeriesChartPanel(olLayer));
            me.updateTimeSeriesChart(olLayer, olFeat);
        }
    }

});
