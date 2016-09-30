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

    requires: [],

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
        var filterVals = FilterUtil.getStartEndFilterFromMetadata(
            olLayer.metadata
        );
        var startDateField = view.down('datepickerfield[name=datestart]');
        var endDateField = view.down('datepickerfield[name=dateend]');
        startDateField.setValue(filterVals.mindatetimeinstant);
        endDateField.setValue(filterVals.maxdatetimeinstant);
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
        var view = me.getView();
        // var layerName = olLayer.get('name');
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var chart = view.down('d3-chart');
        var chartController = chart.getController();
        var valFromSeq = Koala.util.String.getValueFromSequence;
        var stationName = !Ext.isEmpty(chartConfig.seriesTitleTpl) ?
            Koala.util.String.replaceTemplateStrings(
                chartConfig.seriesTitleTpl, olFeat) : "";

        // console.log(chart.getSelectedStations().length - 1)
        chartController.addShape({
            type: chartConfig.shapeType || 'line',
            curve: chartConfig.curveType || 'linear',
            xField: chartConfig.xAxisAttribute,
            yField: chartConfig.yAxisAttribute,
            name: stationName,
            id: olFeat.get('id'),
            color: valFromSeq(chartConfig.colorSequence, chart.getSelectedStations().length, 'red'),
            opacity: valFromSeq(chartConfig.strokeOpacitySequence, 0, 0),
            width: valFromSeq(chartConfig.strokeWidthSequence, 0, 1),
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
