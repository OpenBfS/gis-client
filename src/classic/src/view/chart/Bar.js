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
Ext.define("Koala.view.chart.Bar", {
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

    layer: null,

    width: '100%',

    legend: {
        docked: 'right'
    },

    constructor: function(cfg) {
        var chartConfig = cfg.layer.get('barChartProperties');
        var xConfig = Koala.util.Object.getConfigByPrefix(
            chartConfig, "xAxis_", true);
        var yConfig = Koala.util.Object.getConfigByPrefix(
            chartConfig, "yAxis_", true);
        var xLabelRotation = Koala.util.String.coerce(
            chartConfig.xAxisLabelRotation);
        var yLabelRotation = Koala.util.String.coerce(
            chartConfig.yAxisLabelRotation);
        var dspUnit = chartConfig.dspUnit || '';

        var defaultXAxis = {
            type: 'category',
            position: 'bottom',
            grid: true,
            label: {
                rotate: {
                    degrees: xLabelRotation || -45
                }
            }
        };
        Ext.apply(defaultXAxis, xConfig);

        var defaultYAxis = {
            type: 'numeric',
            position: 'left',
            grid: true,
            minimum: 0,
            // The parameters in the documentation are wrong. Guess the order is
            // correct like this.
            renderer: function (axis, label) {
                return Math.round(label*10,10)/10 + ' ' + dspUnit;
            },
            label: {
                rotate: {
                    degrees: yLabelRotation || 0
                }
            }
        };
        Ext.apply(defaultYAxis, yConfig);
        cfg.axes = [defaultYAxis, defaultXAxis];
        this.callParent([cfg]);
    }
});
