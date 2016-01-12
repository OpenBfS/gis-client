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
 * @class Koala.view.chart.BarController
 */
Ext.define('Koala.view.chart.BarController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-chart-bar',

    /**
     *
     */
    prepareBarSeriesLoad: function() {
        var me = this;
        var view = me.getView();
        var layer = view.selectedStation.get('layer');
        var chartConfig = layer.get('barChartProperties');
        var paramConfig = Koala.util.Object.getConfigByPrefix(
            chartConfig, "param_", true);
        Ext.iterate(paramConfig, function(k, v) {
            paramConfig[k] = Koala.util.String.replaceTemplateStrings(
                v, view.selectedStation);
        });

        if (Ext.isEmpty(chartConfig.dataFeatureType) ||
            Ext.isEmpty(chartConfig.chartFieldSequence)) {
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

        // first try to read out explicitly configured WFS URL
        var url = Koala.util.Object.getPathStrOr(
                layer.metadata,
                "layerConfig/wfs/url",
                null
            );
        if (!url) {
            // … otherwise determine from wms url
            url = layer.getSource() instanceof ol.source.TileWMS ?
                (layer.getSource().getUrls()[0]).replace(/\/wms/g, "/wfs") :
                (layer.getSource().getUrl()).replace(/\/wms/g, "/wfs");
        }

        Ext.Ajax.request({
            url: url,
            method: 'GET',
            type: 'ajax',
            params: requestParams,
            success: function(res) {

                var json = Ext.decode(res.responseText),
                    store = view.getStore();

                // move the values from props one level up as we have no model
                Ext.each(json.features, function(feat) {
                    Ext.iterate(feat.properties, function(k, v) {
                        // check if we have an fieldtitle or defaultvalue to set
                        var fields = chartConfig.chartFieldSequence.split(",");
                        var index = Ext.Array.indexOf(fields, k);
                        var defaultValue;
                        if (index >= 0) {
                            var replacedTitle = Koala.util.String.getValueFromSequence(
                                chartConfig.chartFieldTitleSequence, index,
                                feat[k + '_name'] = k);
                            defaultValue = Koala.util.String.getValueFromSequence(
                                chartConfig.chartFieldDefaultsSequence, index);

                            feat[k + '_name'] = replacedTitle;
                        } else {
                            feat[k + '_name'] = k;
                        }

                        if (!Ext.isNumeric(v)) {
                            feat[k + '_value'] = defaultValue;
                        } else {
                            feat[k + '_value'] = v;
                        }
                    });
                    delete feat.properties;
                });
                store.add(json.features);
                me.onBarStoreLoad(chartConfig);
            },
            failure: function() {
                Ext.log.error("failure on chartdata load");
            }
        });

        var sequence = chartConfig.chartFieldSequence.split(",");
        Ext.each(sequence, function(fieldName) {
            view.getAxes()[0].getFields().push(fieldName + '_value');
        });

        view.setLoading(true);
    },

    /**
     *
     */
    onBarStoreLoad: function(chartConfig) {
        var me = this;
        var view = me.getView();
        var sequence = chartConfig.chartFieldSequence.split(",");
        var i = 0;
        Ext.each(sequence, function(fieldName) {
            var title = Koala.util.String.getValueFromSequence(
                chartConfig.chartFieldTitleSequence, i, fieldName);
            var newSeries = me.createNewBarSeries(title, fieldName, chartConfig, i);
            view.addSeries(newSeries);
            i++;
        });

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
    createNewBarSeries: function(title, field, chartConfig, seriesIndex) {
        var me = this;
        var view = me.getView();
        var strokeStyle = Koala.util.String.getValueFromSequence(
            chartConfig.colorSequence, seriesIndex, me.getRandomColor());
        var strokeWidth = parseInt(Koala.util.String.getValueFromSequence(
            chartConfig.strokeWidthSequence, seriesIndex, 1), 10);
        var fillOpacity = parseFloat(Koala.util.String.getValueFromSequence(
            chartConfig.fillOpacitySequence, seriesIndex, 0.8));

        // check if we have generic series properties
        var seriesProperties =
            Koala.util.Object.getConfigByPrefix(chartConfig, "ui_series_", true);

        var newSeries = {
            type: view.getSeriesType(),
            title: title,
            xField: field + '_name',
            yField: field + '_value',
            style: {
                lineWidth: strokeWidth,
                fillStyle: strokeStyle,
                strokeStyle: strokeStyle,
                fillOpacity: fillOpacity
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
                renderer: function (tooltip, record) {
                    var key = record.get(this.getXField());
                    var value = record.get(this.getYField());
                    var unit = chartConfig.dspUnit ? chartConfig.dspUnit : '';
                    var defaultTemplate = //this.getTitle() + '<br/>' +
                            key + ' : ' + value + " " + unit;

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
