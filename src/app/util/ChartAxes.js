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
 * A utility class with chart manipulation functions regarding axes.
 *
 * @class Koala.util.ChartAxes
 */
Ext.define('Koala.util.ChartAxes', {

    requires: [
        'Koala.view.component.D3BaseController',
        'Koala.util.Date',
        'Koala.util.Label',
        'Koala.util.Object',
        'Koala.util.ChartConstants'
    ],

    statics: {

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
            date = moment(date);
            if (Koala.Application.isUtc()) {
                date = Koala.util.Date.removeUtcOffset(date);
            }
            date = Koala.util.Date.getTimeReferenceAwareMomentDate(date);
            var formatMillisecond = d3.timeFormat('.%L'),
                formatSecond = d3.timeFormat(':%S'),
                formatMinute = d3.timeFormat('%H:%M'),
                formatHour = d3.timeFormat('%H:%M'),
                formatDay = d3.timeFormat('%a %d'),
                formatWeek = d3.timeFormat('%b %d'),
                formatMonth = d3.timeFormat('%B'),
                formatYear = d3.timeFormat('%Y');

            return (d3.timeSecond(date) < date ? formatMillisecond
                : d3.timeMinute(date) < date ? formatSecond
                    : d3.timeHour(date) < date ? formatMinute
                        : d3.timeDay(date) < date ? formatHour
                            : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
                                : d3.timeYear(date) < date ? formatMonth
                                    : formatYear)(date);
        },

        toggleScaleForAxis: function(axis, controller) {
            if (axis.scale === 'linear' || axis.scale === undefined) {
                axis.scale = 'log';
            } else if (axis.scale === 'log') {
                axis.scale = 'linear';
            }
            controller.getChartData();
        },

        showToggleScaleMenu: function(attachedSeries, chart, elm, label) {
            attachedSeries = JSON.parse(attachedSeries);
            var items = [chart.getAxes().left];
            items = items.concat(attachedSeries);
            var menuItems = [];
            var i = 0;
            var me = this;
            var controller = chart.getController();

            Ext.each(items, function(axis, idx) {
                var text = axis.yAxisLabel;
                if (!text) {
                    text = label + ' ' + (++i);
                }
                menuItems.push({
                    text: text,
                    handler: function() {
                        if (idx === 0) {
                            me.toggleScaleForAxis(
                                chart.getAxes().left,
                                controller
                            );
                        } else {
                            me.toggleScaleForAxis(
                                controller.attachedSeriesAxisConfig[idx-1],
                                controller
                            );
                        }
                    }
                });
            });

            var menu = Ext.create({
                items: menuItems,
                xtype: 'menu'
            });
            if (elm) {
                menu.showBy(elm);
            } else {
                Ext.Viewport.setMenu(menu, {
                    side: 'right'
                });
                Ext.Viewport.showMenu('right');
            }
        },

        /**
         * Creates a new d3 axis.
         * @param  {object} axisConfig configuration object for the axis
         * @param  {Function}  orient     the d3 axis orientation function
         * @param  {Function}  scale      the d3 axis scale function
         * @return {Function}             the newly created d3 axis
         */
        createAxis: function(axisConfig, orient, scale) {
            var Const = Koala.util.ChartConstants;
            var axis = Const.ORIENTATION[orient];

            // https://github.com/d3/d3-format
            var tickFormatter;
            if (axisConfig.scale === 'time') {
                tickFormatter = this.getMultiScaleTimeFormatter;
            } else if (axisConfig.format) {
                tickFormatter = d3.format(axisConfig.format || ',.0f');
            } else {
                tickFormatter = function(tickString) {
                    var isTime = (new moment(tickString, moment.ISO_8601, true))
                        .isValid();

                    tickString = isTime ? Koala.util.Date.getFormattedDate(
                        new moment(tickString)) : tickString;
                    return tickString;
                };
            }

            if (!axis) {
                return;
            }

            return axis(scale)
                .ticks(axisConfig.ticks)
                .tickValues(axisConfig.tickValues)
                .tickFormat(tickFormatter)
                .tickSize(axisConfig.tickSize || 6)
                .tickPadding(axisConfig.tickPadding || 3);
        },

        /**
         * Render a single axis.
         * @param  {String}  orient     top/left/bottom/top
         * @param  {Object} axisConfig axis configuration object
         * @param  {Array}  chartSize  pixel size of the chart
         * @param  {String}  viewId     the Ext view id
         * @param  {Object} axis the d3 axis object
         * @param  {Number} offsetX the x offset, if any
         * @param  {Number} index the index, if an index should be set
         * @param  {Object} metadata the layer metadata
         */
        drawAxis: function(orient, axisConfig, chartSize, viewId, axis, offsetX, index, metadata) {
            var staticMe = Koala.view.component.D3BaseController;
            var Const = Koala.util.ChartConstants;
            var makeTranslate = staticMe.makeTranslate;
            var CSS = Const.CSS_CLASS;
            var series = Koala.util.Object.getPathStrOr(
                metadata,
                'layerConfig/timeSeriesChartProperties/attachedSeries',
                '[]'
            );
            series = JSON.parse(series);

            var axisTransform;
            var labelTransform;
            var labelPadding;
            var cssAxisClass;
            var cssLabelClass;
            var totalOffset = 0;
            Ext.each(series, function(s) {
                totalOffset += s.axisWidth || 40;
            });

            if (orient === 'top' || orient === 'bottom') {
                cssAxisClass = CSS.AXIS + ' ' + CSS.AXIS_X;
                cssLabelClass = CSS.AXIS_LABEL + ' ' + CSS.AXIS_LABEL_X;
                axisTransform = (orient === 'bottom') ?
                    makeTranslate(totalOffset, chartSize[1]) : undefined;

                labelTransform = makeTranslate(chartSize[0] / 2, 0);
                labelPadding = axisConfig.labelPadding || 35;
            } else if (orient === 'left' || orient === 'right') {
                cssAxisClass = CSS.AXIS + ' ' + CSS.AXIS_Y;
                if (index) {
                    cssAxisClass += '_' + index;
                }
                cssLabelClass = CSS.AXIS_LABEL + ' ' + CSS.AXIS_LABEL_Y;
                axisTransform = (orient === 'right') ?
                    makeTranslate(chartSize[0], 0) : undefined;
                if (offsetX) {
                    axisTransform = makeTranslate(offsetX, 0);
                }
                var translate = makeTranslate(chartSize[1] / -2, 0);
                labelTransform = 'rotate(-90), ' + translate;
                labelPadding = (axisConfig.labelPadding || 25) * -1;
            }
            if (index !== undefined) {
                // attached series axes hidden by default
                cssAxisClass += ' k-d3-hidden';
            }

            d3.select(viewId + ' svg > g')
                .append('g')
                .attr('class', cssAxisClass)
                .attr('transform', axisTransform)
                .call(axis)
                .append('text')
                .attr('transform', labelTransform)
                .attr('dy', labelPadding)
                .attr('fill', axisConfig.labelColor || '#000')
                .attr('class', cssLabelClass)
                .style('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .style('font-size', axisConfig.labelSize || 12)
                .text(axisConfig.label || '');

            if (axisConfig.rotateXAxisLabel && (orient === 'top' || orient === 'bottom')) {
                d3.selectAll(viewId + ' .' + CSS.AXIS + '.' + CSS.AXIS_X + ' > g > text')
                    .attr('transform', 'rotate(-55)')
                    .attr('dx', '-10px')
                    .attr('dy', '1px')
                    .style('text-anchor', 'end');
            } else if (orient === 'top' || orient === 'bottom') {
                Koala.util.Label.handleLabelWrap('.' + CSS.AXIS + '.' + CSS.AXIS_X);
            }
        },

        /**
         * Redraw a single axis.
         * @param  {function} axisGenerator the d3 axis
         * @param  {String}  orient        the axis orientations
         * @param  {Object}  metadata      the current layer metadata
         * @param  {Array}  chartSize     the chart size
         * @param  {String}  viewId        the id of the chart viewId
         * @param  {Object} axisConfig axis configuration object
         */
        redrawAxis: function(axisGenerator, orient, metadata, chartSize, viewId, axisConfig) {
            var staticMe = Koala.view.component.D3BaseController;
            var Const = Koala.util.ChartConstants;
            var makeTranslate = staticMe.makeTranslate;
            var axisTransform;
            var labelTransform;
            var axis;
            var CSS = Const.CSS_CLASS;
            var axisSelector = '#' + viewId + ' svg g.' + CSS.AXIS;
            var totalOffset = 0;
            var seriesConfigs = Koala.util.Object.getPathStrOr(
                metadata,
                'layerConfig/timeSeriesChartProperties/attachedSeries',
                '[]'
            );
            if (Ext.isString(seriesConfigs)) {
                seriesConfigs = JSON.parse(seriesConfigs);
            }
            var idx = 0;
            Ext.each(seriesConfigs, function(s) {
                var node = d3.select('.k-d3-axis-y_' + (++idx));
                if (node.node() && !node.classed('k-d3-hidden')) {
                    totalOffset += s.axisWidth || 40;
                }
            });

            if (orient === 'top' || orient === 'bottom') {
                axisTransform = (orient === 'bottom') ?
                    makeTranslate(totalOffset, chartSize[1]) : undefined;
                labelTransform = makeTranslate(chartSize[0] / 2, 0);

                axis = d3.select(axisSelector + '.' + CSS.AXIS_X);
            } else if (orient === 'left' || orient === 'right') {
                axisTransform = (orient === 'right') ?
                    makeTranslate(0, chartSize[1]) : undefined;
                var translate = makeTranslate(chartSize[1] / -2, 0);
                labelTransform = 'rotate(-90), ' + translate;

                axis = d3.select(axisSelector + '.' + CSS.AXIS_Y);
            }

            if (!axis) {
                return;
            }

            axis
                .transition()
                .attr('transform', axisTransform)
                .call(axisGenerator);

            // Redraw the axis label
            axis.select('.' + CSS.AXIS_LABEL)
                .transition()
                .attr('transform', labelTransform);

            if (axisConfig.rotateXAxisLabel && (orient === 'top' || orient === 'bottom')) {
                d3.selectAll(axisSelector + '.' + CSS.AXIS_X + ' > g > text')
                    .attr('transform', 'rotate(-55)')
                    .attr('dx', '-10px')
                    .attr('dy', '1px')
                    .style('text-anchor', 'end');
            } else {
                if (orient === 'top' || orient === 'bottom') {
                    // timeout because of resize animations,
                    // width determination is wrong when calculating instantly
                    window.setTimeout(function() {
                        Koala.util.Label.handleLabelWrap(axisSelector + '.' + CSS.AXIS_X);
                    }, 500);
                }

            }
        },

        /**
         * Creates the grid axis.
         */
        createGridAxes: function(gridConfig, chartSize, scales, gridAxes) {
            if (!gridConfig.show) {
                return false;
            }

            var Const = Koala.util.ChartConstants;
            var orientations = ['bottom', 'left'];

            Ext.each(orientations, function(orient) {
                var axis = Const.ORIENTATION[orient];
                var scale = scales[orient];
                var tickSize;

                if (orient === 'top' || orient === 'bottom') {
                    tickSize = chartSize[1];
                } else if (orient === 'left' || orient === 'right') {
                    tickSize = chartSize[0] * -1;
                }

                var chartAxis = axis(scale)
                    .tickFormat('')
                    .tickSize(tickSize);

                gridAxes[orient] = chartAxis;
            });
        }

    }

});
