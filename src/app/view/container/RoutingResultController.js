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
        'BasiGX.util.Layer',
        'Koala.util.Geocoding'
    ],

    modifyInteraction: undefined,
    modifyInteractionStartCoordinate: undefined,
    modifyInteractionFeature: undefined,

    /**
     * Handler for the routingResultChanged event.
     *
     * @param {Object} newResult The new result as GeoJSON.
     */
    onRoutingResultChanged: function(newResult) {
        var me = this;

        if (newResult) {
            me.clearRoutes();
            me.addRouteToMap(newResult);
            me.registerDragHandler();
            me.zoomToRoute();
            me.clearRoutingSummaries();
            me.addRoutingSummary(newResult);
            me.clearRoutingInstructions();
            me.setRoutingInstructionsVisiblity(false);
            me.setElevationPanelVisibility(false);
            me.resetToggleButtons();
        } else {
            me.clearRoutingInstructions();
            me.clearRoutingSummaries();
            me.resetToggleButtons();
            me.setRoutingInstructionsVisiblity(false);
            me.setElevationPanelVisibility(false);
        }
    },

    /**
     * Register the drag handler for route dragging.
     */
    registerDragHandler: function() {
        var me = this;

        var view = me.getView();
        if (!view) {
            return;
        }

        var map = view.map;
        if (!map) {
            return;
        }

        var layer = me.getRouteLayer();
        if (!layer) {
            return;
        }

        me.unregisterDragHandler();

        me.modifyInteraction = new ol.interaction.Modify({
            source: layer.getSource()
        });

        me.modifyInteraction.once('modifyend', me.handleRouteDrag.bind(me));
        me.modifyInteraction.once('modifystart', function(evt) {
            me.modifyInteractionStartCoordinate = evt.mapBrowserEvent.coordinate;
            // all subproperties are defined here,
            // otherwise the event could not have been triggered.
            me.modifyInteractionFeature = evt.features.getArray()[0].clone();
        }.bind(me));

        map.addInteraction(me.modifyInteraction);
    },

    /**
     * Unregister the drag handler.
     */
    unregisterDragHandler: function() {
        var me = this;
        var view = me.getView();

        if (!view) {
            return;
        }

        var map = view.map;
        if (!map) {
            return;
        }

        if (me.modifyInteraction !== undefined) {
            map.removeInteraction(me.modifyInteraction);
            me.modifyInteraction = undefined;
        }
    },

    /**
     * Handle dragging of the route.
     *
     * @param {ol.interaction.Modify.Event} evt The modify event.
     */
    handleRouteDrag: function(evt) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var map = view.map;
        if (!map) {
            return;
        }

        me.unregisterDragHandler();
        me.setWindowLoading(true);

        var language = vm.get('language');
        var wayPointStore = vm.get('waypoints');

        var evtCoord = evt.mapBrowserEvent.coordinate;

        var geocoding = Koala.util.Geocoding;

        // suppress default browser behaviour
        evt.preventDefault();

        // transform coordinate
        var sourceProjection = map.getView().getProjection().getCode();
        var targetProjection = ol.proj.get('EPSG:4326');
        var transformed = ol.proj.transform(evtCoord, sourceProjection, targetProjection);

        var latitude = transformed[1];
        var longitude = transformed[0];

        geocoding.doReverseGeocoding(longitude, latitude, language)
            .then(function(resultJson) {

                var features = resultJson.features;
                if (features.length === 0) {
                    throw new Error();
                }

                var placeName = geocoding.createPlaceString(features[0].properties);

                var newWayPointJson = {
                    address: placeName,
                    latitude: latitude,
                    longitude: longitude
                };

                var wayPointIndex = me.getWaypointIndex();
                wayPointStore.insert(wayPointIndex, newWayPointJson);
            })
            .catch(function(err) {
                var str = 'An error occured: ' + err;
                Ext.Logger.log(str);
                Ext.toast(vm.get('i18n.errorGeoCoding'));
                me.resetDragRouteLayer();
                me.registerDragHandler();
                me.setWindowLoading(false);
            });
    },

    /**
     * Set the loading animation on the parentWindow.
     *
     * @param {Boolean} loading True, if loading animation should be shown. False otherwise.
     */
    setWindowLoading: function(loading) {
        var me = this;

        var view = me.getView();
        if (!view) {
            return;
        }

        var parentWindow = view.up('k-window-classic-routing');
        if (!parentWindow) {
            return;
        }

        parentWindow.setLoading(loading);
    },

    /**
     * Reset the route layer to the unmodified route.
     */
    resetDragRouteLayer: function() {
        var me = this;

        var layer = me.getRouteLayer();
        if (!layer) {
            return;
        }

        var source = layer.getSource();
        if (!source) {
            return;
        }

        source.clear();
        source.addFeature(me.modifyInteractionFeature);
    },

    /**
     * Get the index of the waypoint that comes after the dragged location.
     *
     * We snap all waypoints to the route, to make sure, the points are all located
     * on the route using turf.js nearestPointOnLine().
     * Then, we snap the dragStart point to the route as well.
     *
     * Besides snapping, nearestPointOnLine() also gives us the distance of the starting point of
     * a route to the snapped point. So we can compare the distances and select
     * the first waypoint that comes after the dragStart point.
     *
     * @returns The index of the first waypoint that comes after the dragged location.
     */
    getWaypointIndex: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var map = view.map;
        if (!map) {
            return;
        }

        var format = new ol.format.GeoJSON({
            featureProjection: map.getView().getProjection().getCode()
        });
        var route = format.writeGeometryObject(me.modifyInteractionFeature.getGeometry());

        var sourceProjection = map.getView().getProjection().getCode();
        var targetProjection = ol.proj.get('EPSG:4326');
        var dragStartTransformed = ol.proj.transform(me.modifyInteractionStartCoordinate, sourceProjection, targetProjection);

        var dragStartPoint = turf.nearestPointOnLine(route, turf.point(dragStartTransformed));

        var waypointsStore = vm.get('waypoints');
        var snappedPoints = [];
        waypointsStore.each(function(wp) {
            var snappedPoint = turf.nearestPointOnLine(route, turf.point([wp.get('longitude'), wp.get('latitude')]));
            snappedPoint.properties.recId = wp.getId();
            snappedPoints.push(snappedPoint);
        });

        var nextWayPointId;
        for (var i = 0; i < snappedPoints.length; i++) {
            var point = snappedPoints[i];
            if (dragStartPoint.properties.location < point.properties.location) {
                nextWayPointId = point.properties.recId;
                break;
            }
        }

        return waypointsStore.indexOfId(nextWayPointId);
    },

    /**
     * Cleanup method when container will be destroyed.
     */
    onDestroy: function() {
        var me = this;
        me.destroyElevationPanel();
        me.unregisterDragHandler();
    },

    /**
     * Clear the RouteLayer.
     */
    clearRoutes: function() {
        var me = this;
        var routeLayer = me.getRouteLayer();
        routeLayer.getSource().clear();
    },

    /**
     * Reset the push state of toggle buttons in the routing summary grid.
     */
    resetToggleButtons: function() {
        var query = '[name=routing-summary-grid] button[pressed]';
        var enabledButtons = Ext.ComponentQuery.query(query);
        Ext.Array.each(enabledButtons, function(btn) {
            btn.setPressed(false);
        });
    },

    /**
     * Handler for the mouseenter event on the instruction grid.
     *
     * @param {Ext.grid.Panel} grid The Ext Grid.
     * @param {Ext.data.Model} rec A single RoutingInstruction.
     */
    onInstructionMouseEnter: function(grid, rec) {
        var me = this;

        var routeSegmentLayer = me.getRouteSegmentLayer();
        if (!routeSegmentLayer) {
            return;
        }
        var source = routeSegmentLayer.getSource();
        if (!source) {
            return;
        }
        source.clear();
        var feature = me.createLineFeature(rec.get('coordinates'));
        source.addFeature(feature);
    },

    /**
     * Handler for the mouseleave event on the instruction grid.
     */
    onInstructionMouseLeave: function() {
        var me = this;

        var routeSegmentLayer = me.getRouteSegmentLayer();
        if (!routeSegmentLayer) {
            return;
        }
        var source = routeSegmentLayer.getSource();
        if (!source) {
            return;
        }
        source.clear();
    },

    /**
     * Handler for the select event on the instruction grid.
     *
     * @param {Ext.grid.Panel} grid The Ext Grid.
     * @param {Ext.data.Model} rec A single RoutingInstruction.
     */
    onInstructionSelect: function(grid, rec) {
        var me = this;
        var view = me.getView();

        var routeSegmentLayer = me.getRouteSegmentLayer();
        if (!routeSegmentLayer) {
            return;
        }
        var source = routeSegmentLayer.getSource();
        if (!source) {
            return;
        }
        source.clear();

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
     * Get the RouteLayer.
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
     * Get the ElevationLayer.
     * @returns {ol.layer.Vector} The ElevationLayer.
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
     * Add the Routing feature to the map.
     *
     * @param {Object} geojson The GeoJSON to be added.
     * @param {Object} featureProperties Additional properties for feature.
     */
    addRouteToMap: function(geojson, featureProperties) {
        var me = this;
        var view = me.getView();

        var layer = me.getRouteLayer();
        if (!layer) {
            return;
        }

        // the GeoJSON contains a FeatureCollection
        // that's why need the "readFeatures" function
        // which returns an array
        // the "readFeature" function does does not work here
        var newRouteFeatures = (new ol.format.GeoJSON({
            featureProjection: view.map.getView().getProjection()
        })).readFeatures(geojson);

        // the GeoJSON could contain more routes
        // however we only want the the first one
        var newRoute = newRouteFeatures[0];

        // add additional properties to the feature
        if (featureProperties && Ext.isObject(featureProperties)) {
            // all routes are highlighted by default
            featureProperties['highlighted'] = true;
            newRoute.setProperties(featureProperties);
        }

        var source = layer.getSource();
        source.addFeature(newRoute);
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
     * Destroy the elevation graph
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
        var vm = btn.lookupViewModel();
        if (!vm) {
            return;
        }
        // Ext injects the store record as 'record'.
        var routingSummary = vm.get('record');
        me.setElevationPanelVisibility(btn.pressed);
        if (btn.pressed) {
            me.updateElevationPanel(routingSummary);
        }
    },

    /**
     * Update the elevation panel.
     */
    updateElevationPanel: function(summary) {
        var me = this;
        var view = me.getView();

        var elevationPanelName = view.elevationProfilePanelName;

        var routeLayer = BasiGX.util.Layer.getLayerByName(view.routeLayerName);
        if (!routeLayer) {
            return;
        }

        var elevationPanel = Ext.ComponentQuery.query('[name=' + elevationPanelName + ']')[0];
        if (summary) {
            elevationPanel.fireEvent('dataChanged', summary.getData());
        } else {
            var southContainer = Ext.ComponentQuery.query('[name=south-container]')[0];
            if (southContainer && southContainer.isVisible() && elevationPanel.isVisible()) {
                elevationPanel.fireEvent('rerender');
            }
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
        var vm = view.lookupViewModel();

        // get original query for this route
        var query = Ext.clone(item.lookupViewModel().get('record').get('query'));

        // modifiy original query
        query['format'] = item.downloadType;

        var onSuccess = function(res) {
            var blob;
            if (item.downloadType === 'gpx') {
                blob = new Blob([res], {
                    type: 'application/xml;charset=utf-8'
                });
            } else {
                blob = new Blob([JSON.stringify(res)]);
            }
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'route.' + item.downloadType;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        };

        var onError = function(err) {
            var str = 'An error occured: ' + err;
            Ext.Logger.log(str);

            Ext.toast(vm.get('i18n.errorDownloadRoute'));

            var resultPanel = me.getResultPanel();

            if (!resultPanel) {
                return;
            }
            resultPanel.fireEvent('resultChanged');
        };

        var orsUtil = Koala.util.OpenRouteService;
        orsUtil.requestDirectionsApi(query)
            .then(onSuccess)
            .catch(onError);
    },

    /**
     * Handle the click event for the routing instructions button.
     *
     * @param {Ext.button.Button} btn The clicked button.
     */
    onDetailsButtonClicked: function(btn) {
        var me = this;

        var btnVm = btn.lookupViewModel();
        if (!btnVm) {
            return;
        }

        if (btn.pressed) {
            var routingSummary = btnVm.get('record');
            me.updateRoutingInstructions(routingSummary);
        } else {
            me.clearRoutingInstructions();
        }

        me.setRoutingInstructionsVisiblity(btn.pressed);
    },

    /**
     * Set the visibility of the routing instructions.
     *
     * @param {Boolean} visible Visibility of routing instructions.
     */
    setRoutingInstructionsVisiblity: function(visible) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        vm.set('showRoutingInstructions', visible);
    },

    /**
     * Update the routing instructions.
     *
     * @param {Ext.data.Model} rec The routing summary record.
     */
    updateRoutingInstructions: function(rec) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();
        var instructionsStore = vm.get('routinginstructions');

        if (!instructionsStore) {
            return;
        }

        instructionsStore.removeAll();

        var props = rec.get('properties');
        var geometry = rec.get('geometry');

        if (!props) {
            return;
        }

        var segments = props.segments;
        if (!segments) {
            return;
        }

        var instructions = [];
        Ext.Array.forEach(segments, function(segment) {
            var steps = segment.steps || [];
            Ext.Array.forEach(steps, function(step) {
                var coordinates = [];
                for (var i=step.way_points[0]; i<=step.way_points[1]; i++) {
                    var coord = Ext.clone(geometry.coordinates[i]);
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
    },

    /**
     * Clear the routing instructions store.
     */
    clearRoutingInstructions: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var instructionsStore = vm.get('routinginstructions');
        instructionsStore.removeAll();
    },

    /**
     * Clear the routing summaries store.
     */
    clearRoutingSummaries: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var summaryStore = vm.get('routingsummaries');
        if (summaryStore) {
            summaryStore.removeAll();
        }
    },

    /**
     * Add the routing summary to its store.
     *
     * If a VROOM route is available, its properties will be merged
     * with the ORS route.
     *
     * @param {GeoJson} orsRoute The ORS route.
     * @returns {Ext.data.Model} The added summary model instance.
     */
    addRoutingSummary: function(orsRoute) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        // check if the result contains at least
        // one feature
        if (!orsRoute.features ||
            !Ext.isArray(orsRoute.features) ||
            orsRoute.features.length === 0) {
            return;
        }

        // the GeoJSON could contain many features
        // we are only interested in the first one
        var feat = orsRoute.features[0];

        var props = {};
        if (feat.properties) {
            props = Ext.clone(feat.properties);
        }

        var query = orsRoute.metadata.query;
        var profile = query.profile;

        var distance = props.summary ? props.summary.distance : undefined;
        var duration = props.summary ? props.summary.duration : undefined;

        var summary = {
            profile: profile,
            properties: props,
            geometry: Ext.clone(feat.geometry),
            ascent: props.ascent,
            descent: props.descent,
            distance: distance,
            duration: duration,
            query: query
        };

        var summaryStore = vm.get('routingsummaries');
        return summaryStore.add(summary)[0];
    },

    /**
     * Get the WaypointLayer.
     * @returns {ol.layer.Vector} The WaypointLayer.
     */
    getWaypointLayer: function() {
        var me = this;
        var view = me.getView();

        if (!view.waypointLayerName) {
            return;
        }

        return BasiGX.util.Layer.getLayerByName(view.waypointLayerName);
    },

    zoomToWayPointLayer: function() {
        var me = this;
        var view = me.getView().up('window');
        if (!view) {
            return;
        }

        var map = view.map;
        if (!map) {
            return;
        }

        var layer = me.getWaypointLayer();
        if (!layer) {
            return;
        }

        var source = layer.getSource();
        if (!source) {
            return;
        }

        var extent = source.getExtent();
        if (!extent) {
            return;
        }

        // zoom to extent
        map.getView().fit(extent, {
            duration: 1000,
            padding: '30 30 30 30'
        });
    }
});
