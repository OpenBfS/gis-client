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
        'GeoExt.component.Popup',
        'BasiGX.util.Layer'
    ],

    /**
     * Reference to openContextMenu function
     * with the controller's "this" in the scope.
     * Necessary for properly removing the listener
     * again.
     */
    boundOpenContextMenu: null,

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
     * Gets the WaypointLayer.
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
     * Handler for visualising the routing results.
     * @param {Object} geojson The routing GeoJSON.
     */
    onRouteLoaded: function(geojson) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var resultPanel = view.down('[name=' + view.routingResultPanelName + ']');
        if (!resultPanel) {
            return;
        }

        resultPanel.fireEvent('resultChanged', geojson);
        vm.set('showRoutingResults', true);
    },

    onWaypointAdded: function(feature) {
        var me = this;
        me.addWayPointToMap(feature);
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
     * @param {ol.MapBrowserEvent} evt The clickevent on the map.
     */
    onWaypointClick: function(evt) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        if (!view.map) {
            return;
        }

        var popup = vm.get('waypointPopup');

        // True, if a feature of the waypointlayer was clicked.
        // If false, we will hide the popup.
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
        var map = view.map;

        me.createRoutingLayers();

        if (vm.get('waypointPopup') === null) {
            vm.set('waypointPopup', me.createWaypointPopup());
        }

        // context menu
        var mapViewport = map.getViewport();
        me.boundOpenContextMenu = me.openContextMenu.bind(me);
        mapViewport.addEventListener('contextmenu', me.boundOpenContextMenu);
    },

    /**
     * Opens a context menu when a right-click on the map
     * is performed.
     *
     * @param {event} evt The event emitted by clicking on the map.
     */
    openContextMenu: function(evt) {

        var me = this;

        var view = me.getView();
        var vm = view.lookupViewModel();
        var map = view.map;

        var evtCoord = map.getEventCoordinate(evt);

        // suppress default browser behaviour
        evt.preventDefault();

        // transform coordiante
        var sourceProjection = map.getView().getProjection().getCode();
        var targetProjection = ol.proj.get('EPSG:4326');
        var transformed = ol.proj.transform(evtCoord, sourceProjection, targetProjection);

        var latitude = transformed[1];
        var longitude = transformed[0];

        var mapContextMenu = Ext.create('Ext.menu.Menu', {
            renderTo: Ext.getBody(),
            items: [
                {
                    text: vm.get('i18n.addStartPoint'),
                    handler: function() {
                        me.storeRoutingPoint('start', latitude, longitude);
                    }
                },
                {
                    text: vm.get('i18n.addViaPoint'),
                    handler: function() {
                        me.storeRoutingPoint('via', latitude, longitude);
                    }
                },
                {
                    text: vm.get('i18n.addEndPoint'),
                    handler: function() {
                        me.storeRoutingPoint('end', latitude, longitude);
                    }
                }
            ]
        });
        mapContextMenu.showAt(evt.x, evt.y);
        vm.set('mapContextMenu', mapContextMenu);
    },

    /**
     * Adds a new waypint to the store.
     *
     * @param {String} wayPointType The type of the waypoint.
     * @param {number} latitude The latitude of the new waypoint.
     * @param {number} longitude The longitude of the new waypoint.
     */
    storeRoutingPoint: function(wayPointType, latitude, longitude) {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var newWayPointJson = {
            address: '',
            latitude: latitude,
            longitude: longitude
        };

        var wayPointStore = vm.get('waypoints');

        // TODO: handle case that store only contains 1 records
        // this should not be allowed, because the role of the
        // waypoint is defined by its position in the store.
        // With only one record the role of the waypoint cannot
        // be identified

        if (wayPointType === 'start') {
            wayPointStore.setStartPoint(newWayPointJson);
        }

        if (wayPointType === 'via') {
            wayPointStore.addViaPoint(newWayPointJson);
        }

        if (wayPointType === 'end') {
            wayPointStore.setEndPoint(newWayPointJson);
        }

        // destroy the menu so it can be re-created
        // on next right click on the map
        var mapContextMenu = vm.get('mapContextMenu');
        mapContextMenu.destroy();
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
        if (!me.getElevationLayer()) {
            me.createLayer('elevationStyle', view.elevationLayerName);
        }
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
     * Updates the values in the user interface.
     */
    setFormEntries: function() {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var wayPointStore = vm.get('waypoints');

        var count = wayPointStore.count();

        var formCmp = view.down('form');

        // maybe set to true
        formCmp.removeAll();

        wayPointStore.each(function(rec, index) {

            var label = vm.get('i18n.viaFieldTitle');

            if (index === 0) {
                label = vm.get('i18n.startFieldTitle');
            }
            if (index === (count - 1)) {
                label = vm.get('i18n.endFieldTitle');
            }
            var coordinate = rec.get('coordinate');
            var fieldValue = [];

            if (rec.get('hasLongitude') && rec.get('hasLatitude')) {
                fieldValue = coordinate;
            }

            var currentChild = formCmp.getComponent(index);
            formCmp.remove(currentChild);
            formCmp.insert(index, {
                xtype: 'textfield',
                fieldLabel: label,
                value: fieldValue,
                allowBlank: false
            });
        });

        me.updateWayPointLayer();
    },

    /**
     * Redraws the waypoint layer.
     */
    updateWayPointLayer: function() {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();
        var map = view.map;
        var wayPointStore = vm.get('waypoints');

        // make waypoint layer empty
        var layer = me.getWaypointLayer();
        if (!layer) {
            return;
        }
        layer.getSource().clear();

        // loop trought waypoints and recreate map icons
        wayPointStore.each(function(rec) {

            // only draw valid coordinates
            if (rec.get('hasLongitude') && rec.get('hasLatitude')) {
                // transform to map projection
                var sourceProjection = ol.proj.get('EPSG:4326');
                var targetProjection = map.getView().getProjection().getCode();
                var coordinate = rec.get('coordinate');
                var transformed = ol.proj.transform(coordinate, sourceProjection, targetProjection);

                var waypoint = new ol.Feature({
                    geometry: new ol.geom.Point(transformed),
                    description: rec.get('address')
                });

                view.fireEvent('onWaypointAdded', waypoint);
            }
        });
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
            var overlay = vm.get('waypointPopup').getOverlay();
            view.map.removeOverlay(overlay);
            vm.set('waypointPopup', null);
        }

        if (vm.get('waypoints') !== null) {
            var wayPointStore = vm.get('waypoints');
            wayPointStore.removeAll();
        }

        // remove context menu listener
        var mapViewport = view.map.getViewport();
        mapViewport.removeEventListener('contextmenu', me.boundOpenContextMenu);

        // destroy context window
        if (vm.get('mapContextMenu') !== null) {
            var mapContextMenu = vm.get('mapContextMenu');
            mapContextMenu.destroy();
            vm.set('mapContextMenu', null);
        }
    },

    /**
     * Fires the http request to the OpenRouteService API.
     *
     * @param {String} service The service to use (e.g. 'directions', 'geocode').
     * @param {Object} params The request params.
     * @param {Function} onSuccess The success handler.
     * @param {Function} onError The error handler.
     */
    requestORS: function(service, params, onSuccess, onError) {
        switch (service.toLowerCase()) {
            case 'directions':
                // TODO: replace with custom instance
                // TODO: add host url
                var Directions = new Openrouteservice.Directions({
                    api_key: '5b3ce3597851110001cf624852581e9bffb2450b8472eccc933bae17'
                });
                Directions.calculate(params)
                    .then(onSuccess)
                    .catch(onError);
                break;
            default:
                break;
        }
    },

    /**
     * Get the OpenRouteService parameters.
     *
     * @param {Object} overwrites Overwrites default params with these values.
     * @returns {Object} The OpenRouteService parameters.
     */
    getORSParams: function(overwrites) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        if (!overwrites) {
            overwrites = {};
        }

        var wayPointStore = vm.get('waypoints');
        var waypoints = wayPointStore.getCoordinatesArray();

        // same properties as on https://maps.openrouteservice.org/
        var params = {
            coordinates: waypoints,
            profile: vm.get('routingProfile'),
            format: 'geojson',
            instructions: true,
            geometry: true,
            elevation: true,
            preference: 'recommended',
            // TODO use application language here
            language: 'en-US',
            units: 'm',
            attributes: [
                'detourfactor',
                'percentage'
            ],
            instructions_format: 'html',
            extra_info: [
                'steepness',
                'waytype',
                'surface'
            ]
        };

        return Ext.Object.merge(params, overwrites);
    },

    /**
     * Requests openrouteservice API.
     */
    makeRoutingRequest: function() {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var wayPointStore = vm.get('waypoints');
        if (!wayPointStore.isValid() || wayPointStore.count() < 2) {
            // TODO: tell user that routing does not work
            return;
        }

        var params = me.getORSParams();

        var onSuccess = function(json) {
            view.fireEvent('onRouteLoaded', json);
        };

        var onError = function(err) {
            vm.set('showDownloadButton', false);
            // TODO: proper error handling
            var str = 'An error occured: ' + err;
            Ext.Logger.log(str);
        };

        me.requestORS('directions', params, onSuccess, onError);
    },

    /**
     * Downloads a route in a given output format.
     *
     * @param {'geojson'|'gpx'} outputFormat The output format
     */
    makeDownloadRequest: function(outputFormat) {
        var me = this;

        var params = me.getORSParams({
            format: outputFormat,
            extra_info: []
        });

        var onSuccess = function(res) {
            var blob;
            if (outputFormat === 'gpx') {
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
            a.download = 'route.' + outputFormat;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        };

        var onError = function(err) {
            // TODO: proper error handling
            var str = 'An error occured: ' + err;
            Ext.Logger.log(str);
        };

        me.requestORS('directions', params, onSuccess, onError);
    }

});
