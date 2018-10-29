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
  * A base class for both the D3ChartController and the D3BarChartController.
  *
  * @class Koala.view.component.D3BaseController
  */
Ext.define('Koala.view.component.D3BaseController', {
    extend: 'Ext.app.ViewController',

    inheritableStatics: {

        /**
         * Returns a string ready to be used in a transform-attribute for the
         * passed parameters `x` and `y`.
         *
         * @param {Number} x The amount to translate in horizontal direction.
         * @param {Number} y The amount to translate in vertical direction.
         * @return {String} A string ready to be used in a transform-attribute.
         */
        makeTranslate: function(x, y) {
            return 'translate(' + x + ',' + y + ')';
        },

        /**
         * Returns a random color in hexadecimal form '#063EAA'.
         *
         * @return {String} color The random color, e.g. '#6580C6' or '#AC3A97'.
         */
        getRandomColor: (function() {
            var letters = '0123456789ABCDEF'.split('');
            return function() {
                // An alternative approach:
                // return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
                var color = '#';
                for (var i = 0; i < 6; i++ ) {
                    var idx = Math.floor(Math.random() * 16);
                    color += letters[idx];
                }
                return color;
            };
        }()),

        /**
         * Ensures that the given label is not longer than the specified max
         * length and returns a shortened string (maxLength chars + '…') to be
         * used for labeling.
         *
         * @param {String} labelText The text to use as label.
         * @param {Number} [maxLength] The maximum length, optional.
         * @return {String} A possibly shortened labeltext with an added … if
         *     the input was longer than allowed.
         */
        labelEnsureMaxLength: function(labelText, maxLength) {
            var ensured = labelText || '';
            var maxLen = !Ext.isEmpty(maxLength) ? maxLength : Infinity;
            if (ensured.length > maxLen) {
                ensured = ensured.substring(0, maxLen);
                ensured += '…';
            }
            return ensured;
        }
    },

    /**
     * The SVG element for the chart-container as returned by d3.
     *
     * @type {Selection} https://developer.mozilla.org/docs/Web/API/Selection
     */
    containerSvg: null,

    /**
     * The SVG element for the legend as returned by d3.
     *
     * @type {Selection} https://developer.mozilla.org/docs/Web/API/Selection
     */
    legendSvg: null,

    /**
     * The width in pixels of the legend.
     *
     * @type {Number}
     */
    legendTargetWidth: 200,

    /**
     * The height of one legend entry in pixels.
     *
     * @type {Number}
     */
    legendEntryTargetHeight: 30,

    /**
     * The current visibility of the legend container.
     *
     * @private
     * @type {Boolean}
     */
    legendVisible: true,

    /**
     * The default chart margin to apply.
     *
     * @type {Object}
     */
    defaultChartMargin: {
        top: 10,
        right: 200,
        bottom: 20,
        left: 40
    },

    /**
     * Custom colors picked by the user.
     * @type {Array}
     */
    customColors: [],

    /**
     * Color & visibility of configured thresholds.
     * @type {Object}
     */
    thresholdState: {},

    /**
     * Used as the fallback for labeling when no explicity function is
     * provided.
     *
     * @param {mixed} val The value for labeling.
     * @return {mixed} The exact same value that was passed in.
     */
    getFallBackIdentity: function() {
        var viewModel = this.getViewModel();
        var label = viewModel.get('belowDetectionLimitLabel');
        return function(val, object) {
            if (object.detection_limit && object.detection_limit === '<') {
                return label;
            }
            return val;
        };
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
            var alwaysRender = me.getView().getConfig().alwaysRenderChart;

            if (!me.chartDataAvailable && !alwaysRender) {
                view.setHtml('<div class="noDataError">' +
                    me.getViewModel().get('noDataAvailableText') +
                    '</div>'
                );
                me.chartRendered = false;
            } else {
                var errorDiv = view.el.query('.noDataError');
                if (errorDiv[0]) {
                    errorDiv[0].remove();
                }

                me.drawChart();
            }
        });

        me.getChartData();
    },

    /**
     *
     */
    getChartData: function() {
        var me = this;
        var view = me.getView();
        if (view.getShowLoadMask() && view.getSelectedStations().length > 0 &&
            view.setLoading) {
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
     * @param {Function} [cbSuccess] The function to be called on success. Optional.
     * @param {Function} [cbFailure] The function to be called on failure. Optional.
     * @param {Function} [cbScope] The callback function to be called on
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
     * Returns the current size of the view element.
     *
     * @return {Array<Number>} An array of width (index 0) and height (index 1).
     */
    getViewSize: function() {
        var me = this;
        var view = me.getView();
        var viewSize = view.el.getSize();

        return [
            viewSize.width,
            viewSize.height
        ];
    },

    /**
<<<<<<< HEAD
=======
     * Returns the chart size as array of width at index 0 & height at index 1.
     * @return {Array<Number>} An array of width (index 0) and height (index 1).
     */
    getChartSize: function() {
        var me = this;
        var view = me.getView();
        var viewSize = me.getViewSize();
        var chartMargin = view.getChartMargin() || me.defaultChartMargin;

        var extraWidth = 110;
        if (Ext.isModern) {
            extraWidth -= 40;
        }
        var legWidth = Koala.util.Label.getMinimumLegendWidth('#' + view.getId()) + extraWidth;

        var series = this.attachedSeriesShapes;
        var offset = 0;
        if (series && series.length > 0) {
            var configs = JSON.parse(series[0].config.attachedSeries);
            var visibility = [];
            Ext.each(series, function(shape) {
                var id = shape.config.id;
                Ext.each(configs, function(config, idx) {
                    var visible = me.attachedSeriesVisibleById[id][idx];
                    visibility[idx] = visibility[idx] || visible;
                });
            });
            Ext.each(configs, function(config, idx) {
                var width = config.axisWidth || 40;
                if (visibility[idx]) {
                    offset += width;
                }
            });
        }
        var chartWidth = viewSize[0] - chartMargin.left - offset - legWidth;
        if (this.type === 'component-d3barchart') {
            var maxCount = 0;
            Ext.each(this.data, function(group) {
                maxCount = Math.max(maxCount, Ext.Object.getKeys(group).length);
            });
            chartWidth = view.getBarWidth() * maxCount * this.data.length + parseInt(chartMargin.left, 10);
        }

        return [
            viewSize[0] - chartMargin.left - offset - legWidth,
            viewSize[1] - chartMargin.top - chartMargin.bottom,
            chartWidth
        ];
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
     * Draws the root <svg>-element into the <div>-element rendered by the
     * Ext component.
     */
    drawSvgContainer: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BaseController;
        var makeTranslate = staticMe.makeTranslate;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var chartMargin = view.getChartMargin() || me.defaultChartMargin;
        var marginLeft = parseInt(chartMargin.left, 10);
        var translate = makeTranslate(chartMargin.left, chartMargin.top);
        var chartSize = me.getChartSize();
        var scrollbarHeight = Ext.getScrollbarSize().height;

        // Get the container view by its ID and append the SVG including an
        // additional group element to it.
        var container = d3.select(viewId);
        if (this.type === 'component-d3barchart') {
            container = container
                .append('div')
                .attr('style', 'overflow-x: auto; width: ' + chartSize[0] + 'px');
        }
        container
            .append('svg')
            .attr('viewBox', '0 0 ' + (chartSize[2] + marginLeft) + ' ' + (chartSize[1] - scrollbarHeight))
            .attr('width', (chartSize[2] + marginLeft))
            .attr('height', chartSize[1] - scrollbarHeight)
            .append('g')
            .attr('transform', translate);

        var containerSvg = d3.select(viewId + ' svg');
        me.containerSvg = containerSvg;
    },

    appendBackground: function(node) {
        var view = this.getView();
        var chartSize = this.getChartSize();
        var CSS = Koala.util.ChartConstants.CSS_CLASS;
        node.append('rect')
            .style('fill', view.getBackgroundColor() || '#EEE')
            .attr('class', CSS.PLOT_BACKGROUND)
            .attr('width', chartSize[2])
            .attr('height', chartSize[1])
            // to make y axis line visible
            .attr('transform', 'translate(1, 0)')
            .attr('pointer-events', 'all');
    },

    /**
     *
     */
    deleteShapeContainerSvg: function() {
        var view = this.getView();
        var svg = d3.select('#' + view.getId() + ' svg g.k-d3-shape-container');
        if (svg && !svg.empty()) {
            svg.node().remove();
        }
    },

    /**
     * Draws the legend container <div>.
     */
    drawLegendContainer: function() {
        var me = this;
        var CSS = Koala.util.ChartConstants.CSS_CLASS;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var viewSize = me.getViewSize();
        var viewHeight = viewSize[1];

        var legWidth = me.legendTargetWidth;
        var legHeight = viewHeight;

        d3.select(viewId)
            .append('div')
            .attr('class', CSS.LEGEND_CONTAINER)
            .style('width', legWidth + 'px')
            .style('height', legHeight + 'px')
            .style('right', '0px' )
            // values below will be updated in #updateLegendContainerDimensions
            .append('svg')
            .attr('viewBox', '0 0 ' + legWidth + ' 100')
            .attr('width', legWidth)
            .attr('height', '100');
        var legSvg = d3.select(viewId + ' .' + CSS.LEGEND_CONTAINER + ' svg');

        me.legendSvg = legSvg;
    },

    /**
     * Updates the size of the root SVG container to the current view size.
     */
    updateSvgContainerSize: function() {
        var me = this;
        var staticMe = Koala.view.component.D3BaseController;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var chartSize = me.getChartSize();
        var makeTranslate = staticMe.makeTranslate;
        var chartMargin = view.getChartMargin() || me.defaultChartMargin;
        var marginLeft = parseInt(chartMargin.left, 10);
        var translate = makeTranslate(chartMargin.left, chartMargin.top);
        var scrollbarHeight = Ext.getScrollbarSize().height;

        var svgContainer = d3.select(viewId + ' svg');
        var svgGroup = d3.select(viewId + ' svg g');
        var svgRect = d3.select(viewId + ' svg rect');
        var viewSize = me.getViewSize();
        var legWidth = me.calculateLegendWidth();
        var barChartParent;
        var svgContainerWidth = (chartSize[2] < chartSize[0]) ? chartSize[0] : chartSize[2];

        svgContainer
            .attr('viewBox', '0 0 ' + viewSize[0] + ' ' + viewSize[1])
            .attr('width', viewSize[0])
            .attr('height', viewSize[1]);

        svgRect
            .attr('width', chartSize[0])
            .attr('height', chartSize[1]);

        if (this.type === 'component-d3barchart') {
            barChartParent = svgContainer.select(function() {
                return this.parentNode;
            });
            barChartParent
                .style('width', (viewSize[0] - legWidth) + 'px');

            svgRect
                .attr('height', chartSize[1] - scrollbarHeight)
                .attr('width', chartSize[2] + marginLeft);
            svgContainer
                .attr('height', viewSize[1] - scrollbarHeight)
                .attr('viewBox', '0 0 ' + (marginLeft + chartSize[2]) + ' ' + (viewSize[1] - scrollbarHeight))
                .attr('width', (svgContainerWidth + marginLeft));
        }

        svgGroup
            .attr('transform', translate);


        // Re-register the zoom interaction if requested as the charts sizes
        // may have changed.
        if (view.getZoomEnabled()) {
            me.createInteractions();
            d3.select(viewId + ' svg > g > g.k-d3-shape-container')
                .call(me.zoomInteraction);
        }
    },

    /**
     * Updates the position of the legend container <div>.
     */
    updateLegendContainerPosition: function() {
        var me = this;
        var viewSize = me.getViewSize();
        var viewHeight = viewSize[1];
        var legWidth = me.calculateLegendWidth();
        var legHeight = viewHeight;
        var legendNode = me.legendSvg.node();

        if (legendNode && legendNode.parentNode) {
            d3.select(legendNode.parentNode)
                .style('right', '0px')
                .style('width', legWidth + 'px')
                .style('height', legHeight + 'px');
        }
    },

    createScale: function(orient, axisConfig, chartSize) {
        var scaleType = Koala.util.ChartConstants.SCALE[axisConfig.scale || 'linear'];
        var range;

        if (orient === 'top' || orient === 'bottom') {
            range = [0, chartSize[2]];
        } else if (orient === 'left' || orient === 'right') {
            range = [chartSize[1], 0];
        }

        return scaleType().range(range);
    },

    /**
     *
     */
    createScales: function() {
        var me = this;
        var view = me.getView();
        var chartSize = me.getChartSize();

        Ext.iterate(view.getAxes(), function(orient, axisConfig) {
            me.scales[orient] = me.createScale(orient, axisConfig, chartSize);
        });
    },

    /**
     * Creates legends for any configured thresholds.
     * @param  {Object} config          the chart configuration
     * @param  {Object} legendContainer the legend container
     * @param  {Number} curTranslateY current y legend position
     */
    drawThresholdLegends: function(config, legendContainer, curTranslateY) {
        var me = this;
        var Const = Koala.util.ChartConstants;
        var staticMe = Koala.view.component.D3BaseController;
        var thresholds = config.thresholds;

        Ext.each(thresholds, function(threshold, idx) {
            if (me.thresholdState[idx].deleted) {
                return;
            }
            curTranslateY += me.legendEntryTargetHeight;
            var legendEntry = legendContainer
                .append('g')
                .on('click', function() {
                    var target = d3.select(d3.event.target);
                    if (target && (target.classed(Const.CSS_CLASS.DELETE_ICON) ||
                            target.classed(Const.CSS_CLASS.COLOR_ICON))) {
                        return;
                    }
                    me.thresholdState[idx].visibility = !me.thresholdState[idx].visibility;
                    me.redrawChart();
                    me.redrawLegend();
                })
                .attr('transform', staticMe.makeTranslate(0, curTranslateY));

            // background for the concrete legend icon, to widen clickable area.
            legendEntry.append('path')
                .attr('d', Const.SVG_DEFS.LEGEND_ICON_BACKGROUND)
                .style('stroke', 'none')
                // invisible, but still triggering events
                .style('fill', 'rgba(0,0,0,0)');

            var line = legendEntry.append('path')
                .attr('d', Const.SVG_DEFS.LEGEND_ICON_LINE)
                .style('stroke', me.thresholdState[idx].color || threshold.stroke)
                .style('stroke-width', threshold.lineWidth)
                .style('fill', 'none');
            if (threshold.dasharray) {
                line.style('stroke-dasharray', threshold.dasharray);
            }

            legendEntry.append('text')
                .text(threshold.label)
                .attr('text-anchor', 'start')
                .attr('dy', '0')
                .attr('dx', '25');

            legendEntry.append('title')
                .text(threshold.tooltip);

            legendEntry.append('text')
                // fa-paint-brush from FontAwesome, see http://fontawesome.io/cheatsheet/
                .text('\uf1fc')
                .attr('class', Const.CSS_CLASS.COLOR_ICON)
                .attr('text-anchor', 'start')
                .attr('dy', '1')
                .attr('dx', '150')
                .on('click', me.generateColorCallback(undefined, idx));

            legendEntry.append('text')
                // ✖ from FontAwesome, see http://fontawesome.io/cheatsheet/
                .text('')
                .attr('class', Const.CSS_CLASS.DELETE_ICON)
                .attr('text-anchor', 'start')
                .attr('dy', '1')
                .attr('dx', '170')
                .on('click', function() {
                    me.thresholdState[idx].deleted = true;
                    me.redrawChart();
                    me.redrawLegend();
                });

            var disabledClsName = Const.CSS_CLASS.DISABLED_CLASS;

            legendEntry.classed(disabledClsName, !me.thresholdState[idx].visibility);
        });
    },

    /**
     * Draws configured thresholds, if any.
     * @param  {Object} config the chart configuration object
     * @param  {Object} svg    the chart
     * @param  {Number} from   the minimum x value
     * @param  {Number} to     the maximum x value
     * @param  {Function} x      x axis mapping function
     * @param  {Function} y      y axis mapping function
     */
    drawThresholds: function(config, svg, from, to, x, y) {
        var me = this;
        if (config.thresholds) {
            var exactInterval = me.getView().getConfig().useExactInterval;
            if (exactInterval) {
                from = me.getView().getStartDate();
                to = me.getView().getEndDate();
            }
            var thresholds = config.thresholds;
            Ext.each(thresholds, function(threshold, idx) {
                if (!me.thresholdState[idx]) {
                    me.thresholdState[idx] = {visibility: true};
                }
                if (me.thresholdState[idx].deleted) {
                    return;
                }
                if (me.thresholdState[idx].visibility) {
                    var yval = y(threshold.value);
                    var line = svg.append('line')
                        .attr('x1', x(from))
                        .attr('x2', x(to))
                        .attr('y1', yval)
                        .attr('y2', yval)
                        .style('stroke', me.thresholdState[idx].color || threshold.stroke)
                        .style('stroke-width', threshold.lineWidth);
                    if (threshold.dasharray) {
                        line.style('stroke-dasharray', threshold.dasharray);
                    }
                }
            });
        }
    },

    createAttachedSeriesAxes: function() {
        var me = this;
        var Axes = Koala.util.ChartAxes;
        var chartSize = this.getChartSize();
        me.attachedSeriesAxes = [];
        me.attachedSeriesScales = [];
        Ext.each(this.attachedSeriesAxisConfig, function(config) {
            var scale = me.createScale('left', config, chartSize);
            var axis = Axes.createAxis(config, 'left', scale);

            me.setDomainForScale(config, scale, 'left', config);

            me.attachedSeriesAxes.push(axis);
            me.attachedSeriesScales.push(scale);
        });
    },

    drawAttachedSeriesAxis: function() {
        var me = this;
        var view = this.getView();
        var metadata = view.getConfig().targetLayer.metadata;
        var chartSize = this.getChartSize();
        var viewId = '#' + view.getId();
        var Axes = Koala.util.ChartAxes;
        var series = Koala.util.Object.getPathStrOr(
            metadata,
            'layerConfig/timeSeriesChartProperties/attachedSeries',
            '[]'
        );
        series = JSON.parse(series);
        var drawOffset = 0;
        Ext.each(series, function(config, idx) {
            var label = config.dspUnit || '';
            var axisConfig = Koala.view.component.D3Chart.extractLeftAxisConfig(config, label);
            var axis = me.attachedSeriesAxes[idx];
            var axisWidth = (config.axisWidth || 40) + drawOffset;
            drawOffset += axisWidth;
            Axes.drawAxis('left', axisConfig, chartSize, viewId, axis, axisWidth, idx + 1, metadata);
        });
    },

    /**
     * Creates the axes.
     */
    createAxes: function() {
        var me = this;
        var Axes = Koala.util.ChartAxes;
        var view = me.getView();
        var axesConfig = view.getAxes();

        Ext.iterate(axesConfig, function(orient, axisConfig) {
            var scale = me.scales[orient];
            var axis = Axes.createAxis(axisConfig, orient, scale);
            me.axes[orient] = axis;
        });
    },

    /**
     * Draws the axes.
     */
    drawAxes: function() {
        var me = this;
        var view = this.getView();
        var viewId = '#' + view.getId();
        var axesConfig = view.getAxes();
        var chartSize = this.getChartSize();
        var metadata = view.getConfig().targetLayer.metadata;
        var Axes = Koala.util.ChartAxes;

        Ext.iterate(axesConfig, function(orient, axisConfig) {
            Axes.drawAxis(orient, axisConfig, chartSize, viewId, me.axes[orient], undefined, undefined, metadata);
        });
    },

    /**
     * Redraws all axes.
     */
    redrawAxes: function() {
        var me = this;
        var view = me.getView();
        var axesConfig = view.getAxes();
        var metadata = view.getConfig().targetLayer.metadata;
        var Axes = Koala.util.ChartAxes;
        var chartSize = this.getChartSize();
        var viewId = view.getId();

        Ext.iterate(axesConfig, function(orient, config) {
            var axisGenerator = me.axes[orient];
            Axes.redrawAxis(axisGenerator, orient, metadata, chartSize, viewId, config);
        });
    },

    /**
     * Creates the grid axis.
     */
    createGridAxes: function() {
        var Axes = Koala.util.ChartAxes;
        var gridConfig = this.getView().getGrid();
        var chartSize = this.getChartSize();
        Axes.createGridAxes(gridConfig, chartSize, this.scales, this.gridAxes);
    },

    /**
     * Redraws the grid axis.
     */
    redrawGridAxes: function() {
        var me = this;
        var view = me.getView();
        var gridConfig = view.getGrid();

        if (!gridConfig.show) {
            return false;
        }

        var Const = Koala.util.ChartConstants;
        var CSS = Const.CSS_CLASS;
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

            if (!axis) {
                return;
            }

            axis
                .transition()
                .call(axisGenerator);
        });
    },

    /**
>>>>>>> upstream/master
     *
     */
    showScaleWindow: function() {
        var viewModel = this.getViewModel();
        var magnification = viewModel.get('magnification');
        var okText = viewModel.get('okText');
        var cancelText = viewModel.get('cancelText');
        var original = viewModel.get('original');
        var twofold = viewModel.get('twofold');
        var threefold = viewModel.get('threefold');
        var fourfold = viewModel.get('fourfold');
        return new Ext.Promise(function(resolve) {
            Ext.create('Ext.window.Window', {
                title: magnification,
                autoShow: true,
                items: [{
                    xtype: 'combobox',
                    value: 1,
                    store: [
                        [1, original],
                        [2, twofold],
                        [3, threefold],
                        [4, fourfold]
                    ]
                }],
                buttons: [{
                    text: okText,
                    handler: function() {
                        var win = this.up('window');
                        var scale = win.down('combobox').getValue();
                        win.close();
                        resolve(scale);
                    }
                }, {
                    text: cancelText,
                    handler: function() {
                        var win = this.up('window');
                        win.close();
                    }
                }]
            });
        });
    },

    /**
     * Exports the chart to a dataUri and calls the specified callback
     * function. The first argument of the callback function is the dataUri.
     *
     * @param {number} scale The scale of the resulting image.
     * @param {boolean} isBarChart Wiehter it is a barchart or not
     * @param {DOMString} outputFormat An image outputFormat like 'image/bmp'
     *                                 default is 'image/png'.
     */
    chartToDataUri: function(scale, isBarChart, outputFormat) {
        var chartNode = this.getView().getEl().dom.querySelector('svg');
        var legend = chartNode.querySelector('.legend');

        return new Ext.Promise(function(resolve) {
            outputFormat = outputFormat || 'image/png';
            scale = scale || 1;
            var downloadIcons = legend.querySelector('.k-d3-download-icon');
            var deleteIcons = legend.querySelector('.k-d3-delete-icon');
            var colorIcons = legend.querySelector('.k-d3-color-icon');
            downloadIcons.style.display = 'none';
            deleteIcons.style.display = 'none';
            colorIcons.style.display = 'none';

            var chartSource = (new XMLSerializer()).serializeToString(chartNode);
            var chartDataUri = 'data:image/svg+xml;base64,'+ btoa(
                unescape(encodeURIComponent(chartSource)));

            var chartImageWidth = chartNode.getBoundingClientRect().width * scale;
            var chartImageHeight = chartNode.getBoundingClientRect().height * scale;
            var chartImageObject = new Image(chartImageWidth, chartImageHeight);
            chartImageObject.src = chartDataUri;

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = chartImageWidth;
            canvas.height = chartImageHeight;
            ctx.fillStyle = 'white';
            ctx.fillRect(0,0,canvas.width,canvas.height);

            chartImageObject.onload = function() {
                ctx.drawImage(chartImageObject, 0, 0, chartImageWidth, chartImageHeight);
                var dataUri = canvas.toDataURL(outputFormat);
                downloadIcons.style.display = 'block';
                deleteIcons.style.display = 'block';
                colorIcons.style.display = 'block';
                resolve(dataUri);
            };
        });
    },

    /**
<<<<<<< HEAD
=======
     * Draws the axis.
     */
    drawGridAxes: function() {
        var me = this;
        var view = me.getView();
        var gridConfig = view.getGrid();

        if (!gridConfig.show) {
            return false;
        }

        var Const = Koala.util.ChartConstants;
        var CSS = Const.CSS_CLASS;
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
        var staticMe = Koala.view.component.D3BaseController;
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
     * Redraws the chart title completely.
     */
    redrawTitle: function() {
        var me = this;

        me.deleteTitle();
        me.drawTitle();
    },

    wrapAndResizeLegend: function() {
        var me = this;
        var id = '#' + this.getView().getId();
        // raise the buffer to reflect special cases with legend and delete icons
        Koala.util.Label.distanceBuffer = 70;
        Koala.util.Label.handleLabelWrap(
            id + ' .k-d3-scrollable-legend-container',
            ' g > text:not(.k-d3-color-icon):not(.k-d3-delete-icon):not(.k-d3-download-icon)',
            25,
            1.2,
            true
        );
        // reset buffer back to default
        Koala.util.Label.distanceBuffer = 20;
        var selector = id + ' .k-d3-scrollable-legend-container g > text' +
            ':not(.k-d3-color-icon):not(.k-d3-delete-icon):not(.k-d3-download-icon)';
        var y = me.legendEntryTargetHeight;
        d3.selectAll(selector).each(function() {
            var count = d3.select(this).selectAll('tspan').size();
            var parent = d3.select(this).node().parentNode;
            d3.select(parent)
                .attr('transform', 'translate(0,' + y + ')');
            // every additional tspan will lead to an extra height on the parent
            y += 14 * (count -1) + me.legendEntryTargetHeight;
        });
        // resize the container
        me.updateLegendContainerDimensions();
    },

    /**
     * The legend entries for all elements is in its own svg, which itself lives
     * in a scrollable div. For the SVG to be actually scrollable, we have to
     * give it the real dimensions of all the legend element it contains. This
     * way the svg is (sometimes) bigger in height than the containg div, and
     * the browser shows the scrollbar.
     */
    updateLegendContainerDimensions: function() {
        var me = this;
        var legendParent = me.legendSvg;
        var view = me.getView();
        var xtype = view.getXType ? view.getXType() : view.xtype;
        var config = view.getTargetLayer().get('timeSeriesChartProperties');
        var thresholds = config.thresholds ? config.thresholds : [];
        var targetLayer = view.getTargetLayer();
        var allowDownload = Koala.util.Object.getPathStrOr(
            targetLayer,
            'metadata/layerConfig/olProperties/allowDownload',
            true
        );
        allowDownload = Koala.util.String.coerce(allowDownload);
        allowDownload = allowDownload && !(this instanceof Koala.view.component.D3BarChartController);

        var numLegends;
        if (xtype === 'd3-barchart') { // for barcharts
            numLegends = me.data.length;
            numLegends += Ext.Object.getValues(me.colorsByKey).length;
        } else if (xtype === 'd3-chart') { // for timeseries
            numLegends = Object.keys(me.data).length;
        } else {
            // Ouch, shouldn't happen.
            numLegends = 0;
        }
        numLegends += thresholds.length;

        var selector = '.k-d3-scrollable-legend-container g > text tspan';
        var lineCount = d3.selectAll(selector).size();
        lineCount = Math.max(lineCount - numLegends, 0);

        var heightEach = me.legendEntryTargetHeight;
        var legWidth = this.calculateLegendWidth();
        var legHeight = heightEach + heightEach * numLegends + lineCount * 14;
        legendParent
            .attr('viewBox', '0 0 ' + legWidth + ' ' + legHeight)
            .attr('width', legWidth)
            .attr('height', legHeight);
        d3.select('#' + view.getId() + ' .k-d3-scrollable-legend-container')
            .style('width', legWidth + 'px');

        var curx = legWidth - 40;
        d3.selectAll('#' + view.getId() + ' text.k-d3-delete-icon')
            .attr('dx', curx);
        if (!Ext.isModern) {
            var off = 20;
            if (allowDownload) {
                d3.selectAll('#' + view.getId() + ' text.k-d3-download-icon')
                    .attr('dx', curx - off);
                off += 20;
            }
            d3.selectAll('#' + view.getId() + ' text.k-d3-color-icon')
                .attr('dx', curx - off);
        }
    },

    calculateLegendWidth: function() {
        var view = this.getView();
        var targetLayer = view.getTargetLayer();
        var allowDownload = Koala.util.Object.getPathStrOr(
            targetLayer,
            'metadata/layerConfig/olProperties/allowDownload',
            true
        );
        allowDownload = Koala.util.String.coerce(allowDownload);
        allowDownload = allowDownload && !(this instanceof Koala.view.component.D3BarChartController);

        var extraWidth = 110;
        if (Ext.isModern) {
            extraWidth -= 40;
        } else {
            if (!allowDownload) {
                extraWidth -= 20;
            }
        }
        return Koala.util.Label.getMinimumLegendWidth('#' + view.getId()) + extraWidth;
    },

    /**
>>>>>>> upstream/master
     * Generates a callback that can be used for the click event on the delete
     * icon. Inside this callback all relevant parts of the series/bar are
     * removed by eventually calling into the concrete #deleteEverything
     * and #redrawLegend implementations of child classes
     *
     * @param {Object} dataObj The current shape object to handle.
     * @param {[Number]} idx The index of the shape object in the array of all
     *     shapes.
     * @return {Function} The callback to be used as click handler on the delete
     *     icon.
     */
    generateDeleteCallback: function(index, legendIndex) {
        var me = this;
        var deleteCallback = function() {
            me.deleteEverything(index, legendIndex);
        };
        return deleteCallback;
    },

    /**
     * Generates a callback that can be used for the click event on the download
     * icon. It will call the downloadSeries function which has to be implemtend
     * in the child classes.
     *
     * @param {Object} dataObj The current shape object to handle.
     * @return {Function} The callback to be used as click handler on the
     *                    download icon.
     */
    generateDownloadCallback: function(dataObj) {
        var me = this;
        var downloadCallback = function() {
            me.downloadSeries(dataObj);
        };
        return downloadCallback;
    },

    /**
     * Generates a callback that can be used for the click event on the color
     * icon.
     * @param  {Number} index the index of the series to change color for
     * @return {Function}       The generated callback function
     */
    generateColorCallback: function(idx) {
        var me = this;
        var viewModel = this.getViewModel();
        return function() {
            var color = me.chartConfig.timeseriesComponentConfig.series[idx].color;
            var win = Ext.create('Ext.window.Window', {
                title: viewModel.get('colorWindowTitle'),
                width: 300,
                layout: 'fit',
                bodyPadding: 10,
                items: [{
                    xtype: 'container',
                    items: [{
                        padding: '10px 0',
                        html: viewModel.get('colorWindowMessage')
                    },{
                        xtype: 'colorfield',
                        width: '100%',
                        name: 'chart-color-picker',
                        value: color,
                        listeners: {
                            change: function(field, value) {
                                field.setFieldStyle({
                                    fontSize: 0,
                                    backgroundColor: '#' + value
                                });
                            }
                        }
                    }]
                }],
                bbar: [{
                    text: viewModel.get('colorMsgButtonYes'),
                    handler: function() {
                        var cmp = win.down('[name=chart-color-picker]');
                        me.chartConfig.timeseriesComponentConfig
                            .series[idx].color = '#' + cmp.getValue();
                        me.drawChart();
                        win.close();
                    }
                }, {
                    text: viewModel.get('colorMsgButtonNo'),
                    handler: function() {
                        this.up('window').close();
                    }
                }]
            });
            win.show();
        };
    },

    /**
     * Shows a color picker window.
     * @param  {String} oldColor    the initial color
     * @param  {Function} updateColor will be called with the new value in case
     * the user chose
     */
    showColorPicker: function(oldColor, updateColor) {
        var me = this;
        var viewModel = this.getView().getViewModel();
        var win = Ext.create('Ext.window.Window', {
            title: viewModel.get('colorWindowTitle'),
            width: 300,
            layout: 'fit',
            bodyPadding: 10,
            items: [{
                xtype: 'container',
                items: [{
                    padding: '10px 0',
                    html: viewModel.get('colorWindowMessage')
                },{
                    xtype: 'colorfield',
                    width: '100%',
                    name: 'chart-color-picker',
                    value: oldColor,
                    listeners: {
                        change: function(field, value) {
                            field.setFieldStyle({
                                fontSize: 0,
                                backgroundColor: '#' + value
                            });
                        }
                    }
                }]
            }],
            bbar: [{
                text: viewModel.get('colorMsgButtonYes'),
                handler: function() {
                    var cmp = win.down('[name=chart-color-picker]');
                    updateColor('#' + cmp.getValue());
                    me.drawChart();
                    win.close();
                }
            }, {
                text: viewModel.get('colorMsgButtonNo'),
                handler: function() {
                    this.up('window').close();
                }
            }]
        });
        win.show();
    },

    /**
     * A placeholder method to be implemented by subclasses.
     *
     * @param {Object} dataObj The data object, either a 'bar' or a 'series'.
     */
    deleteEverything: function(dataObj) {
        Ext.log.info('deleteEverything received', dataObj);
        Ext.raise('deleteEverything must be overridden by child controllers');
    },

    /**
     * Toggles the legend's visibility.
     */
    toggleLegendVisibility: function() {
        if (this.legendConfig) {
            this.chartConfig.legendComponentConfig = this.legendConfig;
            delete this.legendConfig;
        } else {
            this.legendConfig = this.chartConfig.legendComponentConfig;
            delete this.chartConfig.legendComponentConfig;
        }
        this.handleResize();
    }

});
