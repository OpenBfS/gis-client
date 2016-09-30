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
    chartRendered: false,
    ajaxCounter: 0,
    chartDataAvailable: false,

    /**
     *
     */
    onShow: function() {
        var me = this;
        var view = me.getView();

        // We have to cleanup manually.  WHY?!
        me.scales = {};
        me.shapes = [];
        me.axes = {};
        me.gridAxes = {};
        me.data = {};

        me.on('chartdataprepared', function() {
            if (!me.chartDataAvailable) {
                view.setHtml(me.getViewModel().get('noDataAvailableText'));
                me.chartRendered = false;
            } else {
                if (me.chartRendered) {
                    me.redrawChart();
                } else {
                    view.setHtml('');
                    me.drawChart();
                }
            }
        });

        // TODO Move to barchart!
        if (view.chartType === 'bar') {
            var targetLayer = view.getTargetLayer();
            var chartConfig = targetLayer.metadata.layerConfig.barChartProperties;
            var selectedStation = view.getSelectedStations()[0];
            var props = selectedStation.getProperties();

            var data = {};
            Ext.each(chartConfig.chartFieldSequence.split(','), function(field) {
                data[field] = props[field];
            });

            // TODO double check locality_code, is this hardcoded?
            me.data[props.locality_code] = data;
        } else {
            me.getChartData();
        }

    },

    /**
     *
     */
    redrawChart: function() {
        var me = this;

        // Reset the shapes and scales
        me.shapes = [];
        me.scales = {};

        me.deleteSvg();

        me.createScales();
        me.createAxes();
        me.createGridAxes();
        me.createShapes();

        me.setDomainForScales();

        me.redrawAxes();
        me.redrawGridAxes();
        me.drawShapes();

        me.redrawLegend();

        // Zoom to the new chart extent
        me.resetZoom();
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
        me.drawLegend();

        me.chartRendered = true;
    },

    /**
     * [redrawAxes description]
     * @return {[type]} [description]
     */
    redrawAxes: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var CSS = staticMe.CSS_CLASS;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var axesConfig = view.getAxes();
        var axisSelector = viewId + ' svg g.' + CSS.AXIS;

        Ext.iterate(axesConfig, function(orient) {
            var axisGenerator = me.axes[orient];
            var axis;

            if (orient === 'top' || orient === 'bottom') {
                axis = d3.select(axisSelector + '.' + CSS.AXIS_X);
            } else if (orient === 'left' || orient === 'right') {
                axis = d3.select(axisSelector + '.' + CSS.AXIS_Y);
            }

            axis.call(axisGenerator);
        });
    },

    /**
     * [redrawGridAxes description]
     * @return {[type]} [description]
     */
    redrawGridAxes: function() {
        var me = this;
        var view = me.getView();
        var gridConfig = view.getGrid();

        if (!gridConfig.show) {
            return false;
        }

        var staticMe = Koala.view.component.D3ChartController;
        var CSS = staticMe.CSS_CLASS;
        var viewId = '#' + view.getId();
        var axisSelector = viewId + ' svg g.' + CSS.GRID;
        var orientations = ['bottom', 'left'];

        Ext.each(orientations, function(orient) {
            var axisGenerator = me.gridAxes[orient];
            var axis;

            if (orient === 'top' || orient === 'bottom') {
                axis = d3.select(axisSelector + '.' + CSS.GRID_X);
            } else if (orient === 'left' || orient === 'right') {
                axis = d3.select(axisSelector + '.' + CSS.GRID_Y);
            }

            axis.call(axisGenerator);
        });
    },

    /**
     *
     */
    deleteSvg: function() {
        var view = this.getView();
        var svg = d3.select('#' + view.getId() + ' svg svg');
        if (svg && !svg.empty()) {
            svg.node().remove();
            this.chartRendered = false;
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
        var shapes = view.getShapes();
        var added = false;
        allowDupes = Ext.isDefined(allowDupes) ? allowDupes : false;

        if (allowDupes === true || !me.containsStation(selectedStation)) {
            view.getSelectedStations().push(selectedStation);
            shapes.push(shapeConfig);
            view.setShapes(shapes);
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
            if (Ext.isDefined(min) && Ext.isDefined(max)) {
                // We're done for this axis, both min and max were given
                axisDomain = [min, max];
            } else {
                // Otherwise we have to find min and max from the data in all
                // shapes.
                Ext.each(me.shapes, function(shape) {
                    var data = me.data[shape.config.id];
                    var extent = d3.extent(data, function(d) {
                        return d[axis.dataIndex];
                    });

                    if(!axisDomain) {
                        // first iteration / shape
                        axisDomain = [extent[0], extent[1]];
                    } else {
                        // any other run, take the new min and max if they are
                        // actually bigger or smaller.
                        axisDomain[0] = Math.min(extent[0], axisDomain[0]);
                        axisDomain[1] = Math.max(extent[1], axisDomain[1]);
                    }
                });
                // now we need to check again, if either min and max were
                // explicitly passed. The values from GNOS, if they exist,
                // always take precedence.
                if (Ext.isDefined(min)) {
                    axisDomain[0] = min;
                }
                if (Ext.isDefined(max)) {
                    axisDomain[1] = max;
                }
            }
            // actually set the domain
            var domain = me.scales[orient].domain(axisDomain);
            if (makeDomainNice) {
                domain.nice();
            }

        });
    },

    /**
     * Draws the root <svg>-element into the <div>-element rendered by the Ext
     * component.
     */
    drawSvgContainer: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var CSS = staticMe.CSS_CLASS;
        var view = me.getView();
        var viewId = '#' + view.getId();

        me.callParent();

        // register zoom interaction if requested
        if (view.getZoomEnabled()) {
            var plot = d3.select(viewId + ' svg rect.' + CSS.PLOT_BACKGROUND);
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
                                    return scaleX(d[shape.config.xField]);
                                }));

                            d3.selectAll(shapePointsSelector)
                                .attr('cx', function(d) {
                                    return scaleX(d[shape.config.xField]);
                                });
                        });

                        axis.call(axisGenerator.scale(scaleX));
                    } else if (orient === 'left' || orient === 'right') {
                        // axis = d3.select(axisSelector + '.' + CSS.AXIS_Y);
                        //
                        // axis.call(axisGenerator.scale(
                        //     d3.event.transform.rescaleY(scaleGenerator)));

                        // d3.selectAll('circle')
                        //     .attr('cy', function(d) {
                        //         return scaleGenerator(d.value);
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
    createScales: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var view = me.getView();
        var chartSize = me.getChartSize();

        Ext.iterate(view.getAxes(), function(orient, axisConfig) {
            var scaleType = staticMe.SCALE[axisConfig.scale || 'linear'];
            var range;

            if (orient === 'top' || orient === 'bottom') {
                range = [0, chartSize[0]];
            } else if (orient === 'left' || orient === 'right') {
                range = [chartSize[1], 0];
            }

            me.scales[orient] = scaleType().range(range);
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
                        return Ext.isDefined(d.value);
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
     * [createAxes description]
     * @return {[type]} [description]
     */
    createAxes: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var view = me.getView();
        var axesConfig = view.getAxes();

        Ext.iterate(axesConfig, function(orient, axisConfig) {
            var axis = staticMe.ORIENTATION[orient];
            var scale = me.scales[orient];
            // https://github.com/d3/d3-format
            var tickFormatter = axisConfig.scale === 'time' ?
                    me.getMultiScaleTimeFormatter :
                    d3.format(axisConfig.format || ',.0f');

            var chartAxis = axis(scale)
                .ticks(axisConfig.ticks)
                .tickValues(axisConfig.values)
                .tickFormat(tickFormatter)
                .tickSize(axisConfig.tickSize || 6)
                .tickPadding(axisConfig.tickPadding || 3);

            me.axes[orient] = chartAxis;
        });
    },

    /**
     * Method that can be adjusted to generate a custom multi scale time formatter
     * function, based on https://github.com/d3/d3-time-format
     *
     * See https://github.com/d3/d3-time-format/blob/master/README.md#locale_format
     * for available D3 datetime formats.
     *
     * @param  {Date} date The current Date object.
     * @return {function} The multi-scale time format function.
     */
    getMultiScaleTimeFormatter: function(date) {
        var formatMillisecond = d3.timeFormat(".%L"),
            formatSecond = d3.timeFormat(":%S"),
            formatMinute = d3.timeFormat("%H:%M"),
            formatHour = d3.timeFormat("%H:%M"),
            formatDay = d3.timeFormat("%a %d"),
            formatWeek = d3.timeFormat("%b %d"),
            formatMonth = d3.timeFormat("%B"),
            formatYear = d3.timeFormat("%Y");

        return (d3.timeSecond(date) < date ? formatMillisecond
          : d3.timeMinute(date) < date ? formatSecond
          : d3.timeHour(date) < date ? formatMinute
          : d3.timeDay(date) < date ? formatHour
          : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
          : d3.timeYear(date) < date ? formatMonth
          : formatYear)(date);
    },

    /**
     *
     */
    drawAxes: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var makeTranslate = staticMe.makeTranslate;
        var CSS = staticMe.CSS_CLASS;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var axesConfig = view.getAxes();
        var chartSize = me.getChartSize();

        Ext.iterate(axesConfig, function(orient, axisConfig) {
            var axisTransform;
            var labelTransform;
            var labelPadding;
            var cssClass;

            if (orient === 'top' || orient === 'bottom') {
                cssClass = CSS.AXIS + ' ' + CSS.AXIS_X;
                axisTransform = (orient === 'bottom') ?
                        makeTranslate(0, chartSize[1]) : undefined;

                labelTransform = makeTranslate(chartSize[0] / 2, 0);
                labelPadding = axisConfig.labelPadding || 35;
            } else if (orient === 'left' || orient === 'right') {
                cssClass = CSS.AXIS + ' ' + CSS.AXIS_Y;
                axisTransform = (orient === 'right') ?
                        makeTranslate(chartSize[0], 0) : undefined;
                var translate = makeTranslate(chartSize[1] / -2, 0);
                labelTransform = 'rotate(-90), ' + translate;
                labelPadding = (axisConfig.labelPadding || 25) * -1;
            }

            d3.select(viewId + ' svg > g')
                .append('g')
                    .attr('class', cssClass)
                    .attr('transform', axisTransform)
                    .call(me.axes[orient])
                .append('text')
                    .attr('transform', labelTransform)
                    .attr('dy', labelPadding)
                    .attr('fill', axisConfig.labelColor || '#000')
                    .style('text-anchor', 'middle')
                    .style('font-weight', 'bold')
                    .style('font-size', axisConfig.labelSize || 12)
                    .text(axisConfig.label || '');

        });
    },

    /**
     * [createGridAxes description]
     * @return {[type]} [description]
     */
    createGridAxes: function() {
        var me = this;
        var view = me.getView();
        var gridConfig = view.getGrid();

        if (!gridConfig.show) {
            return false;
        }

        var staticMe = Koala.view.component.D3ChartController;
        var chartSize = me.getChartSize();
        var orientations = ['bottom', 'left'];

        Ext.each(orientations, function(orient) {
            var axis = staticMe.ORIENTATION[orient];
            var scale = me.scales[orient];
            var tickSize;

            if (orient === 'top' || orient === 'bottom') {
                tickSize = chartSize[1];
            } else if (orient === 'left' || orient === 'right') {
                tickSize = chartSize[0] * -1;
            }

            var chartAxis = axis(scale)
                .tickFormat('')
                .tickSize(tickSize);

            me.gridAxes[orient] = chartAxis;
        });
    },

    /**
     * [drawGridAxes description]
     * @return {[type]} [description]
     */
    drawGridAxes: function() {
        var me = this;
        var view = me.getView();
        var gridConfig = view.getGrid();

        if (!gridConfig.show) {
            return false;
        }

        var staticMe = Koala.view.component.D3ChartController;
        var CSS = staticMe.CSS_CLASS;
        var viewId = '#' + view.getId();
        var orientations = ['bottom', 'left'];

        Ext.each(orientations, function(orient) {
            var cssClass;

            if (orient === 'bottom') {
                cssClass = CSS.GRID + ' ' + CSS.GRID_X;
            } else if (orient === 'left') {
                cssClass = CSS.GRID + ' ' + CSS.GRID_Y;
            }

            d3.select(viewId + ' svg > g')
                .append('g')
                    .attr('class', cssClass)
                    .call(me.gridAxes[orient]);

            d3.selectAll(viewId + ' svg g.' + CSS.GRID + ' line')
                .style('stroke-width', gridConfig.width || 1)
                .style('stroke', gridConfig.color || '#d3d3d3')
                .style('stroke-opacity', gridConfig.opacity || 0.7);
        });
    },

    /**
     *
     */
    drawTitle: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var makeTranslate = staticMe.makeTranslate;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var titleConfig = view.getTitle();
        var chartSize = me.getChartSize();

        d3.select(viewId + ' svg > g')
            .append('text')
                .attr('transform', makeTranslate(chartSize[0] / 2, 0))
                .attr('dy', (titleConfig.labelPadding || 18) * -1)
                .attr('fill', titleConfig.labelColor || '#000')
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style('font-size', titleConfig.labelSize || 20)
                .text(titleConfig.label);
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
                shapeGroup.selectAll("text")
                    .data(me.data[shapeId])
                    .enter()
                    .append("text")
                        .filter(function(d) {
                            return Ext.isDefined(d[yField]);
                        })
                        .text(function(d) {
                            return d[yField];
                        })
                        .attr("transform", function(d) {
                            var x = me.scales[orientX](d[xField]);
                            var y = me.scales[orientY](d[yField]);
                            return "rotate(-90," + x + "," + y + ") translate(-15,15)";
                        })
                        .attr("x", function(d) {
                             return me.scales[orientX](d[xField]);
                        })
                        .attr("y", function(d) {
                             return me.scales[orientY](d[yField]);
                        })
                        .attr("text-anchor", "middle")
                        .style("font-family", "sans-serif")
                        .style("font-size", "11px")
                        .style("font-weight", "bold")
                        .style("fill", "white")
                        .style("unselectable", "on");
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

                                var html = Koala.util.String.replaceTemplateStrings(tooltipTpl, data);
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

    /**
     * Removes the current legend from the chart (if it exists) and redraws the
     * legend by looking at our internal data.
     */
    redrawLegend: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var CSS = staticMe.CSS_CLASS;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var legendCls = CSS.SHAPE_GROUP + CSS.SUFFIX_LEGEND;
        var legend = d3.select(viewId + ' svg g.' + legendCls);
        if (legend && !legend.empty()) {
            var legendNode = legend.node();
            legendNode.parentNode.removeChild(legendNode);
        }
        me.drawLegend();
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
                    if (target && target.classed(CSS.DELETE_ICON)) {
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

            legendEntry.append('text')
                // ✖ from FontAwesome, see http://fontawesome.io/cheatsheet/
                .text('')
                .attr('class', CSS.DELETE_ICON)
                .attr('text-anchor', 'start')
                .attr('dy', '1')
                .attr('dx', '160') // TODO Discuss, do we need this dynamically?
                .on('click', me.generateDeleteCallback(shape));
        });
    },

    /**
     *
     */
    deleteEverything: function(dataObj){
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
        var shapeConfigToRemove = Ext.Array.findBy(shapeConfigs, function(shapeConfig){
            return shapeConfig.id === shapeId;
        });
        Ext.Array.remove(shapeConfigs, shapeConfigToRemove);
    },

    /**
     *
     */
    deleteData: function(shapeId){
        delete this.data[shapeId];
    },

    /**
     *
     */
    deleteSelectedStation: function(shapeId){
        var stations = this.getView().getSelectedStations();
        var stationToRemove = Ext.Array.findBy(stations, function(station){
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
        var shapeToRemove = Ext.Array.findBy(me.shapes, function(shape){
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
        me.ajaxCounter = 0;

        Ext.each(view.getSelectedStations(), function(station) {
            me.getChartDataForStation(station);
        });
    },

    /**
     *
     */
    getChartDataForStation: function(selectedStation) {
        var me = this;
        var FilterUtil = Koala.util.Filter;
        var view = me.getView();
        var targetLayer = view.getTargetLayer();
        var chartConfig = targetLayer.get("timeSeriesChartProperties");
        var filterConfig = FilterUtil.getStartEndFilterFromMetadata(targetLayer.metadata);
        var startDate = view.getStartDate();
        var endDate = view.getEndDate();
        var timeField = filterConfig.parameter;

        var paramConfig = Koala.util.Object.getConfigByPrefix(
            chartConfig, "param_", true);

        Ext.iterate(paramConfig, function(k, v) {
            paramConfig[k] = Koala.util.String.replaceTemplateStrings(
                v, selectedStation);
        });

        // TODO refactor this gathering of the needed filter attribute
        var filters = targetLayer.metadata.filters;
        var timeRangeFilter;

        Ext.each(filters, function(filter) {
            var fType = (filter && filter.type) || '';
            if (fType === 'timerange' || fType === 'pointintime') {
                timeRangeFilter = filter;
                return false;
            }
        });
        if (!timeRangeFilter) {
            Ext.log.warn("Failed to determine a timerange filter");
        }
        // don't accidently overwrite the configured filter…
        timeRangeFilter = Ext.clone(timeRangeFilter);

        var intervalInSeconds = me.getIntervalInSeconds(
            timeRangeFilter.interval, timeRangeFilter.unit
        );

        var startString = Ext.Date.format(startDate, targetLayer.metadata.filters[0].mindatetimeformat || Koala.util.Date.ISO_FORMAT);
        var endString = Ext.Date.format(endDate, targetLayer.metadata.filters[0].maxdatetimeformat || Koala.util.Date.ISO_FORMAT);

        var url = targetLayer.metadata.layerConfig.wfs.url;

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

        Ext.Ajax.request({
            url: url,
            method: 'GET',
            params: requestParams,
            success: function(resp) {
                var jsonObj = Ext.decode(resp.responseText);

                var snapObject = me.getTimeStampSnapObject(
                        startDate, intervalInSeconds, jsonObj.features, timeField);

                var compareableDate, matchingFeature;

                var xAxisAttr = chartConfig.xAxisAttribute;
                var yAxisAttr = chartConfig.yAxisAttribute;
                var valueField = chartConfig.yAxisAttribute;

                var mockUpData = [];

                while (startDate <= endDate) {

                    var newRawData = {};

                    compareableDate = Ext.Date.format(startDate, 'timestamp');
                    matchingFeature = snapObject[compareableDate];

                    newRawData[xAxisAttr] = startDate;
                    newRawData[valueField] = undefined;

                    if (matchingFeature) {
                        me.chartDataAvailable = true;
                        newRawData[valueField] = matchingFeature.properties[yAxisAttr];
                    }

                    mockUpData.push(newRawData);
                    startDate = Ext.Date.add(startDate, Ext.Date.SECOND, intervalInSeconds);
                }

                me.data[selectedStation.get('id')] = mockUpData;

                me.ajaxCounter++;

                if (me.ajaxCounter === view.getSelectedStations().length) {
                    if (view.getShowLoadMask()) {
                        view.setLoading(false);
                    }
                    me.fireEvent('chartdataprepared');
                }

            },
            failure: function() {
                Ext.log.error('Failure on chartdata load');
            }
        });
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
    getTimeStampSnapObject: function (startDate, intervalInSeconds, features,
            xAxisAttr) {
        var obj = {};
        var startSeconds = parseInt(
                Ext.Date.format(startDate, "timestamp"), 10);
        var columnSeconds = intervalInSeconds / 2;

        Ext.each(features, function(feat){
            // Dates in features are always in UTC, `new Date` seems to be
            // respecting the format
            var featDate = new Date(feat.properties[xAxisAttr]);

            if (Koala.Application.isLocal()) {
                var makeLocal = Koala.util.Date.makeLocal;
                featDate = makeLocal(featDate);
            }

            var featDateSeconds = parseInt(
                    Ext.Date.format(featDate, "timestamp"), 10);
            var diffSeconds = featDateSeconds - startSeconds;
            var modulos = diffSeconds % intervalInSeconds;
            var snapSeconds;

            if(modulos < columnSeconds){
                snapSeconds = featDateSeconds - modulos;
            } else {
                snapSeconds = featDateSeconds + modulos;
            }
            obj[snapSeconds] = feat;
        });

        return obj;
    },

    /**
     * Normalize interval and unit to seconds.
     *
     * @param interval {Integer}
     * @param unit {String["seconds", "minutes", "hours", "days"]}
     */
    getIntervalInSeconds: function (interval, unit) {
        var multiplier = 0;

        switch (unit.toLowerCase()) {
            case "seconds":
                multiplier = 1;
                break;
            case "minutes":
                multiplier = Koala.util.Duration.secondsInOne.MINUTE;
                break;
            case "hours":
                multiplier = Koala.util.Duration.secondsInOne.HOUR;
                break;
            case "days":
                multiplier = Koala.util.Duration.secondsInOne.DAY;
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
        var chartingMetadata = view.getTargetLayer().get("timeSeriesChartProperties");
        var identifyField = chartingMetadata.featureIdentifyField || "id";
        var candidateIdVal = candidate.get(identifyField);
        var doesContainSeries = false;

        if (!Ext.isDefined(candidateIdVal)){
            Ext.log.warn("Failed to determine if chart contains a series for " +
                "the passed feature. Does it expose a field '" + identifyField +
                "' with a sane value?");
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
