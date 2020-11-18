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
 * @class Koala.view.window.RoutingController
 */
Ext.define('Koala.view.window.RoutingController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-routing',
    requires: [
        'GeoExt.component.Popup'
    ],

    /**
     * Gets a layer by its name.
     * @param {String} layerName The name of the layer to get.
     * @returns {ol.layer.Layer} The layer if found. Null otherwise.
     */
    getLayerByName: function(layerName) {
        var me = this;
        var view = me.getView();
        var map = view.map;

        if (!map) {
            return;
        }

        var layers = map.getLayers().getArray();
        return Ext.Array.findBy(layers, function(l) {
            return l.get('name') === layerName;
        });
    },

    /**
     * Gets the RouteLayer.
     * @returns {ol.layer.Vector} The RouteLayer.
     */
    getRouteLayer: function() {
        var me = this;
        var view = me.getView();

        if (!view.routeLayerName) {
            return;
        }

        return me.getLayerByName(view.routeLayerName);
    },

    /**
     * Gets the WaypointLayer.
     * @returns {ol.layer.Vector} The WaypointLayer.
     */
    getWaypointLayer: function() {
        var me = this;
        var view = me.getView();

        if (!view.waypointLayerName) {
            return;
        }

        return me.getLayerByName(view.waypointLayerName);
    },

    /**
     * Handler for visualising the routing results.
     * @param {Object} geojson The routing GeoJSON.
     */
    onRouteLoaded: function(geojson) {
        var me = this;
        me.addRouteToMap(geojson);
    },

    onWaypointAdded: function(feature) {
        var me = this;
        me.addWayPointToMap(feature);
    },

    /**
     * Adds the Routing feature to the map.
     * @param {Object} geojson The GeoJSON to be added.
     */
    addRouteToMap: function(geojson) {
        var me = this;
        var view = me.getView();

        var layer = me.getRouteLayer();
        if (!layer) {
            return;
        }

        var source = new ol.source.Vector({
            features: (new ol.format.GeoJSON({
                featureProjection: view.map.getView().getProjection()
            })).readFeatures(geojson)
        });
        layer.setSource(source);
    },

    /**
     * Adds a single waypoint to the waypointLayer.
     */
    addWayPointToMap: function(feature) {
        var me = this;

        var layer = me.getWaypointLayer();
        if (!layer) {
            return;
        }

        var source = layer.getSource();
        source.addFeature(feature);
    },

    /**
     * Handler for clicking on a waypoint.
     */
    onWaypointClick: function(evt) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        if (!view.map) {
            return;
        }

        var popup = vm.get('waypointPopup');

        var waypointLayerListed = false;
        view.map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            if (layer === null) {
                return;
            }

            if (layer.get('name') !== view.waypointLayerName) {
                return;
            }

            waypointLayerListed = true;

            if (!popup) {
                return;
            }

            var coordinate = feature.getGeometry().getCoordinates();
            var content = me.getWaypointPopupContent(feature.get('description'));
            popup.setHtml(content);
            popup.position(coordinate);
            popup.show();
        });
        if (!waypointLayerListed && popup) {
            popup.hide();
        }
    },

    /**
     * Gets the content for the waypoint popup.
     * This makes sure that the boilerplate for the popup
     * will always be set up properly.
     *
     * TODO should this function be moved to the viewmodel?
     *
     * @param {String} content The content of the tooltip.
     * @returns {String} The HTML String for the popup.
     */
    getWaypointPopupContent: function(content) {
        var popupTooltip = '<div class="popup-tip-container">' +
            '<div class="popup-tip"></div></div>';
        var popupContent = '<p><strong>' + content + '</strong></p>';
        return popupContent + popupTooltip;
    },

    /**
     * Creates the WaypointPopup.
     * @returns {GeoExt.component.Popup} The created waypointPopup.
     */
    createWaypointPopup: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var popup = Ext.create('GeoExt.component.Popup', {
            map: view.map,
            width: 140
        });

        var overlay = popup.getOverlay();
        // set the overlay above the marker
        // a negative value shifts the overlay upwards
        var offsetY = vm.get('waypointFontSize') * (-1);
        overlay.setOffset([0, offsetY]);

        return popup;
    },

    /**
     * Create all instances that need to be created, as soon as
     * the Routing window will be opened.
     */
    onBoxReady: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        me.createRoutingLayers();

        if (vm.get('waypointPopup') === null) {
            vm.set('waypointPopup', me.createWaypointPopup());
        }

        // TODO remove this. Just used for dev
        var feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([8.63, 49.40]))
        });
        feature.set('description', 'Point 1 description with some long text');
        me.getView().fireEvent('onWaypointAdded', feature);

        var feature2 = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([8.68, 49.41]))
        });
        feature2.set('description', 'Point 2');
        me.getView().fireEvent('onWaypointAdded', feature2);
    },

    /**
     * Creates all needed layers for the routing.
     */
    createRoutingLayers: function() {
        var me = this;
        var view = me.getView();

        if (!me.getRouteLayer()) {
            me.createLayer('routeStyle', view.routeLayerName);
        }
        if (!me.getWaypointLayer()) {
            me.createLayer('waypointStyle', view.waypointLayerName);

            if (view.map !== null) {
                view.map.on('singleclick', me.onWaypointClick, me);
            }
        }
    },

    /**
     * Handler for finding the start location.
     *
     * TODO: Button is only temporary.
     * TODO: Remove when not needed anymore.
     */
    onStartButtonClick: function() {
        var me = this;
        me.applyCoordianteAssignment('startValue');
    },


    /**
     * Handler for finding the target location.
     *
     * TODO: Button is only temporary.
     * TODO: Remove when not needed anymore.
     */
    onTargetButtonClick: function() {
        var me = this;
        me.applyCoordianteAssignment('targetValue');
    },

    /**
     * Enables an one-time listener for a map click.
     *
     * Assigns the coordiantes to the property.
     * @param {String} propName The Name of the start object in the viewModel.
     */
    applyCoordianteAssignment: function(propName) {
        var me = this;
        var view = me.getView();
        var map = view.map;
        map.once('singleclick', function(event) {

            var coordinate = event.coordinate;
            var sourceProjection = map.getView().getProjection().getCode();
            var targetProjection = ol.proj.get('EPSG:4326');
            var transformed = ol.proj.transform(coordinate, sourceProjection, targetProjection);

            var vm = view.lookupViewModel();
            vm.set(propName, transformed);
        });
    },


    /**
     * Creates a new layer and overwrites the applied viewLayer.
     *
     * Gets the style from the viewModel by name.
     *
     * @param {String} styleName The name of the style object in the viewModel.
     * @param {String} viewLayerName The name of the viewLayer that should be overwritten.
     * @returns {ol.layer.Vector} The created vector layer.
     */
    createLayer: function(styleName, layerName) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var map = view.map;
        var displayInLayerSwitcherKey =
            BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;

        var source = new ol.source.Vector();
        var layer = new ol.layer.Vector({
            source: source,
            style: vm.get(styleName)
        });
        layer.set(displayInLayerSwitcherKey, false);
        layer.set('name', layerName);

        map.addLayer(layer);

        return layer;
    },

    /**
     * Handles data cleanup when the window is being closed.
     */
    onWindowClose: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var routeLayer = me.getRouteLayer();
        if (routeLayer) {
            view.map.removeLayer(routeLayer);
        }
        var waypointLayer = me.getWaypointLayer();
        if (waypointLayer) {
            view.map.removeLayer(waypointLayer);
        }
        if (view.map !== null) {
            view.map.un('singleclick', me.onWaypointClick, me);
        }

        if (vm.get('waypointPopup') !== null) {
            var overlay = vm.waypointPopup.getOverlay();
            view.map.removeOverlay(overlay);
            vm.set('waypointPopup', null);
        }
    },

    /**
     * Requests openrouteservice API.
     *
     * TODO: This is currently only a place holder.
     * TODO: Remove later.
     */
    makeRoutingRequest: function() {
        var me = this;

        Ext.Ajax.request({
            url: '/ors/ors.json',

            success: function(response) {
                var content = Ext.decode(response.responseText);
                me.getView().fireEvent('onRouteLoaded', content);
            }
        });
    }

});
