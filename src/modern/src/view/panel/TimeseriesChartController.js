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
 * @class Koala.view.panel.TimeseriesChartController
 */
Ext.define('Koala.view.panel.TimeseriesChartController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-timeserieschart',

    requires: [
        'Koala.util.Filter',
        'Koala.util.String',

        'Koala.view.component.D3Chart'
    ],

    updateFor: function(olLayer, olFeat){
        var me = this;
        var view = me.getView();
        var existingChart = view.down('d3-chart');

        if (existingChart) {
            // TODO do we need to check if olLayer is the same?
            //      we could also listoin the change of the olLayer and cleanup
            me.updateChartWith(olLayer, olFeat);
        } else {
            me.updateChartFilterValuesFromLayer(olLayer);
            var chart = me.createTimeseriesChart(olLayer, olFeat);
            view.add(chart);
        }
    },

    updateChartFilterValuesFromLayer: function(olLayer) {
        var me = this;
        var view = me.getView();
        var FilterUtil = Koala.util.Filter;
        var metadata = olLayer.metadata;
        var filterVals = FilterUtil.getStartEndFilterFromMetadata(metadata);
        // This is how we would get min/max values for the modern part
        // but `datepickerfield` instances don't have `minValue`/`maxValue`…
        //
        // var minMaxDates = FilterUtil.getMinMaxDatesFromMetadata(metadata);
        var startDateField = view.down('datepickerfield[name=datestart]');
        var endDateField = view.down('datepickerfield[name=dateend]');

        startDateField.setValue(filterVals.mindatetimeinstant);
        // No need to set these, sadly `minValue`/`maxValue` don't exist
        //
        // startDateField.setMinValue(minMaxDates.min);
        // startDateField.setMaxValue(minMaxDates.max);

        endDateField.setValue(filterVals.maxdatetimeinstant);
        // No need to set these, sadly `minValue`/`maxValue` don't exist
        //
        // endDateField.setMinValue(minMaxDates.min);
        // endDateField.setMaxValue(minMaxDates.max);
    },

    applyChangedFilterToChart: function() {
        var me = this;
        var view = me.getView();
        var charts = view.query('d3-chart');
        var startDate = view.down('datepickerfield[name=datestart]').getValue();
        var endDate = view.down('datepickerfield[name=dateend]').getValue();

        Ext.each(charts, function(chart) {
            var chartController = chart.getController();

            // update the time range for the chart
            chart.setStartDate(startDate);
            chart.setEndDate(endDate);

            var shapes = chart.getShapes();

            Ext.each(shapes, function(shape) {
                chartController.deleteShapeSeriesById(shape.id);
                chartController.deleteLegendEntry(shape.id);
            });

            // update the chart to reflect the changes
            chart.getController().getChartData();
        });
    },

    updateChartWith: function(olLayer, olFeat) {
        // don't proceed if we don't get a olFeat, e.g. if we were called
        // by the selectChartLayerCombo
        if (!olFeat) {
            return false;
        }

        var me = this;
        var StringUtil = Koala.util.String;
        var view = me.getView();
        var layerName = olLayer.get('name');
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var chart = view.down('d3-chart[name="' + layerName + '"]');
        var chartController = chart.getController();
        var valFromSeq = StringUtil.getValueFromSequence;
        var coerce = StringUtil.coerce;
        var stationName = "";
        if(!Ext.isEmpty(chartConfig.seriesTitleTpl)) {
            stationName =StringUtil.replaceTemplateStrings(
                chartConfig.seriesTitleTpl, olFeat
            );
        }
        var currentSeqIndex = chart.getSelectedStations().length;
        var color = valFromSeq(chartConfig.colorSequence, currentSeqIndex, "");
        if (!color) {
            color = Koala.view.component.D3BaseController.getRandomColor();
        }

        chartController.addShape({
            type: chartConfig.shapeType || 'line',
            curve: chartConfig.curveType || 'linear',
            xField: chartConfig.xAxisAttribute,
            yField: chartConfig.yAxisAttribute,
            name: stationName,
            id: olFeat.get('id'),
            color: color,
            opacity: coerce(chartConfig.strokeOpacity) || 1,
            width: coerce(chartConfig.strokeWidth) || 1,
            tooltipTpl: chartConfig.tooltipTpl
        }, olFeat, false);
    },

    /**
     *
     */
    createTimeseriesChart: function(olLayer, olFeat) {
        var view = this.getView();
        var start = view.down('datepickerfield[name=datestart]').getValue();
        var end = view.down('datepickerfield[name=dateend]').getValue();
        return Koala.view.component.D3Chart.create(olLayer, olFeat, start, end);
    }

});
