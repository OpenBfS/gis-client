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
        var layer = this.getView().getTargetLayer();

        var serverBased = Koala.util.Object.getPathStrOr(layer, 'metadata/layerConfig/vector/url', false);
        if (layer instanceof ol.layer.Vector && !serverBased) {
            var fmt = new ol.format.GeoJSON();
            var data = layer.originalFeatures || layer.getSource().getFeatures();
            data = data.slice();
            var groupAttribute = Koala.util.Object.getPathStrOr(layer.metadata, 'layerConfig/olProperties/featureIdentifyField');
            data = Ext.Array.filter(data, function(feat) {
                return feat.get(groupAttribute) === station.get(groupAttribute);
            });
            window.setTimeout(function() {
                if (Ext.isFunction(cbFn)) {
                    cbFn.call(cbScope, station);
                }
                if (Ext.isFunction(cbSuccess)) {
                    cbSuccess.call(cbScope, {
                        responseText: fmt.writeFeatures(data)
                    }, station);
                }
            }, 500);
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
     * Creates a simple ExtJS tooltip, see the
     * {@link http://docs.sencha.com/extjs/6.0.0/classic/Ext.tip.ToolTip.html|ExtJS API documentation}
     * for further details and config options.
     */
    createTooltip: function() {
        this.tooltipCmp = Ext.create('Ext.tip.ToolTip');
    },

    /**
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
     */
    chartToDataUri: function(scale) {
        var chartNode = this.getView().el.dom.querySelector('.k-barchart-container');
        if (!chartNode) {
            chartNode = this.getView().el.dom;
        }
        var outputFormat = 'image/png';
        scale = scale || 1;
        var downloadIcons = this.getView().el.dom.querySelectorAll('.k-d3-download-icon');
        var deleteIcons = this.getView().el.dom.querySelectorAll('.k-d3-delete-icon');
        var colorIcons = this.getView().el.dom.querySelectorAll('.k-d3-color-icon');
        var disabled = this.getView().el.dom.querySelectorAll('.k-d3-disabled');
        downloadIcons.forEach(function(icon) {
            icon.style.display = 'none';
        });
        deleteIcons.forEach(function(icon) {
            icon.style.display = 'none';
        });
        colorIcons.forEach(function(icon) {
            icon.style.display = 'none';
        });
        // should only match legend entries
        disabled.forEach(function(el) {
            el.style.opacity = 0.3;
        });
        return new Ext.Promise(function(resolve) {
            html2canvas(chartNode, {
                scale: scale
            })
                .then(function(canvas) {
                    downloadIcons.forEach(function(icon) {
                        icon.style.display = 'block';
                    });
                    deleteIcons.forEach(function(icon) {
                        icon.style.display = 'block';
                    });
                    colorIcons.forEach(function(icon) {
                        icon.style.display = 'block';
                    });
                    disabled.forEach(function(el) {
                        // unfortunately, `delete` and setting the opacity to undefined don't work (at least in Chrome)
                        el.style = 'cursor: pointer';
                    });
                    resolve(canvas.toDataURL(outputFormat));
                });
        });
    },

    /**
     * Generates a callback that can be used for the click event on the delete
     * icon. Inside this callback all relevant parts of the series/bar are
     * removed by eventually calling into the concrete #deleteEverything
     * and #redrawLegend implementations of child classes
     *
     * @param {Object} dataObj The current shape object to handle.
     * @param {Number} idx The index of the shape object in the array of all
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
    generateColorCallback: function(idx, legendIdx) {
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
                                var cwin = this.up('window');
                                if (cwin.isVisible()) {
                                    window.setTimeout(function() {
                                        cwin.close();
                                        me.chartConfig.timeseriesComponentConfig
                                            .series[idx].color = '#' + value;
                                        me.chartConfig.legendComponentConfig.items[legendIdx]
                                            .style.stroke = '#' + value;
                                        me.drawChart();
                                    }, 0);
                                    return;
                                }
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
                        me.chartConfig.legendComponentConfig.items[legendIdx]
                            .style.stroke = '#' + cmp.getValue();
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
            var svg = document.querySelector('#' + this.getView().getId());
            var legendContainer = svg.querySelector('.k-barchart-legend-container svg');
            if (legendContainer) {
                legendContainer.remove();
            }
        }
        this.handleResize();
    },

    /**
     * Toggles an axis scale back and forth between linear and logarithmic.
     * @param  {String|undefined} axis if not given, the 'y' scale is toggled
     */
    toggleScale: function(axis) {
        var powerOfTen = Koala.util.ChartData.powerOfTen;
        if (!axis) {
            axis = 'y';
        }
        var cfg;
        if (this instanceof Koala.view.component.D3ChartController) {
            cfg = this.chartConfig.timeseriesComponentConfig.axes[axis];
        } else {
            cfg = this.chartConfig.barComponentConfig.axes[axis];
        }
        var scale = cfg.scale;
        scale = scale === 'linear' ? 'log' : 'linear';
        cfg.scale = scale;
        cfg.factor = scale === 'log' ? undefined : 0.8;
        cfg.harmonize = scale === 'log';
        cfg.epsilon = scale === 'log' ? 0.01 : undefined;
        cfg.tickFormatter = scale === 'log' ? function(val) {
            return !powerOfTen(val) ? ''
                : val > 1000 || val < 0.0001
                    ? val.toExponential()
                    : val;
        } : undefined;
        if (!this.chartOverrides) {
            this.chartOverrides = {};
        }
        this.chartOverrides[axis] = {
            scale: scale
        };
        this.drawChart();
    }

});
