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
     * Called on painted event. Only used in modern toolkit.
     *
     * @private
     */
    onPainted: function() {
        var me = this;
        me.onBoxReady();
    },

    /**
     *
     */
    onBoxReady: function() {
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

        me.chartRendered = true;
    },

    /**
     *
     */
    redrawChart: function() {
        var me = this;

        if (me.chartRendered && me.data) {

            me.updateSvgContainerSize();

            me.deleteShapeContainerSvg();

            me.createScales();
            me.createAxes();
            me.createGridAxes();

            me.setDomainForScales();

            me.redrawTitle();
            me.redrawAxes();
            me.redrawGridAxes();
            me.redrawShapes();

            me.updateLegendContainerPosition();
        }
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
