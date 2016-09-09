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
    extend: 'Ext.app.ViewController',
    alias: 'controller.component-d3chart',

    statics: {

        /**
         * [CSS_CLASS description]
         * @type {Object}
         */
        CSS_CLASS: {
            AXIS: 'k-d3-axis',
            AXIS_X: 'k-d3-axis-x',
            AXIS_Y: 'k-d3-axis-y',

            PLOT_BACKGROUND: 'k-d3-plot-background',

            SHAPE_GROUP: 'k-d3-shape-group',
            SHAPE_PATH: 'k-d3-shape-path',
            SHAPE_POINT_GROUP: 'k-d3-shape-points',

            PREFIX_IDX_SHAPE_GROUP: 'shape-group-',
            PREFIX_IDX_SHAPE_PATH: 'shape-path-',
            PREFIX_IDX_SHAPE_POINT_GROUP: 'shape-points-',

            SUFFIX_LEGEND: '-legend',
            SUFFIX_HIDDEN: '-hidden'
        },

        /**
         * [ADDITIONAL_BAR_MARGIN description]
         * @type {Number}
         */
        ADDITIONAL_BAR_MARGIN: 5,

        /**
         * Given a SVG `<path>` (from a d3 selection), modify the start point by
         * `offsetX` and `offsetY`.
         *
         * Directly modifies the `d`-attribute.
         *
         * @param {Selection} d3Path The path to modify.
         * @param {Number} offsetX The offset in horizontal direction.
         * @param {Number} offsetX The offset in vertical direction.
         */
        adjustPathStart: function(d3Path, offsetX, offsetY) {
            var currentD = d3Path.attr('d');
            var startCoords = currentD.match(/^M([+-]?\d*\.?\d+),([+-]?\d*\.?\d+)/);
            var xCoord = parseFloat(startCoords[1], 10);
            var yCoord = parseFloat(startCoords[2], 10);
            var newX = xCoord + offsetX;
            var newY = yCoord + offsetY;
            var newD = currentD.replace(startCoords[0], 'M' + newX + ',' + newY);
            d3Path.attr('d', newD);
        },

        /**
         * This method will take a d3 object (e.g. from a selection) and adjust its
         * transfrom element to move it on the canvas. The modification is
         * controlled by a `diffObj` which looks like:
         *
         *     {
         *         translate: {
         *             x: -15,
         *             y: 7
         *         }
         *     }
         *
         * The above object means move the object 15 units to the left and seven to
         * the top.
         *
         * The transform attribute is modified directly.
         *
         * @param {Selection} d3Obj The object to manipulate.
         * @param {Object} diffObj A specification which attribute how to modify.
         */
        adjustTransformTranslate: function (d3Obj, diffObj) {
            var staticMe = Koala.view.component.D3ChartController;
            var makeTranslate = staticMe.makeTranslate;
            var currentTransform = d3Obj.attr('transform');

            var regEx = /translate\((\d+),(\d+)\)/;
            if (!currentTransform) {
                currentTransform = makeTranslate(0, 0);
            }
            var newTransform = currentTransform;
            var matches = regEx.exec(currentTransform);
            if (matches) {
                var x = parseFloat(matches[1], 10);
                var y = parseFloat(matches[2], 10);
                x += 'translate' in diffObj ? diffObj.translate.x || 0 : 0;
                y += 'translate' in diffObj ? diffObj.translate.y || 0 : 0;
                var newTranslate = makeTranslate(x, y);
                newTransform = currentTransform.replace(matches[0], newTranslate);
            }
            d3Obj.attr('transform', newTransform);
        },

        /**
         * Returns a string ready to be used in a transform-attribute for the
         * passed parameters `x` and `y`.
         *
         * @param {Number} x The amount to translate in horizontal direction.
         * @param {Number} y The amount to translate in vertical direction.
         * @return {String} A string ready to be used in a transform-attribute.
         */
        makeTranslate: function(x, y) {
            return "translate(" + x + "," + y + ")";
        },

        /**
         * Static mapping of supported D3 axis generators. See the
         * {@link https://github.com/d3/d3-axis/blob/master/README.md#axisTop|D3 API documentation}
         * for further details.
         *
         * @type {function} top - Return a top-oriented axis generator.
         * @type {function} right - Return a right-oriented axis generator.
         * @type {function} bottom - Return a bottom-oriented axis generator.
         * @type {function} left - Return a left-oriented axis generator.
         */
        ORIENTATION: {
            top: d3.axisTop,
            right: d3.axisRight,
            bottom: d3.axisBottom,
            left: d3.axisLeft
        },

        /**
         * Static mapping of supported d3 scales. In D3 Scales are functions that
         * map from an input domain to an output range. See the
         * {@link https://github.com/d3/d3/blob/master/API.md#scales-d3-scale|D3 API documentation}
         * for further details.
         *
         * @type {function} linear - Return a quantitative linear scale.
         * @type {function} pow - Return a quantitative power scale.
         * @type {function} sqrt - Return a quantitative power scale with exponent 0.5.
         * @type {function} log - Return a quantitative logarithmic scale.
         * @type {function} ident - Return a quantitative identity scale.
         * @type {function} time - Return a linear scale for time.
         * @type {function} utc - Return a linear scale for UTC.
         */
        SCALE: {
            linear: d3.scaleLinear,
            pow: d3.scalePow,
            sqrt: d3.scaleSqrt,
            log: d3.scaleLog,
            ident: d3.scaleIdentity,
            time: d3.scaleTime,
            utc: d3.scaleUtc
        },

        /**
         * Static mapping of supported d3 shape types. See the
         * {@link https://github.com/d3/d3/blob/master/API.md#shapes-d3-shape|D3 API documentation}
         * for further details.
         *
         * @type {function} line - Return a line generator.
         * @type {function} area - Return an area generator.
         * @type {function} bar - TODO
         */
        TYPE: {
            line: d3.line,
            area: d3.area,
            // TODO: set another type?!
            bar: d3.line
        },

        /**
         * Static mapping of supported d3 curve types. In D3 the curve type
         * represents the interpolation between points in a continous shape. See
         * the {@link https://github.com/d3/d3/blob/master/API.md#curves|D3 API documentation}
         * for further details.
         *
         * @type {function} linear - A polyline through specified points.
         * @type {function} cubicBasisSpline - A cubic basis spline using the
         *       specified control points.
         * @type {function} curveMonotoneX - A cubic spline that preserves
         *       monotonicity in y, assuming monotonicity in x.
         * @type {function} naturalCubicSpline - A natural cubic spline with the
         *       second derivative of the spline set to zero at the endpoints.
         * @type {function} curveStep - A piecewise constant function. The y-value
         *       changes at the midpoint of each pair of adjacent x-values.
         * @type {function} curveStepAfter - A piecewise constant function. The
         *       y-value changes after the x-value.
         * @type {function} curveStepBefore - A piecewise constant function. The
         *       y-value changes before the x-value.
         */
        CURVE: {
            linear: d3.curveLinear,
            cubicBasisSpline: d3.curveBasis,
            curveMonotoneX: d3.curveMonotoneX,
            naturalCubicSpline: d3.curveNatural,
            curveStep: d3.curveStep,
            curveStepAfter: d3.curveStepAfter,
            curveStepBefore: d3.curveStepBefore
        }
    },

    /**
     *
     */
    privates: {
        scales: {},
        shapes: [],
        tooltipCmp: null,
        data: [],
        // TODO: needed?
        axes: {}
    },

    /**
     * [getChartSize description]
     * @return {[type]} [description]
     */
    getChartSize: function() {
        var me = this;
        var view = me.getView();
        var chartMargin = view.getChartMargin();

        return [
            view.getWidth() - chartMargin.left - chartMargin.right,
            view.getHeight() - chartMargin.top - chartMargin.bottom
        ];
    },

    /**
     *
     */
    onShow: function() {
        var me = this;
        var view = me.getView();

        if (view.getShowLoadMask()) {
            view.setLoading(true);
        }

        me.on('chartdatachanged', function() {

            me.drawChart();

            if (view.getShowLoadMask()) {
                view.setLoading(false);
            }
        });

        me.getChartData();

    },

    /**
     *
     */
    drawChart: function() {
        var me = this;

        me.drawSvgContainer();

        me.createScales();
        me.createAxes();
        me.createShapes();
        me.createTooltip();

        me.setDomainForScales();

        me.drawTitle();
        me.drawAxes();
        me.drawShapes();

        me.drawLegend();
    },

    /**
     * Sets the domain for each scale in the chart by the use of the extent of
     * the given input data values.
     */
    setDomainForScales: function() {
        var me = this;
        var view = me.getView();
        var shapeConfig = view.getShapes();

        // iterate over all scales/axis orientations and all shapes to find the
        // corresponding data index for each scale. Set the extent (max/min range
        // in this data index) for each scale.
        Ext.iterate(me.scales, function(orient) {
            // TODO: is it safe to iterate over the config?
            Ext.each(shapeConfig, function() {
                me.scales[orient].domain(d3.extent(me.data, function(d) {
                    return d[view.getAxes()[orient].dataIndex];
                }));
            });
        });
    },

    /**
     * Creates a simple ExtJS tooltip, see the
     * {@link http://docs.sencha.com/extjs/6.0.0/classic/Ext.tip.ToolTip.html|ExtJS API documentation}
     * for further details and config options.
     */
    createTooltip: function() {
        this.tooltipCmp = Ext.create('Ext.tip.ToolTip');
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
        var chartMargin = view.getChartMargin();
        var chartSize = me.getChartSize();
        var translate = 'translate(' + chartMargin.left + ',' +
                chartMargin.top + ')';

        // Get the container view by its ID and append the SVG including an
        // additional group element to it.
        d3.select(viewId)
            .append('svg')
                .attr('width', view.getWidth())
                .attr('height', view.getHeight())
            .append('g')
                .attr('transform', translate)
            .append('rect')
                .style('fill', view.getBackgroundColor())
                .attr('class', CSS.PLOT_BACKGROUND)
                .attr('width', chartSize[0])
                .attr('height', chartSize[1])
                .attr('pointer-events', 'all');

        // register zoom interaction if requested
        if (view.getZoomEnabled()) {
            var plot = d3.select(viewId + ' svg rect.' + CSS.PLOT_BACKGROUND);
            plot.call(me.createZoomInteraction());
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

        // var chartSize = me.getChartSize();
        //var extent = [[0,0], [600 - 50, 400 - 50]];

        return d3.zoom()
            //.scaleExtent([1, 5])
            //.translateExtent(extent)
            .on('zoom', function() {
                d3.selectAll(viewId + ' svg g.' + CSS.SHAPE_GROUP)
                    .attr('transform', d3.event.transform);

                Ext.iterate(me.axes, function(orient) {
                    var axis;
                    var axisSelector = 'svg g.' + CSS.AXIS;
                    var axisGenerator = me.axes[orient];
                    var scaleGenerator = me.scales[orient];

                    if (orient === 'top' || orient === 'bottom') {
                        axis = d3.select(axisSelector + '.' + CSS.AXIS_X);
                        axis.call(axisGenerator.scale(
                            d3.event.transform.rescaleX(scaleGenerator)));
                    } else if (orient === 'left' || orient === 'right') {
                        axis = d3.select(axisSelector + '.' + CSS.AXIS_Y);
                        axis.call(axisGenerator.scale(
                            d3.event.transform.rescaleY(scaleGenerator)));
                    }
                });
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
            var scaleType = staticMe.SCALE[axisConfig.scale];
            var range;

            // The x axes
            if (orient === 'top' || orient === 'bottom') {
                range = [0, chartSize[0]];
            }

            // The y axes
            if (orient === 'left' || orient === 'right') {
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

        Ext.each(view.getShapes(), function(shapeConfig) {
            var shapeType = staticMe.TYPE[shapeConfig.type];
            var curveType = staticMe.CURVE[shapeConfig.curve];
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

            var chartAxis = axis(scale)
                .ticks(axisConfig.ticks)
                .tickValues(axisConfig.values)
                .tickFormat(axisConfig.format ? d3.format(axisConfig.format) : undefined)
                .tickSize(axisConfig.tickSize || 6)
                .tickPadding(axisConfig.tickPadding || 3);

            me.axes[orient] = chartAxis;
        });
    },

    /**
     *
     */
    drawAxes: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var CSS = staticMe.CSS_CLASS;
        // var staticMe = Koala.view.component.D3ChartController;
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
                        'translate(0,' + chartSize[1] + ')' : undefined;

                labelTransform = 'translate(' + (chartSize[0] / 2) + ', 0)';
                labelPadding = (axisConfig.labelPadding || '35px');
            }

            if (orient === 'left' || orient === 'right') {
                cssClass = CSS.AXIS + ' ' + CSS.AXIS_Y;
                axisTransform = (orient === 'right') ?
                        'translate(' + chartSize[0] + ', 0)' : undefined;

                labelTransform = 'rotate(-90), translate(' + (chartSize[1] / 2 * -1) + ', 0)';
                labelPadding = (axisConfig.labelPadding || '25px') * -1;
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
                    .text(axisConfig.label);

        });
    },

    /**
     *
     */
    drawTitle: function() {
        var me = this;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var titleConfig = view.getTitle();
        var chartSize = me.getChartSize();

        d3.select(viewId + ' svg > g')
            .append('text')
                .attr('transform', 'translate(' + (chartSize[0] / 2) + ', 0)')
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
                // .attr('viewBox', '0 0 550 420');

        Ext.each(me.shapes, function(shape, idx) {
            var xField = shape.config.xField;
            var yField = shape.config.yField;
            var orientX = me.getAxisByField(xField);
            var orientY = me.getAxisByField(yField);
            var color = shape.config.color;
            var darkerColor = d3.color(color).darker();

            var shapeGroup = shapeSvg
                .append('g')
                    .attr('class', staticMe.CSS_CLASS.SHAPE_GROUP)
                    .attr('idx', staticMe.CSS_CLASS.PREFIX_IDX_SHAPE_GROUP + idx)
                    .attr('shape-type', shape.config.type);

            if (shape.config.type === 'bar') {
                barWidth = (chartSize[0] / me.data.length);
                barWidth -= staticMe.ADDITIONAL_BAR_MARGIN;
                shapeGroup
                    .selectAll("rect")
                        .data(me.data)
                    .enter().append("rect")
                        .filter(function(d) {
                            return Ext.isDefined(d[yField]);
                        })
                            .style("fill", color)
                            .attr("x", function(d) {
                                return me.scales[orientX](d[xField]);
                            })
                            .attr("width", barWidth)
                            .attr("y", function(d) {
                                return me.scales[orientY](d[yField]);
                            })
                            .attr("height", function(d) {
                                return chartSize[1] - me.scales[orientY](d[yField]);
                            })
                            .on('mouseover', function(data) {
                                var tooltip = me.tooltipCmp;
                                var html = [
                                    'Some content for series ' + idx,
                                    '<br />',
                                    '<ul>',
                                    '  <li>',
                                    '<strong>' + xField + '</strong>: ',
                                    data[xField],
                                    '  </li>',
                                    '  <li>',
                                    '<strong>' + yField + '</strong>: ',
                                    data[yField],
                                    '  </li>',
                                    '</ul>'
                                ].join('');
                                tooltip.setHtml(html);
                                tooltip.setTitle('Title for ' + shape.config.name);
                                tooltip.setTarget(this);
                                tooltip.show();
                            });
            } else {
                shapeGroup.append('path')
                    .attr('class', staticMe.CSS_CLASS.SHAPE_PATH)
                    .attr('idx', staticMe.CSS_CLASS.PREFIX_IDX_SHAPE_PATH + idx)
                    .datum(me.data)
                    .style('fill', function() {
                        switch (shape.config.type) {
                            case 'line':
                                return 'none';
                            case 'area':
                                return color;
                        }
                    })
                    .style('stroke', function() {
                        switch (shape.config.type) {
                            case 'line':
                                return color;
                            case 'area':
                                return 'none';
                        }
                    })
                    .style('stroke-width', function() {
                        switch (shape.config.type) {
                            case 'line':
                                return shape.config.width;
                            case 'area':
                                return 0;
                        }
                    })
                    .attr('d', shape.shape);

                var pointGroup = shapeGroup.append('g')
                    .attr('class', staticMe.CSS_CLASS.SHAPE_POINT_GROUP)
                    .attr('idx', staticMe.CSS_CLASS.PREFIX_IDX_SHAPE_POINT_GROUP + idx);

                // TODO refactor the selectAll method below; DK
                //      pointGroup.enter()???
                pointGroup.selectAll('circle')
                    .data(me.data)
                    .enter().append('circle')
                        .filter(function(d) {
                            return Ext.isDefined(d[yField]);
                        })
                            .style('fill', color)
                            .style('stroke', darkerColor)
                            .style('stroke-width', 2)
                            .on('mouseover', function(data) {
                                var tooltip = me.tooltipCmp;
                                var html = [
                                    'Some content for series ' + idx,
                                    '<br />',
                                    '<ul>',
                                    '  <li>',
                                    '<strong>' + xField + '</strong>: ',
                                    data[xField],
                                    '  </li>',
                                    '  <li>',
                                    '<strong>' + yField + '</strong>: ',
                                    data[yField],
                                    '  </li>',
                                    '</ul>'
                                ].join('');
                                tooltip.setHtml(html);
                                tooltip.setTitle('Title for ' + shape.config.name);
                                tooltip.setTarget(this);
                                tooltip.show();
                            })
                            .attr('cx', function(d) {
                                return me.scales[orientX](d[xField]);
                            })
                            .attr('cy', function(d) {
                                return me.scales[orientY](d[yField]);
                            })
                            .attr('r', shape.config.width);
            }

        });
        if (barWidth !== undefined) {
            me.adjustForBarchart(barWidth);
        }
    },

    /**
     * When we render at least one bar chart, we need to move certain SVG
     * elements so that the center of the bars lies directly atop the
     * corresponding tick. Things like the x-axis, the legend and all non bar
     * charts will be moved by the amount of half a width of a bar.
     *
     * @param {Number} barWidth The width of one bar in the chart.
     */
    adjustForBarchart: function(barWidth) {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var CSS = staticMe.CSS_CLASS;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var additionalOffset = 2;
        var xOffset = (barWidth / 2) + additionalOffset;
        var diffObj = {
            translate: {
                x: xOffset,
                y: 0
            }
        };

        var chartSel = viewId + ' svg g.' + CSS.SHAPE_GROUP;

        // move line charts
        var lineSel = chartSel + '[shape-type="line"]';
        var lines = d3.selectAll(lineSel);
        lines.each(function() {
            var line = d3.select(this);
            staticMe.adjustTransformTranslate(line, diffObj);
        });

        // move area charts
        var areaSel = chartSel + '[shape-type="area"]';
        var areas = d3.selectAll(areaSel);
        areas.each(function() {
            var area = d3.select(this);
            staticMe.adjustTransformTranslate(area, diffObj);
        });

        // move barcharts but only by the additional offset!
        var barSel = chartSel + '[shape-type="bar"]';
        var bars = d3.selectAll(barSel);
        bars.each(function() {
            var bar = d3.select(this);
            staticMe.adjustTransformTranslate(bar, {
                translate: {
                    x: additionalOffset
                }
            });
        });

        // move legends
        var legSel = chartSel + CSS.SUFFIX_LEGEND;
        var legends = d3.selectAll(legSel);
        legends.each(function() {
            var legend = d3.select(this);
            staticMe.adjustTransformTranslate(legend, diffObj);
        });

        // move x-axis
        var xAxisSel = viewId + ' svg g.' + CSS.AXIS_X;
        var xAxis = d3.select(xAxisSel);
        staticMe.adjustTransformTranslate(xAxis, diffObj);

        // finally make the x-axis slightly longer on the left side by
        // adjusting the start point
        staticMe.adjustPathStart(xAxis.select('path'), -xOffset, 0);
    },

    /**
     *
     */
    drawLegend: function() {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var CSS = staticMe.CSS_CLASS;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var legendConfig = view.getLegend();
        var legendMargin = legendConfig.legendMargin;
        var chartSize = me.getChartSize();

        var legend = d3.select(viewId + ' svg > g')
            .append('g')
                .attr('class', CSS.SHAPE_GROUP + CSS.SUFFIX_LEGEND)
                .attr('transform', 'translate(' + (chartSize[0] + legendMargin.left) + ',' + (legendMargin.bottom) + ')');

        Ext.each(me.shapes, function(shape, idx) {
            var toggleVisibilityFunc = (function() {
                return function() {
                    var shapeGroup = me.shapeGroupByIndex(idx);
                    me.toggleShapeGroupVisibility(
                        shapeGroup, // the real group, containig shapepath & points
                        d3.select(this) // legend entry
                    );
                };
            }());

            var legendEntry = legend
                .append('g')
                .on('click', toggleVisibilityFunc)
                .attr('transform', 'translate(0, ' + (idx * 30) + ')');

            // background for the concrete legend icon, to widen clickable area.
            legendEntry.append('path')
                .attr('d', 'M-3 -14 h 25 v 16 h -25 Z')
                .style('stroke', 'none')
                // invisible, but still triggering events
                .style('fill', 'rgba(0,0,0,0)');

            legendEntry.append('path')
                .attr('d', function() {
                    switch (shape.config.type) {
                        case 'line':
                            return 'M0 -6 C 3 0, 7 0, 10 -6 S 15 -12, 20 -6';
                        case 'area':
                            return 'M0 -6 C 3 0, 7 0, 10 -6 S 15 -12, 20 -6 M20 -6 v 6 h -20 v -6 Z';
                        case 'bar':
                            return 'M0 -10 h 6 v 12 h -6 Z M7 -6 h 6 v 8 h -6 Z M14 -10 h 6 v 12 h -6 Z';
                    }
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

            legendEntry.append('text')
                .text(shape.config.name)
                .attr('text-anchor', 'start')
                .attr('dy', '0')
                .attr('dx', '25');
        });
    },

    /**
     */
    shapeGroupByIndex: function(idx) {
        var me = this;
        var staticMe = Koala.view.component.D3ChartController;
        var viewId = '#' + me.getView().getId();
        var clsShapeGroup = staticMe.CSS_CLASS.SHAPE_GROUP;
        var idxVal = staticMe.CSS_CLASS.PREFIX_IDX_SHAPE_GROUP + idx;
        var selector = [
            viewId,                      // only capture our view…
            ' svg g.' + clsShapeGroup, // only capture shapepaths…
            '[idx="' + idxVal + '"]'     // only capture the right index
        ].join('');
        return d3.select(selector);
    },

    /**
     */
    toggleShapeGroupVisibility: function(shapeGroup, legendElement) {
        var staticMe = Koala.view.component.D3ChartController;
        var CSS = staticMe.CSS_CLASS;
        var hideClsName = CSS.SHAPE_GROUP + CSS.SUFFIX_HIDDEN;
        var hideClsNameLegend = CSS.SHAPE_GROUP + CSS.SUFFIX_LEGEND + CSS.SUFFIX_HIDDEN;
        var isHidden = shapeGroup.classed(hideClsName);
        shapeGroup.classed(hideClsName, !isHidden);
        legendElement.classed(hideClsNameLegend, !isHidden);
    },

    /**
     *
     */
    getChartData: function() {
        var me = this;
        var view = me.getView();
        var featureType = view.getFeatureType();

        var startDate = "2015-01-01T00:00:00.000Z";
        var endDate = "2015-01-20T00:00:00.000Z";
        var timeField = "end_measure";

        Koala.util.Layer.addLayerToMap({
            "id": "f917f393-fb9b-4345-99cf-8d2fcfab8d3d",
            "dspTxt": "niederschlag_24h",
            "inspireId": "",
            "filters": [
                {
                    "type":"pointintime",
                    "param":"end_measure",
                    "interval":"24",
                    "unit":"hours",
                    "mindatetimeformat":"Y-m-dTH:i:s",
                    "mindatetimeinstant":"2015-01-01T09:00:00",
                    "maxdatetimeformat":"Y-m-dTH:i:s",
                    "maxdatetimeinstant":"2015-11-15T09:00:00",
                    "defaulttimeformat":"Y-m-dTH:i:s",
                    "defaulttimeinstant":"2015-11-15T09:00:00"
                }
            ],
            "layerConfig":{
                "wms":{
                    "url":"http://10.133.7.63/geoserver/orig-f-bfs/wms" ,
                    "layers":"orig-f-bfs:niederschlag_24h",
                    "transparent":"true",
                    "version":"1.3.0",
                    "styles":"",
                    "format":"image/png"
                },
                "wfs":{
                    "url":"http://10.133.7.63/geoserver/orig-f-bfs/ows"
                },
                "download":{
                    "url":"http://10.133.7.63/geoserver/orig-f-bfs/ows?service=WFS&request=GetFeature&version=2.0.0&typeNames=orig-f-bfs:niederschlag_24h",
                    "filterFieldStart":"",
                    "filterFieldEnd":""
                },
                "olProperties":{
                    "hoverTpl":"<b>niederschlag<\/b>: [[locality_name]]<br>[[end_measure]]<br>Messwert (mm):[[value]]",
                    "legendUrl":"http://10.133.7.63/geoserver/orig-f-bfs/ows?service=wms&request=GetLegendGraphic&layer=imis:niederschlag_24h&width=40&height=40&format=image/png",
                    "allowHover":"true",
                    "allowShortInfo":"true",
                    "allowDownload":"true",
                    "allowRemoval":"true",
                    "allowOpacityChange":"true",
                    "hasLegend":"true",
                    "encodeFilterInViewparams":"true"
                },
                "timeSeriesChartProperties":{
                    "xAxisAttribute":"end_measure",
                    "yAxisAttribute":"value",
                    "dspUnit":"mm",
                    "yAxisLabelRotation":"0",
                    "dataFeatureType":"orig-f-bfs:niederschlag_24h_timeseries",
                    "colorSequence":"#5A005A,#0C2C84,#225EA8,#1D91C0,#41B6C4,#7FCDBB,#C7E9B4,#EDF8B1",
                    "strokeWidthSequence":"2",
                    "strokeOpacitySequence":"0.9",
                    "titleTpl":"niederschlag_24h",
                    "seriesTitleTpl":"[[locality_name]]",
                    "ui_series_step":"false",
                    "allowFilterForm":"true",
                    "tooltipTpl":"Dies ist die Station [[title]]. Hier wurde am [[end_measure]] folgender Wert gemessen: [[value]]",
                    "hasToolTip":"true",
                    "yAxis_grid":"\\{\\\"odd\\\":\\{\\\"opacity\\\":1,\\\"fill\\\":\\\"#ddd\\\",\\\"stroke\\\":\\\"#bbb\\\",\\\"lineWidth\\\":1\\}\\}",
                    "end_timestamp":"now",
                    "duration":"P2WT",
                    "end_timestamp_format":"Y-m-dTH:i:s",
                    "featureIdentifyField":"id",
                    "param_viewparams":"locality_code:[[id]]",
                    "featureShortDspField":"locality_name",
                    "featureIdentifyFieldDataType":"string"
                },
                "barChartProperties":{
                }
            }
        });

        var layer = BasiGX.util.Layer.getLayerByFeatureType(featureType);

        // TODO refactor this gathering of the needed filter attribute
        var filters = layer.metadata.filters;
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

        // getTime() TODO. sommer and wintertime?!
        var start = Ext.Date.parse(startDate, Koala.util.Date.ISO_FORMAT);
        var end = Ext.Date.parse(endDate, Koala.util.Date.ISO_FORMAT);
        // var diff = Ext.Date.diff(start, end, Ext.Date.SECOND);
        // var steps = diff / intervalInSeconds;

        var url = "http://10.133.7.63/geoserver/orig-f-bfs/ows?";

        var requestParams = {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            // TODO: replace with real layer
            typeName: 'orig-f-bfs:niederschlag_24h_timeseries',
            outputFormat: 'application/json',
            filter: me.getDateTimeRangeFilter(startDate, endDate, timeField),
            // TODO: replace with value from metadata timeRangeFilter.param
            sortBy: 'end_measure'
        };

        Ext.Ajax.request({
            url: url,
            method: 'GET',
            params: requestParams,
            success: function(resp) {
                var jsonObj = Ext.decode(resp.responseText);

                var snapObject = me.getTimeStampSnapObject(
                        start, intervalInSeconds, jsonObj.features, 'end_measure');

                var compareableDate, matchingFeature;

                var xAxisAttr = 'end_measure';
                var valueField = 'value';
                var yAxisAttr = 'value';
                // var dataObjectField = 'value';

                var mockUpData = [];

                while(start <= end){

                    var newRawData = {};

                    compareableDate = Ext.Date.format(start, "timestamp");
                    matchingFeature = snapObject[compareableDate];

                    // Why did we do this?
                    // Ext.Date.format(date, Koala.util.Date.ISO_FORMAT);
                    newRawData[xAxisAttr] = start;
                    newRawData[valueField] = undefined;

                    if(matchingFeature){
                        newRawData[valueField] = matchingFeature.properties[yAxisAttr];
                        //newRawData[dataObjectField] = Ext.clone(matchingFeature.properties);
                    }

                    mockUpData.push(newRawData);
                    start = Ext.Date.add(start, Ext.Date.SECOND, intervalInSeconds);
                }

                me.data = mockUpData;

                me.fireEvent('chartdatachanged');

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

        // startDate = timeSeriesWin.down('datefield[name=datestart]').getValue();
        // endDate = timeSeriesWin.down('datefield[name=dateend]').getValue();
        // timeField = layerFilter.param;

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
    }

});
