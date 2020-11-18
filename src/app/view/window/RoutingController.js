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

        var layer = view.routeLayer;
        if (layer === null) {
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
        var view = me.getView();

        var layer = view.waypointLayer;
        if (layer === null) {
            return;
        }

        var source = layer.getSource();
        source.addFeature(feature);
    },

    /**
     * Create all instances that need to be created, as soon as
     * the Routing window will be opened.
     */
    onBoxReady: function() {
        var me = this;

        me.createRoutingLayers();

        // TODO remove this. Just used for dev
        me.getView().fireEvent('onWaypointAdded', new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([8.63, 49.40]))
        }));
    },

    /**
     * Creates all needed layers for the routing.
     */
    createRoutingLayers: function() {
        var me = this;
        var view = me.getView();

        if (view.routeLayer === null) {
            me.createLayer('routeStyle', 'routeLayer');
        }
        if (view.waypointLayer === null) {
            me.createLayer('waypointStyle', 'waypointLayer');
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
     */
    createLayer: function(styleName, viewLayerName) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var map = view.map;

        var source = new ol.source.Vector();
        var layer = new ol.layer.Vector({
            source: source,
            style: vm.get(styleName),
            map: map
        });

        view[viewLayerName] = layer;
    },

    /**
     * Handles data cleanup when the window is being closed.
     */
    onWindowClose: function() {
        var me = this;
        var view = me.getView();

        if (view.routeLayer !== null) {
            view.routeLayer.setMap(null);
            view.routeLayer = null;
        }
        if (view.waypointLayer !== null) {
            view.waypointLayer.setMap(null);
            view.waypointLayer = null;
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
