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
 * @class Koala.view.panel.ElevationProfileController
 */
Ext.define('Koala.view.panel.ElevationProfileController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-elevationprofile',

    requires: [
        'BasiGX.util.Layer'
    ],

    statics: {
        xAxisBase: {
            display: true,
            orientation: 'x',
            scale: 'linear',
            labelColor: '#000000',
            format: function(val) {
                if (val === 0) {
                    return val;
                }
                return (val / 1000).toFixed(1) + '';
            }
        },
        yAxisBase: {
            display: true,
            orientation: 'y',
            scale: 'linear',
            sanitizeLabels: true,
            ticks: 5
        },
        lineBase: {
            color: '#ff0000',
            curveType: 'curveMonotoneX',
            style: {
                stroke: '#ff0000',
                fill: '#ff000077'
            },
            skipDots: true
        },
        indicatorLine: {
            id: 'routing-indicator-line',
            stroke: '#000000',
            width: 1
        },
        chartBase: {
            backgroundColor: '',
            position: [0, 10],
            shapeType: 'area'
        },
        /**
         * Get the min and max values for the given data.
         *
         * @param {Array} data Array of data entries.
         * @returns {Object} The min and max values.
         */
        getMinMax: function(data) {
            var minX = Infinity;
            var maxX = -Infinity;
            var minY = Infinity;
            var maxY = -Infinity;

            Ext.Array.forEach(data, function(d) {
                if (d[0] > maxX) {
                    maxX = d[0];
                }
                if (d[0] < minX) {
                    minX = d[0];
                }
                if (d[1] > maxY) {
                    maxY = d[1];
                }
                if (d[1] < minY) {
                    minY = d[1];
                }
            });
            return {
                minX: minX,
                maxX: maxX,
                minY: minY,
                maxY: maxY
            };
        },
        /**
         * Compares two data entries and returns the one
         * that is closest to val.
         *
         * @param {Array} d0 Single data entry.
         * @param {Array} d1 Single data entry.
         * @param {Number} val The value for comparison.
         * @returns {Array} The closer data entry.
         */
        getClosestDataPoint: function(d0, d1, val) {
            if (!d0 || !d1) {
                return;
            }

            return val - d0[0] > d1[0] - val ? d1 : d0;
        }
    },

    /**
     * Handler for the datachanged event.
     *
     * @param {Ext.data.Model} routingSummary A routing summary.
     */
    onDataChanged: function(routingSummary) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        if (!view.isVisible()) {
            return;
        }

        vm.set('routingSummary', routingSummary);
        me.createChart();
    },

    /**
     * Create the chart.
     */
    createChart: function() {
        var me = this;
        var staticMe = Koala.view.panel.ElevationProfileController;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var routingSummary = vm.get('routingSummary');

        if (!routingSummary) {
            return;
        }

        var container = view.down('[name=' + view.elevationContainerName + ']');
        if (!container) {
            return;
        }

        var data = me.mapSummaryToChart(routingSummary);
        var limits = staticMe.getMinMax(data);

        var xAxis = staticMe.xAxisBase;
        xAxis.min = limits.minX;
        xAxis.max = limits.maxX;
        xAxis.label = vm.get('xLabel');

        var yAxis = staticMe.yAxisBase;
        yAxis.min = limits.minY;
        yAxis.max = limits.maxY;
        yAxis.label = vm.get('yLabel');

        var axes = {
            x: xAxis,
            y: yAxis
        };

        var line = staticMe.lineBase;
        line.data = data;
        line.axes = ['x', 'y'];

        var containerSize = me.getContainerSize(container);
        var width = containerSize.width;
        var height = containerSize.height;

        var chart = staticMe.chartBase;
        chart.size = [width - 50, height - 20];
        chart.series = [line];
        chart.axes = axes;

        var chartComponent = new D3Util.TimeseriesComponent(chart);
        var chartRenderer = new D3Util.ChartRenderer({
            components: [chartComponent],
            size: [width, height],
            zoomType: 'none',
            onMouseMoveFunc: me.onMouseMove.bind(me, data, chartComponent, chart.position, limits)
        });
        chartRenderer.render(container.el.dom);
    },

    /**
     * Get the size of a container.
     *
     * This methods makes sure that we get the container
     * sizes as numeric values. The ways to achieve this,
     * differ between modern and classic toolkit.
     *
     * @param {Ext.Container} container The Ext container to get the size from.
     */
    getContainerSize: function(container) {
        if (!Ext.isModern) {
            return container.getSize(true);
        }

        return container.el.getSize(true);
    },

    /**
     * Clears the elevation layer.
     */
    clearElevationLayer: function() {
        var me = this;
        var view = me.getView();

        var elevationLayer;

        if (view.elevationLayerName === null || !BasiGX.util.Layer.getLayerByName(view.elevationLayerName)) {
            elevationLayer = null;
        } else {
            elevationLayer = BasiGX.util.Layer.getLayerByName(view.elevationLayerName);
        }
        elevationLayer.getSource().clear();
    },

    /**
     * Handles mouse move events on the chart.
     *
     * @param {Array} data Array of data entries.
     * @param {D3Util.TimeseriesComponent} chartComponent The elevation graph.
     * @param {Number} chartMarginLeft The left margin of the chart.
     */
    onMouseMove: function(data, chartComponent, chartMargin, limits) {
        var me = this;
        var view = me.getView();
        var staticMe = Koala.view.panel.ElevationProfileController;

        var xAxis = chartComponent.originalScales.x;
        var svg = view.down('[name=' + view.elevationContainerName + ']').el.dom.getElementsByTagName('svg')[0];
        var bisectDate = D3Util.d3.bisector(function(d) {
            return d[0];
        }).left;
        var yAxisWidth = chartComponent.calculateAxesWidth(D3Util.d3.select(svg));
        var xOffset = chartMargin[0] + yAxisWidth + 2;
        var xValCurrent = xAxis.invert(D3Util.d3.mouse(svg)[0] - xOffset);
        var idx = bisectDate(data, xValCurrent);
        var d0 = data[idx - 1];
        var d1 = data[idx];
        var d = staticMe.getClosestDataPoint(d0, d1, xValCurrent);
        if (!d) {
            me.clearElevationProfile();
        } else {
            d[2](chartComponent, d[0], limits);
        }
    },

    /**
     * Set the indicator line.
     *
     * @param {D3Util.TimeseriesComponent} chart The elevation graph.
     * @param {Number} valX The value on the x axis.
     * @param {Object} limits the min/max values for x/y.
     */
    setIndicatorLine: function(chart, valX, limits) {
        var me = this;
        var view = me.getView();
        var staticMe = Koala.view.panel.ElevationProfileController;

        var indicatorLineConfig = staticMe.indicatorLine;

        var svg = view.down('[name=' + view.elevationContainerName + ']')
            .el.dom
            .getElementsByTagName('svg')[0];

        D3Util.d3.select(svg).selectAll('#' + indicatorLineConfig.id).remove();
        var x = chart.originalScales.x;
        var y = chart.originalScales.y;

        D3Util.d3.select(svg).select('.timeseries-chart')
            .append('line')
            .attr('y1', y(limits.minY))
            .attr('y2', y(limits.maxY))
            .attr('x1', x(valX))
            .attr('x2', x(valX))
            .attr('stroke', indicatorLineConfig.stroke)
            .attr('stroke-width', indicatorLineConfig.width)
            .attr('id', indicatorLineConfig.id);
    },

    /**
     * Updates the values for the info box properties.
     *
     * @param {Object} props Object of properties to update.
     */
    updateInfoBoxValues: function(props) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var duration;
        if (props.duration) {
            var hours = Math.floor(props.duration / 60 / 60);
            var minutes = Math.floor((props.duration - (hours * 60 * 60)) / 60);
            duration = hours + ':' + minutes;
        }
        var distance;
        if (props.distance) {
            distance = (props.distance/1000).toFixed(1);
        }
        vm.set('distance', distance);
        vm.set('elevation', props.elevation ? props.elevation.toFixed(0) : undefined);
        vm.set('duration', duration);
        vm.set('showIndicatorBox', props.showIndicatorBox);
    },

    /**
     * Maps routing summary properties into the charting data structure.
     *
     * @param {Ext.data.Model} summary The routing summary.
     * @returns {Array} Array of charting data entries.
     */
    mapSummaryToChart: function(summary) {
        var me = this;
        var view = me.getView();

        var elevationLayer;

        if (view.elevationLayerName === null || !BasiGX.util.Layer.getLayerByName(view.elevationLayerName)) {
            elevationLayer = null;
        } else {
            elevationLayer = BasiGX.util.Layer.getLayerByName(view.elevationLayerName);
        }

        var map = BasiGX.view.component.Map.guess().getMap();

        var mapping = [];
        var coordinates = summary.geometry.coordinates;
        var props = summary.properties;
        var segments = props.segments;
        var distance = 0;
        var duration = 0;
        Ext.Array.forEach(segments, function(segment) {
            Ext.Array.forEach(segment.steps, function(step) {
                distance += step.distance;
                var stepDistance = distance;
                duration += step.duration;
                var stepDuration = duration;
                var type = step.type;
                var wayPoints = step.way_points;
                var wayPoint = wayPoints[0];
                var coordinate = coordinates[wayPoint];
                var elevation = coordinate[2];
                var tooltipFunc = function(chart, x, limits) {
                    var transformed = coordinate;

                    if (map) {
                        var sourceProjection = ol.proj.get('EPSG:4326');
                        var targetProjection;
                        targetProjection = map.getView().getProjection().getCode();
                        transformed = ol.proj.transform(coordinate, sourceProjection, targetProjection);
                    }

                    var feat = new ol.Feature({
                        geometry: new ol.geom.Point(transformed)
                    });
                    feat.setProperties({
                        duration: stepDuration,
                        type: type,
                        elevation: elevation,
                        distance: stepDistance
                    });

                    if (elevationLayer) {
                        var source = elevationLayer.getSource();
                        source.clear();
                        source.addFeature(feat);
                    }

                    me.setIndicatorLine(chart, x, limits);
                    me.updateInfoBoxValues(
                        Ext.Object.merge(
                            feat.getProperties(),
                            {showIndicatorBox: true}
                        )
                    );
                };

                mapping.push([
                    distance,
                    elevation,
                    tooltipFunc,
                    {
                        fill: '#00000000',
                        stroke: '#00000000'
                    }
                ]);
            });
        });
        return mapping;
    },

    /**
     * Cleanup method for the elevation profile.
     * Removes the indicator line and clears the
     * elevation layer.
     */
    clearElevationProfile: function() {
        var me = this;
        var view = me.getView();
        var staticMe = Koala.view.panel.ElevationProfileController;

        var svg = view.down('[name=' + view.elevationContainerName + ']')
            .el.dom
            .getElementsByTagName('svg')[0];

        D3Util.d3.select(svg)
            .selectAll('#' + staticMe.indicatorLine.id)
            .remove();

        me.updateInfoBoxValues({
            distance: undefined,
            elevation: undefined,
            duration: undefined,
            showIndicatorBox: false
        });

        me.clearElevationLayer();
    }
});
