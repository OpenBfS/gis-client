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
Ext.define('Koala.view.chart.TimeSeriesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-chart-timeseries',

    requires: [
        'Koala.util.String'
    ],

    /**
     * Requesting the charts data through Ext.Ajax as we need to handle
     * the parse and filling strategy ourselves
     */
    prepareTimeSeriesLoad: function() {
        var me = this;
        var view = me.getView();
        var seriesIndex = view.getSeries().length;
        var valueField = 'value_' + seriesIndex;
        var layer = view.selectedStation.get('layer');
        var chartConfig = layer.get('timeSeriesChartProperties');
        var paramConfig = Koala.util.Object.getConfigByPrefix(
            chartConfig, "param_", true);
        Ext.iterate(paramConfig, function(k, v) {
            paramConfig[k] = Koala.util.String.replaceTemplateStrings(
                v, view.selectedStation);
        });

        if (Ext.isEmpty(chartConfig.dataFeatureType) ||
            Ext.isEmpty(chartConfig.xAxisAttribute) ||
            Ext.isEmpty(chartConfig.yAxisAttribute)) {
                Ext.log.error('chart configuration of layer is invalid!');
                return;
        }

        var requestParams = {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: chartConfig.dataFeatureType,
            outputFormat: 'application/json'
        };
        Ext.apply(requestParams, paramConfig);

        // determined from wms url
        var url = (layer.getSource().getUrls()[0]).replace(/\/wms/g, "/wfs");

        Ext.Ajax.request({
            url: url,
            method: 'GET',
            type: 'ajax',
            params: requestParams,
            success: function(res) {

                var json = Ext.decode(res.responseText),
                    chart = Ext.ComponentQuery.query('k-chart-timeseries')[0],
                    store = chart.getStore();

                var recs = [];
                Ext.each(json.features, function(feat) {
                    var matchFound = false;
                    Ext.each(store.data.items, function(item) {
                        // we try to find a matching record in the store
                        // and append the new value if match is found
                        if (Ext.Date.isEqual(item.data[chartConfig.xAxisAttribute],
                                new Date(feat.properties[chartConfig.xAxisAttribute]))) {
                            matchFound = item;
                            return false;
                        }
                    });
                    if (matchFound) {
                        // TODO refactor JW weißs bescheid
                        matchFound.data[valueField] =
                            feat.properties[chartConfig.yAxisAttribute];
                    } else {
                        var newRec = Ext.create(store.getModel(),
                            feat.properties);
                        newRec.data[valueField] =
                            feat.properties[chartConfig.yAxisAttribute];
                        recs.push(newRec);
                    }
                });
                store.add(recs);
                me.onTimeSeriesDataLoad(valueField, chartConfig);
            },
            failure: function() {
                Ext.log.error("failure on chartdata load");
            }
        });

        view.getAxes()[0].getFields().push(valueField);

        view.setLoading(true);
    },

    /**
     *
     */
    onTimeSeriesDataLoad: function(valueField, chartConfig) {
        var me = this;
        var view = me.getView();
        var station = view.selectedStation;
        var stationName = !Ext.isEmpty(chartConfig.seriesTitleTpl) ?
            Koala.util.String.replaceTemplateStrings(
                chartConfig.seriesTitleTpl, station) : "";

        var newSeries = me.createNewSeries(stationName,
            chartConfig, valueField);
        if(newSeries){
            view.addSeries(newSeries);
        }
        view.setLoading(false);
    },

    /**
     *
     */
    getRandomColor: function() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    /**
     *
     */
    createNewSeries: function(title, chartConfig, valueField) {
        var me = this;
        var view = me.getView();
        var seriesIndex = view.getSeries().length;
        var strokeStyle = Koala.util.String.getValueFromSequence(
            chartConfig.colorSequence, seriesIndex, me.getRandomColor());
        var strokeWidth = parseInt(Koala.util.String.getValueFromSequence(
            chartConfig.strokeWidthSequence, seriesIndex, 1), 10);
        var strokeOpacity = parseFloat(Koala.util.String.getValueFromSequence(
            chartConfig.strokeOpacitySequence, seriesIndex, 1));
        var fillOpacity = parseFloat(Koala.util.String.getValueFromSequence(
            chartConfig.fillOpacitySequence, seriesIndex, 0.8));

        // check if we have generic series properties
        var seriesProperties =
            Koala.util.Object.getConfigByPrefix(chartConfig, "ui_series_", true);

        var newSeries = {
            type: view.getSeriesType(),
            title: title,
            xField: chartConfig.xAxisAttribute,
            yField: valueField,
            step: view.getShowStep() === "false" ? false : true,
            style: {
                lineWidth: strokeWidth,
                strokeStyle: strokeStyle,
                strokeOpacity: strokeOpacity
            },
            marker: {
                radius: 0
            },
            selectionTolerance: 5,
            highlight: {
                fillStyle: strokeStyle,
                fillOpacity: fillOpacity,
                radius: 5,
                lineWidth: strokeWidth + 2,
                strokeStyle: strokeStyle
            },
            tooltip: {
                trackMouse: true,
                showDelay: 0,
                dismissDelay: 0,
                hideDelay: 0,
                renderer: function (tooltip, record) {
                    var timestamp = record.get(chartConfig.xAxisAttribute);
                    var time = timestamp.toLocaleDateString() + " " +
                        timestamp.toLocaleTimeString();
                    var value = record.get(valueField);
                    var unit = chartConfig.dspUnit ? chartConfig.dspUnit : '';
                    var defaultTemplate = this.getTitle() + '<br/>' +
                            time + '<br/>' + value + " " + unit;

                    if (!Ext.isEmpty(chartConfig.tooltipTpl)) {
                        var tpl = Koala.util.String.replaceTemplateStrings(
                            chartConfig.tooltipTpl, view.selectedStation, false);
                        tpl = Koala.util.String.replaceTemplateStrings(
                            tpl, record, false);
                        tooltip.setHtml(tpl);
                    } else {
                        tooltip.setHtml(defaultTemplate);
                    }
                }
            }
        };
        if (Koala.util.String.coerce(chartConfig.hasToolTip) === false) {
            delete newSeries.tooltip;
        }
        // apply / override additional properties
        newSeries = Ext.apply(newSeries, seriesProperties);
        return newSeries;
    }
});
