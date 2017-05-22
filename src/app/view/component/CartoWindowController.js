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
        console.log('init');
    },

    createTabs: function() {
        var me = this;
        var view = me.getView();
        var layer = view.getLayer();

        if (Koala.util.Layer.isTimeseriesChartLayer(layer)) {
            me.createTimeSeriesTab();
        }

        me.createHtmlTab();
    },

    createTimeSeriesTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.getEl().dom;
        var timeSeriesTab = me.createTabElement({
            title: 'Chart',
            content: 'REPLACE WITH CHART'
        });

        el.appendChild(timeSeriesTab);
    },

    createHtmlTab: function() {
        var me = this;
        var view = me.getView();
        var el = view.getEl().dom;
        var timeSeriesTab = me.createTabElement({
            title: 'Html',
            content: 'My custom HTML'
        });

        el.appendChild(timeSeriesTab);
    },

    createTabElement: function(config) {
        var me = this;
        var view = me.getView();
        var tabIndex = view.tabs.length;

        var tab = document.createElement('div');
        tab.className = 'cartowindow-tab';

        var label = document.createElement('label');
        label.setAttribute('for', 'cartowindow-tab-label-'+ tabIndex);
        label.setAttribute('tabindex', tabIndex);

        var input = document.createElement('input');
        input.setAttribute('id', 'cartowindow-tab-label-' + tabIndex);
        input.setAttribute('type', 'radio');
        input.setAttribute('name', 'tabs');
        // input.setAttribute('checked', 'true');
        input.setAttribute('aria-hidden', 'true');

        var header = document.createElement('h2');
        header.textContent = config.title;

        var content = document.createElement('div');
        content.className = 'content tab-' + tabIndex;

        content.textContent = config.content;
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

        el.addEventListener('mousedown', function() {
            dragPan.setActive(false);
            overlayer.set('dragging', true);
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
