/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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

    onInitialize: function() {
        var me = this;
        var utcRadios = Ext.ComponentQuery.query('radiofield[originalValue=UTC]');
        Ext.each(utcRadios, function(utcRadio) {
            utcRadio.on('change', me.onTimeReferenceChanged, me);
        });
    },

    onPainted: function() {
        var me = this;
        var view = me.getView();

        // Redraw the chart as the underlying data may have been changed.
        view.down('d3-chart').getController().redrawChart();
    },

    onTimeReferenceChanged: function() {
        var me = this;
        var view = me.getView();
        var startDatePicker = view.down('k-container-datetimepicker[name=startdate]');
        var endDatePicker = view.down('k-container-datetimepicker[name=enddate]');
        var startDate = startDatePicker.getValue();
        var endDate = endDatePicker.getValue();
        var chart = view.down('d3-chart');

        // Update the datepicker values.
        if (startDate) {
            startDate = Koala.util.Date.getTimeReferenceAwareMomentDate(startDate);
            startDatePicker.setValue(startDate);
        }
        if (endDate) {
            endDate = Koala.util.Date.getTimeReferenceAwareMomentDate(endDate);
            endDatePicker.setValue(endDate);
        }

        if (chart) {
            var chartController = chart.getController();
            var chartData = chartController.data;
            var xAxisAttribute = chart.getTargetLayer().get(
                'timeSeriesChartProperties').xAxisAttribute;

            // Update the chart data itself.
            Ext.iterate(chartData, function(stationId, data) {
                Ext.each(data, function(item) {
                    if (Koala.Application.isUtc()) {
                        item[xAxisAttribute] = Koala.util.Date.removeUtcOffset(
                            item[xAxisAttribute]);
                    } else {
                        item[xAxisAttribute] = Koala.util.Date.addUtcOffset(
                            item[xAxisAttribute]).local();
                    }
                });
            });
        }
    },

    /**
     * Toogles the visibility of the filter form panel.
     */
    onSearchToolClick: function() {
        var me = this;
        var view = me.getView();
        var filterForm = view.down('k-form-timeseriesfiltercontrol');

        filterForm.setHidden(!filterForm.isHidden());
    },

    /**
     * Toggles the legend's visibility.
     */
    onCollapseLegendToolClick: function() {
        var me = this;
        var view = me.getView();
        var chart = view.down('d3-chart');
        var chartCtrl = chart.getController();

        chartCtrl.toggleLegendVisibility();
    },

    updateFor: function(olLayer, olFeat) {
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
        var startDateContainer = view.down('container[name=startdate]');
        var endDateContainer = view.down('container[name=enddate]');
        // This is how we would get min/max values for the modern part
        // but `datepickerfield` instances don't have `minValue`/`maxValue`…
        var minMaxDates = FilterUtil.getMinMaxDatesFromMetadata(metadata);
        var maxDuration = Koala.util.Object.getPathStrOr(metadata,
            'layerConfig/timeSeriesChartProperties/duration', null);

        // Set the allowed max/min values for the start container.
        startDateContainer.setMaxValue(minMaxDates.max);
        startDateContainer.setMinValue(minMaxDates.min);
        // Set the default start value.
        startDateContainer.setValue(filterVals.mindatetimeinstant);
        // Set the max. allowed time duration to the start field.
        startDateContainer.setMaxDuration(maxDuration);

        // Set the allowed max/min values for the end container.
        endDateContainer.setMaxValue(minMaxDates.max);
        endDateContainer.setMinValue(minMaxDates.min);
        // Set the default end value.
        endDateContainer.setValue(filterVals.maxdatetimeinstant);
    },

    applyChangedFilterToChart: function() {
        var me = this;
        var view = me.getView();
        var charts = view.query('d3-chart');
        var startDate = view.down('k-container-datetimepicker[name=startdate]').getValue();
        var endDate = view.down('k-container-datetimepicker[name=enddate]').getValue();

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

            // Mark the chart as rendered
            chart.getController().chartRendered = true;

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
        var stationName = '';
        if (!Ext.isEmpty(chartConfig.seriesTitleTpl)) {
            stationName =StringUtil.replaceTemplateStrings(
                chartConfig.seriesTitleTpl, olFeat
            );
        }
        var currentSeqIndex = chart.getSelectedStations().length;
        var color = valFromSeq(chartConfig.colorSequence, currentSeqIndex, '');
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
        var config = {
            startDate: view.down('k-container-datetimepicker[name=startdate]').getValue(true),
            endDate: view.down('k-container-datetimepicker[name=enddate]').getValue(true),
            width: '100%',
            flex: 1,
            margin: 0
        };
        return Koala.view.component.D3Chart.create(olLayer, olFeat, config);
    }

});
