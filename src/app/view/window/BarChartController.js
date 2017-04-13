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

    requires: [
        'Koala.view.component.D3BarChart',
        'Koala.util.String'
    ],

    /**
     * Removes the previousy selected feature from the select interaction
     */
    onBarchartWinClose: function() {
        // TODO prepare for multi map setup
        var mapComp = Ext.ComponentQuery.query('k-component-map')[0];
        mapComp.removeAllHoverFeatures();
    },

    /**
     * Create the barchart by a given layer and feature. Adds flex and height to
     * fit the panel.
     *
     * @param {ol.layer.Layer} olLayer An openlayers layer.
     * @param {ol.Feature} olFeat An openlayers feature.
     * @return {Koala.view.component.D3BarChart} The barchart component.
     */
    createBarChart: function(olLayer, olFeat) {
        var config = {
            flex: 1,
            height: '100%'
        };

        return Koala.view.component.D3BarChart.create(olLayer, olFeat, config);
    },

    /**
     * Create the BarChart Panel which includes the barchart and the
     * rightColumnWrapper containing the download and reset buttons.
     *
     * @param {ol.layer.Layer} olLayer An openlayers layer.
     * @param {ol.Feature} olFeat An openlayers feature.
     * @return {Ext.panel.Panel} The Panel including all needed components.
     */
    createBarChartPanel: function(olLayer, olFeat) {
        var me = this;
        var chart = me.createBarChart(olLayer, olFeat);
        var chartConfig = olLayer.get('barChartProperties');

        var rightColumnWrapper = {
            xtype: 'panel',
            header: false,
            layout: {
                type: 'vbox',
                align: 'middle',
                pack: 'center'
            },
            bodyPadding: 5,
            height: '100%',
            width: 180,
            items: [{
                xtype: 'button',
                bind: {
                    text: '{exportAsImageBtnText}'
                },
                handler: me.onExportAsImageClicked,
                scope: me,
                margin: '0 0 10px 0'
            }, {
                xtype: 'button',
                bind: {
                    text: '{undoBtnText}'
                },
                hidden: !Koala.util.String.coerce(chartConfig.allowZoom),
                handler: me.onUndoButtonClicked,
                scope: me,
                margin: '0 0 10px 0'
            }]
        };

        var panel = {
            xtype: 'panel',
            name: 'chart-composition',
            layout: {
                type: 'hbox'
            },
            items: [
                chart,
                rightColumnWrapper
            ]
        };

        return panel;
    },

    /**
     * Convert current chart view into PNG.
     *
     * @param {Ext.button.Button} btn The button.
     */
    onExportAsImageClicked: function(btn) {
        var chart = btn.up('[name="chart-composition"]').down('d3-barchart');
        var chartCtrl = chart.getController();
        var cb = function(dataUri) {
            download(dataUri, 'chart.png', 'image/png');
        };
        var cbScope = this;
        chartCtrl.chartToDataUriAndThen(cb, cbScope);
    },

    /**
     * Zoom back out after the button has been clicked.
     *
     * @param {Ext.button.Button} btn The clicked button.
     */
    onUndoButtonClicked: function(btn) {
        var chart = btn.up('[name="chart-composition"]').down('d3-barchart');
        var chartCtrl = chart.getController();
        chartCtrl.resetZoom();
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
        if (lastChart) {
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
            view.add(me.createBarChartPanel(olLayer, olFeat, uniqueId));
            view.show();
            me.updateBarChartWin(view, lastChart, olLayer.qtitle);
        } else {
            // close the newly opened, empty window
            view.destroy();
        }
    }
});
