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
        // var props = olLayer.get('barChartProperties');
        // var categoryCount = props.chartFieldSequence.split(",").length;
        // var chartWidth = 200 + categoryCount * 30;
        // var titleTpl = 'titleTpl' in props ? props.titleTpl : '';
        // var title = Koala.util.String.replaceTemplateStrings(titleTpl, olLayer);
        // title = Koala.util.String.replaceTemplateStrings(titleTpl, olFeat);
        //
        // var chart = {
        //     title: Ext.isEmpty(title) ? undefined : title,
        //     xtype: 'k-chart-bar',
        //     name: chartId,
        //     layer: olLayer,
        //     height: 350,
        //     width: chartWidth
        // };

        var me = this;
        var view = me.getView();
        var chartConfig = olLayer.get('barChartProperties');
        var categoryCount = chartConfig.chartFieldSequence.split(",").length;
        var chartWidth = 200 + categoryCount * 30;
        var titleTpl = 'titleTpl' in chartConfig ? chartConfig.titleTpl : '';
        var title = Koala.util.String.replaceTemplateStrings(titleTpl, olFeat);
        var stationName = !Ext.isEmpty(chartConfig.seriesTitleTpl) ?
            Koala.util.String.replaceTemplateStrings(
                chartConfig.seriesTitleTpl, olFeat) : "";
        var valFromSeq = Koala.util.String.getValueFromSequence;

        // var startDate = view.down('datefield[name=datestart]').getValue();
        // var endDate = view.down('datefield[name=dateend]').getValue();


        var shapes = [];
        Ext.each(chartConfig.chartFieldSequence.split(','), function(yField) {
            shapes.push({
                type: 'bar',
                curve: 'linear',
                xField: yField,
                yField: yField,
                name: stationName,
                id: olFeat.get('id')
                // color: valFromSeq(chartConfig.colorSequence, 0, 'red'),
                // opacity: valFromSeq(chartConfig.strokeOpacitySequence, 0, 0),
                // width: valFromSeq(chartConfig.strokeWidthSequence, 0, 1)
            });
        });


        var chart = {
            xtype: 'd3-barchart',
            zoomEnabled: true,
            name: olLayer.get('name'),
            height: 350,
            width: chartWidth,
            startDate: olFeat.get('end_measure'),
            endDate: olFeat.get('end_measure'),
            targetLayer: olLayer,
            selectedStation: olFeat,
            chartMargin: {
                top: 10,
                right: 200,
                bottom: 20,
                left: 40
            },
            shapes: [{
                type: 'bar',
                curve: 'linear',
                // xField: yField,
                // yField: yField,
                name: stationName,
                id: olFeat.get('id')
                // color: valFromSeq(chartConfig.colorSequence, 0, 'red'),
                // opacity: valFromSeq(chartConfig.strokeOpacitySequence, 0, 0),
                // width: valFromSeq(chartConfig.strokeWidthSequence, 0, 1)
            }],
            grid: {
                show: true, // neue Config ?
                color: '#d3d3d3', // neue Config ?
                width: 1, // neue Config ?
                opacity: 0.7 // neue Config ?
            },
            axes: {
                left: {
                    scale: 'linear',
                    dataIndex: 'Te132', //chartConfig.yAxisAttribute, //'value',
                    format: ',.0f',
                    label: (chartConfig.yAxisLabel || '') + ' ' + (chartConfig.dspUnit || '')
                },
                bottom: {
                    scale: 'ordinal',
                    dataIndex: 'Te132', //chartConfig.xAxisAttribute, //'end_measure',
                    label: chartConfig.xAxisLabel || ''
                }
            }
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
            // me.updateBarChartStore(olFeat, uniqueId);
            view.show();
            me.updateBarChartWin(view, lastChart, olLayer.qtitle);
        } else {
            // close the newly opened, empty window
            view.destroy();
        }
    }
});
