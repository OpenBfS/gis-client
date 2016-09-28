/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
/**
 * @class Koala.view.window.BarChartController
 */
Ext.define('Koala.view.window.BarChartController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-barchart',

    /**
     * Removes the previousy selected feature from the select interaction
     */
    onBarchartWinClose: function() {
        // TODO prepare for multi map setup
        var mapComp = Ext.ComponentQuery.query('k-component-map')[0];
        mapComp.removeAllHoverFeatures();
    },

    createBarChart: function(olLayer, olFeat, chartId) {
        var props = olLayer.get('barChartProperties');
        var categoryCount = props.chartFieldSequence.split(",").length;
        var chartWidth = 200 + categoryCount * 30;
        var titleTpl = 'titleTpl' in props ? props.titleTpl : '';
        var title = Koala.util.String.replaceTemplateStrings(titleTpl, olLayer);
        title = Koala.util.String.replaceTemplateStrings(titleTpl, olFeat);

        var chart = {
            title: Ext.isEmpty(title) ? undefined : title,
            xtype: 'k-chart-bar',
            name: chartId,
            layer: olLayer,
            height: 350,
            width: chartWidth
        };
        return chart;
    },

    updateBarChartStore: function(olFeat, chartId) {
        if (!olFeat) {
            return false;
        }

        var me = this;
        var view = me.getView();
        var chart = view.down('chart[name=' + chartId + ']');
        var chartView = view.down('k-chart-bar');
        var controller = chartView.getController();

        chart.selectedStation = olFeat;

        controller.prepareBarSeriesLoad();
    },

    updateBarChartWin: function(view, lastChart, layerTitle) {
        if (layerTitle) {
            view.setBind({title: layerTitle});
        }
        if (lastChart){
            view.setPosition(lastChart.getX() + 20, lastChart.getY() + 20);
        }
    },

    isLayerChartRendered: function(chartId) {
        var existingCharts = Ext.ComponentQuery.query('k-chart-bar');
        var isRendered = false;

        Ext.each(existingCharts, function(chart) {
            if (chart.name === chartId) {
                isRendered = true;
                return;
            }
        });

        return isRendered;
    },

    createOrUpdateChart: function(olLayer, olFeat, uniqueId) {
        var me = this;
        var view = me.getView();
        var layerChartRendered = me.isLayerChartRendered(uniqueId);
        //used for offsetting following windows
        var existingCharts = Ext.ComponentQuery.query('k-chart-bar');
        var lastChart = existingCharts[existingCharts.length - 1];

        if (!layerChartRendered) {
            view.add(me.createBarChart(olLayer, olFeat, uniqueId));
            me.updateBarChartStore(olFeat, uniqueId);
            view.show();
            me.updateBarChartWin(view, lastChart, olLayer.qtitle);
        } else {
            // close the newly opened, empty window
            view.destroy();
        }
    }
});
