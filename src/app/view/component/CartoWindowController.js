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
        'Koala.util.Object'
    ],

    /**
     * Called on initialize event. Only used in modern toolkit.
     *
     * @private
     */
    onInitialize: function() {
        var me = this;

        me.createTabs();

        me.createOverlay();

        me.getOrCreateLineLayer();

        me.createLineFeature();

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
        var el = view.getEl().dom;
        var featureId = view.feature.get('id');
        var closeElement = Ext.DomHelper.createDom({
            tag: 'div',
            html: '<i class="fa fa-times-circle" aria-hidden="true"></i>',
            cls: featureId + ' closeElement'
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
        var el = view.getEl();
        var viewModel = me.getViewModel();
        var tabs = viewModel.get('tabs');
        var tabIndex = tabs.length;
        var closeElement = el.down('.closeElement');
        closeElement.setStyle('left', (tabIndex*100) + 'px');
    },

    /**
     * Create the tab which contains the rendered TimeSeries and adds it to the
     * tabwindow.
     */
    createTimeSeriesTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.getEl().dom;
        var layer = view.layer;
        var feature = view.feature;
        var timeFilter = Koala.util.Filter.getStartEndFilterFromMetadata(
                view.layer.metadata);

        var timeSeriesTab = me.createTabElement({
            title: 'Timeseries',
            className: 'timeseries-tab',
            active: true
        });

        var config = {
            startDate: timeFilter.mindatetimeinstant,
            endDate: timeFilter.maxdatetimeinstant,
            width: '400px',
            height: '400px',
            renderTo: timeSeriesTab.getElementsByTagName('div')[0]
        };

        var chartObj = Koala.view.component.D3Chart.create(layer, feature, config);
        Ext.create(chartObj);

        el.appendChild(timeSeriesTab);
    },

    /**
     * Create the tab which contains the rendererd BarChart and adds it to the
     * tabwindow.
     */
    createBarChartTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.getEl().dom;
        var timeSeriesTab = me.createTabElement({
            title: 'Bar Chart',
            innerHTML: 'Replace with barchart',
            className: 'barchart-tab'
        });

        el.appendChild(timeSeriesTab);
    },

    getTabData: function(urlProperty, contentProperty) {
        var view = this.getView();
        var layer = view.layer;
        var feature = view.feature;
        urlProperty = layer.get(urlProperty);
        var url;
        if (urlProperty) {
            url = Koala.util.String.replaceTemplateStrings(
                urlProperty,
                view.feature
            );
        }
        var prop = layer.get(contentProperty);

        var promise;

        if (prop) {
            promise = Ext.Promise.resolve(feature.get(prop));
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
        var el = view.getEl().dom;
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
        var el = view.getEl().dom;
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
        var el = view.getEl().dom;
        var layer = view.layer;
        var feature = view.feature;
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
        var featureId = view.feature.get('id');
        var tabIdString = featureId + ' cartowindow-tab-label-'+ tabIndex;

        var tab = Ext.DomHelper.createDom({
            tag: 'div',
            cls: featureId + ' cartowindow-tab ' + config.className,
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
                name: featureId + ' tabs',
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

        Ext.create('Ext.resizer.Resizer', {
            target: tab.querySelector('.content'),
            handles: 'se'
        });

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

        var overlay = new ol.Overlay({
            position: view.getFeature().getGeometry().getCoordinates(),
            positioning: 'top-left',
            element: view.getEl().dom,
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
        var map = view.getMap();
        var feature = view.getFeature();
        var coords = feature.getGeometry().getCoordinates();
        var el = view.getEl().dom;
        var overlay = viewModel.get('overlay');

        var lineFeature = new ol.Feature({
            geometry: new ol.geom.LineString([coords, coords])
        });

        var dragPan;
        map.getInteractions().forEach(function(interaction) {
            if (interaction instanceof ol.interaction.DragPan) {
                dragPan = interaction;
            }
        });

        el.addEventListener('mousedown', function(event) {
            if (event.target.tagName === 'LABEL') {
                dragPan.setActive(false);
                overlay.set('dragging', true);
            } else if (Ext.Array.contains(event.target.classList, 'x-resizable-handle')) {
                overlay.set('resizing', true);
                me.resizeTarget = Ext.get(event.target).up('.cartowindow-tab').down('.content');
            }
        });

        view.onMouseUp = function() {
            if (overlay.get('dragging') === true) {
                dragPan.setActive(true);
                overlay.set('dragging', false);
            }
        };

        view.onMouseUpWindow = function() {
            overlay.set('resizing', false);
        };

        view.pointerMoveListener = function(evt) {
            if (overlay.get('dragging') === true) {
                overlay.setPosition(evt.coordinate);
                me.updateLineFeature();
            } else if (overlay.get('resizing') === true) {
                var target = me.resizeTarget;
                var targetX = target.getX();
                var targetY = target.getY();
                var evtX = evt.originalEvent.clientX;
                var evtY = evt.originalEvent.clientY;
                var newWidth = evtX - targetX;
                var newHeight = evtY - targetY;
                newWidth = newWidth > view.contentMinWidth
                        ? newWidth
                        : view.contentMinWidth || 0;
                newHeight = newHeight > view.contentMinHeight
                        ? newHeight
                        : view.contentMinHeight || 0;

                var timeSeriesEl = target.down('[id^=d3-chart]');
                if (timeSeriesEl) {
                    var chart = Ext.getCmp(timeSeriesEl.id);
                    chart.setWidth(newWidth - 20);
                    chart.setHeight(newHeight - 20);
                }
                target.setWidth(newWidth);
                target.setHeight(newHeight);
                me.updateLineFeature();
            }
        };

        el.addEventListener('mouseup', view.onMouseUp);
        window.addEventListener('mouseup', view.onMouseUpWindow);
        map.on('pointermove', view.pointerMoveListener);

        viewModel.get('lineLayer').getSource().addFeature(lineFeature);
        viewModel.set('lineFeature', lineFeature);
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

    /**
     * onBeforeDestroy listener. It removes the lineLayer before destroy and
     * removes the pointerMoveListener.
     */
    onBeforeDestroy: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var map = view.getMap();
        var lineLayer = viewModel.get('lineLayer');

        map.un('pointermove', view.pointerMoveListener);
        window.removeEventListener('mouseup', view.onMouseUpWindow);
        map.removeLayer(lineLayer);
    }

});
