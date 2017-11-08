/*  Copyright (c) 2015-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * A utility class with chart manipulation functions.
 *
 * @class Koala.util.Chart
 */
Ext.define('Koala.util.Chart', {

    requires: [
        'Koala.util.String',
        'Koala.view.window.TimeSeriesWindow'
    ],

    statics: {

        /**
         * Opens a new timeseries window if none exists, or adds the feature
         * to an existing one.
         * @param {ol.Feature} olFeat the station to add
         */
        openTimeseriesWindow: function(olFeat) {
            var win = Ext.ComponentQuery.query('window[name=timeserieswin]')[0];
            var olLayer = olFeat.get('layer');

            // create the window if it doesn't exist already
            if (!win) {
                win = Koala.util.Chart.createTimeSeriesChartWindow(olLayer);
            }
            win.getController().createOrUpdateChart(olLayer, olFeat);

            // show the window itself
            win.show();

            return win;
        },

        /**
         * Creates a new timeseries window for the given layer.
         * @param {object} an openlayers layer object with chart config
         */
        createTimeSeriesChartWindow: function(olLayer) {
            var chartConfig = olLayer.get('timeSeriesChartProperties');
            var addFilterForm = !Ext.isEmpty(chartConfig.allowFilterForm) ?
                Koala.util.String.getBool(chartConfig.allowFilterForm) : true;

            var win = Ext.create('Koala.view.window.TimeSeriesWindow', {
                addFilterForm: addFilterForm,
                initOlLayer: olLayer
            });
            return win;
        },

        /**
         * Adds a feature to a timeseries chart.
         * @param {object} olLayer the layer upon which the chart is based
         * @param {ol.Feature} olFeat the feature to add
         * @param {Koala.view.component.D3Chart} chart the chart
         */
        addFeatureToTimeseriesChart: function(olLayer, olFeat, chart) {
            if (!olFeat) {
                return false;
            }

            var StringUtil = Koala.util.String;
            var chartConfig = olLayer.get('timeSeriesChartProperties');
            var chartController = chart.getController();
            var valFromSeq = StringUtil.getValueFromSequence;
            var stationName = '';
            var promise = new Ext.Promise(function(resolve) {
                resolve(stationName);
            });
            if (!Ext.isEmpty(chartConfig.seriesTitleTpl)) {
                promise = StringUtil.replaceTemplateStringsWithPromise(
                    chartConfig.seriesTitleTpl, olFeat
                );
            }

            promise.then(function(name) {
                var currentSeqIndex = chart.getSelectedStations().length;

                var color = valFromSeq(chartConfig.colorSequence, currentSeqIndex, '');
                if (!color) {
                    color = Koala.view.component.D3BaseController.getRandomColor();
                }
                Koala.util.Chart.addShapeToChart(chartController, chartConfig, name, olFeat, color);
            })
                .catch(function() {
                    var currentSeqIndex = chart.getSelectedStations().length;

                    var color = valFromSeq(chartConfig.colorSequence, currentSeqIndex, '');
                    if (!color) {
                        color = Koala.view.component.D3BaseController.getRandomColor();
                    }
                    Koala.util.Chart.addShapeToChart(chartController, chartConfig, '', olFeat, color);
                });
        },

        /**
         * Helper function that adds a shape to a timeseries chart.
         * @param {object} chartController the controller of the chart
         * @param {object} chartConfig chart config from the layer
         * @param {string} stationName name of the station to add
         * @param {ol.Feature} olFeat the feature of the station
         * @param {string} color the color to use
         */
        addShapeToChart: function(chartController, chartConfig, stationName, olFeat, color) {
            var coerce = Koala.util.String.coerce;
            chartController.addShape({
                type: chartConfig.shapeType || 'line',
                curve: chartConfig.curveType || 'linear',
                xField: chartConfig.xAxisAttribute,
                yField: chartConfig.yAxisAttribute,
                name: stationName,
                id: olFeat.get(chartConfig.featureIdentifyField || 'id'),
                color: color,
                opacity: coerce(chartConfig.strokeOpacity) || 1,
                width: coerce(chartConfig.strokeWidth) || 1,
                tooltipTpl: chartConfig.tooltipTpl,
                attachedSeries: chartConfig.attachedSeries
            }, olFeat, false);
        },

        /**
         * Recalculate y axis ticks. Writes to the given config object. See the
         * comment below on how this behaves.
         * @param  {Object} chartConfig the config
         * @return {Array} the array with the new tick values
         */
        recalculateAxisTicks: function(chartConfig) {
            // There are four ways and combinations of defining the ticks and
            // the min and max values on the y axis based on the chart configs
            // yAxisTicks, yAxisMin, yAxisMax and yTickValues:
            // 1. Fully automatically: If neither yAxisTicks, yAxisMin,
            // yAxisMax or yTickValues are set in the chartConfig object, the
            // min and max values are determined by the chart data and will be
            // fit into a "nice" range with a a proper count of ticks.
            // 2. Fully automatically (hinted): If yAxisTicks is set, the min
            // and max values are determined by the chart data (as above), but
            // the number of ticks will be set by the parameter. Note: The count
            // is only a hint for d3 and is just a approximate value.
            // 3. Automatic step size: If yAxisTicks, yAxisMin and yAxisMax are
            // set, the min and max axis values are rendered as given and the
            // tick count is the number of additional ticks to be set between
            // the min an max ticks.
            // 4. Fully manual: If yTickValues is given, only the ticks in
            // this parameter are shown on the axis.
            // 5. If the actual domain is bigger than the given min/max values,
            // we fall back to the fully automatically mode.

            var StringUtil = Koala.util.String;
            var yAxisTickValues;
            if (chartConfig.yAxisTicks && chartConfig.yAxisMin &&
                    chartConfig.yAxisMax) {
                var rangeMin = StringUtil.coerce(chartConfig.yAxisMin);
                var rangeMax = StringUtil.coerce(chartConfig.yAxisMax);
                var tickCnt = StringUtil.coerce(chartConfig.yAxisTicks);

                // Tick count must be greater than 0
                if (tickCnt < 0) {
                    tickCnt = 0;
                }

                // Logarithmic scales with min/max values of 0 are
                // not possible.
                if (chartConfig.yAxisScale === 'log' && (rangeMin === 0 ||
                        rangeMax === 0)) {
                    if (rangeMin === 0) {
                        rangeMin = 0.00000001;
                    }
                    if (rangeMax === 0) {
                        rangeMax = 0.00000001;
                    }
                }

                var rangeStep = Math.abs(rangeMax - rangeMin) / (tickCnt + 1);
                yAxisTickValues = d3.range(rangeMin, rangeMax + rangeStep,
                    rangeStep);
            }

            if (chartConfig.yTickValues) {
                yAxisTickValues = [];
                Ext.each(chartConfig.yTickValues.split(','), function(val) {
                    yAxisTickValues.push(StringUtil.coerce(val));
                });
            }
            return yAxisTickValues;
        }

    }

});
