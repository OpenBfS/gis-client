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
 * A utility class to handle authentication stuff.
 *
 * @class Koala.util.Authentication
 */
Ext.define('Koala.util.Chart', {

    requires: [
        'Koala.util.String'
    ],

    statics: {

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
            var currentSeqIndex = chart.getSelectedStations().length;
            var color = valFromSeq(chartConfig.colorSequence, currentSeqIndex, '');
            if (!color) {
                color = Koala.view.component.D3BaseController.getRandomColor();
            }

            promise.then(function(name) {
                Koala.util.Chart.addShapeToChart(chartController, chartConfig, name, olFeat, color);
            })
                .catch(function() {
                    Koala.util.Chart.addShapeToChart(chartController, chartConfig, '', olFeat, color);
                });
        },

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
                tooltipTpl: chartConfig.tooltipTpl
            }, olFeat, false);
        }

    }

});
