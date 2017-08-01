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
 * @class Koala.view.component.CartoWindowController
 */
Ext.define('Koala.view.component.CartoWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-component-cartowindow',

    requires: [
        'Ext.util.CSV',
        'Ext.Promise',
        'Ext.Ajax',
        'BasiGX.util.Layer',
        'Koala.util.AppContext',
        'Koala.util.Chart',
        'Koala.util.Object'
    ],

    /**
     * Called on initialize event. Only used in modern toolkit.
     *
     * @private
     */
    onInitialize: function() {
        var me = this;
        var view = me.getView();
        var feature = view.getFeature();
        var layer = view.getLayer();

        // Cleanup hover artifacts
        var mapComponent = Ext.ComponentQuery.query('k-component-map')[0];

        var hoverPlugin = mapComponent.getPlugin('hoverBfS');
        if (hoverPlugin) {
            hoverPlugin.cleanupHoverArtifacts();
        }

        // Add toolkitname (modern/classic) as css class to the view
        view.addCls(Ext.isModern ? 'modern' : 'classic');

        // If the feature has no layer set as property (like in modern) we add one
        if (!feature.get('layer')) {
            feature.set('layer', layer);
        }

        me.createTabs();

        me.createOverlay();

        me.getOrCreateLineLayer();

        me.createLineFeature();

        me.createLayerListeners();
    },

    /**
     * Create the Tabs.
     */
    createTabs: function() {
        var me = this;
        var view = me.getView();
        var layer = view.getLayer();
        me.createCloseElement();

        if (Koala.util.Layer.isTimeseriesChartLayer(layer)) {
            me.createTimeSeriesTab();
        }

        if (Koala.util.Layer.isBarChartLayer(layer)) {
            me.createBarChartTab();
        }

        if (Koala.util.Layer.isTableLayer(layer)) {
            me.createTableTab();
        }

        if (Koala.util.Layer.isHtmlLayer(layer)) {
            me.createHtmlTab();
        }

        if (layer.get('hoverTpl')) {
            me.createHoverTemplateTab();
        }

        me.updateCloseElementPosition();
    },

    /**
     * Creates the closeElement and adds it to the tabwindow.
     */
    createCloseElement: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        var cartoWindowId = view.getCartoWindowId();
        var closeElement = Ext.DomHelper.createDom({
            tag: 'div',
            html: '<i class="fa fa-times-circle" aria-hidden="true"></i>',
            cls: cartoWindowId + ' closeElement'
        });

        closeElement.addEventListener('click', function() {
            view.destroy();
        });

        el.appendChild(closeElement);
    },

    /**
     * Updates the position of the close element due to the amount of rendered
     * tabs.
     */
    updateCloseElementPosition: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var tabs = viewModel.get('tabs');
        var tabIndex = tabs.length;
        var closeElement = view.el.down('.closeElement');
        closeElement.setStyle('left', (tabIndex*100) + 'px');
    },

    /**
     * Create the tab which contains the rendered TimeSeries and adds it to the
     * tabwindow.
     */
    createTimeSeriesTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        var layer = view.getLayer();
        var feature = view.getFeature();
        var timeFilter = Koala.util.Filter.getStartEndFilterFromMetadata(
            layer.metadata);

        var timeSeriesTab = me.createTabElement({
            title: 'Timeseries',
            className: 'timeseries-tab',
            active: true
        });

        var tabElm = timeSeriesTab.getElementsByTagName('div')[0];

        var config = {
            startDate: timeFilter.mindatetimeinstant,
            endDate: timeFilter.maxdatetimeinstant,
            width: '400px',
            height: '400px',
            renderTo: tabElm
        };

        var chartObj = Koala.view.component.D3Chart.create(layer, feature, config);

        this.createTimeSeriesButtons(tabElm);
        this.createCombineTimeseriesButton(tabElm);

        el.appendChild(timeSeriesTab);
        this.timeserieschart = Ext.create(chartObj);

        this.createLegendVisibilityButton(tabElm, this.timeserieschart);
        this.createExportToPngButton(tabElm, this.timeserieschart);
    },

    /**
     * Create buttons to scroll/expand the timeseries start/end date.
     * @param {Element} elm element to render the buttons to
     */
    createTimeSeriesButtons: function(elm) {
        var left = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'seriesLeft',
            glyph: 'xf104@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('expandToLeft')
            },
            renderTo: elm
        };
        var right = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'seriesRight',
            glyph: 'xf105@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('expandToRight')
            },
            renderTo: elm
        };
        left = Ext.create(left);
        left.el.dom.addEventListener('click', this.scrollTimeseriesLeft.bind(this));
        right = Ext.create(right);
        right.el.dom.addEventListener('click', this.scrollTimeseriesRight.bind(this));
    },

    /**
     * Create button to combine all timeseries carto windows.
     * @param {Element} elm element to render the button to
     */
    createCombineTimeseriesButton: function(elm) {
        var combine = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'seriesCombine',
            glyph: 'xf066@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('combineSeries')
            },
            renderTo: elm
        };
        combine = Ext.create(combine);
        combine.el.dom.addEventListener('click', this.combineTimeseries.bind(this));
    },

    /**
     * Create legend visibility toggle button.
     * @param {Element} elm element to render the button to
     * @param {Koala.view.component.D3Chart|Koala.view.component.D3BarChart} chart
     *          The associated chart
     */
    createLegendVisibilityButton: function(elm, chart) {
        var btn = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'toggleLegend',
            glyph: 'xf151@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('toggleLegendVisibility')
            }
        };
        this.legendVisibilityButton = Ext.create(btn);
        this.legendVisibilityButton.render(elm, chart.xtype === 'd3-chart' ? 5 : 3);
        this.legendVisibilityButton.el.dom.addEventListener('click',
            this.toggleLegend.bind(this, chart));
    },

    /**
     * Create export to png button.
     * @param {Element} elm element to render the button to
     * @param {Koala.view.component.D3Chart|Koala.view.component.D3BarChart} chart
     *          The associated chart
     */
    createExportToPngButton: function(elm, chart) {
        var btn = {
            cls: 'carto-window-chart-button',
            xtype: 'button',
            name: 'exportToPng',
            glyph: 'xf019@FontAwesome',
            bind: {
                tooltip: this.view.getViewModel().get('exportToPngText')
            }
        };
        this.exportToPngButton = Ext.create(btn);
        this.exportToPngButton.render(elm, chart.xtype === 'd3-chart' ? 6 : 4);
        this.exportToPngButton.el.dom.addEventListener('click',
            this.exportToPng.bind(this, chart));
    },

    /**
     * Exports the chart to PNG and starts a download.
     * @param {Koala.view.component.D3Chart|Koala.view.component.D3BarChart} chart
     *          The associated chartion]
     */
    exportToPng: function(chart) {
        var cb = function(dataUri) {
            download(dataUri, 'chart.png', 'image/png');
        };
        var chartCtrl = chart.getController();
        chartCtrl.chartToDataUriAndThen(cb);
    },

    /**
     * Create the tab which contains the rendererd BarChart and adds it to the
     * tabwindow.
     */
    createBarChartTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        var layer = view.getLayer();
        var feature = view.getFeature();

        var barChartTab = me.createTabElement({
            title: 'Bar Chart',
            className: 'barchart-tab',
            active: true
        });

        var tabElm = barChartTab.getElementsByTagName('div')[0];

        var config = {
            width: '400px',
            height: '400px',
            flex: 1,
            renderTo: tabElm
        };

        var chartObj = Koala.view.component.D3BarChart.create(
            layer, feature, config);


        el.appendChild(barChartTab);
        var barChart = Ext.create(chartObj);

        this.createLegendVisibilityButton(tabElm, barChart);
        this.createExportToPngButton(tabElm, barChart);
    },

    getTabData: function(urlProperty, contentProperty) {
        var view = this.getView();
        var layer = view.layer;
        urlProperty = layer.get(urlProperty);
        contentProperty = layer.get(contentProperty);
        var url, prop;
        if (urlProperty) {
            url = Koala.util.String.replaceTemplateStrings(
                urlProperty,
                view.feature
            );
        }
        if (contentProperty) {
            prop = Koala.util.String.replaceTemplateStrings(
                contentProperty,
                view.feature
            );
        }

        var promise;

        if (prop) {
            promise = Ext.Promise.resolve(prop);
        } else {
            promise = new Ext.Promise(function(resolve, reject) {
                Ext.Ajax.request({
                    url: url,
                    success: function(response) {
                        resolve(response.responseText);
                    },
                    failure: function(response) {
                        reject(response.status);
                    }
                });
            });
        }
        return promise;
    },

    getTableData: function() {
        return this.getTabData('tableContentURL', 'tableContentProperty');
    },

    arrayToTable: function(data) {
        var html = '<table class="bordered-table">';
        Ext.each(data, function(row) {
            html += '<tr>';
            Ext.each(row, function(value) {
                html += '<td>';
                html += value;
                html += '</td>';
            });
            html += '</tr>';
        });
        return html + '</table>';
    },

    geoJsonToTable: function(collection) {
        var html = '<table class="bordered-table">';
        var first = true;
        var headerRow = '<tr>';
        var row;
        Ext.each(collection.features, function(feat) {
            row = '<tr>';
            Ext.iterate(feat.properties, function(key, prop) {
                row += '<td>';
                row += prop;
                row += '</td>';
                if (first) {
                    headerRow += '<th>' + key + '</th>';
                }
            });
            if (first) {
                first = false;
                html += headerRow + '</tr>';
            }
            html += row + '</tr>';
        });
        return html + '</table>';
    },

    convertData: function(data) {
        switch (data[0]) {
            case '<': {
                return data;
            }
            case '[': {
                // case of simple arrays in array
                return this.arrayToTable(JSON.parse(data));
            }
            case '{': {
                // case of GeoJSON
                return this.geoJsonToTable(JSON.parse(data));
            }
            default: {
                return this.arrayToTable(Ext.util.CSV.decode(data));
            }
        }
    },

    getHtmlData: function() {
        return this.getTabData('htmlContentURL', 'htmlContentProperty');
    },

    /**
     * Create the tab which contains the table content and adds it to the
     * tabwindow.
     */
    createTableTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        this.getTableData().then(function(data) {
            var html = me.convertData(data);

            var timeSeriesTab = me.createTabElement({
                title: 'Table',
                innerHTML: html,
                className: 'table-tab'
            });

            el.appendChild(timeSeriesTab);
            me.updateCloseElementPosition();
        });
    },

    /**
     * Create the tab which contains the html content and adds it to the
     * tabwindow.
     */
    createHtmlTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        this.getHtmlData().then(function(data) {
            var timeSeriesTab = me.createTabElement({
                title: 'Html',
                innerHTML: data,
                className: 'html-tab'
            });

            el.appendChild(timeSeriesTab);
            me.updateCloseElementPosition();
        });
    },

    /**
     * Create the tab which contains the hovertemplate and adds it to the
     * tabwindow.
     */
    createHoverTemplateTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.el.dom;
        var layer = view.getLayer();
        var feature = view.getFeature();
        var template = Koala.util.Object.getPathStrOr(layer,
            'metadata/layerConfig/olProperties/hoverTpl');
        var innerHTML = Koala.util.String.replaceTemplateStrings(template,
            feature);
        var timeSeriesTab = me.createTabElement({
            title: 'Hover',
            innerHTML: innerHTML,
            className: 'hoverTpl-tab'
        });

        el.appendChild(timeSeriesTab);
    },

    /**
     * Create a tab for the tabwindow.
     *
     * @param {Object} config An config object which can contain these params:
     *               {String} title The title of the tab.
     *               {String} innerHtml The htmlcontent of the tab.
     *               {String} className A css class added to the tab.
     * @return {HTMLDivElement} The returned div element.
     */
    createTabElement: function(config) {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var tabs = viewModel.get('tabs');
        var tabIndex = tabs.length;
        var cartoWindowId = view.getCartoWindowId();
        var tabIdString = cartoWindowId + '__cartowindow-tab-label-'+ tabIndex;

        var tab = Ext.DomHelper.createDom({
            tag: 'div',
            cls: cartoWindowId + ' cartowindow-tab ' + config.className,
            children: [{
                tag: 'label',
                for: tabIdString,
                tabIndex: tabIndex,
                style: {
                    position: 'absolute',
                    top: '-2em',
                    left: (tabIndex * 100) + 'px'
                }
            }, {
                tag: 'input',
                id: tabIdString,
                type: 'radio',
                name: cartoWindowId + ' tabs',
                checked: config.active || false,
                'aria-hidden': true
            }, {
                tag: 'h2',
                html: config.title,
                style: {
                    position: 'absolute',
                    top: '-2em',
                    left: (tabIndex * 100) + 'px'
                }
            }, {
                tag: 'div',
                cls: 'content tab-' + tabIndex,
                html: config.innerHTML || ''
            }]
        });

        if (!Ext.isModern) {
            Ext.create('Ext.resizer.Resizer', {
                target: tab.querySelector('.content'),
                handles: 'se s e'
            });
        }

        var input = tab.querySelector('input');
        input.addEventListener('change', me.updateLineFeature.bind(me));

        tabs.push(tab);
        return tab;
    },

    /**
     * Creates the ol.Overlay which contains the tabwindow, adds it to the map
     * and stores it as an attribute of the view.
     */
    createOverlay: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var map = view.getMap();
        var position = view.getFeature().getGeometry().getCoordinates();
        var cartoWindowId = view.getCartoWindowId();

        var overlay = new ol.Overlay({
            id: cartoWindowId,
            position: position,
            positioning: 'top-left',
            element: view.el.dom,
            stopEvent: true,
            dragging: false
        });

        map.addOverlay(overlay);

        viewModel.set('overlay', overlay);
    },

    /**
     * This method creates a vectorlayer which stores the lineFeatures of the
     * carto-windows. If the layer allready exists it will use this one instead.
     */
    getOrCreateLineLayer: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var map = view.getMap();
        var lineLayer = BasiGX.util.Layer.getLayerByName('carto-window-lines');

        if (!lineLayer) {
            var lineStyle = view.getLayer().get('cartoWindowLineStyle');
            lineLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: lineStyle.split(',')[0],
                        width: lineStyle.split(',')[1]
                    })
                }),
                zIndex: 800,
                name: 'carto-window-lines',
                printSpecial: true
            });
            lineLayer.set(BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER, false);
            map.addLayer(lineLayer);
        }
        viewModel.set('lineLayer', lineLayer);
    },

    /**
     * Creates the lineFeature adds it to a layer and adds this layer to the map.
     * It also adds the Drag functionality to the cartowindow. The feature is
     * stored as a attribute of the view.
     */
    createLineFeature: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var mapComponent = Ext.ComponentQuery.query('k-component-map')[0];
        var hoverPlugin = mapComponent.getPlugin('hoverBfS');
        var map = view.getMap();
        var feature = view.getFeature();
        var coords = feature.getGeometry().getCoordinates();
        var el = view.el.dom;
        var overlay = viewModel.get('overlay');
        var cartoWindowId = view.getCartoWindowId();

        var lineFeature = new ol.Feature({
            geometry: new ol.geom.LineString([coords, coords])
        });

        lineFeature.setId(cartoWindowId);

        var dragPan;
        map.getInteractions().forEach(function(interaction) {
            if (interaction instanceof ol.interaction.DragPan) {
                dragPan = interaction;
            }
        });

        var downEvent = Ext.isModern ? 'touchstart': 'mousedown';
        var upEvent = Ext.isModern ? 'touchend': 'mouseup';

        el.addEventListener(downEvent, function(event) {
            if (event.target.tagName === 'LABEL') {
                dragPan.setActive(false);
                overlay.set('dragging', true);
                hoverPlugin.setPointerRest(false);
            } else if (Ext.Array.contains(event.target.classList, 'x-resizable-handle')) {
                overlay.set('resizing', true);
                me.resizeTarget = Ext.get(event.target).up('.cartowindow-tab').down('.content');
            }
        });

        me.onMouseUp = function() {
            if (overlay.get('dragging') === true) {
                dragPan.setActive(true);
                overlay.set('dragging', false);
                hoverPlugin.setPointerRest(true);
            }
        };

        me.onMouseUpWindow = function() {
            overlay.set('resizing', false);
        };

        me.pointerMoveListener = function(event) {
            if (overlay.get('dragging') === true) {
                overlay.setPosition(event.coordinate);
                me.updateLineFeature();
            } else if (overlay.get('resizing') === true) {
                var target = me.resizeTarget;
                var targetX = target.getX();
                var targetY = target.getY();
                var evtX = event.originalEvent.clientX;
                var evtY = event.originalEvent.clientY;
                var newWidth = evtX - targetX;
                var newHeight = evtY - targetY;
                newWidth = newWidth > view.contentMinWidth
                    ? newWidth
                    : view.contentMinWidth || 0;
                newHeight = newHeight > view.contentMinHeight
                    ? newHeight
                    : view.contentMinHeight || 0;

                var chartContainerEl = target.down('[id^=d3-chart]') ||
                        target.down('[id^=d3-barchart]');
                if (chartContainerEl) {
                    var chart = Ext.getCmp(chartContainerEl.id);
                    chart.setWidth(newWidth - 20);
                    chart.setHeight(newHeight - 20);
                }
                target.setWidth(newWidth);
                target.setHeight(newHeight);
                me.updateLineFeature();
            }
        };

        el.addEventListener(upEvent, me.onMouseUp);
        window.addEventListener(upEvent, me.onMouseUpWindow);
        map.on('pointermove', me.pointerMoveListener);

        viewModel.get('lineLayer').getSource().addFeature(lineFeature);
        viewModel.set('lineFeature', lineFeature);
    },

    /**
     * Create listeners for 'change:visible' on the layer and 'remove' on the
     * layerCollection to sync layer, overlay and feature visibility.
     */
    createLayerListeners: function() {
        var me = this;
        var view = me.getView();
        var layer = view.getLayer();
        var map = view.getMap();
        var layerCollection = map.getLayers();

        layer.on('change:visible', me.onLayerVisibilityChange, me);
        layerCollection.on('remove', me.onLayerRemove, me);
    },

    /**
     * Handler for the layers 'change:visible' event. It syncs visibility changes
     * between the layer and the overlay/lineFeature.
     * @param {ol.Object.Event} evt The change:visible event.
     */
    onLayerVisibilityChange: function(evt) {
        var me = this;
        var viewModel = me.getViewModel();
        var overlay = viewModel.get('overlay');
        var lineFeature = viewModel.get('lineFeature');
        var lineLayer = BasiGX.util.Layer.getLayerByName('carto-window-lines');

        if (lineFeature && lineLayer && overlay) {
            var el = overlay.getElement();
            var lineSource = lineLayer.getSource();

            if (evt.target.get('visible')) {
                if (!lineSource.getFeatureById(lineFeature.getId())) {
                    lineSource.addFeature(lineFeature);
                    el.classList.remove('x-hidden');
                }
            } else {
                el.classList.add('x-hidden');
                lineSource.removeFeature(lineFeature);
            }
        }
    },

    /**
     * Handler for the maps 'remove' event. It removes the overlay and lineFeature
     * when the layer is removed.
     * @param {ol.Collection.Event} evt The remove event.
     */
    onLayerRemove: function(evt) {
        var me = this;
        var view = me.getView();
        var layer = view.getLayer();
        var removedLayer = evt.element;

        if (layer === removedLayer) {
            view.destroy();
        }
    },

    /**
     * Updates the coordinates of the drawn lineFeature. And sets the
     * centerCoords property on the overlay.
     */
    updateLineFeature: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var map = view.getMap();
        var feature = view.getFeature();
        var lineFeature = viewModel.get('lineFeature');
        var featureStartCoords = feature.getGeometry().getCoordinates();
        var overlay = viewModel.get('overlay');
        var overlayerCoords = overlay.getPosition();
        var overlayerTopLeftPixel = map.getPixelFromCoordinate(overlayerCoords);
        var overlayWidth = overlay.getElement().clientWidth;
        var overlayHeight = overlay.getElement().clientHeight;
        var centerPixel = [overlayWidth/2 + overlayerTopLeftPixel[0],
            overlayHeight/2 + overlayerTopLeftPixel[1]];
        var centerCoords = map.getCoordinateFromPixel(centerPixel);
        lineFeature.getGeometry().setCoordinates([featureStartCoords, centerCoords]);
        overlay.centerCoords = centerCoords;
    },

    scrollTimeseriesLeft: function() {
        this.scrollTimeseries('min', 'startDate', 'subtract');
    },

    scrollTimeseriesRight: function() {
        this.scrollTimeseries('max', 'endDate', 'add');
    },

    scrollTimeseries: function(minOrMax, startOrEndDate, addOrSubtract) {
        var controller = this.timeserieschart.getController();
        var zoom = controller.currentDateRange;
        var hasZoom = zoom[minOrMax] !== null;

        var changedDate = this.timeserieschart.getConfig(startOrEndDate);
        if (hasZoom) {
            changedDate = moment(zoom[minOrMax]);
        }

        var layer = this.getView().layer;
        var duration = Koala.util.Object.getPathStrOr(
            layer,
            'metadata/layerConfig/timeSeriesChartProperties/duration'
        );
        changedDate[addOrSubtract](moment.duration(duration));

        // only change start/end date if needed
        var start = this.timeserieschart.getConfig('startDate');
        var end = this.timeserieschart.getConfig('endDate');
        if (!start.isBefore(changedDate) || !end.isAfter(changedDate)) {
            this.timeserieschart.setConfig(startOrEndDate, changedDate);
        }

        if (hasZoom) {
            zoom[minOrMax] = changedDate.valueOf();
        }
        controller.getChartData();
        if (hasZoom) {
            var min = zoom.min;
            var max = zoom.max;
            controller.on('chartdataprepared', function() {
                // unfortunately, d3 has an internal timer resetting
                // the zoom frequently in the first few hundred ms after
                // creation
                window.setTimeout(function() {
                    controller.zoomToInterval(min, max);
                }, 800);
            });
        }
    },

    combineTimeseries: function() {
        var me = this;
        var stations = this.timeserieschart.selectedStations;
        var stationIds = [];
        Ext.each(stations, function(station) {
            stationIds.push(station.get('id'));
        });
        var newStations = [];
        var newStationIds = [];

        var allCharts = Ext.ComponentQuery.query('d3-chart');
        Ext.each(allCharts, function(chart) {
            Ext.each(chart.selectedStations, function(station) {
                if (stationIds.indexOf(station.get('id')) === -1 && newStationIds.indexOf(station.get('id')) === -1) {
                    newStations.push(station);
                    newStationIds.push(station.get('id'));
                }
            });
        });
        Ext.each(newStations, function(station) {
            Koala.util.Chart.addFeatureToTimeseriesChart(station.get('layer'), station, me.timeserieschart);
        });
        this.timeserieschart.getController().getChartData();
        var cartos = Ext.ComponentQuery.query('k-component-cartowindow');
        Ext.each(cartos, function(carto) {
            if (carto !== me.getView()) {
                carto.destroy();
            }
        });
    },

    toggleLegend: function(chart) {
        var btn = this.legendVisibilityButton;
        chart.getController().toggleLegendVisibility();
        var glyph = btn.getGlyph();
        if (glyph.glyphConfig === 'xf151@FontAwesome') {
            glyph = 'xf150@FontAwesome';
        } else {
            glyph = 'xf151@FontAwesome';
        }
        btn.setGlyph(glyph);
    },

    /**
     * onBeforeDestroy listener. It removes the lineLayer before destroy and
     * removes the pointerMoveListener.
     */
    onBeforeDestroy: function() {
        var me = this;
        var view = me.getView();
        var layer = view.getLayer();
        var map = view.getMap();
        var layerCollection = map.getLayers();
        var viewModel = me.getViewModel();
        var lineLayer = viewModel.get('lineLayer');
        var lineFeature = viewModel.get('lineFeature');
        var upEvent = Ext.isModern ? 'touchend': 'mouseup';

        layer.un('change:visible', me.onLayerVisibilityChange, me);
        layerCollection.un('remove', me.onLayerRemove, me);
        map.un('pointermove', me.pointerMoveListener);
        window.removeEventListener(upEvent, me.onMouseUpWindow);
        lineLayer.getSource().removeFeature(lineFeature);
    }

});
