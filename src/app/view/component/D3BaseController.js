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
        adjustTransformTranslate: function(d3Obj, diffObj) {
            var staticMe = Koala.view.component.D3BaseController;
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
            var svgContainer = me.getSvgContainer();
            var alwaysRender = me.getView().getConfig().alwaysRenderChart;

            if (!me.chartDataAvailable && !alwaysRender) {
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
     * Interface method to be overrriden in child classes.
     */
    redrawChart: function() {
        Ext.Logger.warn('Empty interface method.');
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
        var thresholds;
        if (config.thresholds) {
            thresholds = JSON.parse(config.thresholds);
        }

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
            var thresholds = JSON.parse(config.thresholds);
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
     * Exports the chart to a dataUri and calls the specified callback
     * function. The first argument of the callback function is the dataUri.
     *
     * @param {Function} cb The callbackfunction. Receives the dataUri. required
     * @param {Object} cbScope The scope for the callback function.
     * @param {DOMString} outputFormat An image outputFormat like 'image/bmp'
     *                                 default is 'image/png'.
     */
    chartToDataUriAndThen: function(cb, cbScope, outputFormat) {
        if (!cb) {
            Ext.logger.warn('Please pass a callback function as first argument.');
            return false;
        }
        outputFormat = outputFormat || 'image/png';
        cbScope = cbScope || this;
        var chartNode = this.containerSvg.node();
        d3.selectAll('.k-d3-hidden').style('display', 'none');
        var chartSource = (new XMLSerializer()).serializeToString(chartNode);
        var chartDataUri = 'data:image/svg+xml;base64,'+ btoa(
            unescape(encodeURIComponent(chartSource)));

        var chartImageWidth = chartNode.getBoundingClientRect().width;
        var chartImageHeight = chartNode.getBoundingClientRect().height;
        var chartImageObject = new Image(chartImageWidth, chartImageHeight);
        chartImageObject.src = chartDataUri;

        var legendD3 = this.legendSvg;
        var legendNode = legendD3.node();
        var downloadIcons = legendD3.selectAll('.k-d3-download-icon');
        var deleteIcons = legendD3.selectAll('.k-d3-delete-icon');
        var colorIcons = legendD3.selectAll('.k-d3-color-icon');
        downloadIcons.style('display', 'none');
        deleteIcons.style('display', 'none');
        colorIcons.style('display', 'none');
        var legendSource = (new XMLSerializer()).serializeToString(legendNode);
        var legendDataUri = 'data:image/svg+xml;base64,'+ btoa(
            unescape(encodeURIComponent(legendSource)));
        var legendImageWidth = legendNode.getBoundingClientRect().width;
        var legendImageHeight = legendNode.getBoundingClientRect().height;
        var legendImageObject = new Image(legendImageWidth, legendImageHeight);
        legendImageObject.src = legendDataUri;

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = chartImageWidth;
        canvas.height = legendImageHeight > chartImageHeight ?
            legendImageHeight : chartImageHeight;
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0,canvas.width,canvas.height);

        chartImageObject.onload = function() {
            ctx.drawImage(chartImageObject, 0, 0, chartImageWidth,
                chartImageHeight);
            d3.selectAll('.k-d3-hidden').style('display', 'block');
            legendImageObject.onload = function() {
                ctx.drawImage(legendImageObject,
                    (chartImageWidth + 10 - legendImageWidth), 0, legendImageWidth, legendImageHeight);
                var dataUri = canvas.toDataURL(outputFormat);
                downloadIcons.style('display', 'block');
                deleteIcons.style('display', 'block');
                colorIcons.style('display', 'block');
                cb.call(cbScope, dataUri);
            };
        };
    },

    /**
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
        var thresholds = config.thresholds ? JSON.parse(config.thresholds) : [];
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
    generateDeleteCallback: function(dataObj) {
        var me = this;
        var deleteCallback = function() {
            me.deleteEverything(dataObj);
            me.redrawLegend();
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
     * @param  {Object} shape The shape to handle. If undefined, the threshold
     *                        with index idx will be updated.
     * @return {Function}       The generated callback function
     */
    generateColorCallback: function(shape, idx) {
        var me = this;
        var viewModel = this.getViewModel();
        return function() {
            var color;
            if (shape) {
                color = me.customColors[idx] || shape.config.color;
            } else {
                var lay = me.getView().getTargetLayer();
                var config = JSON.parse(lay.get('timeSeriesChartProperties').thresholds)[idx];
                color = me.thresholdState[idx].color || config.stroke;
            }
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
                    handler: me.colorPicked.bind(me, shape, idx)
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
     * Callback to update the color of a chart item.
     * @param  {Object} shape the shape to update. If undefined, the threshold
     *                        with index idx will be updated.
     * @param  {Number} idx   index of the shape
     */
    colorPicked: function(shape, idx) {
        var cmp = Ext.ComponentQuery.query('[name=chart-color-picker]')[0];
        if (shape) {
            var oldColor = shape.config.color;
            shape.config.color = '#' + cmp.getValue();
            this.customColors[idx] = shape.config.color;
            // also apply the color to the same member of the other groups
            Ext.each(this.data, function(group) {
                if (group[shape.config.key]) {
                    group[shape.config.key].color = shape.config.color;
                }
            });
            // if we have attachedSeries and it has the same color as the parent
            // we will also apply the new color to the attached series
            if (shape.config.attachedSeries) {
                var as = Koala.util.String.coerce(shape.config.attachedSeries);
                if (Ext.isArray(as)) {
                    Ext.each(as, function(series) {
                        if (!series.color || series.color === oldColor) {
                            series.color = shape.config.color;
                        }
                    });
                    shape.config.attachedSeries = JSON.stringify(as);
                }
            }
        } else {
            this.thresholdState[idx].color = '#' + cmp.getValue();
        }
        this.redrawChart();
        this.redrawLegend();
        cmp.up('window').close();
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
     * Deletes the legendentry passed from the DOM.
     *
     * @param {id} id The id of the associated series.
     */
    deleteLegendEntry: function(id) {
        var me = this;
        var CSS = Koala.util.ChartConstants.CSS_CLASS;
        var view = me.getView();
        var viewId = '#' + view.getId();
        var selectorTpl = '{0} g[idx="{1}{2}"]';
        var selector = Ext.String.format(
            selectorTpl,
            viewId, CSS.PREFIX_IDX_LEGEND_GROUP, id
        );
        var legendEntry = d3.select(selector).node();
        var parent = legendEntry && legendEntry.parentNode;
        if (parent) {
            parent.removeChild(legendEntry);
        }
    },

    /**
     * Removes the title of the chart.
     */
    deleteTitle: function() {
        var me = this;
        var view = me.getView();
        var viewId = '#' + view.getId();

        var titleNode = d3.select(viewId + ' svg > g > text');
        titleNode.remove();
    },

    /**
     * Toggles an SVG g element's visibility and the appropriate legend entry
     * the g usually groups a bar and its label or a series.
     */
    toggleGroupVisibility: function(group, legendElement) {
        var Const = Koala.util.ChartConstants;
        var CSS = Const.CSS_CLASS;
        var hideClsName = CSS.HIDDEN_CLASS;
        var disabledClsName = CSS.DISABLED_CLASS;

        if (group && group.nodes().length > 0) {
            var isHidden = group.classed(hideClsName);
            group.classed(hideClsName, !isHidden);
        }

        if (legendElement && legendElement.nodes().length > 0) {
            var isDisabled = legendElement.classed(disabledClsName);
            legendElement.classed(disabledClsName, !isDisabled);
        }
    },

    /**
     * Removes the current legend from the chart (if it exists) and redraws the
     * legend by looking at our internal data (by calling #drawLegend).
     */
    redrawLegend: function() {
        var me = this;
        var Const = Koala.util.ChartConstants;
        var CSS = Const.CSS_CLASS;
        var legendCls = CSS.SHAPE_GROUP + CSS.SUFFIX_LEGEND;
        var legend = this.legendSvg.select('g.' + legendCls);
        if (legend) {
            var legendNode = legend.node();
            legendNode.parentNode.removeChild(legendNode);
        }
        me.drawLegend();
    },

    /**
     * Toggles the legend's visibility.
     */
    toggleLegendVisibility: function() {
        var me = this;
        var view = me.getView();
        // var chart = view.down('d3-chart');
        // var chartCtrl = chart.getController();
        var chartMargin = view.getChartMargin() || me.defaultChartMargin;
        var chartMarginRight = me.legendTargetWidth;

        if (me.legendSvg && me.legendSvg.node() &&
                me.legendSvg.node().parentNode) {

            me.legendVisible = !me.legendVisible;

            var legendContainer = me.legendSvg.node().parentNode;
            d3.select(legendContainer).style('display', me.legendVisible ?
                'unset' : 'none');

            view.setChartMargin({
                top: chartMargin.top,
                right: me.legendVisible ? chartMarginRight : 25,
                bottom: chartMargin.bottom,
                left: chartMargin.left
            });

            me.redrawChart();
        }
    },

    /**
     * Returns the root <svg>-container containing the chart itself.
     *
     * @method getSvgContainer
     * @return {Selections} The selection (data-driven transformation of the
     *     document object model). Note: The selection may be empty, check with
     *     selection.node().
     */
    getSvgContainer: function() {
        var me = this;
        var view = me.getView();
        var viewId = '#' + view.getId();

        return d3.select(viewId + ' svg');
    }

});
