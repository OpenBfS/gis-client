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
Ext.define('Koala.view.window.BarChartController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-barchart',

    createBarChart: function(olLayer) {
        var props = olLayer.get('barChartProperties');
        var categoryCount = props.chartFieldSequence.split(",").length;
        var chartWidth = 200 + categoryCount * 30;
        var chart = {
            xtype: 'k-chart-bar',
            name: olLayer.get('name'),
            layer: olLayer,
            height: 350,
            width: chartWidth
        };
        return chart;
    },

    updateBarChartStore: function(olLayer, olFeat) {
        if (!olFeat) {
            return false;
        }

        var me = this;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var chart = view.down('chart[name=' + layerName + ']');
        var chartView = Ext.ComponentQuery.query('k-chart-bar')[0];
        var controller = chartView.getController();

        chart.selectedStation = olFeat;

        controller.prepareBarSeriesLoad();
    },

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

    createOrUpdateChart: function(olLayer, olFeat) {
        var me = this;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var layerChartRendered = me.isLayerChartRendered(layerName);

        if (!layerChartRendered) {
            view.add(me.createBarChart(olLayer));
            me.updateBarChartStore(olLayer, olFeat);
        }
    }
});
