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
 * @class Koala.view.component.D3BarChartController
 */
Ext.define('Koala.view.component.D3BarChartController', {
    extend: 'Koala.view.component.D3BaseController',
    alias: 'controller.component-d3barchart',

    /**
     *
     */
    scales: {},
    shapes: [],
    axes: {},
    gridAxes: {},
    tooltipCmp: null,
    // zoomInteraction: null,
    initialPlotTransform: null,
    data: {},
    chartRendered: false,
    ajaxCounter: 0,
    chartConfig: null,
    featureProps: null,

    /**
     * The default chart margin to apply.
     *
     * @type {Object}
     */
    defaultChartMargin: {
        top: 50,
        right: 200,
        bottom: 50,
        left: 50
    },

    /**
     *
     */
    onShow: function() {
        var me = this;

        // We have to cleanup manually.  WHY?!
        me.scales = {};
        me.shapes = [];
        me.axes = {};
        me.gridAxes = {};
        me.data = [];

        me.prepareData();
        me.drawChart();
    },

    /**
     *
     */
     prepareData: function() {
        var me = this;
        var staticMe = me.self;
        var view = me.getView();
        var selectedStation = view.getSelectedStation();
        var featureProps = selectedStation.getProperties();
        var fields = view.getChartFieldSequence().split(',');
        var colors = view.getShape().color.split(',');

        Ext.each(fields, function(field, idx) {
            var dataObj = {};
            dataObj.key = field;
            dataObj.value = featureProps[field];
            dataObj.color = colors[idx] || staticMe.getRandomColor();
            me.data.push(dataObj);
        });
    },

    /**
     *
     */
    drawChart: function() {
        var me = this;

        me.drawSvgContainer();
        me.drawLegendContainer();

        me.createScales();
        me.createAxes();
        me.createGridAxes();
        me.createTooltip();

        me.setDomainForScales();

        me.drawTitle();
        me.drawAxes();
        me.drawGridAxes();
        me.drawShapes();

        me.drawLegend();
    },

    /**
     *
     */
    redrawChart: function() {
        var me = this;

        me.deleteShapeContainerSvg();

        me.createScales();
        me.createAxes();
        me.createGridAxes();

        me.setDomainForScales();

        me.redrawAxes();
        me.redrawGridAxes();
        me.redrawShapes();
    },

    /**
     *
     */
    deleteShapeContainerSvg: function() {
        var view = this.getView();
        var svg = d3.select('#' + view.getId() + ' svg svg');
        if (svg && !svg.empty()) {
            svg.node().remove();
        }
    },

    /**
     *
     */
    createScales: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
        var view = me.getView();
        var chartSize = me.getChartSize();

        Ext.iterate(view.getAxes(), function(orient, axisConfig) {
            var scaleType = staticMe.SCALE[axisConfig.scale];
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
     * [createAxes description]
     * @return {[type]} [description]
     */
    createAxes: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
        var view = me.getView();
        var axesConfig = view.getAxes();

        Ext.iterate(axesConfig, function(orient, axisConfig) {
            var axis = staticMe.ORIENTATION[orient];
            var scale = me.scales[orient];

            // https://github.com/d3/d3-format
            var tickFormatter = axisConfig.format ? d3.format(axisConfig.format) : undefined;

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
     * Sets the domain for each scale in the chart by the use of the extent
     * of the given input data values.
     */
    setDomainForScales: function() {
        var me = this;

        // iterate over all scales/axis orientations and all shapes to find the
        // corresponding data index for each scale. Set the extent (max/min range
        // in this data index) for each scale.
        Ext.iterate(me.scales, function(orient) {
            if (orient === 'top' || orient === 'bottom') {
                var topBottomDomain = me.data.map(function(d) {
                    return d.key;
                });
                me.scales[orient].domain(topBottomDomain);
            } else if (orient === 'left' || orient === 'right') {
                var minOffsetTopFactor = 0.1; // was 0.05 ~ val/20
                var min = 0;
                var max = d3.max(me.data, function(d) {
                    if (d.hidden) {
                        return;
                    }
                    return d.value + d.value * minOffsetTopFactor;
                });
                // max = Math.ceil(max);
                me.scales[orient].domain([min, max]);
            }
        });
    },

    /**
     *
     */
    drawTitle: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var titleConfig = view.getTitle();
        var chartSize = me.getChartSize();
        var translate = staticMe.makeTranslate(chartSize[0] / 2, 0);

        d3.select(viewId + ' svg > g')
            .append('text')
                .attr('transform', translate)
                .attr('dy', (titleConfig.labelPadding || 18) * -1)
                .attr('fill', titleConfig.labelColor || '#000')
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style('font-size', titleConfig.labelSize || 20)
                .text(titleConfig.label || '');
    },

    /**
     *
     */
    drawAxes: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
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

                var labelTranslate = makeTranslate(chartSize[1] / -2, 0);
                labelTransform = 'rotate(-90), ' + labelTranslate;
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
     * [redrawShapes description]
     * @return {[type]} [description]
     */
    redrawShapes: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var shapeGroup = d3.select(viewId + ' .' + staticMe.CSS_CLASS.SHAPE_GROUP);

        shapeGroup.node().remove();

        me.drawShapes();
    },

    /**
     *
     */
    drawShapes: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
        var view = me.getView();
        var selectedStation = view.getSelectedStation();
        var viewId = '#' + view.getId();
        var chartSize = me.getChartSize();
        var barWidth;

        var shapeConfig = view.getShape();
        var xField = 'key';
        var yField = 'value';
        var orientX = 'bottom';
        var orientY = 'left';

        var shapeGroup = d3.select(viewId + ' svg > g')
            .append('g')
                .attr('class', staticMe.CSS_CLASS.SHAPE_GROUP);

        barWidth = (chartSize[0] / me.data.length);
        barWidth -= staticMe.ADDITIONAL_BAR_MARGIN;

        shapeGroup
            .selectAll('rect')
                .data(me.data)
            .enter().append('g')
                .attr('class', staticMe.CSS_CLASS.BAR)
                .attr('id', function(d) {
                    return d[xField];
                })
                .append('rect')
                .filter(function(d) {
                    return (Ext.isDefined(d[yField]) && !d.hidden);
                })
                    .style('fill', function(d) {
                        return d.color || staticMe.getRandomColor();
                    })
                    // .style('opacity', shapeConfig.opacity)
                    .attr('x', function(d) {
                        return me.scales[orientX](d[xField]);
                    })
                    .attr('y', function(d) {
                        return me.scales[orientY](d[yField]);
                    })
                    .attr('width', barWidth)
                    .attr('height', function(d) {
                        return chartSize[1] - me.scales[orientY](d[yField]);
                    })
                    .on('mouseover', function(data) {
                        var tooltipCmp = me.tooltipCmp;
                        var tooltipTpl = shapeConfig.tooltipTpl;
                        var html = Koala.util.String.replaceTemplateStrings(tooltipTpl, {
                            xAxisAttribute: data[xField],
                            yAxisAttribute: data[yField]
                        });
                        html = Koala.util.String.replaceTemplateStrings(html, data);
                        html = Koala.util.String.replaceTemplateStrings(html, selectedStation);
                        tooltipCmp.setHtml(html);
                        tooltipCmp.setTarget(this);
                        tooltipCmp.show();
                    });

        var bars = d3.selectAll(viewId + ' .k-d3-bar');
        var labelFunc = view.getLabelFunc() || staticMe.identity;

        bars.append("text")
            .filter(function(d) {
                return (Ext.isDefined(d[yField]) && !d.hidden);
            })
            .text(function(d){
                return labelFunc(d[yField], d);
            })
            .attr("x", function(d) {
                 return me.scales[orientX](d[xField]);
            })
            .attr("y", function(d) {
                 return me.scales[orientY](d[yField]);
            })
            .attr('transform', 'translate(' + (barWidth / 2) + ', -5)')
            .attr("text-anchor", "middle")
            // TODO make configurable. Generic from css config
            .style("font-family", "sans-serif")
            .style("font-size", "11px")
            .style("fill", "#000")
            .style("font-weight", "bold")
            .style("unselectable", "on");
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

            axis
                .transition()
                .call(axisGenerator);
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

            axis
                .transition()
                .call(axisGenerator);
        });
    },

    /**
     * Removes the current legend from the chart (if it exists) and redraws the
     * legend by looking at our internal data (by calling #drawLegend).
     */
    redrawLegend: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
        var CSS = staticMe.CSS_CLASS;
        var legendCls = CSS.SHAPE_GROUP + CSS.SUFFIX_LEGEND;
        var legend = this.legendSvg.select('g.' + legendCls);
        if (legend) {
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
        var staticMe = Koala.view.component.D3BarChartController;
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

        Ext.each(me.data, function(dataObj, idx) {
            var toggleVisibilityFunc = (function() {
                return function() {
                    var target = d3.select(d3.event.target);
                    if (target && target.classed(CSS.DELETE_ICON)) {
                        // click happened on the delete icon, no visibility
                        // toggling. The deletion is handled in an own event
                        // handler
                        return;
                    }
                    var barGroup = me.getBarGroupByKey(dataObj['key']);
                    me.toggleGroupVisibility(
                        barGroup,       // the real group, containig shapepath & points
                        d3.select(this) // legend entry
                    );
                    var SHAPE_GROUP = CSS.SHAPE_GROUP;
                    var SUFFIX_HIDDEN = CSS.SUFFIX_HIDDEN;
                    var hideClsNameLegend = SHAPE_GROUP + CSS.SUFFIX_LEGEND + SUFFIX_HIDDEN;
                    d3.select(this).classed(hideClsNameLegend, !dataObj.hidden);
                    dataObj.hidden = !dataObj.hidden;
                    me.redrawChart();
                };
            }());

            var curTranslateY = (idx + 1) * legendEntryHeight;
            var legendEntry = legend
                .append('g')
                    .on('click', toggleVisibilityFunc)
                    .attr('transform', staticMe.makeTranslate(0, curTranslateY))
                    .attr('idx', CSS.PREFIX_IDX_LEGEND_GROUP + dataObj.key);

            // background for the concrete legend icon, to widen clickable area.
            legendEntry.append('path')
                .attr('d', SVG_DEFS.LEGEND_ICON_BACKGROUND)
                .style('stroke', 'none')
                // invisible, but still triggering events
                .style('fill', 'rgba(0,0,0,0)');

            legendEntry.append('path')
                .attr('d', SVG_DEFS.LEGEND_ICON_BAR)
                .style('fill', dataObj.color);

            var nameAsTooltip = dataObj.key;
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
                .on('click', me.generateDeleteCallback(dataObj));
        });
    },

    /**
     *
     */
    deleteEverything: function(dataObj) {
        // Data
        this.deleteData(dataObj.key);
        // Shape
        this.deleteBarGroup(dataObj.key);
        // Legend
        this.deleteLegendEntry(dataObj.key);

        this.redrawChart();
        this.redrawLegend();
    },

    /**
     *
     */
    deleteData: function(dataKey) {
        var me = this;
        var dataObjToDelete = Ext.Array.findBy(me.data, function(dataObj){
            return dataObj.key === dataKey;
        });
        Ext.Array.remove(me.data, dataObjToDelete);
    },

    /**
     * Removes the barGroup series specified by the given dataKey.
     */
    deleteBarGroup: function(dataKey) {
        var barGroup = this.getBarGroupByKey(dataKey);
        barGroup.node().remove();
    },

    /**
     *
     */
    getBarGroupByKey: function(key) {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
        var CSS = staticMe.CSS_CLASS;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var selector = viewId + ' svg g.' + CSS.SHAPE_GROUP +
            ' g[id="' + key + '"]';
        return d3.select(selector);
    }

});
