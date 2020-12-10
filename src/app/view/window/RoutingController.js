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
        'BasiGX.util.Layer',
        'Koala.util.Geocoding'
    ],

    /**
     * Reference to openContextMenu function
     * with the controller's "this" in the scope.
     * Necessary for properly removing the listener
     * again.
     */
    boundOpenContextMenu: null,

    /**
     * Change the language variable in the ViewModel.
     *
     * @param {string} locale The code for the language used in the application.
     */
    changeLanguage: function(locale) {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        vm.set('language', locale);

        view.fireEvent('makeRoutingRequest', undefined, undefined);
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

    /**
     * Get the ElevationLayer.
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
     * Get the avoid area Layer.
     */
    getAvoidAreaLayer: function() {
        var me = this;
        var view = me.getView();

        if (!view.avoidAreaLayerName) {
            return;
        }

        return BasiGX.util.Layer.getLayerByName(view.avoidAreaLayerName);
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
     * Add a single waypoint to the waypointLayer.
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
     * Get the content for the waypoint popup.
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

        var wayPointStore = vm.get('waypoints');
        wayPointStore.on('datachanged',
            function() {
                view.fireEvent('updateWayPointLayer');
                view.fireEvent('makeRoutingRequest', undefined, undefined);
            }
        );

        // application language
        var languageComboBox = me.getLanguageComboBox();
        if (languageComboBox) {
            languageComboBox.on('applanguagechanged', me.changeLanguage.bind(me));
            vm.set('language', languageComboBox.getValue());
        }
    },

    /**
     * Open a context menu when a right-click on the map
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
                        me.storeMapClick(longitude, latitude, 'start');
                        mapContextMenu.destroy();
                    }
                },
                {
                    text: vm.get('i18n.addViaPoint'),
                    handler: function() {
                        me.storeMapClick(longitude, latitude, 'via');
                        mapContextMenu.destroy();
                    }
                },
                {
                    text: vm.get('i18n.addEndPoint'),
                    handler: function() {
                        me.storeMapClick(longitude, latitude, 'end');
                        mapContextMenu.destroy();
                    }
                }
            ]
        });

        mapContextMenu.showAt(evt.x, evt.y);
        vm.set('mapContextMenu', mapContextMenu);

    },

    /**
     * Store the clicked coordinate as routing waypoint.
     *
     * @param {number} longitude The longitude of the new waypoint.
     * @param {number} latitude The latitude of the new waypoint.
     * @param {string} wayPointType The type of the new waypoint. Allowed values: "start", "via" and "end".
     */
    storeMapClick: function(longitude, latitude, wayPointType) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();
        var language = vm.get('language');
        var wayPointStore = vm.get('waypoints');

        var geocoding = Koala.util.Geocoding;

        geocoding.doReverseGeocoding(longitude, latitude, language)
            .then(function(resultJson) {

                var features = resultJson.features;
                if (features.length === 0) {
                    Ext.toast(vm.get('i18n.error_msg_geocoding'));
                    return;
                }

                var placeName = geocoding.createPlaceString(features[0].properties);

                var newWayPointJson = {
                    address: placeName,
                    latitude: latitude,
                    longitude: longitude
                };

                if (wayPointType === 'start') {
                    wayPointStore.setStartPoint(newWayPointJson);
                } else if (wayPointType === 'via') {
                    wayPointStore.addViaPoint(newWayPointJson);
                } else if (wayPointType === 'end') {
                    wayPointStore.setEndPoint(newWayPointJson);
                }
            })
            .catch(function(err) {
                var str = 'An error occured: ' + err;
                Ext.Logger.log(str);
                Ext.toast(vm.get('i18n.error_msg_geocoding'));
            });
    },

    /**
     * Create all needed layers for the routing.
     */
    createRoutingLayers: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        if (!me.getRouteLayer()) {
            me.createLayer('routeStyle', view.routeLayerName);
        }
        if (!me.getRouteSegmentLayer()) {
            me.createLayer('routeSegmentStyle', view.routeSegmentLayerName);
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

        if (!me.getAvoidAreaLayer()) {
            var avoidAreaLayer = me.createLayer('avoidAreaStyle', view.avoidAreaLayerName);

            avoidAreaLayer.setOpacity(vm.get('avoidAreaOpacity'));

            var source = avoidAreaLayer.getSource();
            source.on('change', function() {

                var deleteAvoidAreaButtonVisible = source.getFeatures().length > 0;
                vm.set('deleteAvoidAreaButtonVisible', deleteAvoidAreaButtonVisible);
                view.fireEvent('makeRoutingRequest', undefined, undefined);
            });

            // create interaction
            if (!me.avoidAreaDrawInteraction) {
                view.avoidAreaDrawInteraction = new ol.interaction.Draw({
                    source: source,
                    type: 'Polygon',
                    stopClick: true
                });
                view.map.addInteraction(view.avoidAreaDrawInteraction);
                view.avoidAreaDrawInteraction.setActive(false);
            }
        }
    },

    /**
     * Create a new layer and overwrites the applied viewLayer.
     *
     * Get the style from the viewModel by name.
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
     * Redraw the waypoint layer.
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
     * Handle data cleanup when the window is being closed.
     */
    onWindowClose: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var routeLayer = me.getRouteLayer();
        if (routeLayer) {
            view.map.removeLayer(routeLayer);
        }
        var routeSegmentLayer = me.getRouteSegmentLayer();
        if (routeSegmentLayer) {
            view.map.removeLayer(routeSegmentLayer);
        }
        var avoidAreaLayer = me.getAvoidAreaLayer();
        if (avoidAreaLayer) {
            if (view.avoidAreaDrawInteraction) {
                view.map.removeInteraction(view.avoidAreaDrawInteraction);
            }
            view.map.removeLayer(avoidAreaLayer);

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

        if (vm.get('routinginstructions') !== null) {
            var instructionsStore = vm.get('routinginstructions');
            instructionsStore.removeAll();
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

        // application language
        var languageComboBox = me.getLanguageComboBox();
        if (languageComboBox) {
            languageComboBox.un('applanguagechanged', me.changeLanguage.bind(me));
        }
    },

    /**
     * Find the application's language combobox.
     *
     * @returns {Ext.form.field.ComboBox} The combobox that contains the language choice.
     */
    getLanguageComboBox: function() {
        var languageSelect = Ext.ComponentQuery.query('k-form-field-languagecombo')[0];
        if (!languageSelect && Ext.isModern) {
            // modern
            languageSelect = Ext.ComponentQuery.query('k-field-languageselect')[0];
        }
        return languageSelect;
    },

    /**
     * Fire the http request to the OpenRouteService API.
     *
     * @param {String} service The service to use (e.g. 'directions', 'geocode').
     * @param {Object} params The request params.
     * @param {Function} onSuccess The success handler.
     * @param {Function} onError The error handler.
     */
    requestORS: function(service, params, onSuccess, onError) {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        switch (service.toLowerCase()) {
            case 'directions':

                var routingOpts = vm.get('routingOpts');

                var Directions = new Openrouteservice.Directions({
                    host: routingOpts.openrouteserviceUrl,
                    api_key: routingOpts.openrouteserviceApiKey
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

        // avoid area
        var additionalOptions = {};
        var avoidArea = me.getAvoidAreaGeometry();
        if (!Ext.Object.isEmpty(avoidArea)) {
            additionalOptions.avoid_polygons = avoidArea;
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
            language: vm.get('language'),
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
            ],
            options: additionalOptions
        };

        return Ext.Object.merge(params, overwrites);
    },

    /**
     * Get the geometry of the avoid area layer.
     *
     * @returns {Object} The geometry of the avoid area if available, an empty object otherwise.
     */
    getAvoidAreaGeometry: function() {
        var me = this;
        var view = me.getView();

        var avoidAreaLayer = me.getAvoidAreaLayer();
        if (!avoidAreaLayer) {
            return {};
        }
        var source = avoidAreaLayer.getSource();
        var features = source.getFeatures();
        if (features.length === 0) {
            return {};
        }

        if (features.length !== 0) {
            var firstFeature = features[0];

            var formatter = new ol.format.GeoJSON();
            var sourceProjection = view.map.getView().getProjection().getCode();
            var targetProjection = ol.proj.get('EPSG:4326');

            var geoJson = formatter.writeFeatureObject(firstFeature, {
                dataProjection: targetProjection,
                featureProjection: sourceProjection
            });
            return geoJson.geometry;
        }
        return {};
    },

    /**
     * Request openrouteservice API.
     */
    makeRoutingRequest: function(onSuccess, onError) {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var wayPointStore = vm.get('waypoints');
        if (!wayPointStore.isValid() || wayPointStore.count() < 2) {
            return;
        }

        var params = me.getORSParams();

        if (!onSuccess) {
            onSuccess = function(json) {
                view.fireEvent('onRouteLoaded', json);
            };
        }

        if (!onError) {
            onError = function(err) {
                vm.set('showDownloadButton', false);
                // TODO: proper error handling
                var str = 'An error occured: ' + err;
                Ext.Logger.log(str);
            };
        }

        me.requestORS('directions', params, onSuccess, onError);
    },

    /**
     * Download a route in a given output format.
     *
     * @param {'geojson'|'gpx'} outputFormat The output format
     */
    makeDownloadRequest: function(outputFormat) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

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
            var str = 'An error occured: ' + err;
            Ext.Logger.log(str);

            Ext.toast(vm.get('i18n.error_msg_geocoding'));

            var resultPanel = view.down('[name=' + view.routingResultPanelName + ']');
            if (!resultPanel) {
                return;
            }
            resultPanel.fireEvent('resultChanged');
        };

        me.requestORS('directions', params, onSuccess, onError);
    }
});
