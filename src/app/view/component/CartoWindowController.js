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
        'Ext.Ajax'
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

        me.createLineFeature();
    },

    /**
     * Create the Tabs.
     */
    createTabs: function() {
        var me = this;
        var view = me.getView();
        var layer = view.getLayer();

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

        // TODO Add if test
        me.createHoverTemplateTab();

        // TODO
        // me.createCloseIconTab();
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
        var url = Koala.util.String.replaceTemplateStrings(
            layer.get(urlProperty),
            view.feature
        );
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

    convertData: function(data) {
        switch (data[0]) {
            case '<': {
                return data;
            }
            case '[': {
                return this.arrayToTable(JSON.parse(data));
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
        var tabIndex = view.tabs.length;
        var featureId = view.feature.get('id');
        var tabIdString = featureId + ' cartowindow-tab-label-'+ tabIndex;

        var tab = document.createElement('div');
        tab.className = featureId + ' cartowindow-tab ' + config.className;

        var label = document.createElement('label');
        label.setAttribute('for', tabIdString);
        label.setAttribute('tabindex', tabIndex);

        var input = document.createElement('input');
        input.setAttribute('id', tabIdString);
        input.setAttribute('type', 'radio');
        input.setAttribute('name', featureId + ' tabs');
        input.setAttribute('checked', config.active || false);
        input.setAttribute('aria-hidden', 'true');

        var header = document.createElement('h2');
        header.textContent = config.title;

        var content = document.createElement('div');
        content.className = 'content tab ' + tabIndex;
        content.innerHTML = config.innerHTML || '';

        tab.appendChild(label);
        tab.appendChild(input);
        tab.appendChild(header);
        tab.appendChild(content);

        view.tabs.push(tab);
        return tab;
    },

    /**
     * Creates the ol.Overlay which contains the tabwindow, adds it to the map
     * and stores it as an attribute of the view.
     */
    createOverlay: function() {
        var me = this;
        var view = me.getView();
        var map = view.getMap();

        var overlay = new ol.Overlay({
            position: view.getFeature().getGeometry().getCoordinates(),
            positioning: 'center-center',
            element: view.getEl().dom,
            stopEvent: true,
            dragging: false
        });

        map.addOverlay(overlay);

        view.overlay = overlay;
    },

    /**
     * Creates the lineFeature adds it to a layer and adds this layer to the map.
     * It also adds the Drag functionality to the cartowindow. The feature is
     * stored as a attribute of the view.
     */
    createLineFeature: function() {
        var me = this;
        var view = me.getView();
        var map = view.getMap();
        var feature = view.getFeature();
        var coords = feature.getGeometry().getCoordinates();
        var el = view.getEl().dom;
        var overlayer = view.overlay;

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
                overlayer.set('dragging', true);
            }
        });
        el.addEventListener('mouseup', function() {
            if (overlayer.get('dragging') === true) {
                dragPan.setActive(true);
                overlayer.set('dragging', false);
            }
        });

        view.pointerMoveListener = function(evt) {
            if (overlayer.get('dragging') === true) {
                overlayer.setPosition(evt.coordinate);
                lineFeature.getGeometry().setCoordinates([coords, evt.coordinate]);
            }
        };

        map.on('pointermove', view.pointerMoveListener);

        me.lineFeatureVectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [lineFeature]
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 10
                })
            }),
            name: 'Proof Layer',
            proofPrintable: true
        });
        map.addLayer(me.lineFeatureVectorLayer);

        view.lineFeature = lineFeature;
    },

    /**
     * OnDestroy listener. It removes the lineFeatureVectorLayer on destroy and
     * removes the pointerMoveListener.
     */
    onDestroy: function() {
        var me = this;
        var view = me.getView();
        var map = view.getMap();

        map.un('pointermove', me.pointerMoveListener);
        map.removeLayer(me.lineFeatureVectorLayer);
    }

});
