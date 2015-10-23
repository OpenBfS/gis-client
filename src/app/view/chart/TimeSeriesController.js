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
    prepareTimeSeriesLoad: function(selectedStation) {
        var me = this;
        var view = me.getView();
        var valueField = 'value_' + selectedStation.get('geo_id');
        var layer = view.layer;
        var chartConfig = layer.get('timeSeriesChartProperties');
        var paramConfig = Koala.util.Object.getConfigByPrefix(
            chartConfig, "param_", true);

        view.setLoading(true);

        Ext.iterate(paramConfig, function(k, v) {
            paramConfig[k] = Koala.util.String.replaceTemplateStrings(
                v, selectedStation);
        });

        if (Ext.isEmpty(chartConfig.dataFeatureType) ||
            Ext.isEmpty(chartConfig.xAxisAttribute) ||
            Ext.isEmpty(chartConfig.yAxisAttribute)) {
                Ext.log.error('chart configuration of layer is invalid!');
                return;
        }

        // get the timerangefilter, actially we need the attribute param
        // only
        var filters = layer.metadata.filters,
            timeRangeFilter;

        Ext.each(filters, function(filter) {
            if (filter && filter.type && filter.type === 'timerange') {
                timeRangeFilter = filter;
                return false;
            } else {
                // some mockup values, TODO: remove me later on?
                timeRangeFilter = {
                    param: 'end_measure'
                };
            }
        });

        var requestParams = {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: chartConfig.dataFeatureType,
            outputFormat: 'application/json',
            filter: me.getDateTimeRangeFilter(timeRangeFilter)
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
                Ext.each(json.features, function(feat, featIdx) {
                    var matchFound = false;

                    Ext.each(store.data.items, function(item, itemIdx) {
                        // we try to find a matching record in the store
                        // and append the new value if match is found
                        if (Ext.Date.isEqual(item.data[chartConfig.xAxisAttribute],
                                new Date(feat.properties[chartConfig.xAxisAttribute]))) {
                            matchFound = item;
                            return false;
                        }
                    });

                    if (matchFound) {
                        // TODO refactor JW, DK, KV wissen bescheid
                        matchFound.data[valueField] =
                            feat.properties[chartConfig.yAxisAttribute];
                        return;
                    } else {
                        var newRec = Ext.create(store.getModel(),
                            feat.properties);
                        newRec.data[valueField] =
                            feat.properties[chartConfig.yAxisAttribute];
                        recs.push(newRec);
                    }
                });
                store.add(recs);
                me.onTimeSeriesDataLoad(selectedStation, valueField, chartConfig);
            },
            failure: function() {
                Ext.log.error("failure on chartdata load");
            }
        });

        view.getAxes()[0].getFields().push(valueField);
    },

    /**
     *
     */
    getDateTimeRangeFilter: function(layerFilter) {
        var me = this;
        var timeSeriesWin = me.getView().up('window');
        var filter;
        var startDate;
        var endDate;
        var timeField;

        startDate = timeSeriesWin.down('datefield[name=datestart]').getValue();
        endDate = timeSeriesWin.down('datefield[name=dateend]').getValue();
        timeField = layerFilter.param;

        filter =
            '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">' +
            '    <ogc:PropertyIsBetween>' +
            '        <ogc:PropertyName>' + timeField + '</ogc:PropertyName>' +
            '        <ogc:LowerBoundary>'+
            '            <ogc:Literal>' + startDate.toISOString() + '</ogc:Literal>' +
            '        </ogc:LowerBoundary>' +
            '        <ogc:UpperBoundary>' +
            '            <ogc:Literal>' + endDate.toISOString() + '</ogc:Literal>' +
            '        </ogc:UpperBoundary>' +
            '    </ogc:PropertyIsBetween>' +
            '</ogc:Filter>';

        return filter;
    },

    /**
     *
     */
    onTimeSeriesDataLoad: function(selectedStation, valueField, chartConfig) {
        var me = this;
        var view = me.getView();
        var stationName = !Ext.isEmpty(chartConfig.seriesTitleTpl) ?
            Koala.util.String.replaceTemplateStrings(
                chartConfig.seriesTitleTpl, selectedStation) : "";

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
            colors: [strokeStyle],
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
