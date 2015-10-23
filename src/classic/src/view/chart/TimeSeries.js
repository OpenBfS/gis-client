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
Ext.define("Koala.view.chart.TimeSeries", {
    extend: "Ext.chart.CartesianChart",
    xtype: "k-chart-timeseries",

    requires: [
        "Koala.util.Object",
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

    selectedStations: [],

    layer: null,

    width: '100%',

    legend: {
        docked: 'right'
    },

    constructor: function(cfg) {
        var chartConfig = cfg.layer.get('timeSeriesChartProperties');
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
            type: 'time',
            position: 'bottom',
            grid: true,
            fields: [chartConfig.xAxisAttribute],
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
            renderer: function (axis, idx, data, v) {
                if (v === null) {
                    return '';
                }
                return data.renderer(v) + ' ' + dspUnit;
            },
            label: {
                rotate: {
                    degrees: yLabelRotation || 0
                }
            }
        };
        Ext.apply(defaultYAxis, yConfig);

        cfg.axes = [defaultYAxis, defaultXAxis];

        cfg.store = {
            fields: [{
                name: chartConfig.xAxisAttribute,
                type: 'date',
                dateFormat: 'c',
                mapping: function(dataRec){
                    return dataRec.properties[chartConfig.xAxisAttribute];
                }
            }]
        };

        this.callParent([cfg]);

    }
});
