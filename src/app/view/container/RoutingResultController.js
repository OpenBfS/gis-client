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
 * @class Koala.view.container.RoutingResultController
 */
Ext.define('Koala.view.container.RoutingResultController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-container-routingresult',

    requires: [
        'BasiGX.util.Layer'
    ],

    /**
     * Handler for the routingResultChanged event.
     *
     * @param {Object} newResult The new result as GeoJSON.
     */
    onRoutingResultChanged: function(newResult) {
        var me = this;

        me.addRouteToMap(newResult);
        me.zoomToRoute();
        me.updateRoutingInstructions(newResult);
        me.updateElevationPanel();
    },

    /**
     * Cleanup method when container will be destroyed.
     */
    onDestroy: function() {
        var me = this;
        me.destroyElevationPanel();
    },

    /**
     * Handler for the boxready event.
     */
    onBoxReady: function() {
        var me = this;

        // rerender elevationprofile to translate svg labels
        var langCombo = Ext.ComponentQuery.query('k-form-field-languagecombo')[0];
        langCombo.on('applanguagechanged', me.updateElevationPanel.bind(me));
    },

    /**
     * Handler for the mouseenter event on the grid.
     *
     * @param {Ext.grid.Panel} grid The Ext Grid.
     * @param {Koala.store.RoutingInstructions} rec A single RoutingInstruction.
     */
    onGridMouseEnter: function(grid, rec) {
        var me = this;

        var routeSegmentLayer = me.getRouteSegmentLayer();
        if (!routeSegmentLayer) {
            return;
        }
        var source = routeSegmentLayer.getSource();
        if (source) {
            source.clear();
        }
        var feature = me.createLineFeature(rec.get('coordinates'));
        source.addFeature(feature);
    },

    /**
     * Handler for the mouseleave event on the grid.
     */
    onGridMouseLeave: function() {
        var me = this;

        var routeSegmentLayer = me.getRouteSegmentLayer();
        if (!routeSegmentLayer) {
            return;
        }
        var source = routeSegmentLayer.getSource();
        if (source) {
            source.clear();
        }
    },

    /**
     * Handler for the select event on the grid.
     *
     * @param {Ext.grid.Panel} grid The Ext Grid.
     * @param {Koala.store.RoutingInstructions} rec A single RoutingInstruction.
     */
    onGridSelect: function(grid, rec) {
        var me = this;
        var view = me.getView();

        var routeSegmentLayer = me.getRouteSegmentLayer();
        if (!routeSegmentLayer) {
            return;
        }
        var source = routeSegmentLayer.getSource();
        if (source) {
            source.clear();
        }
        var feature = me.createLineFeature(rec.get('coordinates'));
        source.addFeature(feature);

        var map = view.map;
        if (!map) {
            return;
        }

        var mapView = map.getView();
        mapView.fit(feature.getGeometry());
    },

    /**
     * Create a line feature from a coordinate array.
     *
     * @param {[Number, Number, Number][]} coords Array of xyz ordinates.
     * @returns {ol.Feature} The created LineFeature.
     */
    createLineFeature: function(coords) {
        var me = this;
        var view = me.getView();
        var map = view.map;
        if (!map) {
            return;
        }

        // transform to map projection
        var sourceProjection = ol.proj.get('EPSG:4326');
        var targetProjection = map.getView().getProjection().getCode();

        var transformedCoords = Ext.Array.map(coords, function(coord) {
            return ol.proj.transform(coord, sourceProjection, targetProjection);
        });

        var lineString = new ol.geom.LineString(transformedCoords);
        return new ol.Feature(lineString);
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

        return BasiGX.util.Layer.getLayerByName(view.routeLayerName);
    },

    /**
     * Get the RouteSegmentLayer.
     *
     * @returns {ol.layer.Vector} The RouteSegmentLayer.
     */
    getRouteSegmentLayer: function() {
        var me = this;
        var view = me.getView();

        if (!view.routeSegmentLayerName) {
            return;
        }

        return BasiGX.util.Layer.getLayerByName(view.routeSegmentLayerName);
    },

    /**
     * Gets the ElevationLayer.
     * @returns {ol.layer.Vector} The WaypointLayer.
     */
    getElevationLayer: function() {
        var me = this;
        var view = me.getView();

        if (!view.elevationLayerName) {
            return;
        }

        return BasiGX.util.Layer.getLayerByName(view.elevationLayerName);
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
     * Zoom to the extent of the route.
     */
    zoomToRoute: function() {
        var me = this;
        var view = me.getView();
        var map = view.map;
        var mapView = map.getView();

        var layer = me.getRouteLayer();
        if (!layer) {
            return;
        }
        var source = layer.getSource();
        if (!source) {
            return;
        }

        var feature = source.getFeatures()[0];
        if (!feature) {
            return;
        }
        var geom = feature.getGeometry();

        mapView.fit(geom);
    },

    /**
     * Destroys the elevation graph
     */
    destroyElevationPanel: function() {
        var me = this;
        var view = me.getView();

        var southContainer = Ext.ComponentQuery.query('container[name=south-container]')[0];
        if (southContainer) {
            var elevationPanel = southContainer.down('[name=' + view.elevationProfilePanelName + ']');
            if (elevationPanel) {
                southContainer.remove(elevationPanel);
                elevationPanel.destroy();
            }
            southContainer.hide();
        }
    },

    /**
     * Set the visibility of the elvationprofile panel.
     *
     * @param {Boolean} visible True, if panel should be visible. False otherwise.
     */
    setElevationPanelVisibility: function(visible) {
        var southContainer = Ext.ComponentQuery.query('container[name=south-container]')[0];

        if (!southContainer) {
            return;
        }

        if (visible) {
            southContainer.show();
        } else {
            southContainer.hide();
        }
    },

    /**
     * Handle the clickevent of the elevation button.
     *
     * @param {Ext.button.Button} btn The clicked button.
     */
    onElevationBtnClick: function(btn) {
        var me = this;
        me.setElevationPanelVisibility(btn.pressed);
    },

    /**
     * Update the elevation panel.
     */
    updateElevationPanel: function() {
        var me = this;
        var view = me.getView();

        var elevationPanelName = view.elevationProfilePanelName;

        var routeLayer = BasiGX.util.Layer.getLayerByName(view.routeLayerName);
        if (!routeLayer) {
            return;
        }

        var elevationPanel = Ext.ComponentQuery.query('[name=' + elevationPanelName + ']')[0];
        if (elevationPanel) {

            if (routeLayer.getSource().getFeatures().length === 0) {
                me.setElevationPanelVisibility(false);
            }
            elevationPanel.updateLayer(routeLayer);
        }
    },

    /**
     * Handle clicking on an downloadButton item.
     *
     * @param {Ext.menu.Item} item The clicked menu item.
     */
    onDownloadButtonClicked: function(item) {
        var me = this;
        var view = me.getView();

        var routingWindow = view.up('k-window-routing');
        if (routingWindow) {
            routingWindow.fireEvent('makeDownloadRequest', item.downloadType);
        }
    },

    updateRoutingInstructions: function(result) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();
        var instructionsStore = vm.get('routinginstructions');

        if (!instructionsStore) {
            return;
        }

        instructionsStore.removeAll();

        var features = result.features;
        if (!features) {
            return;
        }

        var feature = features[0];

        var resultProps = feature.properties;
        if (!resultProps) {
            return;
        }

        var resultGeom = feature.geometry;

        if (!resultGeom) {
            return;
        }

        var segments = resultProps.segments;
        if (!segments) {
            return;
        }

        var instructions = [];

        Ext.Array.forEach(segments, function(segment) {
            var steps = segment.steps || [];
            Ext.Array.forEach(steps, function(step) {
                var coordinates = [];
                for (var i=step.way_points[0]; i<=step.way_points[1]; i++) {
                    var coord = Ext.clone(resultGeom.coordinates[i]);
                    coordinates.push(coord);
                }

                var instruction = {
                    distance: step.distance,
                    duration: step.duration,
                    instruction: step.instruction,
                    name: step.name,
                    type: step.type,
                    waypoints: step.way_points,
                    coordinates: coordinates
                };

                instructions.push(instruction);
            });
        });
        instructionsStore.add(instructions);
    }
});
