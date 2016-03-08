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
 * @class Koala.view.chart.TimeSeries
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
        type: "k-timeseries"
    },

    config: {
        seriesType: "line",
        showStep: true,
        selectedStations: []
    },

    layer: null,

    flex: 1,

    legend: {
        docked: "right"
    },

    constructor: function(cfg) {
        var chartConfig = cfg.layer.get("timeSeriesChartProperties");
        var getConfigByPrefix = Koala.util.Object.getConfigByPrefix;
        var coerce = Koala.util.String.coerce;
        var xConfig = getConfigByPrefix(chartConfig, "xAxis_", true);
        var yConfig = getConfigByPrefix(chartConfig, "yAxis_", true);
        var xLabelRotation = coerce(chartConfig.xAxisLabelRotation);
        var yLabelRotation = coerce(chartConfig.yAxisLabelRotation);
        var dspUnit = chartConfig.dspUnit || '';

        var defaultXAxis = {
            type: "time",
            position: "bottom",
            grid: true,
            fields: [chartConfig.xAxisAttribute],
            label: {
                rotate: {
                    degrees: xLabelRotation || -90
                }
            }
        };
        Ext.apply(defaultXAxis, xConfig);

        var defaultYAxis = {
            type: "numeric",
            position: "left",
            grid: true,
            minimum: 0,
            renderer: function (axis, label) {
                return label + ' ' + dspUnit;
            },
            label: {
                rotate: {
                    degrees: yLabelRotation !== undefined ? yLabelRotation : 0
                }
            }
        };
        Ext.apply(defaultYAxis, yConfig);
        cfg.axes = [defaultYAxis, defaultXAxis];

        cfg.store = {
            fields: [{
                name: chartConfig.xAxisAttribute,
                type: "date",
                // TODO double check format, I suspect this isn't correct
                dateFormat: "c",
                mapping: function(dataRec){
                    return dataRec.properties[chartConfig.xAxisAttribute];
                }
            }]
        };

        this.callParent([cfg]);
    },

    /**
     * Returns whether this chart currently contains a series for the passed
     * feature or not. In order for this method to properly work, you will need
     * to specify a valid `featureIdentifyField` in the current layers
     * `timeSeriesChartProperties`.
     *
     * @param {ol.Feature} candidate The feature to check.
     * @return {boolean} Whether the candidate is already represented inside
     *     this chart.
     */
    containsSeriesFor: function(candidate) {
        var me = this;
        var chartingMetadata = me.layer.get("timeSeriesChartProperties");
        var identifyField = chartingMetadata.featureIdentifyField || "id";
        var candidateIdVal = candidate.get(identifyField);
        var doesContainSeries = false;
        if (!Ext.isDefined(candidateIdVal)){
            Ext.log.warn("Failed to determine if chart contains a series for " +
                "the passed feature. Does it expose a field '" + identifyField +
                "' with a sane value?");
        } else {
            var currentStations = me.getSelectedStations();
            Ext.each(currentStations, function(currentStation) {
                var currentStationIdVal = currentStation.get(identifyField);
                if (currentStationIdVal === candidateIdVal) {
                    doesContainSeries = true;
                    return false; // …stop iterating
                }
            });
        }
        return doesContainSeries;
    },

    /**
     * Add a station to the list of managed stations for this chart. Please note
     * that this does not actually render a new series for the station, callers
     * (like e.g. the timeseries window controller) need to ensure that the data
     * is actually fetched and drawn.
     *
     * TODO We may want to refactor this, so the last note isn't needed any
     *      longer. the twc currently simply calls into our own controller and
     *      issues `prepareTimeSeriesLoad`, which we might do as well here…
     *
     * By default the candidate will only be added, if it doesn't already
     * exist (see #containsSeriesFor), but this can be skipped if the second
     * argument (`allowDupes`) is passed as `true`. This method returns whether
     * the feature was actually added.
     *
     * @param {ol.Feature} candidate The feature to add.
     * @param {boolean} [allowDupes] Whether duplicates are allowed. Defaults to
     *     `true`.
     * @return {boolean} Whether the candidate was added.
     */
    addStation: function(candidate, allowDupes){
        var me = this;
        var added = false;
        allowDupes = Ext.isDefined(allowDupes) ? allowDupes : false;
        if (allowDupes === true || !me.containsSeriesFor(candidate)) {
            me.getSelectedStations().push(candidate);
            added = true;
        }
        return added;
    },

    /**
     * Remove a single station from the chart; removal includess the series and
     * also the entry in the internal list of stations: #selectedStations.
     *
     * The parameter to this methdo is an id of the series, fuuture versions may
     * want to also support an `ol.Feature`.
     *
     * @param {string} seriesIdentifier An id of a series, as it can be obtained
     *     by calling `seriesInstance.getId()`.
     */
    removeStation: function(seriesIdentifier) {
        var me = this;
        var chartProps = me.layer.get("timeSeriesChartProperties");
        var featureShortDspField = chartProps.featureShortDspField || "name";
        var actualSeries = me.getSeries(seriesIdentifier)[0];
        if (!actualSeries) {
            return;
        }
        var actualSeriesTitle = actualSeries.getTitle();
        var selectedStations = me.getSelectedStations();
        var newSelected = Ext.Array.filter(selectedStations, function(station){
            return station.get(featureShortDspField) !== actualSeriesTitle;
        });
        me.setSelectedStations(newSelected);
        me.removeSeries(seriesIdentifier);
    },

    /**
     * Removes all stations from the chart; removal includess the series and
     * also the entries in the internal list of stations: #selectedStations.
     *
     * Delegates the work to the dedicated method #removeStation.
     */
    removeAllStations: function(){
        var me = this;
        var series = me.getSeries();
        Ext.each(series, function(oneSeries) {
            me.removeStation(oneSeries.getId());
        });
    }

});
