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
        'Ext.Array',
        'Ext.Object',
        'BasiGX.util.Layer',
        'BasiGX.view.component.Map',
        'Koala.util.OpenRouteService'
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
            ticks: 5,
            labelPadding: 5
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
        },

        /**
         * Create ol point features from summary.
         *
         * These point features should be used for displaying
         * on the chart. Chart data is provided in the properties
         * of each feature.
         *
         * @param {Ext.data.Model} summary The routing summary.
         * @returns {ol.Feature[]} Array of ol.Feature.
         */
        createPointFeatures: function(summary) {
            var coordinates = summary.geometry.coordinates;

            var distance = 0;
            // radius is equal to the semi-major axis of the WGS84 ellipsoid
            // see also https://openlayers.org/en/v4.6.5/apidoc/ol.Sphere.html
            var sphere = new ol.Sphere(6378137);

            var pointFeatures = [];
            Ext.Array.each(summary.properties.segments, function(segment) {
                Ext.Array.each(segment.steps, function(step) {
                    var start = step.way_points[0];
                    var end = step.way_points[1];

                    for (var i=start; i<end; i++) {
                        var coordinate = coordinates[i];

                        if (i !== 0) {
                            // distance in meters
                            distance += sphere.haversineDistance(coordinates[i - 1], coordinate);
                        }
                        var stepDistance = distance;

                        var properties = {
                            distance: stepDistance,
                            elevation: coordinate[2]
                        };

                        var feat = new ol.Feature({
                            geometry: new ol.geom.Point(coordinate)
                        });

                        feat.setProperties(properties);
                        pointFeatures.push(feat);
                    }
                });
            });
            return pointFeatures;
        }
    },

    /**
     * Handler for the datachanged event.
     *
     * @param {Ext.data.Model} routingSummary A routing summary.
     */
    onDataChanged: function(routingSummary) {
        var me = this;
        var staticMe = Koala.view.panel.ElevationProfileController;
        var view = me.getView();
        var vm = view.lookupViewModel();

        if (!view.isVisible()) {
            return;
        }

        vm.set('routingSummary', routingSummary);
        // Always reset to elevation when data changes
        vm.set('displayAttribute', 'elevation');
        var pointFeatures = staticMe.createPointFeatures(routingSummary);
        vm.set('pointFeatures', pointFeatures);
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

        var pointFeatures = vm.get('pointFeatures');

        if (!pointFeatures) {
            return;
        }

        var displayAttribute = vm.get('displayAttribute');

        var container = view.down('[name=' + view.elevationContainerName + ']');
        if (!container) {
            return;
        }

        var data = me.mapDataForAttribute(pointFeatures, displayAttribute);
        var limits = staticMe.getMinMax(data);

        var xAxis = staticMe.xAxisBase;
        xAxis.min = limits.minX;
        xAxis.max = limits.maxX;
        xAxis.label = vm.get('xLabel');

        var yAxis = staticMe.yAxisBase;
        yAxis.min = limits.minY;
        yAxis.max = limits.maxY;
        yAxis.label = displayAttribute;

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
        chart.size = [width - 50 - yAxis.labelPadding, height - 20];
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

        var distance;
        if (props.distance) {
            distance = (props.distance/1000).toFixed(1);
        }
        var displayAttribute = vm.get('displayAttribute');
        var val = props[displayAttribute];

        vm.set('distance', distance);
        vm.set('displayValue', val);
        vm.set('showIndicatorBox', props.showIndicatorBox);
    },

    /**
     * Map the data for given attribute.
     *
     * This maps the ol point features to the structure that
     * is required for charting. The values of each feature under
     * the given attribute name will be displayed on the y-axis.
     *
     * @param {ol.Feature[]} pointFeatures The point features to visualize.
     * @param {String} attr The name of the attribute to visualize on the y-axis.
     * @returns {Array[]} List of charting data points.
     */
    mapDataForAttribute: function(pointFeatures, attr) {
        var me = this;
        return Ext.Array.map(pointFeatures, function(feat) {
            var tooltipFunc = me.createTooltipFunc(feat);
            return [
                feat.get('distance'),
                feat.get(attr),
                tooltipFunc,
                {
                    fill: '#00000000',
                    stroke: '#00000000'
                }
            ];
        });
    },

    /**
     * Create a tooltip function for an ol point feature.
     *
     * @param {ol.Feature} feat The ol feature.
     * @returns {Function} The tooltip function for the given feature.
     */
    createTooltipFunc: function(feat) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var vm = view.lookupViewModel();

        var elevationLayer;

        if (view.elevationLayerName === null || !BasiGX.util.Layer.getLayerByName(view.elevationLayerName)) {
            elevationLayer = null;
        } else {
            elevationLayer = BasiGX.util.Layer.getLayerByName(view.elevationLayerName);
        }

        var map = BasiGX.view.component.Map.guess().getMap();

        return function(chart, x, limits) {
            var featClone = feat.clone();
            if (map) {
                var sourceProjection = ol.proj.get('EPSG:4326');
                var targetProjection;
                targetProjection = map.getView().getProjection().getCode();
                featClone.getGeometry().transform(sourceProjection, targetProjection);
            }
            if (elevationLayer) {
                var source = elevationLayer.getSource();
                var style = elevationLayer.getStyle();
                if (Ext.isArray(style)) {
                    var OpenRouteService = Koala.util.OpenRouteService;
                    var profile = vm.get('routingSummary').profile;
                    var profileIcon = OpenRouteService.getUnicodeFromProfile(profile);
                    style[style.length - 1].getText().setText(profileIcon);
                }
                source.clear();
                source.addFeature(featClone);
            }

            me.setIndicatorLine(chart, x, limits);
            me.updateInfoBoxValues(
                Ext.Object.merge(
                    featClone.getProperties(),
                    {showIndicatorBox: true}
                )
            );
        };
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
            showIndicatorBox: false
        });

        me.clearElevationLayer();
    },

    /**
     * Change the data that is displayed on the
     * y-axis of the graph.
     *
     * If layerName is provided, the property with key
     * 'propKey' will be merged on the routing layer.
     * The merged data will be cached, so for each layer property
     * this will only be done once.
     *
     * layerName can be omitted to display properties of the
     * original route.
     *
     * @param {String} propKey The name of the property to display.
     * @param {String} layerName The name of the layer.
     */
    changeGraph: function(propKey, layerName) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        view.setLoading(true);

        var vm = view.lookupViewModel();

        var shouldMergeLayers = true;
        var featurePropKey = propKey;

        if (layerName) {
            featurePropKey = layerName + '.' + propKey;
        }

        if (vm.get('displayAttribute') === featurePropKey) {
            shouldMergeLayers = false;
        }

        var pointFeatures = vm.get('pointFeatures');
        var featureProps = Ext.Object.getKeys(pointFeatures[0].getProperties());
        if (Ext.Array.contains(featureProps, featurePropKey) || !layerName) {
            shouldMergeLayers = false;
        }

        // Unfortunately, a zero-second timeout is needed to make sure
        // the loading mask is rendered before the window freezes due
        // to me.mergeLayer()
        window.setTimeout(function() {
            if (shouldMergeLayers) {
                var joinedPoints = me.mergeLayer(layerName, propKey, featurePropKey, pointFeatures);
                vm.set('pointFeatures', joinedPoints);
            }

            vm.set('displayAttribute', featurePropKey);
            me.createChart();

            view.setLoading(false);
        }, 0);
    },

    /**
     * Merge the layer property to the routing points.
     *
     * @param {String} layerName Name of the layer to get property from.
     * @param {String} propKey Name of the property to merge.
     * @param {String} featurePropKey Name of the property on routing points.
     * @param {ol.Feature[]} pointFeatures Routing points.
     * @returns {ol.Feature[]} Routing points with merged property.
     */
    mergeLayer: function(layerName, propKey, featurePropKey, pointFeatures) {
        var map = BasiGX.view.component.Map.guess().getMap();
        if (!map) {
            return;
        }

        var mergeLayer = BasiGX.util.Layer.getLayerByName(layerName);
        var features = mergeLayer.getSource().getFeatures();
        var sourceProjection = map.getView().getProjection();

        var format = new ol.format.GeoJSON();

        var mergeLayerJson = format.writeFeaturesObject(features, {
            featureProjection: sourceProjection
        });

        var pointFeaturesJson = format.writeFeaturesObject(pointFeatures, {
            featureProjection: 'EPSG:4326'
        });
        var taggedJson = turf.tag(pointFeaturesJson, mergeLayerJson, propKey, featurePropKey);

        return format.readFeatures(taggedJson);
    },

    /**
     * Redraw the chart if the container will be resized.
     */
    handleResize: function() {
        var me = this;
        var view = me.getView();

        if (!view.isVisible()) {
            return;
        }

        me.createChart();
    }
});
