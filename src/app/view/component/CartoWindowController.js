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

        me.createTableTab();

        me.createHtmlTab();

        me.createHoverTemplateTab();

        // TODO
        // me.createCloseIconTab();
    },

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

    createTableTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.getEl().dom;
        var timeSeriesTab = me.createTabElement({
            title: 'Table',
            innerHTML: 'My custom Table',
            className: 'table-tab'
        });

        el.appendChild(timeSeriesTab);
    },

    createHtmlTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.getEl().dom;
        var timeSeriesTab = me.createTabElement({
            title: 'Html',
            innerHTML: 'My custom HTML',
            className: 'html-tab'
        });

        el.appendChild(timeSeriesTab);
    },

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
            title: 'Hover Template',
            innerHTML: innerHTML,
            className: 'hoverTpl-tab'
        });

        el.appendChild(timeSeriesTab);
    },

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

    onDestroy: function() {
        var me = this;
        var view = me.getView();
        var map = view.getMap();

        map.un('pointermove', me.pointerMoveListener);
        map.removeLayer(me.lineFeatureVectorLayer);
    }

});
