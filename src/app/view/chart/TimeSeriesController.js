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
        var dataObjectField = 'data_' + selectedStation.get(identifyField);
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

        // get the filter

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
        view.getAxes()[0].getFields().push(dataObjectField);

        Ext.Ajax.request({
            url: url,
            method: 'GET',
            type: 'ajax',
            params: requestParams,
            success: function(res) {
                var json = Ext.decode(res.responseText);

                var chart = view;
                var store = chart.getStore();

                // Here is the strategy:

                // 1) Get the interval in which we have to create data records.
                var intervalInSeconds = me.getIntervalInSeconds(
                    timeRangeFilter.interval, timeRangeFilter.unit
                );

                // 2) Setup the store data for the given interval
                var newStoreData = me.setupStoreData(json.features,
                    dataObjectField, valueField, chartConfig, intervalInSeconds
                );

                // 3) load the now cleaned-up data into the store. Previous data
                // will be automatically removed.
                store.loadData(newStoreData);

                // 6) enjoy and continue the original workflow:
                me.onTimeSeriesDataLoad(
                    selectedStation, valueField, dataObjectField, chartConfig
                );
            },
            failure: function() {
                Ext.log.error("failure on chartdata load");
            }
        });

    },

    /**
     * Creates data from the startDate to the endDate given in the filter.
     * For every intervalInSeconds a record is created.
     * If we find data for the given features we add this data to the record.
     * If not we set the yAxisAttr to "undefined" to enable gaps in the data.
     * @param {Array[ol.Feature]} features The features of the station.
     * @param {String} dataObjectField The field where we store the dataObject.
     * @param {String} valueField The field where we store the value.
     * @param {Object} chartConfig Configobject which includes
     *    xAxisAttr and yAxisAttr.
     * @param {Integer} intervalInSeconds The Interval of records to be created.
     */
    setupStoreData: function(features, dataObjectField, valueField, chartConfig,
            intervalInSeconds){

        var me = this;
        var timeSeriesWin = me.getView().up('window');
        var date = timeSeriesWin.down('datefield[name=datestart]').getValue();
        var endDate = timeSeriesWin.down('datefield[name=dateend]').getValue();
        var store = me.getView().getStore();

        var xAxisAttr = chartConfig.xAxisAttribute;
        var yAxisAttr = chartConfig.yAxisAttribute;
        var mockUpData = [];

        var snapObject = me.getTimeStampSnapObject(
                date, intervalInSeconds, features, xAxisAttr);

        var compareableDate, matchingFeature;

        // We already got data
        if (store.getCount() > 0) {
            store.each(function (record) {
                var recordDate = record.get(xAxisAttr);
                compareableDate = Ext.Date.format(recordDate, "timestamp");
                matchingFeature = snapObject[compareableDate];

                record.set(valueField, undefined);
                if(matchingFeature){
                    record.set(valueField,
                        matchingFeature.properties[yAxisAttr]);
                    record.set(dataObjectField,
                        Ext.clone(matchingFeature.properties));
                }
                mockUpData.push(record.getData());
            });
        // We don't have data in the store yet
        } else {
            while(date <= endDate){

                var newRawData = {};

                compareableDate = Ext.Date.format(date, "timestamp");
                matchingFeature = snapObject[compareableDate];

                // Why did we do this?
                // Ext.Date.format(date, Koala.util.Date.ISO_FORMAT);
                newRawData[xAxisAttr] = date;
                newRawData[valueField] = undefined;

                if(matchingFeature){
                    newRawData[valueField] = matchingFeature.properties[yAxisAttr];
                    newRawData[dataObjectField] = Ext.clone(matchingFeature.properties);
                }

                mockUpData.push(newRawData);
                date = Ext.Date.add(date, Ext.Date.SECOND, intervalInSeconds);
            }
        }

        return mockUpData;
    },

    /**
     * We create an object of the features where the key is a timestamp.
     * You can then easily access the feature of a given date.
     *
     * @param startDate {Date}
     * @param intervalInSeconds {Integer}
     * @param features {Array[ol.Feature]}
     * @param xAxisAttr {String}
     */
    getTimeStampSnapObject: function (startDate, intervalInSeconds, features,
            xAxisAttr) {
        var obj = {};
        var startSeconds = parseInt(
                Ext.Date.format(startDate, "timestamp"), 10);
        var columnSeconds = intervalInSeconds / 2;

        Ext.each(features, function(feat){
            // "new Date" creates always local timestamp
            var featDate = new Date(feat.properties[xAxisAttr]);

            if (Koala.Application.isLocal()) {
                var makeLocal = Koala.util.Date.makeLocal;
                featDate = makeLocal(featDate);
            }

            var featDateSeconds = parseInt(
                    Ext.Date.format(featDate, "timestamp"), 10);
            var diffSeconds = featDateSeconds - startSeconds;
            var modulos = diffSeconds % intervalInSeconds;
            var snapSeconds;

            if(modulos < columnSeconds){
                snapSeconds = featDateSeconds - modulos;
            } else {
                snapSeconds = featDateSeconds + modulos;
            }
            obj[snapSeconds] = feat;
        });

        return obj;
    },

    /**
     * Normalize interval and unit to seconds.
     *
     * @param interval {Integer}
     * @param unit {String["seconds", "minutes", "hours", "days"]}
     */
    getIntervalInSeconds: function (interval, unit) {
        var multiplier = 0;

        switch (unit.toLowerCase()) {
            case "seconds":
                multiplier = 1;
                break;
            case "minutes":
                multiplier = Koala.util.Duration.secondsInOne.MINUTE;
                break;
            case "hours":
                multiplier = Koala.util.Duration.secondsInOne.HOUR;
                break;
            case "days":
                multiplier = Koala.util.Duration.secondsInOne.DAY;
                break;
            default:
                break;
        }
        return multiplier * interval;
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
    onTimeSeriesDataLoad: function(selectedStation, valueField, dataObjectField,
            chartConfig) {
        var me = this;
        var view = me.getView();
        var stationName = !Ext.isEmpty(chartConfig.seriesTitleTpl) ?
            Koala.util.String.replaceTemplateStrings(
                chartConfig.seriesTitleTpl, selectedStation) : "";
        var newSeries = me.createNewSeries(
                stationName, chartConfig, valueField, dataObjectField, selectedStation
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
    createNewSeries: function(title, chartConfig, valueField, dataObjectField,
            selectedStation) {
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
                        var html = Koala.util.String.replaceTemplateStrings(
                            tpl, record.data[dataObjectField], false);

                        html = Koala.util.String.replaceTemplateStrings(
                            html, selectedStation, false);
                        tooltip.setHtml(html);
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
