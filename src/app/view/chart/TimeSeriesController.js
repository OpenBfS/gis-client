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
 * @class Koala.view.chart.TimeSeriesController
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
        var layer = view.layer;
        var chartConfig = layer.get('timeSeriesChartProperties');
        var identifyField = chartConfig.featureIdentifyField || "id";
        // var valueField = 'value_' + selectedStation.get(identifyField);
        var valueField = chartConfig.yAxisAttribute + '_' +
            selectedStation.get(identifyField);
        var paramConfig = Koala.util.Object.getConfigByPrefix(
            chartConfig, "param_", true);

        var allValueFields = [];
        // generate a list of all valueFields:
        Ext.each(view.getSelectedStations(), function(oneStation) {
            allValueFields.push('value_' + oneStation.get(identifyField));
        });

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

        // get the timerangefilter, actually we need the attribute param
        // only

        // TODO refactor this gathering of the needed filter attribute
        var filters = layer.metadata.filters;
        var timeRangeFilter;

        Ext.each(filters, function(filter) {
            var fType = (filter && filter.type) || '';
            if (fType === 'timerange' || fType === 'pointintime') {
                timeRangeFilter = filter;
                return false;
            }
        });
        if (!timeRangeFilter) {
            Ext.log.warn("Failed to determine a timerange filter");
        }
        // don't accidently overwrite the configured filter…
        timeRangeFilter = Ext.clone(timeRangeFilter);

        // We may need to switch out the parameter that controls the time:
        // The WMS (layer) may have a filter against attribute `abc`, while the
        // WFS (data source for the chart) may have the time in a field `def`.
        //
        // In such a case, the `xAxisAttribute` of the GNOS chart config will
        // differ from the `param` in the timerange-filter:
        if (timeRangeFilter.param !== chartConfig.xAxisAttribute) {
            // They were different, the explicitly configured one wins (we have
            // already tested if the chartConfig.xAxisAttribute isn't empty)
            timeRangeFilter.param = chartConfig.xAxisAttribute;
        }

        var requestParams = {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: chartConfig.dataFeatureType,
            outputFormat: 'application/json',
            filter: me.getDateTimeRangeFilter(timeRangeFilter),
            // see https://redmine-koala.bfs.de/issues/1080#note-36
            sortBy: chartConfig.xAxisAttribute
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
            url = (layer.getSource().getUrls()[0]).replace(/\/wms/g, "/wfs");
        }

        view.getAxes()[0].getFields().push(valueField);

        Ext.Ajax.request({
            url: url,
            method: 'GET',
            type: 'ajax',
            params: requestParams,
            success: function(res) {
                var json = Ext.decode(res.responseText);
                var chart = view;
                var store = chart.getStore();
                var yAxisAttr = chartConfig.yAxisAttribute;
                var xAxisAttr = chartConfig.xAxisAttribute;
                var rawStoreData = [];
                var cleanStoreData = [];

                // Here is the strategy:

                // 1) keep raw copies of the already existing records in the
                //    store, if any.
                store.each(function(rec){
                    rawStoreData.push(rec.getData());
                });

                // 2) next, empty the store, to start from a fresh one. It'll
                //    be reloaded with cleaned-up data later
                store.removeAll();

                // 3) For every Feature of the new dataset, put its specific
                //    value at valueField either into an existing clean data set
                //    from above, or create a new object in this array
                Ext.each(json.features, function(feat) {
                    var match = false;
                    Ext.each(rawStoreData, function(item) {
                        var d1 = item[xAxisAttr];
                        var d2 = new Date(feat.properties[xAxisAttr]);
                        if ( Ext.Date.isEqual(d1, d2) ) {
                            match = item;
                            return false;
                        }
                    });

                    if (match) {
                        // This feature from the new dataset, has a value at
                        // a point in time that another seroies already used.
                        // Set the series soeific valueField to the current
                        // value
                        match[valueField] = feat.properties[yAxisAttr];
                        cleanStoreData.push(match);
                    } else {
                        // This is a new date with a value, set the unique
                        // valueField simply to the current value …
                        var newRawData = feat.properties;
                        newRawData[valueField] = feat.properties[yAxisAttr];
                        // … and add it
                        cleanStoreData.push(newRawData);
                    }
                });

                // 4) We now need to take care of items that weren't cobvered by
                //    dataitems of the new dataset. Some items in cleanStoreData
                //    may still miss either old or the new valueField.
                Ext.each(cleanStoreData, function(cleanStoreDataItem){
                    Ext.each(allValueFields, function(oneValueField) {
                        if (cleanStoreDataItem[oneValueField] === undefined){
                            cleanStoreDataItem[oneValueField] = false;
                        }
                    });
                });

                // 5) load the now ckeaned-up data into the store.
                store.loadData(cleanStoreData);

                // 6) enjoy and continue the original workflow:
                me.onTimeSeriesDataLoad(
                    selectedStation, valueField, chartConfig
                );
            },
            failure: function() {
                Ext.log.error("failure on chartdata load");
            }
        });

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

        filter = '' +
            '<a:Filter xmlns:a="http://www.opengis.net/ogc">' +
              '<a:PropertyIsBetween>' +
                '<a:PropertyName>' + timeField + '</a:PropertyName>' +
                '<a:LowerBoundary>'+
                  '<a:Literal>' + startDate.toISOString() + '</a:Literal>' +
                '</a:LowerBoundary>' +
                '<a:UpperBoundary>' +
                  '<a:Literal>' + endDate.toISOString() + '</a:Literal>' +
                '</a:UpperBoundary>' +
              '</a:PropertyIsBetween>' +
            '</a:Filter>';

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
        var newSeries = me.createNewSeries(
                stationName, chartConfig, valueField, selectedStation
            );
        if(newSeries){
            view.addSeries(newSeries);
        }
        view.redraw();
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
    createNewSeries: function(title, chartConfig, valueField, selectedStation) {
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

                    var identifyField = chartConfig.featureIdentifyField || "id";
                    var seriesValueField = chartConfig.yAxisAttribute + '_' +
                        selectedStation.get(identifyField);
                    var value = record.get(seriesValueField);
                    var unit = chartConfig.dspUnit ? chartConfig.dspUnit : '';
                    var defaultTemplate = this.getTitle() + '<br/>' +
                            time + '<br/>' + value + " " + unit;

                    if (!Ext.isEmpty(chartConfig.tooltipTpl)) {

                        var tpl = Koala.util.String.replaceTemplateStrings(
                            chartConfig.tooltipTpl, {
                                value: value, // TODO this needs docs
                                title: this.getTitle() // TODO this needs docs
                            }, false);
                        tpl = Koala.util.String.replaceTemplateStrings(
                            tpl, record, false);
                        tpl = Koala.util.String.replaceTemplateStrings(
                            tpl, selectedStation, false);

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
