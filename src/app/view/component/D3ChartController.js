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
 * @class Koala.view.component.D3ChartController
 */
Ext.define('Koala.view.component.D3ChartController', {
    extend: 'Koala.view.component.D3BaseController',
    alias: 'controller.component-d3chart',

    /**
     *
     */
    scales: {},
    shapes: [],
    attachedSeriesVisibleById: {},
    axes: {},
    gridAxes: {},
    tooltipCmp: null,
    zoomInteraction: null,
    initialPlotTransform: null,
    data: {},
    gridFeatures: null,
    /**
     * Contains the DateValues of the charts current zoom extent.
     * @type {Object}
     */
    currentDateRange: {
        min: null,
        max: null
    },

    /**
     * Whether the chart is actually being rendered.
     *
     * @type {Boolean}
     */
    chartRendered: false,

    /**
     * An object that holds all requests we issue for fetching series data. It
     * is keyed by the id of a selectedStation. We need this in order to be able
     * to manually abort pending requests in the case of repeatedly adding
     * series.
     *
     * It is filled in #getChartDataForStation, updated once any data request
     * finishes and fully emptied in #getChartData via #abortPendingRequests.
     *
     * @type {Object}
     */
    ajaxRequests: {},

    /**
     * A counter for all our data requests. Increased in #getChartDataForStation
     * and reset in #getChartData. Once all expected chart data has arrived, we
     * set #chartDataAvailable to true and fire #chartdataprepared.
     * @type {Number}
     */
    ajaxCounter: 0,

    /**
     * Whether all data requests have finished and the chart data is actually
     * available.
     *
     * @type {Boolean}
     */
    chartDataAvailable: false,

    /**
     * Boolean flag that indicates if the key that should zoom the y-axis
     * is currently pressed.
     */
    zoomYAxisBtnPressed: false,

    /**
     * Fired once all chart data is available from the data requests.
     *
     * @event chartdataprepared
     */

    /**
     * Called on initialize event. Only used in modern toolkit.
     *
     * @private
     */
    onInitialize: function() {
        var me = this;
        me.onBoxReady();
    },

    /**
     *
     */
    drawChart: function() {
        var me = this;

        me.currentDateRange = {
            min: null,
            max: null
        };
        me.createInteractions();
        me.drawSvgContainer();
        me.drawLegendContainer();

        me.createScales();
        me.createAxes();
        me.createGridAxes();
        me.createShapes();
        me.createTooltip();
        me.createAttachedSeriesAxes();

        me.setDomainForScales();

        me.drawTitle();
        me.drawAxes();
        me.drawAttachedSeriesAxis();
        me.drawGridAxes();
        me.drawShapes();
        me.registerKeyboardHandler(me);

        var promise = this.resolveDynamicTemplateUrls()
            .then(function() {
                me.drawLegend();
                me.chartRendered = true;
            });

        if (promise.catch) {
            promise.catch(function() {
                me.drawLegend();
                me.chartRendered = true;
            });
        }

        me.recalculatePositionsAndVisibility();
    },

    /**
     *
     */
    redrawChart: function() {
        var me = this;

        if (me.chartRendered && (me.chartDataAvailable ||
            me.getView().getConfig().alwaysRenderChart)) {
            // Reset the shapes and scales
            me.shapes = [];
            me.scales = {};

            me.updateSvgContainerSize();

            me.deleteShapeContainerSvg();

            me.createScales();
            me.createAxes();
            me.createGridAxes();
            me.createShapes();
            me.createAttachedSeriesAxes();

            me.setDomainForScales();

            me.redrawTitle();
            me.redrawAxes();
            me.redrawAttachedSeriesAxes();
            me.redrawGridAxes();
            me.drawShapes();
            me.updateLegendContainerPosition();
            me.redrawLegend();

            // Reset the zoom to the initial extent
            me.resetZoom();
            me.recalculatePositionsAndVisibility();
        }
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
    addShape: function(shapeConfig, selectedStation, allowDupes) {
        var me = this;
        var view = me.getView();
        var added = false;
        allowDupes = Ext.isDefined(allowDupes) ? allowDupes : false;

        if (allowDupes === true || !me.containsStation(selectedStation)) {
            view.getSelectedStations().push(selectedStation);
            view.getShapes().push(shapeConfig);
            // update the chart to reflect the changes
            me.getChartData();
            added = true;
        }

        return added;
    },

    /**
     * [createInteractions description]
     * @return {[type]} [description]
     */
    createInteractions: function() {
        this.zoomInteraction = this.createZoomInteraction();
    },

    setDomainForScale: function(axis, scale, orient, config) {
        var me = this;
        // solution with min and max
        var axisDomain;
        var makeDomainNice = true;
        var min;
        var max;

        if (Ext.isDefined(axis.min)) {
            min = Koala.util.String.coerce(axis.min);
            makeDomainNice = false; // if one was given, don't auto-enhance
        }
        if (Ext.isDefined(axis.max)) {
            max = Koala.util.String.coerce(axis.max);
            makeDomainNice = false; // if one was given, don't auto-enhance
        }

        // We have to check if min and max make sense in relation to
        // the scale; 0 doesn't make sense if scale is logarithmic
        if (axis.scale === 'log' && (min === 0 || max === 0 || !min || !max)) {
            Ext.log.warn('Correcting min/max value for y-axis as' +
                ' logarithmic scales don\'t work with 0');
            if (min === 0 || !min) {
                min = 0.00000001;
            }
            if (max === 0 || !max) {
                max = 0.00000001;
            }
        }

        if (Ext.isDefined(min) && Ext.isDefined(max)) {
            // We're basically done for this axis, both min and max were
            // given. We need to iterate over the data nonetheless, so as to
            // extend the minimim and maximum in case of outliers.
            axisDomain = [min, max];
        }

        Ext.each(this.shapes, function(shape) {
            var data = me.data[shape.config.id];

            var extent = d3.extent(data, function(d) {
                var val = d[axis.dataIndex];
                if (d.drawAsZero && orient === 'left') {
                    val = d.minValue;
                }
                return val;
            });

            if (!axisDomain) {
                // first iteration / shape
                axisDomain = [extent[0], extent[1]];
            } else {
                // any other run, take the new min and max if they are
                // actually bigger or smaller.
                // This may lead to the fact that configured min/may values
                // do *not* take precedence, which is intended
                axisDomain[0] = Math.min(extent[0], axisDomain[0]);
                axisDomain[1] = Math.max(extent[1], axisDomain[1]);
                // TODO once we have this for xAxis, we need to be more
                //      verbose here…
                // TODO double check that Math.min also works for dates,
                //      first checks look good, though.
            }
        });

        if (max && max < axisDomain[1] && orient === 'left') {
            var ticks = Koala.util.Chart.recalculateAxisTicks(axis);
            axis.tickValues = ticks;
            if (ticks) {
                axis.ticks = ticks.length;
            }
        }

        //limit chart data to 80% of chart height
        if (axisDomain && (orient !== 'bottom') && (!Ext.isDefined(axis.max) || (Ext.isDefined(axis.max) && (axisDomain[1] > axis.max)))) {
            axisDomain[1] = axisDomain[1]/0.8;
        }
        if (orient === 'bottom' && config.useExactInterval) {
            axisDomain[0] = me.getView().getStartDate();
            axisDomain[1] = me.getView().getEndDate();
        }

        if (!axisDomain || isNaN(axisDomain[0])) {
            axisDomain = [0, 1];
        }

        // actually set the domain
        var domain = scale.domain(axisDomain);
        if (makeDomainNice) {
            domain.nice();
        }
    },

    /**
     * Sets the domain for each scale in the chart by the use of the extent of
     * the given input data values.
     */
    setDomainForScales: function() {
        var me = this;
        var view = me.getView();

        // iterate over all scales/axis orientations and all shapes to find the
        // corresponding data index for each scale. Set the extent (max/min range
        // in this data index) for each scale.
        Ext.iterate(me.scales, function(orient) {
            var axis = view.getAxes()[orient];
            var config = me.getView().getConfig();
            var scale = me.scales[orient];
            me.setDomainForScale(axis, scale, orient, config);
        });
    },

    /**
     * Draws the root <svg>-element into the <div>-element rendered by the Ext
     * component.
     */
    drawSvgContainer: function() {
        var me = this;
        var view = me.getView();
        var viewId = '#' + view.getId();

        me.callParent();

        // register zoom interaction if requested
        if (view.getZoomEnabled()) {
            var plot = d3.select(viewId + ' svg');
            plot.call(me.zoomInteraction);
        }
    },

    /**
     * [createZoomInteraction description]
     * @return {[type]} [description]
     */
    createZoomInteraction: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var CSS = staticMe.CSS_CLASS;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var gridConfig = view.getGrid();
        var chartSize = me.getChartSize();

        return d3.zoom()
            .scaleExtent([1, 200])
            .translateExtent([[0, 0], [chartSize[0], chartSize[1]]])
            .extent([[0, 0], [chartSize[0], chartSize[1]]])
            .on('zoom', function() {
                var transform = d3.event.transform;
                var shapeGroupSelectorTpl = viewId + ' .' + CSS.SHAPE_GROUP +
                        '[idx=' + CSS.PREFIX_IDX_SHAPE_GROUP + '{0}]';

                var allAxes = [];
                Ext.iterate(me.axes, function(orient, axis) {
                    allAxes.push({
                        axis: axis,
                        scale: me.scales[orient],
                        orient: orient
                    });
                });
                Ext.iterate(me.attachedSeriesAxes, function(axis, idx) {
                    allAxes.push({
                        axis: axis,
                        scale: me.attachedSeriesScales[idx],
                        orient: 'left',
                        attachedSeriesIndex: idx + 1
                    });
                });

                Ext.each(allAxes, function(axisConf) {
                    var axis;
                    var axisSelector = viewId + ' svg g.' + CSS.AXIS;
                    var axisGenerator = axisConf.axis;
                    var scaleGenerator = axisConf.scale;
                    var orient = axisConf.orient;

                    if (orient === 'top' || orient === 'bottom') {
                        axis = d3.select(axisSelector + '.' + CSS.AXIS_X);
                        var scaleX = transform.rescaleX(scaleGenerator);
                        var all = me.shapes.slice();
                        all = all.concat(me.attachedSeriesShapes);

                        Ext.each(all, function(shape) {
                            var shapeId = shape.config.id;
                            var attachedSeriesNumber = shape.config.attachedSeriesNumber;
                            if (attachedSeriesNumber) {
                                shapeId = shapeId + '_' + attachedSeriesNumber;
                            }
                            var shapePathSelector = Ext.String.format(shapeGroupSelectorTpl, shapeId) +
                                    ' .' + CSS.SHAPE_PATH;
                            var shapePointsSelector = Ext.String.format(shapeGroupSelectorTpl, shapeId) +
                                    ' .' + CSS.SHAPE_POINT_GROUP + ' circle';
                            var shapeRectsSelector = Ext.String.format(shapeGroupSelectorTpl, shapeId) +
                                    ' .' + CSS.SHAPE_POINT_GROUP + ' rect';
                            var shapePolygonsSelector = Ext.String.format(shapeGroupSelectorTpl, shapeId) +
                                    ' .' + CSS.SHAPE_POINT_GROUP + ' svg';

                            d3.select(shapePathSelector)
                                .attr('d', shape.shape.x(function(d) {
                                    var val = d[shape.config.xField];
                                    if (!val) {
                                        return null;
                                    }
                                    return scaleX(d[shape.config.xField]);
                                }));

                            d3.selectAll(shapePointsSelector)
                                .attr('cx', function(d) {
                                    var val = d[shape.config.xField];
                                    if (!val) {
                                        return null;
                                    }
                                    return scaleX(val);
                                });
                            d3.selectAll(shapeRectsSelector)
                                .filter(function(d) {
                                    return Ext.isDefined(d.style) && d.style.type === 'rect';
                                })
                                .attr('x', function(d) {
                                    var val = d[shape.config.xField];
                                    if (!val) {
                                        return null;
                                    }
                                    if (d.style && d.style.width) {
                                        var w = Koala.util.String.coerce(d.style.width);
                                        if (Ext.isNumber(w)) {
                                            return scaleX(val) - w / 2;
                                        }
                                    }
                                    return scaleX(val);
                                });
                            d3.selectAll(shapePolygonsSelector)
                                .filter(function(d) {
                                    return Ext.isDefined(d.style) && d.style.type === 'star';
                                })
                                .attr('x', function(d) {
                                    var val = d[shape.config.xField];
                                    if (!val) {
                                        return null;
                                    }
                                    if (d.style && d.style.radius) {
                                        var w = Koala.util.String.coerce(d.style.radius);
                                        if (Ext.isNumber(w)) {
                                            return scaleX(val) - w;
                                        }
                                    }
                                    return scaleX(val);
                                });
                        });

                        axis.call(axisGenerator.scale(scaleX));

                        me.currentDateRange.min = scaleX.invert(0);
                        var chartWidth = me.getChartSize()[0];
                        me.currentDateRange.max = scaleX.invert(chartWidth);

                        if (view.getAxes()[orient].rotateXAxisLabel) {
                            d3.selectAll(viewId + ' .' + CSS.AXIS + '.' + CSS.AXIS_X + ' > g > text')
                                .attr('transform', 'rotate(-55)')
                                .attr('dx', '-10px')
                                .attr('dy', '1px')
                                .style('text-anchor', 'end');
                        }

                    } else if (me.zoomYAxisBtnPressed && (orient === 'left' || orient === 'right')) {
                        var curSelector = axisSelector + '.' + CSS.AXIS_Y;
                        if (axisConf.attachedSeriesIndex !== undefined) {
                            curSelector += '_' + axisConf.attachedSeriesIndex;
                        }
                        axis = d3.select(curSelector);
                        var scaleY = transform.rescaleY(scaleGenerator);

                        all = me.shapes.slice();
                        all = all.concat(me.attachedSeriesShapes);

                        Ext.each(all, function(shape) {
                            var shapeId = shape.config.id;
                            var attachedSeriesNumber = shape.config.attachedSeriesNumber;
                            if (attachedSeriesNumber) {
                                shapeId = shapeId + '_' + attachedSeriesNumber;
                            }

                            var shapePathSelector = Ext.String.format(shapeGroupSelectorTpl, shapeId) +
                                    ' .' + CSS.SHAPE_PATH;
                            var shapePointsSelector = Ext.String.format(shapeGroupSelectorTpl, shapeId) +
                                    ' .' + CSS.SHAPE_POINT_GROUP + ' circle';
                            var shapeRectsSelector = Ext.String.format(shapeGroupSelectorTpl, shapeId) +
                                    ' .' + CSS.SHAPE_POINT_GROUP + ' rect';
                            var shapePolygonsSelector = Ext.String.format(shapeGroupSelectorTpl, shapeId) +
                                    ' .' + CSS.SHAPE_POINT_GROUP + ' svg';

                            d3.select(shapePathSelector)
                                .attr('d', shape.shape.y(function(d) {
                                    var val = d[shape.config.yField];
                                    if (!val) {
                                        return null;
                                    }
                                    if (d.drawAsZero) {
                                        val = d.minValue;
                                    }
                                    return scaleY(val);
                                }));

                            d3.selectAll(shapePointsSelector)
                                .attr('cy', function(d) {
                                    var val = d[shape.config.yField];
                                    if (!val) {
                                        return null;
                                    }
                                    if (d.drawAsZero) {
                                        val = d.minValue;
                                    }
                                    return scaleY(val);
                                });
                            d3.selectAll(shapeRectsSelector)
                                .filter(function(d) {
                                    return Ext.isDefined(d.style) && d.style.type === 'rect';
                                })
                                .attr('y', function(d) {
                                    var val = d[shape.config.yField];
                                    if (!val) {
                                        return null;
                                    }
                                    if (d.style && d.style.height) {
                                        var h = Koala.util.String.coerce(d.style.height);
                                        if (Ext.isNumber(h)) {
                                            return scaleY(val) - h / 2;
                                        }
                                    }
                                    return scaleY(val);
                                });
                            d3.selectAll(shapePolygonsSelector)
                                .filter(function(d) {
                                    return Ext.isDefined(d.style) && d.style.type === 'star';
                                })
                                .attr('y', function(d) {
                                    var val = d[shape.config.yField];
                                    if (!val) {
                                        return null;
                                    }
                                    if (d.style && d.style.radius) {
                                        var w = Koala.util.String.coerce(d.style.radius);
                                        if (Ext.isNumber(w)) {
                                            return scaleY(val) - w;
                                        }
                                    }
                                    return scaleY(val);
                                });
                        });

                        axis.call(axisGenerator.scale(scaleY));

                        if (view.getAxes()[orient].rotateYAxisLabel) {
                            d3.selectAll(viewId + ' .' + CSS.AXIS + '.' + CSS.AXIS_Y + ' > g > text')
                                .attr('transform', 'rotate(-55)')
                                .attr('dx', '-10px')
                                .attr('dy', '1px')
                                .style('text-anchor', 'end');
                        }
                    }
                });

                if (gridConfig.show) {
                    Ext.iterate(me.gridAxes, function(orient) {
                        var axis;
                        var axisSelector = 'svg g.' + CSS.GRID;
                        var axisGenerator = me.gridAxes[orient];
                        var scaleGenerator = me.scales[orient];

                        if (orient === 'top' || orient === 'bottom') {
                            axis = d3.select(axisSelector + '.' + CSS.GRID_X);
                            axis.call(axisGenerator.scale(
                                d3.event.transform.rescaleX(scaleGenerator)));
                        } else if (me.zoomYAxisBtnPressed &&
                          (orient === 'left' || orient === 'right')) {
                            axis = d3.select(axisSelector + '.' + CSS.GRID_Y);
                            axis.call(axisGenerator.scale(
                                d3.event.transform.rescaleY(scaleGenerator)));
                        }
                    });

                    d3.selectAll(viewId + ' svg g.' + CSS.GRID + ' line')
                        .style('stroke-width', gridConfig.width || 1)
                        .style('stroke', gridConfig.color || '#d3d3d3')
                        .style('stroke-opacity', gridConfig.opacity || 0.7);
                }
            });
    },

    /**
     * Zoom to another time interval on the x axis.
     * @param  {moment} d0 left boundary
     * @param  {moment} d1 right boundary
     */
    zoomToInterval: function(d0, d1) {
        var me = this;
        var chartId = '#' + me.getView().getId() + ' svg';
        var svg = d3.select(chartId);
        var width = me.getChartSize()[0];
        var x = me.scales['bottom'];
        svg.call(me.zoomInteraction)
            .call(me.zoomInteraction.transform, d3.zoomIdentity
                .scale(width / (x(d1) - x(d0)))
                .translate(-x(d0), 0)
            );
    },

    createShape: function(shapeType, curveType, xField, yField, normalizeX, normalizeY, chartSize) {
        var staticMe = Koala.view.component.D3ChartController;

        var shape = shapeType()
            // set the curve interpolator
            .curve(curveType)
            .defined(function(d) {
                return Ext.isDefined(d[xField]);
            })
            // set the x accessor
            .x(function(d) {
                return normalizeX(d[xField]);
            });

        if (shapeType === staticMe.TYPE.line) {
            shape
                // set the y accessor
                .y(function(d) {
                    var val = d[yField];
                    if (d.drawAsZero) {
                        val = d.minValue;
                    }
                    return normalizeY(val);
                });
        }

        if (shapeType === staticMe.TYPE.area) {
            shape
                .y1(function(d) {
                    return normalizeY(d[yField]);
                })
                .y0(chartSize[1]);
        }

        return shape;
    },

    /**
     *
     */
    createShapes: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var view = me.getView();
        var chartSize = me.getChartSize();

        // Start from scratch, we'll assign new shapes below.
        // Alternatively we could reuse the `shape`, if we detect that
        // it already exists in the `shapes` array.
        me.shapes = [];
        me.attachedSeriesShapes = [];

        Ext.each(view.getShapes(), function(shapeConfig) {
            var shapeType = staticMe.TYPE[shapeConfig.type || 'line'];
            var curveType = staticMe.CURVE[shapeConfig.curve || 'linear'];
            var xField = shapeConfig.xField;
            var yField = shapeConfig.yField;
            var orientX = me.getAxisByField(xField);
            var orientY = me.getAxisByField(yField);
            var normalizeX = me.scales[orientX];
            var normalizeY = me.scales[orientY];
            var shape;

            var attachedSeries = shapeConfig.attachedSeries ?
                JSON.parse(shapeConfig.attachedSeries) : [];

            if (shapeType) {
                shape = me.createShape(shapeType, curveType, xField, yField, normalizeX, normalizeY, chartSize);
            }

            var shapeObj = {
                config: shapeConfig,
                shape: shape
            };
            me.shapes.push(shapeObj);
            if (!me.attachedSeriesVisibleById[shapeConfig.id]) {
                me.attachedSeriesVisibleById[shapeConfig.id] = [];
            }

            var idx = 0;
            Ext.each(attachedSeries, function(config) {
                shapeConfig = Ext.clone(shapeConfig);
                shapeConfig.color = config.color;
                shapeConfig.yField = config.yAxisAttribute;
                shapeConfig.orientY = 'left';
                shapeConfig.attachedSeriesNumber = ++idx;
                shape = me.createShape(shapeType, curveType, xField, config.yAxisAttribute, normalizeX, normalizeY, chartSize);
                me.attachedSeriesShapes.push({
                    config: shapeConfig,
                    shape: shape
                });
            });
        });
    },

    /**
     *
     */
    getAxisByField: function(field) {
        var view = this.getView();
        var axisOrientation = 'left';

        Ext.iterate(view.getAxes(), function(orient, axisConfig) {
            if (axisConfig.dataIndex === field) {
                axisOrientation = orient;
                return false; // break early
            }
        });

        return axisOrientation;
    },

    /**
     *
     */
    drawShapes: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var makeTranslate = staticMe.makeTranslate;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var chartSize = me.getChartSize();
        var barWidth;

        var metadata = view.getConfig().targetLayer.metadata;
        var series = Koala.util.Object.getPathStrOr(
            metadata,
            'layerConfig/timeSeriesChartProperties/attachedSeries',
            '[]'
        );
        series = JSON.parse(series);
        var totalOffset = 0;
        Ext.each(series, function(s) {
            totalOffset += s.axisWidth || 40;
        });

        // Wrap the shapes in its own <svg> element.
        var shapeSvg = d3.select(viewId + ' svg > g')
            .append('g')
            .attr('transform', makeTranslate(totalOffset, 0))
            .attr('class', 'k-d3-shape-container')
            .append('svg')
            .attr('top', 0)
            .attr('left', 0)
            .attr('width', chartSize[0])
            .attr('height', chartSize[1])
            .attr('viewBox', '0 0 ' + chartSize[0] + ' ' + chartSize[1]);

        var minx = Number.POSITIVE_INFINITY;
        var maxx = Number.NEGATIVE_INFINITY;
        var all = [];
        all = all.concat(this.shapes);
        Ext.each(this.attachedSeriesShapes, function(shapes) {
            all = all.concat(shapes);
        });

        Ext.each(all, function(shape, idx) {
            var shapeConfig = shape.config;
            var xField = shapeConfig.xField;
            var yField = shapeConfig.yField;
            var orientX = me.getAxisByField(xField);
            var orientY = me.getAxisByField(yField);
            var color = me.customColors[idx] || shapeConfig.color || staticMe.getRandomColor();
            var darkerColor = d3.color(color).darker();
            var shapeId = shapeConfig.id;
            var attachedSeriesNumber = shapeConfig.attachedSeriesNumber;
            var index = shapeId;
            if (attachedSeriesNumber) {
                index += '_' + attachedSeriesNumber;
            }

            var classes = staticMe.CSS_CLASS.SHAPE_GROUP;
            if (attachedSeriesNumber && !me.attachedSeriesVisibleById[shapeId][attachedSeriesNumber-1]) {
                classes += ' k-d3-hidden';
            }

            var shapeGroup = shapeSvg
                .append('g')
                .attr('class', classes)
                .attr('idx', staticMe.CSS_CLASS.PREFIX_IDX_SHAPE_GROUP +
                    index)
                .attr('shape-type', shapeConfig.type);

            if (shapeConfig.type === 'bar') {
                barWidth = (chartSize[0] / me.data[shapeId].length);
                barWidth -= staticMe.ADDITIONAL_BAR_MARGIN;
                shapeGroup
                    .selectAll('rect')
                    .data(me.data[shapeId])
                    .enter().append('rect')
                    .filter(function(d) {
                        var val = d[xField];
                        if (val && val._isAMomentObject) {
                            val = val.unix() * 1000;
                        }

                        if (val) {
                            minx = Math.min(minx, val);
                            maxx = Math.max(maxx, val);
                        }
                        return Ext.isDefined(d[yField]);
                    })
                    .style('fill', color)
                    .style('opacity', shapeConfig.opacity)
                    .attr('x', function(d) {
                        return me.scales[orientX](d[xField]);
                    })
                    .attr('y', function(d) {
                        return me.scales[orientY](d[yField]);
                    })
                    .attr('transform', 'translate(' + ((barWidth / 2) * -1) + ', 0)')
                    .attr('width', barWidth)
                    .attr('height', function(d) {
                        return chartSize[1] - me.scales[orientY](d[yField]);
                    })
                    .on('mouseover', function() {
                        var tooltipCmp = me.tooltipCmp;
                        var tooltipTpl = shapeConfig.tooltipTpl;
                        var chartProps = view.getTargetLayer().get('timeSeriesChartProperties');

                        var selectedStation = Ext.Array.findBy(me.getView().getSelectedStations(), function(station) {
                            return station.get(chartProps.featureIdentifyField || 'id') === shapeId;
                        });

                        var html = Koala.util.String.replaceTemplateStrings(tooltipTpl, selectedStation);
                        tooltipCmp.setHtml(html);
                        tooltipCmp.setTarget(this);
                        tooltipCmp.show();
                    });
                shapeGroup.selectAll('text')
                    .data(me.data[shapeId])
                    .enter()
                    .append('text')
                    .filter(function(d) {
                        var cy = me.scales[orientY](d[yField]);
                        return Ext.isDefined(d[yField]) && Ext.isNumber(cy);
                    })
                    .text(function(d) {
                        return d[yField];
                    })
                    .attr('transform', function(d) {
                        var x = me.scales[orientX](d[xField]);
                        var y = me.scales[orientY](d[yField]);
                        return 'rotate(-90,' + x + ',' + y + ') translate(-15,15)';
                    })
                    .attr('x', function(d) {
                        return me.scales[orientX](d[xField]);
                    })
                    .attr('y', function(d) {
                        return me.scales[orientY](d[yField]);
                    })
                    .attr('text-anchor', 'middle')
                    .style('font-family', 'sans-serif')
                    .style('font-size', '11px')
                    .style('font-weight', 'bold')
                    .style('fill', 'white')
                    .style('unselectable', 'on');
            } else {
                shapeGroup.append('path')
                    .attr('class', staticMe.CSS_CLASS.SHAPE_PATH)
                    .attr('idx', staticMe.CSS_CLASS.PREFIX_IDX_SHAPE_PATH +
                        index)
                    .datum(me.data[shapeId])
                    .style('fill', function() {
                        switch (shapeConfig.type) {
                            case 'line':
                                return 'none';
                            case 'area':
                                return color;
                        }
                    })
                    .style('stroke', function() {
                        switch (shapeConfig.type) {
                            case 'line':
                                return color;
                            case 'area':
                                return 'none';
                        }
                    })
                    .style('stroke-width', function() {
                        switch (shapeConfig.type) {
                            case 'line':
                                return shapeConfig.width;
                            case 'area':
                                return 0;
                        }
                    })
                    .style('stroke-opacity', shapeConfig.opacity)
                    .attr('d', shape.shape);

                var pointGroup = shapeGroup.append('g')
                    .attr('class', staticMe.CSS_CLASS.SHAPE_POINT_GROUP)
                    .attr('idx', staticMe.CSS_CLASS.PREFIX_IDX_SHAPE_POINT_GROUP +
                        index);

                // handle the style-type 'circle' or, if no style was given,
                // use circles as default
                pointGroup.selectAll('circle')
                    .data(me.data[shapeId])
                    .enter().append('circle')
                    .filter(function(d) {
                        var val = d[xField];
                        if (val && val._isAMomentObject) {
                            val = val.unix() * 1000;
                        }

                        if (val) {
                            minx = Math.min(minx, val);
                            maxx = Math.max(maxx, val);
                        }

                        var cy = me.scales[orientY](d[yField]);
                        return Ext.isDefined(d[yField]) && Ext.isNumber(cy) &&
                            ((Ext.isDefined(d.style) && d.style.type === 'circle') || !Ext.isDefined(d.style));
                    })
                    .style('fill', color)
                    .style('stroke', darkerColor)
                    .style('stroke-width', 2)
                    .on('mouseover', function(data) {
                        var tooltipCmp = me.tooltipCmp;
                        var tooltipTpl = shapeConfig.tooltipTpl;
                        var chartProps = me.getView().getTargetLayer()
                            .get('timeSeriesChartProperties');

                        var selectedStation = Ext.Array.findBy(me.getView().getSelectedStations(), function(station) {
                            return station.get(chartProps.featureIdentifyField || 'id') === shapeId;
                        });

                        var tooltipData = Ext.clone(data);
                        if (Koala.Application.isUtc()) {
                            tooltipData[xField] = Koala.util.Date.addUtcOffset(tooltipData[xField]);
                        }

                        var html = Koala.util.String.replaceTemplateStrings(tooltipTpl, tooltipData);
                        html = Koala.util.String.replaceTemplateStrings(html, selectedStation);
                        tooltipCmp.setHtml(html);
                        tooltipCmp.setTarget(this);
                        tooltipCmp.show();
                    })
                    .attr('cx', function(d) {
                        return me.scales[orientX](d[xField]);
                    })
                    .attr('cy', function(d) {
                        var val = d[yField];
                        if (d.drawAsZero) {
                            val = d.minValue;
                        }
                        return me.scales[orientY](val);
                    })
                    .attr('r', function(d) {
                        if (d.style && d.style.radius) {
                            var r = Koala.util.String.coerce(d.style.radius);
                            if (Ext.isNumber(r)) {
                                return r;
                            }
                        }
                        return 3;
                    });

                // handle the style-type 'rect'
                pointGroup.selectAll('rect')
                    .data(me.data[shapeId])
                    .enter().append('rect')
                    .filter(function(d) {
                        var val = d[xField];
                        if (val && val._isAMomentObject) {
                            val = val.unix() * 1000;
                        }
                        if (val) {
                            minx = Math.min(minx, val);
                            maxx = Math.max(maxx, val);
                        }

                        var cy = me.scales[orientY](d[yField]);
                        return Ext.isDefined(d[yField]) && Ext.isNumber(cy) &&
                            (Ext.isDefined(d.style) && d.style.type === 'rect');
                    })
                    .style('fill', color)
                    .style('stroke', darkerColor)
                    .style('stroke-width', 2)
                    .on('mouseover', function(data) {
                        var tooltipCmp = me.tooltipCmp;
                        var tooltipTpl = shapeConfig.tooltipTpl;
                        var chartProps = me.getView().getTargetLayer()
                            .get('timeSeriesChartProperties');

                        var selectedStation = Ext.Array.findBy(me.getView().getSelectedStations(), function(station) {
                            return station.get(chartProps.featureIdentifyField || 'id') === shapeId;
                        });

                        var tooltipData = Ext.clone(data);
                        if (Koala.Application.isUtc()) {
                            tooltipData[xField] = Koala.util.Date.addUtcOffset(tooltipData[xField]);
                        }

                        var html = Koala.util.String.replaceTemplateStrings(tooltipTpl, tooltipData);
                        html = Koala.util.String.replaceTemplateStrings(html, selectedStation);
                        tooltipCmp.setHtml(html);
                        tooltipCmp.setTarget(this);
                        tooltipCmp.show();
                    })
                    .attr('x', function(d) {
                        if (d.style && d.style.width) {
                            var w = Koala.util.String.coerce(d.style.width);
                            if (Ext.isNumber(w)) {
                                return me.scales[orientX](d[xField]) - w / 2;
                            }
                        }
                        return me.scales[orientX](d[xField]) - 5;
                    })
                    .attr('y', function(d) {
                        if (d.style && d.style.height) {
                            var h = Koala.util.String.coerce(d.style.height);
                            if (Ext.isNumber(h)) {
                                return me.scales[orientY](d[yField]) - h / 2;
                            }
                        }
                        return me.scales[orientY](d[yField]) - 5;
                    })
                    .attr('width', function(d) {
                        if (d.style && d.style.width) {
                            var w = Koala.util.String.coerce(d.style.width);
                            if (Ext.isNumber(w)) {
                                return w;
                            }
                        }
                        return 10;
                    })
                    .attr('height', function(d) {
                        if (d.style && d.style.height) {
                            var h = Koala.util.String.coerce(d.style.height);
                            if (Ext.isNumber(h)) {
                                return h;
                            }
                        }
                        return 10;
                    });

                // handle the style-type 'star'
                pointGroup.selectAll('polygon')
                    .data(me.data[shapeId]).enter()
                    .filter(function(d) {
                        var val = d[xField];
                        if (val && val._isAMomentObject) {
                            val = val.unix() * 1000;
                        }
                        if (val) {
                            minx = Math.min(minx, val);
                            maxx = Math.max(maxx, val);
                        }

                        var cy = me.scales[orientY](d[yField]);
                        return Ext.isDefined(d[yField]) && Ext.isNumber(cy) &&
                            (Ext.isDefined(d.style) && d.style.type === 'star');
                    })
                    .append('svg')
                    .attr('x', function(d) {
                        if (d.style && d.style.radius) {
                            var w = Koala.util.String.coerce(d.style.radius);
                            if (Ext.isNumber(w)) {
                                return me.scales[orientX](d[xField]) - w;
                            }
                        }
                        return me.scales[orientX](d[xField]) - 5;
                    })
                    .attr('y', function(d) {
                        if (d.style && d.style.radius) {
                            var h = Koala.util.String.coerce(d.style.radius);
                            if (Ext.isNumber(h)) {
                                return me.scales[orientY](d[yField]) - h;
                            }
                        }
                        return me.scales[orientY](d[yField]) - 5;
                    })
                    .attr('width', function(d) {
                        if (d.style && d.style.radius) {
                            var w = Koala.util.String.coerce(d.style.radius);
                            if (Ext.isNumber(w)) {
                                return w * 2;
                            }
                        }
                        return 10;
                    })
                    .attr('height', function(d) {
                        if (d.style && d.style.radius) {
                            var h = Koala.util.String.coerce(d.style.radius);
                            if (Ext.isNumber(h)) {
                                return h * 2;
                            }
                        }
                        return 10;
                    })
                    .append('polygon')
                    .style('fill', color)
                    .style('stroke', darkerColor)
                    .style('stroke-width', 2)
                    .on('mouseover', function(data) {
                        var tooltipCmp = me.tooltipCmp;
                        var tooltipTpl = shapeConfig.tooltipTpl;
                        var chartProps = me.getView().getTargetLayer()
                            .get('timeSeriesChartProperties');

                        var selectedStation = Ext.Array.findBy(me.getView().getSelectedStations(), function(station) {
                            return station.get(chartProps.featureIdentifyField || 'id') === shapeId;
                        });

                        var tooltipData = Ext.clone(data);
                        if (Koala.Application.isUtc()) {
                            tooltipData[xField] = Koala.util.Date.addUtcOffset(tooltipData[xField]);
                        }

                        var html = Koala.util.String.replaceTemplateStrings(tooltipTpl, tooltipData);
                        html = Koala.util.String.replaceTemplateStrings(html, selectedStation);
                        tooltipCmp.setHtml(html);
                        tooltipCmp.setTarget(this);
                        tooltipCmp.show();
                    })
                    .attr('points', function(d) {
                        // inspired by http://svgdiscovery.com/C02/create-svg-star-polygon.htm
                        var radius = 10;
                        var sides = 5;
                        if (d.style && d.style.radius) {
                            var r = Koala.util.String.coerce(d.style.radius);
                            if (Ext.isNumber(r)) {
                                radius = r;
                            }
                        }
                        if (d.style && d.style.sides) {
                            var s = Koala.util.String.coerce(d.style.sides);
                            if (Ext.isNumber(s)) {
                                sides = s;
                            }
                        }
                        var theta = Math.PI * 2 / sides;
                        var x = radius;
                        var y = radius;
                        var star = '';
                        for (var i = 0; i < sides; i++) {
                            var k = i + 1;
                            var sineAngle = Math.sin(theta * k);
                            var cosineAngle = Math.cos(theta * k);
                            var x1 = radius / 2 * sineAngle + x;
                            var y1 = radius / 2 * cosineAngle + y;
                            var sineAngleAlpha = Math.sin(theta * k + 0.5 * theta);
                            var cosineAngleAlpha = Math.cos(theta * k + 0.5 * theta);
                            var x2 = radius * sineAngleAlpha + x;
                            var y2 = radius * cosineAngleAlpha + y;

                            star += x1 + ',' + y1 + ' ';
                            star += x2 + ',' + y2 + ' ';
                        }
                        return star;
                    });
            }

        });

        if (barWidth !== undefined) {
            me.initialPlotTransform = {
                x: (barWidth / 2),
                y: 0,
                k: 1
            };
            me.transformPlot(me.initialPlotTransform, 0);
        }

        var config = this.view.getTargetLayer().get('timeSeriesChartProperties');
        this.drawThresholds(config, shapeSvg, minx, maxx, this.scales.bottom, this.scales.left);
    },

    /**
     * Register keyboard handler to detect keypress
     */
    registerKeyboardHandler: function(me) {

        d3.select(window).on('keydown', function() {
            if (d3.event.shiftKey) {
                d3.event.preventDefault();
                d3.event.stopPropagation();
                me.zoomYAxisBtnPressed = true;
            }
        });
        d3.select(window).on('keyup', function() {
            me.zoomYAxisBtnPressed = d3.event.shiftKey;
        });
    },

    /**
     * [transformPlot description]
     * @return {[type]} [description]
     */
    transformPlot: function(transform, duration) {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var CSS = staticMe.CSS_CLASS;
        var viewId = '#' + me.getView().getId();
        var plot = d3.select(viewId + ' svg rect.' + CSS.PLOT_BACKGROUND);

        if (!me.zoomInteraction) {
            return;
        }

        if (duration && duration > 0) {
            plot
                .transition()
                .duration(duration)
                .call(
                    me.zoomInteraction.transform,
                    d3.zoomIdentity
                        .translate(transform.x, transform.y)
                        .scale(transform.k)
                );
        } else {
            plot
                .call(
                    me.zoomInteraction.transform,
                    d3.zoomIdentity
                        .translate(transform.x, transform.y)
                        .scale(transform.k)
                );
        }
    },

    /**
     * Reset the zoom status to the initial zoom (after changing the data).
     */
    resetZoom: function() {
        var me = this;
        var viewId = '#' + me.getView().getId();
        var plot = d3.select(viewId + ' svg');
        var bak = this.zoomYAxisBtnPressed;
        this.zoomYAxisBtnPressed = true;
        this.zoomInteraction.scaleTo(plot, 1);
        this.zoomYAxisBtnPressed = bak;
    },

    resolveDynamicTemplateUrls: function() {
        var view = this.getView();
        var StringUtil = Koala.util.String;
        var replace = StringUtil.replaceTemplateStringsWithPromise;
        var config = view.getConfig().targetLayer.get('timeSeriesChartProperties');
        var promises = [];
        var stations = view.getSelectedStations();

        Ext.each(this.shapes, function(shape, idx) {
            var name = shape.config.name;

            if (Ext.String.startsWith(name, 'featureurl:')) {
                var promise = replace(config.seriesTitleTpl, stations[idx]);
                promises.push(promise);
                promise.then(function(response) {
                    shape.config.name = response.responseText;
                })
                    .catch(function() {
                        shape.config.name = '';
                    });
            }
        });

        return Ext.Promise.all(promises);
    },

    /**
     *
     */
    drawLegend: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var makeTranslate = staticMe.makeTranslate;
        var CSS = staticMe.CSS_CLASS;
        var SVG_DEFS = staticMe.SVG_DEFS;
        var view = me.getView();
        var legendConfig = view.getLegend();
        var legendMargin = legendConfig.legendMargin;
        var legendEntryHeight = me.legendEntryTargetHeight;
        var legendParent = me.legendSvg;
        var curTranslateY;
        var legend = legendParent
            .append('g')
            .attr('class', CSS.SHAPE_GROUP + CSS.SUFFIX_LEGEND)
            .attr('transform', makeTranslate(legendMargin.left || 10, 0));

        me.updateLegendContainerDimensions();

        Ext.each(me.shapes, function(shape, idx) {
            var shapeId = shape.config.id;
            var toggleVisibilityFunc = (function() {
                return function() {
                    var target = d3.select(d3.event.target);
                    if (target && (target.classed(CSS.DELETE_ICON) ||
                            target.classed(CSS.DOWNLOAD_ICON) ||
                            target.classed(CSS.COLOR_ICON))) {
                        // click happened on the delete icon, no visibility
                        // toggling. The deletion is handled in an own event
                        // handler
                        return;
                    }
                    var shapeGroup = me.shapeGroupById(shapeId);
                    me.toggleGroupVisibility(
                        shapeGroup, // the real group, containig shapepath & points
                        d3.select(this) // legend entry
                    );
                };
            }());

            curTranslateY = (idx + 1) * legendEntryHeight;
            var legendEntry = legend
                .append('g')
                .on('click', toggleVisibilityFunc)
                .attr('transform', staticMe.makeTranslate(0, curTranslateY))
                .attr('idx', CSS.PREFIX_IDX_LEGEND_GROUP + shapeId);
            legendEntry.on('contextmenu', me.getContextmenuFunction(shape));

            // background for the concrete legend icon, to widen clickable area.
            legendEntry.append('path')
                .attr('d', SVG_DEFS.LEGEND_ICON_BACKGROUND)
                .style('stroke', 'none')
                // invisible, but still triggering events
                .style('fill', 'rgba(0,0,0,0)');

            legendEntry.append('path')
                .attr('d', function() {
                    var typeUppercase = shape.config.type.toUpperCase();
                    return SVG_DEFS['LEGEND_ICON_' + typeUppercase];
                })
                .style('stroke', function() {
                    switch (shape.config.type) {
                        case 'line':
                            return me.customColors[idx] || shape.config.color;
                        default:
                            return 'none';
                    }
                })
                .style('stroke-width', function() {
                    switch (shape.config.type) {
                        case 'line':
                            return shape.config.width;
                        default:
                            return 0;
                    }
                })
                .style('fill', function() {
                    switch (shape.config.type) {
                        case 'line':
                            return 'none';
                        default:
                            return me.customColors[idx] || shape.config.color;
                    }
                });

            var nameAsTooltip = shape.config.name;
            var visualLabel = staticMe.labelEnsureMaxLength(
                nameAsTooltip, (legendConfig.legendEntryMaxLength || 15)
            );

            legendEntry.append('text')
                .text(visualLabel)
                .attr('text-anchor', 'start')
                .attr('dy', '0')
                .attr('dx', '25');

            legendEntry.append('title')
                .text(nameAsTooltip);

            var targetLayer = view.getTargetLayer();
            var allowDownload = Koala.util.Object.getPathStrOr(
                targetLayer,
                'metadata/layerConfig/olProperties/allowDownload',
                true
            );
            allowDownload = Koala.util.String.coerce(allowDownload);

            if (!Ext.isModern && allowDownload) {
                legendEntry.append('text')
                // fa-save from FontAwesome, see http://fontawesome.io/cheatsheet/
                    .text('')
                    .attr('class', CSS.DOWNLOAD_ICON)
                    .attr('text-anchor', 'start')
                    .attr('dy', '1')
                    .attr('dx', '130') // TODO Discuss, do we need this dynamically?
                    .on('click', me.generateDownloadCallback(shape));
            }

            legendEntry.append('text')
                // fa-paint-brush from FontAwesome, see http://fontawesome.io/cheatsheet/
                .text('\uf1fc')
                .attr('class', CSS.COLOR_ICON)
                .attr('text-anchor', 'start')
                .attr('dy', '1')
                .attr('dx', '150') // TODO Discuss, do we need this dynamically?
                .on('click', me.generateColorCallback(shape, idx));

            legendEntry.append('text')
                // ✖ from FontAwesome, see http://fontawesome.io/cheatsheet/
                .text('')
                .attr('class', CSS.DELETE_ICON)
                .attr('text-anchor', 'start')
                .attr('dy', '1')
                .attr('dx', '170') // TODO Discuss, do we need this dynamically?
                .on('click', me.generateDeleteCallback(shape));

        });

        var config = this.view.getTargetLayer().get('timeSeriesChartProperties');
        this.drawThresholdLegends(config, legend, curTranslateY);
    },

    /**
     * Get the legend entry contextmenu callback function.
     * @param  {Object} shape the shape the contextmenu callback is for.
     * @return {function}       the callback that might show the attached series
     * contextmenu if attached series are configured.
     */
    getContextmenuFunction: function(shape) {
        var me = this;
        return function() {
            d3.event.preventDefault();
            if (shape.config.attachedSeries) {
                var series = JSON.parse(shape.config.attachedSeries);
                var items = [];
                Ext.each(series, function(config, index) {
                    var visible = me.attachedSeriesVisibleById[shape.config.id][index];
                    items.push({
                        xtype: 'menucheckitem',
                        text: config.dspUnit,
                        checked: visible,
                        listeners: {
                            'checkchange': function(_, checked) {
                                me.attachedSeriesVisibleById[shape.config.id][index] = checked;
                                var sel = '[idx=shape-group-' + shape.config.id +
                                    '_' + (index + 1) + ']';
                                d3.select(sel).classed('k-d3-hidden', !checked);
                                me.recalculatePositionsAndVisibility();
                            }
                        }
                    });
                });
                if (items.length > 0) {
                    var menu = Ext.create('Ext.menu.Menu', {
                        items: items
                    });
                    menu.showAt(d3.event.clientX, d3.event.clientY);
                }
            }
        };
    },

    /**
     * Downloads the current visibile data for this series.
     *
     * @param {Object} dataObj The config object of the selected Series.
     */
    downloadSeries: function(dataObj) {
        var me = this;
        var viewModel = me.getViewModel();

        var win = Ext.create('Ext.window.Window', {
            title: viewModel.get('downloadChartDataMsgTitle'),
            name: 'downloaddatawin',
            width: 300,
            layout: 'fit',
            bodyPadding: 10,
            items: [{
                xtype: 'container',
                items: [{
                    padding: '10px 0',
                    html: viewModel.get('downloadChartDataMsgMessage')
                },{
                    xtype: 'combo',
                    width: '100%',
                    fieldLabel: viewModel.get('outputFormatText'),
                    value: 'application/json',
                    forceSelection: true,
                    store: [
                        ['gml3','gml'],
                        ['csv','csv'],
                        ['application/json','json']
                    ]
                }]
            }],
            bbar: [{
                text: viewModel.get('downloadChartDataMsgButtonYes'),
                name: 'confirm-timeseries-download',
                handler: me.doWfsDownload.bind(me, dataObj)
            }, {
                text: viewModel.get('downloadChartDataMsgButtonNo'),
                name: 'abort-timeseries-download',
                handler: function() {
                    this.up('window').close();
                }
            }]
        });
        win.show();
    },

    /**
     * Executes the WFS-Request and starts the real download on success.
     *
     * @param {Object} dataObj The config object of the selected Series.
     * @param {Ext.button.Button} btn The button we clicked on.
     */
    doWfsDownload: function(dataObj, btn) {
        var me = this;
        var stationId = dataObj.config.id;
        var win = btn.up('window');
        var combo = win.down('combo');
        var view = this.getView();
        var allSelectedStations = view.getSelectedStations();
        var requestUrl = me.getChartDataRequestUrl();
        var chartProps = view.getTargetLayer()
            .get('timeSeriesChartProperties');
        var feat = Ext.Array.findBy(allSelectedStations, function(station) {
            return station.get(chartProps.featureIdentifyField || 'id') === stationId;
        });
        var requestParams = me.getChartDataRequestParams(feat, true);

        var format = combo.getValue();
        var layerName = this.getView().config.name.replace(' ','_');
        var fileEnding = combo.getSelectedRecord().get('field2');
        requestParams.outputFormat = format;

        Ext.Ajax.request({
            method: 'GET',
            url: requestUrl,
            params: requestParams,
            success: function(response) {
                var fileName = stationId + '_' + layerName + '.' + fileEnding;

                // Use the download library to enforce a browser download.
                download(response.responseText, fileName, format);
                win.close();
            },
            failure: function(response) {
                Ext.log.warn('Download Error: ', response);
            }
        });
    },


    /**
     *
     */
    deleteEverything: function(dataObj) {
        var id = dataObj.config.id;
        var me = this;
        // ShapeConfig
        me.deleteShapeConfig(id);
        // Data
        me.deleteData(id);
        // selectedStation
        me.deleteSelectedStation(id);
        // Shape
        me.deleteShapeSeriesById(id);
        // Legend
        me.deleteLegendEntry(id);
        // …now redraw the chart
        me.redrawChart();
    },

    /**
     *
     */
    deleteShapeConfig: function(shapeId) {
        var shapeConfigs = this.getView().getShapes();
        var shapeConfigToRemove = Ext.Array.findBy(shapeConfigs, function(shapeConfig) {
            return shapeConfig.id === shapeId;
        });
        Ext.Array.remove(shapeConfigs, shapeConfigToRemove);

        var attachedShapeConfigsToRemove = [];
        Ext.each(this.attachedSeriesShapes, function(shape) {
            if (shape.config.id === shapeId) {
                attachedShapeConfigsToRemove.push(shape);
            }
        });
        Ext.Array.remove(this.attachedSeriesShapes, attachedShapeConfigsToRemove);
    },

    /**
     *
     */
    deleteData: function(shapeId) {
        delete this.data[shapeId];
    },

    /**
     *
     */
    deleteSelectedStation: function(shapeId) {
        var view = this.getView();
        var stations = view.getSelectedStations();
        var chartProps = view.getTargetLayer().get('timeSeriesChartProperties');
        var stationToRemove = Ext.Array.findBy(stations, function(station) {
            return station.get(chartProps.featureIdentifyField || 'id') === shapeId;
        });
        Ext.Array.remove(stations, stationToRemove);
    },

    /**
     * Removes the shape series specified by the given `idx`. Will remove the
     * SVG node and the entry in our internal dataset.
     *
     * @param {Number} id The id of the shape config.
     */
    deleteShapeSeriesById: function(id) {
        var me = this;
        var shapeToRemove = Ext.Array.findBy(me.shapes, function(shape) {
            return shape.config.id === id;
        });
        Ext.Array.remove(me.shapes, shapeToRemove);
        var shapeGroupNode = me.shapeGroupById(id).node();
        if (shapeGroupNode && shapeGroupNode.parentNode) {
            shapeGroupNode.parentNode.removeChild(shapeGroupNode);
        }
    },

    /**
     *
     */
    shapeGroupById: function(id) {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var viewId = '#' + me.getView().getId();
        var clsShapeGroup = staticMe.CSS_CLASS.SHAPE_GROUP;
        var idxVal = staticMe.CSS_CLASS.PREFIX_IDX_SHAPE_GROUP + id;
        var selector = [
            viewId, // only capture our view…
            ' svg g.' + clsShapeGroup, // only capture shapepaths…
            '[idx="' + idxVal + '"]' // only capture the right index
        ].join('');
        return d3.select(selector);
    },

    /**
     *
     */
    getChartData: function() {
        var me = this;
        var view = me.getView();
        if (view.getShowLoadMask() && view.getSelectedStations().length > 0) {
            view.setLoading(true);
        }

        me.data = {};
        me.chartDataAvailable = false;
        me.abortPendingRequests();

        Ext.each(view.getSelectedStations(), function(station) {
            me.getChartDataForStation(station);
        });
    },

    /**
     * Aborts any loading requests in our internal pending requests object and
     * resets both #ajaxRequests and #ajaxCounter.
     */
    abortPendingRequests: function() {
        var me = this;
        Ext.iterate(me.ajaxRequests, function(id, ajaxRequest) {
            if (ajaxRequest && ajaxRequest.isLoading()) {
                ajaxRequest.abort();
            }
        });
        me.ajaxRequests = {};
        me.ajaxCounter = 0;
    },

    /**
     * TODO gettestdatafilter and set to request URL // CQL ticket #1578
     */
    getChartDataForStation: function(selectedStation) {
        var me = this;
        var layer = selectedStation.get('layer');
        var chartProperties = layer.get('timeSeriesChartProperties');

        // The id of the selected station is also the key in the pending
        // requests object.
        var stationId = selectedStation.get(chartProperties.featureIdentifyField || 'id');

        // Store the actual request object, so we are able to abort it if we are
        // called faster than the response arrives.
        var ajaxRequest = me.getChartDataRequest(
            selectedStation,
            me.onChartDataRequestCallback,
            me.onChartDataRequestSuccess,
            me.onChartDataRequestFailure,
            me
        );

        // Put the current request into our storage for possible abortion.
        me.ajaxRequests[stationId] = ajaxRequest;
    },

    /**
     * Returns the request params for a given station.
     *
     * @param {ol.Feature} station The station to build the request for.
     * @param {Boolean} useCurrentZoom Whether to use the currentZoom of the
     *                                 chart or not. Default is false.
     * @return {Object} The request object.
     */
    getChartDataRequestParams: function(station, useCurrentZoom) {
        var me = this;
        var view = me.getView();
        var targetLayer = view.getTargetLayer();
        var chartConfig = targetLayer.get('timeSeriesChartProperties');
        var startDate = view.getStartDate();
        var endDate = view.getEndDate();
        var filterConfig = Koala.util.Filter.getStartEndFilterFromMetadata(
            targetLayer.metadata);
        var timeField = filterConfig.parameter;
        var startString = startDate.toISOString();
        var endString = endDate.toISOString();

        if (useCurrentZoom === true && me.currentDateRange.min &&
                me.currentDateRange.max) {
            startString = moment.utc(me.currentDateRange.min).toISOString();
            endString = moment.utc(me.currentDateRange.max).toISOString();
        }

        // Get the viewparams configured for the layer
        var layerViewParams = Koala.util.Object.getPathStrOr(
            targetLayer, 'metadata/layerConfig/olProperties/param_viewparams', '');

        // Get the request params configured for the chart
        var paramConfig = Koala.util.Object.getConfigByPrefix(
            chartConfig, 'param_', true);

        // Merge the layer viewparams to the chart params
        paramConfig.viewparams = paramConfig.viewparams
            ? paramConfig.viewparams + ';' + layerViewParams
            : layerViewParams;

        // Replace all template strings
        Ext.iterate(paramConfig, function(k, v) {
            paramConfig[k] = Koala.util.String.replaceTemplateStrings(
                v, station);
        });

        var requestParams = {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: chartConfig.dataFeatureType,
            outputFormat: 'application/json',
            filter: me.getWfsFilter(station, startString, endString, timeField),
            sortBy: timeField
        };

        Ext.apply(requestParams, paramConfig);
        return requestParams;
    },

    /**
     * Returns the WFS url of the current charting target layer.
     *
     * @return {String} The WFS url.
     */
    getChartDataRequestUrl: function() {
        var me = this;
        var view = me.getView();
        var targetLayer = view.getTargetLayer();
        var requestUrl = Koala.util.Object.getPathStrOr(targetLayer,
            'metadata/layerConfig/wfs/url');

        return requestUrl;
    },

    /**
     * Returns the Ext.Ajax.request for requesting the chart data.
     *
     * @param {ol.Feature} station The ol.Feature to build the request function
     *                             for. Required.
     * @param {Function} cbSuccess The function to be called on success. Optional.
     * @param {Function} cbFailure The function to be called on failure. Optional.
     * @param {Function} cbScope The callback function to be called on
     *                           success and failure. Optional.
     * @return {Ext.Ajax.request} The request function.
     */
    getChartDataRequest: function(station, cbFn, cbSuccess, cbFailure, cbScope) {
        var me = this;

        if (!(station instanceof ol.Feature)) {
            Ext.log.warn('No valid ol.Feature given.');
            return;
        }

        var ajaxRequest = Ext.Ajax.request({
            method: 'GET',
            url: me.getChartDataRequestUrl(),
            params: me.getChartDataRequestParams(station),
            callback: function() {
                if (Ext.isFunction(cbFn)) {
                    cbFn.call(cbScope, station);
                }
            },
            success: function(response) {
                if (Ext.isFunction(cbSuccess)) {
                    cbSuccess.call(cbScope, response, station);
                }
            },
            failure: function(response) {
                if (Ext.isFunction(cbFailure)) {
                    cbFailure.call(cbScope, response, station);
                }
            }
        });

        return ajaxRequest;
    },

    /**
     * The default callback handler for chart data requests.
     *
     * @param {ol.Feature} station The station the corresponding request was
     *                             send for.
     */
    onChartDataRequestCallback: function(station) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var chartProps = view.getTargetLayer().get('timeSeriesChartProperties');

        // The id of the selected station is also the key in the pending
        // requests object.
        var stationId = station.get(chartProps.featureIdentifyField || 'id');

        // Called for both success and failure, this will delete the
        // entry in the pending requests object.
        if (stationId in me.ajaxRequests) {
            delete me.ajaxRequests[stationId];
        }
    },

    /**
     * Returns the normalized interval based on the time filter attributes
     * (interval and units) of the current target layer.
     *
     * @return {Integer} The normalized interval.
     */
    getIntervalInSecondsForTargetLayer: function() {
        var me = this;
        var view = me.getView();
        var targetLayer = view.getTargetLayer();

        // TODO refactor this gathering of the needed filter attribute
        var filters = targetLayer.metadata.filters;
        var timeFilter;
        var intervalInSeconds;

        Ext.each(filters, function(filter) {
            var fType = (filter && filter.type) || '';
            if (fType === 'timerange' || fType === 'pointintime' || fType === 'rodostime') {
                timeFilter = filter;
                return false;
            }
        });

        if (!timeFilter) {
            Ext.log.warn('Failed to determine a time filter');
        }

        // don't accidently overwrite the configured filter…
        timeFilter = Ext.clone(timeFilter);

        intervalInSeconds = me.getIntervalInSeconds(
            timeFilter.interval, timeFilter.unit
        );

        return intervalInSeconds;
    },

    /**
     * Function to be called on request success.
     *
     * @param {Object} reponse The response object.
     * @param {ol.Feature} station The station the corresponding request was
     *                             send for.
     */
    onChartDataRequestSuccess: function(response, station) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var targetLayer = view.getTargetLayer();
        var startDate = view.getStartDate().clone();
        var endDate = view.getEndDate().clone();
        var chartConfig = targetLayer.get('timeSeriesChartProperties');
        var xAxisAttr = chartConfig.xAxisAttribute;
        var yAxisAttr = chartConfig.yAxisAttribute;
        var valueField = chartConfig.yAxisAttribute;
        var attachedSeries = chartConfig.attachedSeries ?
            JSON.parse(chartConfig.attachedSeries) : [];
        var featureStyle;
        var jsonObj;

        if (chartConfig.featureStyle) {
            try {
                featureStyle = JSON.parse(chartConfig.featureStyle);
            } catch (e) {
                Ext.log.error('Error on parsing the featureStyle');
            }
        }

        if (response && response.responseText) {
            try {
                jsonObj = Ext.decode(response.responseText);
            } catch (err) {
                Ext.log.error('Could not parse the response: ', err);
                return false;
            }
        }
        //used for grid table in CartoWindowController
        me.gridFeatures = Ext.clone(jsonObj.features);

        var filterConfig = Koala.util.Filter.getStartEndFilterFromMetadata(
            targetLayer.metadata);
        var timeField = filterConfig.parameter;
        var intervalInSeconds = me.getIntervalInSecondsForTargetLayer();
        var snapObject = me.getTimeStampSnapObject(
            startDate, intervalInSeconds, jsonObj.features, timeField);

        // The id of the selected station is also the key in the pending
        // requests object.
        //TODO: response shouldnt be restricted on id
        var stationId = station.get(chartConfig.featureIdentifyField || 'id');

        var compareableDate;
        var matchingFeature;
        var seriesData = [];

        var firstDiffSeconds;
        if (jsonObj.features[0]) {
            var startSeconds = startDate.unix();
            var firstFeatDate = Koala.util.Date.getUtcMoment(jsonObj.features[0].properties[xAxisAttr]);
            var firstFeatSeconds = firstFeatDate.unix();
            firstDiffSeconds = Math.abs(firstFeatSeconds - startSeconds);
        }

        function valueExtractor(rawData, feature) {
            return function(config) {
                rawData[config.yAxisAttribute] =
                    feature.properties[config.yAxisAttribute];
            };
        }

        // Iterate until startDate <= endDate
        while (startDate.diff(endDate) <= 0) {
            var newRawData = {};

            compareableDate = startDate.unix() + firstDiffSeconds;
            matchingFeature = snapObject[compareableDate];

            if (matchingFeature) {
                newRawData[xAxisAttr] = Koala.util.Date.getUtcMoment(matchingFeature.properties[xAxisAttr]);

                me.chartDataAvailable = true;
                if (matchingFeature.properties.value_constraint === '<' &&
                    !view.getShowIdentificationThresholdData()) {
                    newRawData.drawAsZero = true;
                    newRawData.minValue = chartConfig.yAxis_minimum;
                }
                newRawData[valueField] = matchingFeature.properties[yAxisAttr];
                Ext.each(attachedSeries, valueExtractor(newRawData, matchingFeature));

                if (featureStyle) {
                    newRawData = me.appendStyleToShape(
                        featureStyle, matchingFeature, newRawData);
                }

                seriesData.push(newRawData);
            } else {
                seriesData.push({});
            }
            startDate.add(intervalInSeconds, 'seconds');
        }

        me.data[stationId] = seriesData;

        me.ajaxCounter++;

        if (me.ajaxCounter === view.getSelectedStations().length) {
            if (view.getShowLoadMask()) {
                view.setLoading(false);
            }
            me.fireEvent('chartdataprepared');
        }
    },

    /**
     * Appends a possible given featurestyle to the chart shape
     * @param {Object} featureStyle The featureStyle object.
     * @param {ol.Feature} matchingFeature The matchingFeature.
     * @param {Object} newRawData The rawData object the style will get appended to.
     */
    appendStyleToShape: function(featureStyle, matchingFeature, newRawData) {
        Ext.each(featureStyle, function(style) {
            var val = matchingFeature.properties[style.attribute];
            if (val) {
                val = Koala.util.String.coerce(val);
                var styleVal = Koala.util.String.coerce(style.value);
                var op = style.operator;
                var min;
                var max;
                if (Ext.isString(styleVal)) {
                    var split = styleVal.split(',');
                    if (split.length === 2) {
                        min = split[0];
                        max = split[1];
                    }
                }
                if ((op === 'eq' && val === styleVal) ||
                    (op === 'ne' && val !== styleVal) ||
                    (op === 'gt' && val > styleVal) ||
                    (op === 'lt' && val < styleVal) ||
                    (op === 'lte' && val <= styleVal) ||
                    (op === 'gte' && val >= styleVal) ||
                    (op === 'between' && min && max && val >= min && val <= max)) {
                    newRawData.style = style.style;
                    return false;
                }
            }
        }, this);
        return newRawData;
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
    getTimeStampSnapObject: function(startDate, intervalInSeconds, features,
        xAxisAttr) {
        var obj = {};

        Ext.each(features, function(feat) {
            // Dates in features are always in UTC, `new Date` seems to be
            // respecting the format
            var featDate = Koala.util.Date.getUtcMoment(feat.properties[xAxisAttr]);

            var featDateSeconds = featDate.unix();

            obj[featDateSeconds] = feat;
        });

        return obj;
    },

    /**
     * Normalize interval and unit to seconds.
     *
     * @param interval {Integer}
     * @param unit {String["seconds", "minutes", "hours", "days"]}
     */
    getIntervalInSeconds: function(interval, unit) {
        var multiplier = 0;

        switch (unit.toLowerCase()) {
            case 'seconds':
                multiplier = 1;
                break;
            case 'minutes':
                multiplier = 60;
                break;
            case 'hours':
                multiplier = 3600;
                break;
            case 'days':
                multiplier = 86400;
                break;
            default:
                break;
        }
        return multiplier * interval;
    },

    /**
     * Get an OGC WFS-Filter for the ChartData. It adds a timeRangeFilter
     * and an additional value-filter for rodosLayer.
     *
     * @param {ol.Feature} station The clicked feature.
     * @param {String} startString ISO 8601 representation of the startDate.
     * @param {String} endString ISO 8601 representation of the endDate.
     * @param {String} timeField The field which contains the date information.
     * @return {String} The xml representation of the OGC WFS-Filter.
     */
    getWfsFilter: function(station, startString, endString, timeField) {
        var me = this;
        var view = me.getView();
        var layer = view.getTargetLayer();
        var chartingMetadata = layer.get('timeSeriesChartProperties');
        var identifyField = chartingMetadata.featureIdentifyField || 'id';
        var timeRangeFilter = me.getPropertyIsBetweenFilter(
            startString, endString, timeField);
        var propertyFilter;
        var rodosProperty = Koala.util.Object.getPathStrOr(layer.metadata,
            'layerConfig/olProperties/rodosLayer', false);
        var isRodosLayer = Koala.util.String.coerce(rodosProperty);
        if (isRodosLayer) {
            propertyFilter = me.getPropertyIsEqualToFilter(identifyField,
                station.get(identifyField));
        }

        var filter = '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
        if (Ext.isString(timeRangeFilter) && Ext.isString(propertyFilter)) {
            filter += '<And>';
            filter += timeRangeFilter;
            filter += propertyFilter;
            filter += '</And>';
        } else if (timeRangeFilter) {
            filter += timeRangeFilter;
        } else if (propertyFilter) {
            filter += propertyFilter;
        }
        filter += '</Filter>';
        return filter;
    },

    /**
     * Get an OGC 'PropertyIsBetween' WFS-Filter for the ChartData.
     *
     * @param {String} lowerBoundary The lowerBoundary of the filter.
     * @param {String} upperBoundary The upperBoundary of the filter.
     * @param {String} field The field on which the filter should look.
     * @return {String} The xml representation of the OGC 'PropertyIsBetween'
     *                  WFS-Filter.
     */
    getPropertyIsBetweenFilter: function(lowerBoundary, upperBoundary, field) {
        var filter = '' +
            '<PropertyIsBetween>' +
                '<PropertyName>' + field + '</PropertyName>' +
                    '<LowerBoundary>'+
                    '<Literal>' + lowerBoundary + '</Literal>' +
                '</LowerBoundary>' +
                '<UpperBoundary>' +
                    '<Literal>' + upperBoundary + '</Literal>' +
                '</UpperBoundary>' +
            '</PropertyIsBetween>';
        return filter;
    },

    /**
     * Get an OGC 'PropertyIsEqualTo' WFS-Filter for the ChartData.
     *
     * @param {String} field The field on which the filter should look.
     * @param {String} value The value the field should have.
     * @return {String} The xml representation of the OGC 'PropertyIsEqualTo'
     *                  WFS-Filter.
     */
    getPropertyIsEqualToFilter: function(field, value) {
        var filter = '' +
            '<PropertyIsEqualTo>' +
              '<PropertyName>' + field + '</PropertyName>' +
              '<Literal>' + value + '</Literal>' +
            '</PropertyIsEqualTo>';
        return filter;
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
    containsStation: function(candidate) {
        var me = this;
        var view = me.getView();
        var chartingMetadata = view.getTargetLayer().get('timeSeriesChartProperties');
        var identifyField = chartingMetadata.featureIdentifyField || 'id';
        var candidateIdVal = candidate.get(identifyField);
        var doesContainSeries = false;

        if (!Ext.isDefined(candidateIdVal)) {
            Ext.log.warn('Failed to determine if chart contains a series for ' +
                'the passed feature. Does it expose a field \'' + identifyField +
                '\' with a sane value?');
        } else {
            var currentStations = view.getSelectedStations();
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
     * Recalculates all positions in case of multiple y axes. This probably only
     * works in case of an x/y axis at left/bottom and possibly multiple
     * attached series.
     */
    recalculatePositionsAndVisibility: function() {
        var me = this;
        var visibleSeries = {};
        var translateX = 0;

        Ext.each(this.attachedSeriesShapes, function(shape) {
            var idx = shape.config.attachedSeriesNumber - 1;
            if (me.attachedSeriesVisibleById[shape.config.id][idx]) {
                visibleSeries[idx] = JSON.parse(shape.config.attachedSeries)[idx];
            } else {
                if (!visibleSeries[idx]) {
                    visibleSeries[idx] = false;
                }
            }
        });

        Ext.iterate(visibleSeries, function(idx, config) {
            if (config) {
                translateX += (config.axisWidth || 40);
            }
            var sel = '.k-d3-axis-y_' + (parseFloat(idx) + 1);
            var visible = config ? true : false;

            d3.select(sel)
                .classed('k-d3-hidden', !visible)
                .attr('transform', 'translate(' + translateX + ',0)');
        });
        var chart = d3.selectAll('.k-d3-shape-container,.k-d3-plot-background');
        if (chart.node()) {
            chart.attr('transform', 'translate(' + translateX + ',0)');
        }
        var axis = d3.select('.k-d3-axis-x');
        if (axis.node()) {
            var cur = axis.attr('transform');
            var ms = cur.match(/,\s*(\d+)/);
            var oldy = parseFloat(ms[1]);
            d3.select('.k-d3-axis-x')
                .attr('transform', 'translate(' + translateX + ',' + oldy + ')');
        }
    }

});
