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
    axes: {},
    gridAxes: {},
    tooltipCmp: null,
    zoomInteraction: null,
    initialPlotTransform: null,
    data: {},
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
     * Note: This is private method, don't call it yourself and if you have to,
     * remember to call it only once!
     *
     * @private
     */
    onBoxReady: function() {
        var me = this;
        var view = me.getView();

        // We have to cleanup manually.  WHY?!
        me.scales = {};
        me.shapes = [];
        me.axes = {};
        me.gridAxes = {};
        me.data = {};

        me.on('chartdataprepared', function() {
            var svgContainer = me.getSvgContainer();
            if (!me.chartDataAvailable) {
                // We explicitly hide the svg root container, as the modern
                // toolkit's panel didn't do it automatically if we update the
                // element via setHtml(). And as it doesn't conflict with the
                // classic toolkit's behaviour, no additional check for the
                // current toolkit is needed.
                svgContainer.attr('display', 'none');
                view.setHtml('<div class="noDataError">' +
                    me.getViewModel().get('noDataAvailableText') +
                    '</div>'
                );
                me.chartRendered = false;
            } else {
                // Show the svg root container, see comment above as well.
                svgContainer.attr('display', 'unset');

                var errorDiv = view.el.query('.noDataError');
                if (errorDiv[0]) {
                    errorDiv[0].remove();
                }

                if (me.chartRendered) {
                    me.redrawChart();
                } else {
                    me.drawChart();
                }
            }
        });

        me.getChartData();
    },

    /**
     *
     */
    drawChart: function() {
        var me = this;

        me.createInteractions();
        me.drawSvgContainer();
        me.drawLegendContainer();

        me.createScales();
        me.createAxes();
        me.createGridAxes();
        me.createShapes();
        me.createTooltip();

        me.setDomainForScales();

        me.drawTitle();
        me.drawAxes();
        me.drawGridAxes();
        me.drawShapes();

        this.resolveDynamicTemplateUrls()
        .then(function() {
            me.drawLegend();
            me.chartRendered = true;
        })
        .catch(function() {
            me.drawLegend();
            me.chartRendered = true;
        });

    },

    /**
     *
     */
    redrawChart: function() {
        var me = this;

        if (me.chartRendered && me.chartDataAvailable) {
            // Reset the shapes and scales
            me.shapes = [];
            me.scales = {};

            me.updateSvgContainerSize();

            me.deleteShapeContainerSvg();

            me.createScales();
            me.createAxes();
            me.createGridAxes();
            me.createShapes();

            me.setDomainForScales();

            me.redrawTitle();
            me.redrawAxes();
            me.redrawGridAxes();
            me.drawShapes();
            me.updateLegendContainerPosition();
            me.redrawLegend();

            // Reset the zoom to the initial extent
            me.resetZoom();
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
            // solution with min and max
            var axis = view.getAxes()[orient];
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
            if (axis.scale === 'log' && (min === 0 || max === 0)) {
                Ext.log.warn('Correcting min/max value for y-axis as' +
                    ' logarithmic scales don\'t work with 0');
                if (min === 0) {
                    min = 0.00000001;
                }
                if (max === 0) {
                    max = 0.00000001;
                }
            }

            if (Ext.isDefined(min) && Ext.isDefined(max)) {
                // We're basically done for this axis, both min and max were
                // given. We need to iterate over the data nonetheless, so as to
                // extend the minimim and maximum in case of outliers.
                axisDomain = [min, max];
            }

            Ext.each(me.shapes, function(shape) {
                var data = me.data[shape.config.id];
                var extent = d3.extent(data, function(d) {
                    return d[axis.dataIndex];
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

            // actually set the domain
            if (axisDomain) {
                var domain = me.scales[orient].domain(axisDomain);
                if (makeDomainNice) {
                    domain.nice();
                }
            }
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

                Ext.iterate(me.axes, function(orient) {
                    var axis;
                    var axisSelector = viewId + ' svg g.' + CSS.AXIS;
                    var axisGenerator = me.axes[orient];
                    var scaleGenerator = me.scales[orient];

                    if (orient === 'top' || orient === 'bottom') {
                        axis = d3.select(axisSelector + '.' + CSS.AXIS_X);
                        var scaleX = transform.rescaleX(scaleGenerator);

                        Ext.each(me.shapes, function(shape) {
                            var shapeId = shape.config.id;
                            var shapePathSelector = Ext.String.format(shapeGroupSelectorTpl, shapeId) +
                                    ' .' + CSS.SHAPE_PATH;
                            var shapePointsSelector = Ext.String.format(shapeGroupSelectorTpl, shapeId) +
                                    ' .' + CSS.SHAPE_POINT_GROUP + ' circle';

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

                    } else if (orient === 'left' || orient === 'right') {
                        // axis = d3.select(axisSelector + '.' + CSS.AXIS_Y);
                        //
                        // axis.call(axisGenerator.scale(
                        //     d3.event.transform.rescaleY(scaleGenerator)));

                        // d3.selectAll('circle')
                        //     .attr('cy', function(d) {
                        //         return scaleGenerator(d[shape.config.xField]);
                        //     });
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
                        } else if (orient === 'left' || orient === 'right') {
                            // axis = d3.select(axisSelector + '.' + CSS.GRID_Y);
                            // axis.call(axisGenerator.scale(
                            //     d3.event.transform.rescaleY(scaleGenerator)));
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

            if (shapeType) {
                shape = shapeType()
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
                            return normalizeY(d[yField]);
                        });
                }

                if (shapeType === staticMe.TYPE.area) {
                    shape
                        .y1(function(d) {
                            return normalizeY(d[yField]);
                        })
                        .y0(chartSize[1]);
                }
            } else {
                // TODO: check if this can be removed
                shape = {};
            }

            me.shapes.push({
                config: shapeConfig,
                shape: shape
            });
        });
    },

    /**
     *
     */
    getAxisByField: function(field) {
        var view = this.getView();
        var axisOrientation;

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
        var view = me.getView();
        var viewId = '#' + view.getId();
        var chartSize = me.getChartSize();
        var barWidth;

        // Wrap the shapes in its own <svg> element.
        var shapeSvg = d3.select(viewId + ' svg > g')
            .append('svg')
                .attr('top', 0)
                .attr('left', 0)
                .attr('width', chartSize[0])
                .attr('height', chartSize[1]);

        Ext.each(me.shapes, function(shape) {
            var shapeConfig = shape.config;
            var xField = shapeConfig.xField;
            var yField = shapeConfig.yField;
            var orientX = me.getAxisByField(xField);
            var orientY = me.getAxisByField(yField);
            var color = shapeConfig.color || staticMe.getRandomColor();
            var darkerColor = d3.color(color).darker();
            var shapeId = shapeConfig.id;

            var shapeGroup = shapeSvg
                .append('g')
                    .attr('class', staticMe.CSS_CLASS.SHAPE_GROUP)
                    .attr('idx', staticMe.CSS_CLASS.PREFIX_IDX_SHAPE_GROUP + shapeId)
                    .attr('shape-type', shapeConfig.type);

            if (shapeConfig.type === 'bar') {
                barWidth = (chartSize[0] / me.data[shapeId].length);
                barWidth -= staticMe.ADDITIONAL_BAR_MARGIN;
                shapeGroup
                    .selectAll('rect')
                        .data(me.data[shapeId])
                    .enter().append('rect')
                        .filter(function(d) {
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

                                var selectedStation = Ext.Array.findBy(me.getView().getSelectedStations(), function(station) {
                                    return station.get('id') === shapeId;
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
                            return Ext.isDefined(d[yField]);
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
                    .attr('idx', staticMe.CSS_CLASS.PREFIX_IDX_SHAPE_PATH + shapeId)
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
                    .attr('idx', staticMe.CSS_CLASS.PREFIX_IDX_SHAPE_POINT_GROUP + shapeId);

                // TODO refactor the selectAll method below; DK
                //      pointGroup.enter()???
                pointGroup.selectAll('circle')
                    .data(me.data[shapeId])
                    .enter().append('circle')
                        .filter(function(d) {
                            return Ext.isDefined(d[yField]);
                        })
                            .style('fill', color)
                            .style('stroke', darkerColor)
                            .style('stroke-width', 2)
                            .on('mouseover', function(data) {
                                var tooltipCmp = me.tooltipCmp;
                                var tooltipTpl = shapeConfig.tooltipTpl;

                                var selectedStation = Ext.Array.findBy(me.getView().getSelectedStations(), function(station) {
                                    return station.get('id') === shapeId;
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
                                return me.scales[orientY](d[yField]);
                            })
                            .attr('r', 3);
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
        this.transformPlot({
            x: 0,
            y: 0,
            k: 1
        }, 500);
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
                            target.classed(CSS.DOWNLOAD_ICON))) {
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

            var curTranslateY = (idx + 1) * legendEntryHeight;
            var legendEntry = legend
                .append('g')
                    .on('click', toggleVisibilityFunc)
                    .attr('transform', staticMe.makeTranslate(0, curTranslateY))
                    .attr('idx', CSS.PREFIX_IDX_LEGEND_GROUP + shapeId);

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
                            return shape.config.color;
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
                            return shape.config.color;
                    }
                });

            var nameAsTooltip = shape.config.name;
            var visualLabel = staticMe.labelEnsureMaxLength(
                nameAsTooltip, (legendConfig.legendEntryMaxLength || 17)
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
                .attr('dx', '150') // TODO Discuss, do we need this dynamically?
                .on('click', me.generateDownloadCallback(shape));
            }

            legendEntry.append('text')
                // ✖ from FontAwesome, see http://fontawesome.io/cheatsheet/
                .text('')
                .attr('class', CSS.DELETE_ICON)
                .attr('text-anchor', 'start')
                .attr('dy', '1')
                .attr('dx', '170') // TODO Discuss, do we need this dynamically?
                .on('click', me.generateDeleteCallback(shape));

        });
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
        var feat = Ext.Array.findBy(allSelectedStations, function(station) {
            return station.get('id') === stationId;
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
        var stations = this.getView().getSelectedStations();
        var stationToRemove = Ext.Array.findBy(stations, function(station) {
            return station.get('id') === shapeId;
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
            viewId,                      // only capture our view…
            ' svg g.' + clsShapeGroup,   // only capture shapepaths…
            '[idx="' + idxVal + '"]'     // only capture the right index
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

        // The id of the selected station is also the key in the pending
        // requests object.
        var stationId = selectedStation.get('id');

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
        paramConfig.viewparams += ';' + layerViewParams;

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
            filter: me.getDateTimeRangeFilter(startString, endString, timeField),
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

        return targetLayer.metadata.layerConfig.wfs.url;
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

        // The id of the selected station is also the key in the pending
        // requests object.
        var stationId = station.get('id');

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
        var timeRangeFilter;
        var intervalInSeconds;

        Ext.each(filters, function(filter) {
            var fType = (filter && filter.type) || '';
            if (fType === 'timerange' || fType === 'pointintime') {
                timeRangeFilter = filter;
                return false;
            }
        });

        if (!timeRangeFilter) {
            Ext.log.warn('Failed to determine a timerange filter');
        }

        // don't accidently overwrite the configured filter…
        timeRangeFilter = Ext.clone(timeRangeFilter);

        intervalInSeconds = me.getIntervalInSeconds(
            timeRangeFilter.interval, timeRangeFilter.unit
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
        var targetLayer = view.getTargetLayer();
        var startDate = view.getStartDate().clone();
        var endDate = view.getEndDate().clone();
        var chartConfig = targetLayer.get('timeSeriesChartProperties');
        var xAxisAttr = chartConfig.xAxisAttribute;
        var yAxisAttr = chartConfig.yAxisAttribute;
        var valueField = chartConfig.yAxisAttribute;
        var jsonObj;

        if (response && response.responseText) {
            try {
                jsonObj = Ext.decode(response.responseText);
            } catch (err) {
                Ext.log.error('Could not parse the response: ', err);
                return false;
            }
        }

        var filterConfig = Koala.util.Filter.getStartEndFilterFromMetadata(
                targetLayer.metadata);
        var timeField = filterConfig.parameter;
        var intervalInSeconds = me.getIntervalInSecondsForTargetLayer();
        var snapObject = me.getTimeStampSnapObject(
                startDate, intervalInSeconds, jsonObj.features, timeField);

        // The id of the selected station is also the key in the pending
        // requests object.
        var stationId = station.get('id');

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

        // Iterate until startDate <= endDate
        while (startDate.diff(endDate) <= 0) {
            var newRawData = {};

            compareableDate = startDate.unix() + firstDiffSeconds;
            matchingFeature = snapObject[compareableDate];

            if (matchingFeature) {
                newRawData[xAxisAttr] = Koala.util.Date.getUtcMoment(matchingFeature.properties[xAxisAttr]);

                me.chartDataAvailable = true;
                newRawData[valueField] = matchingFeature.properties[yAxisAttr];
            }

            seriesData.push(newRawData);
            startDate.add(intervalInSeconds, 'seconds');
        }

        Ext.each(seriesData, function(item) {
            if (Koala.Application.isUtc() && item[xAxisAttr]) {
                item[xAxisAttr] = Koala.util.Date.removeUtcOffset(item[xAxisAttr]);
            }
        });

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
     * The default handler for chart data request failures.
     *
     * @param {Object} response The reponse object.
     * @param {ol.Feature} station The station the corresponding request was
     *                             send for. Optional.
     */
    onChartDataRequestFailure: function(response /*station*/) {
        // aborted requests aren't failures
        if (!response.aborted) {
            Ext.log.error('Failure on chartdata load');
        }
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
     *
     */
    getDateTimeRangeFilter: function(startDate, endDate, timeField) {
        var filter;

        filter = '' +
            '<a:Filter xmlns:a="http://www.opengis.net/ogc">' +
              '<a:PropertyIsBetween>' +
                '<a:PropertyName>' + timeField + '</a:PropertyName>' +
                '<a:LowerBoundary>'+
                  '<a:Literal>' + startDate + '</a:Literal>' +
                '</a:LowerBoundary>' +
                '<a:UpperBoundary>' +
                  '<a:Literal>' + endDate + '</a:Literal>' +
                '</a:UpperBoundary>' +
              '</a:PropertyIsBetween>' +
            '</a:Filter>';

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
    }

});
