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
        var targetLayer = view.getTargetLayer();
        var selectedStation = view.getSelectedStation();
        var chartConfig = targetLayer.metadata.layerConfig.barChartProperties;
        var featureProps = selectedStation.getProperties();
        var fields = chartConfig.chartFieldSequence.split(',');
        var colors = chartConfig.colorSequence.split(',');

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
     * Draws the root <svg>-element into the <div>-element rendered by the
     * Ext component.
     */
    drawSvgContainer: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
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
                .attr('viewBox', "0 0 " + view.getWidth() + " " + view.getHeight())
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
            var chartAxis;
            if(orient === "left"){
                chartAxis = axis(scale);
            } else {
                var tickFormat = axisConfig.format ? d3.format(axisConfig.format) : undefined;
                chartAxis = axis(scale)
                    .ticks(axisConfig.ticks)
                    .tickValues(axisConfig.values)
                    .tickFormat(tickFormat)
                    .tickSize(axisConfig.tickSize || 6)
                    .tickPadding(axisConfig.tickPadding || 3);
            }

            me.axes[orient] = chartAxis;
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
                .text(titleConfig.label || '');
    },

    /**
     *
     */
    drawAxes: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
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
                        'translate(0,' + chartSize[1] + ')' : undefined;

                labelTransform = 'translate(' + (chartSize[0] / 2) + ', 0)';
                labelPadding = axisConfig.labelPadding || 35;
            } else if (orient === 'left' || orient === 'right') {
                cssClass = CSS.AXIS + ' ' + CSS.AXIS_Y;
                axisTransform = (orient === 'right') ?
                        'translate(' + chartSize[0] + ', 0)' : undefined;

                labelTransform = 'rotate(-90), translate(' + (chartSize[1] / 2 * -1) + ', 0)';
                labelPadding = (axisConfig.labelPadding || 25) * -1;
            }

            // We draw the left axis in the grid part as it fits our needs for barcharts.
            if (orient === 'top' || orient === 'bottom') {
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
            }

        });
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
                    return Ext.isDefined(d[yField]);
                })
                    .style('fill', function(d) {
                        return d.color;
                    })
                    .style('opacity', shapeConfig.opacity)
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

                        // Seperate prereplacements. Not sure if this could be done by replaceTemplateStrings util
                        tooltipTpl = tooltipTpl.replace("[[xAxisAttribute]]", data[xField]);
                        tooltipTpl = tooltipTpl.replace("[[yAxisAttribute]]", data[yField]);

                        var html = Koala.util.String.replaceTemplateStrings(tooltipTpl, selectedStation);
                        tooltipCmp.setHtml(html);
                        tooltipCmp.setTarget(this);
                        tooltipCmp.show();
                    });

        var bars = d3.selectAll(viewId + ' .k-d3-bar');

        // TODO for DK, get property just as we do it elsewhere
        var labelFunc = Koala.util.String.coerce(
            view.getTargetLayer().metadata.layerConfig.barChartProperties.labelFunc
        ) || staticMe.identity;

        bars.append("text")
            .filter(function(d) {
                return Ext.isDefined(d[yField]);
            })
            // TODO add configurable labelfunc e.g. unter nachweisgrenze
            .text(function(d){
                return labelFunc(d[yField]);
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

        var staticMe = Koala.view.component.D3BarChartController;
        var chartSize = me.getChartSize();

        var axis = staticMe.ORIENTATION.left;
        var scale = me.scales.left;
        var tickSize = chartSize[0] * -1;

        me.gridAxes.left = axis(scale)
            .tickSize(tickSize);
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

        var staticMe = Koala.view.component.D3BarChartController;
        var CSS = staticMe.CSS_CLASS;
        var viewId = '#' + view.getId();

        var cssClass = CSS.GRID + ' ' + CSS.GRID_Y;

        d3.select(viewId + ' svg > g')
            .append('g')
                .attr('class', cssClass)
                .call(me.gridAxes.left);

        d3.selectAll(viewId + ' svg g.' + CSS.GRID + ' line')
            .style('stroke-width', gridConfig.width)
            .style('stroke', gridConfig.color)
            .style('stroke-opacity', gridConfig.opacity);
    },

    /**
     * Removes the current legend from the chart (if it exists) and redraws the
     * legend by looking atour internal data.
     */
    redrawLegend: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BarChartController;
        var CSS = staticMe.CSS_CLASS;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var legendCls = CSS.SHAPE_GROUP + CSS.SUFFIX_LEGEND;
        var legend = d3.select(viewId + ' svg g.' + legendCls);
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
                    me.toggleBarGroupVisibility(
                        barGroup, // the real group, containig shapepath & points
                        d3.select(this) // legend entry
                    );
                };
            }());

            var legendEntry = legend
                .append('g')
                .on('click', toggleVisibilityFunc)
                .attr('transform', 'translate(0, ' + (idx * 30) + ')')
                .attr('idx', staticMe.CSS_CLASS.PREFIX_IDX_LEGEND_GROUP + idx);

            // background for the concrete legend icon, to widen clickable area.
            legendEntry.append('path')
                .attr('d', 'M-3 -14 h 25 v 16 h -25 Z')
                .style('stroke', 'none')
                // invisible, but still triggering events
                .style('fill', 'rgba(0,0,0,0)');

            legendEntry.append('path')
                .attr('d', 'M0 -10 h 6 v 12 h -6 Z M7 -6 h 6 v 8 h -6 Z M14 -10 h 6 v 12 h -6 Z')
                .style('fill', dataObj.color);

            legendEntry.append('text')
                .text(dataObj.key)
                .attr('text-anchor', 'start')
                .attr('dy', '0')
                .attr('dx', '25');

            legendEntry.append('text')
                .text('✖')
                .attr('class', CSS.DELETE_ICON)
                .attr('text-anchor', 'start')
                .attr('dy', '1')
                .attr('dx', '150') // TODO will be hard to do dynamically…
                .on('click', me.generateDeleteCallback(dataObj));
        });
    },

    /**
     * Generates a callback that can be used for the click event on the delete
     * icon. Inside this callback all relevant parts of the series are removed.
     *
     * @param {Object} shape The current shape object to handle.
     * @param {[type]} idx The index of the shape object in the array of all
     *     shapes.
     * @return {Function} The callback to be used as click handler on the delete
     *     icon.
     */
    generateDeleteCallback: function(dataObj) {
        var me = this;
        var deleteCallback = function() {
            var name = dataObj.key;
            // TODO i18n
            var title = 'Serie "' + name + '" entfernen?';
            var msg = 'Möchten sie die Serie <b>' + name + '</b>' +
                ' aus dem Graphen entfernen?';
            var confirmCallback = function(buttonId) {
                if (buttonId === 'ok' || buttonId === 'yes') {
                    me.deleteEverything(dataObj, this.parentNode);
                    me.redrawLegend();
                }
            };
            Ext.Msg.confirm(title, msg, confirmCallback, this);
        };
        return deleteCallback;
    },

    /**
     *
     */
    deleteEverything: function(dataObj, legendElement) {
        // Data
        this.deleteData(dataObj.key);
        // Shape
        this.deleteBarGroup(dataObj.key);
        // Legend
        this.deleteLegendEntry(legendElement);
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
     * Deletes the legendentry passed from the DOM.
     *
     * @param  {DOMElement} legendEntry The DOM element to remove.
     */
    deleteLegendEntry: function (legendEntry) {
        var parent = legendEntry && legendEntry.parentNode;
        if (parent) {
            parent.removeChild(legendEntry);
        }
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

        return d3.select(viewId + ' svg g.' + CSS.SHAPE_GROUP + ' g[id="' + key + '"]');
    },

    /**
     *
     */
    toggleBarGroupVisibility: function(barGroup, legendElement) {
        var staticMe = Koala.view.component.D3BarChartController;
        var CSS = staticMe.CSS_CLASS;
        var hideClsName = CSS.SHAPE_GROUP + CSS.SUFFIX_HIDDEN;
        var hideClsNameLegend = CSS.SHAPE_GROUP + CSS.SUFFIX_LEGEND + CSS.SUFFIX_HIDDEN;
        if (barGroup) {
            var isHidden = barGroup.classed(hideClsName);
            barGroup.classed(hideClsName, !isHidden);
            legendElement.classed(hideClsNameLegend, !isHidden);
        }
    }

});
