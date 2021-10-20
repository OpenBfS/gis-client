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
        'BasiGX.view.component.Map',
        'Koala.util.Geocoding',
        'Koala.util.OpenRouteService',
        'Koala.util.AppContext'
    ],

    constructor: function() {
        // store bound version of method
        // see https://github.com/terrestris/BasiGX/wiki/Update-application-to-ol-6.5.0,-geoext-4.0.0,-BasiGX-3.0.0#removal-of-opt_this-parameters
        this.onWaypointClick = this.onWaypointClick.bind(this);

        this.callParent(arguments);
    },


    /**
     * Change the language variable in the ViewModel.
     *
     * @param {string} locale The code for the language used in the application.
     */
    changeLanguage: function(locale) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        // TODO: does not work if the window gets open the second time

        vm.set('language', locale);
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
            var content = me.getWaypointPopupContent(feature);
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
     * @param {ol.Feature} feature The feature to get content from.
     * @returns {String} The HTML String for the popup.
     */
    getWaypointPopupContent: function(feature) {
        var popupTooltip = '<div class="popup-tip-container">' +
            '<div class="popup-tip"></div></div>';
        var popupContent = '<p><strong>' + feature.get('description') + '</strong></p>';
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
        // TODO: adapt for other Marker types
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
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var mapContainer = BasiGX.view.component.Map.guess();
        if (mapContainer) {
            view.setX(mapContainer.getX());
            view.setY(mapContainer.getY());
        }

        me.fillViewModel();
        me.createRoutingLayers();

        if (vm.get('waypointPopup') === null) {
            vm.set('waypointPopup', me.createWaypointPopup());
        }

        // application language
        var languageComboBox = me.getLanguageComboBox();
        if (languageComboBox) {
            languageComboBox.on('applanguagechanged', me.changeLanguage.bind(me));
            vm.set('language', languageComboBox.getValue());
        }
    },

    /**
     * Read routing configuration from AppContext
     * and store it in ViewModel.
     */
    fillViewModel: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var contextUtil = Koala.util.AppContext;
        var ctx = contextUtil.getAppContext();
        var routingOpts = contextUtil.getMergedDataByKey('routing', ctx);
        vm.set('routingOpts', routingOpts);



        if (routingOpts.routeStyle) {
            var routeStyle = function(feature) {
                // primary color
                var color = routingOpts.routeStyle.colorPrimary;

                // secondary color
                if (feature.get('highlighted') === false) {
                    color = routingOpts.routeStyle.colorSecondary;
                }

                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: color,
                        width: routingOpts.routeStyle.width
                    })
                });
            };
            vm.set('routeStyle', routeStyle);
        }

        if (routingOpts.routeSegmentStyle) {
            var routeSegmentStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: routingOpts.routeSegmentStyle.color,
                    width: routingOpts.routeSegmentStyle.width
                })
            });
            vm.set('routeSegmentStyle', routeSegmentStyle);
        }

        if (routingOpts.waypointStyle) {
            var waypointStyle = new ol.style.Style({
                text: new ol.style.Text({
                    // unicode for fontawesome map-marker
                    text: '\uf041',
                    font: 'normal ' + routingOpts.waypointStyle.markerSize + 'px FontAwesome',
                    fill: new ol.style.Fill({
                        color: routingOpts.waypointStyle.color
                    }),
                    textBaseline: 'bottom'
                })
            });
            vm.set('waypointStyle', waypointStyle);
            vm.set('waypointFontSize', routingOpts.waypointStyle.markerSize);
        }

        if (routingOpts.elevationStyle) {
            var elevationStyle = [new ol.style.Style({
                text: new ol.style.Text({
                    // unicode for fontawesome map-marker
                    text: '\uf041',
                    font: 'normal 38px FontAwesome',
                    fill: new ol.style.Fill({
                        color: routingOpts.elevationStyle.color
                    }),
                    textBaseline: 'bottom'
                }),
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color: routingOpts.elevationStyle.fill
                    }),
                    radius: routingOpts.elevationStyle.radius,
                    stroke: new ol.style.Stroke({
                        color: routingOpts.elevationStyle.stroke
                    })
                })
            }), new ol.style.Style({
                text: new ol.style.Text({
                    // unicode for fontawesome circle
                    text: '\uf111',
                    font: 'normal 20px FontAwesome',
                    fill: new ol.style.Fill({
                        color: routingOpts.elevationStyle.color
                    }),
                    textBaseline: 'bottom',
                    offsetY: -17

                })
            }), new ol.style.Style({
                text: new ol.style.Text({
                    font: 'normal 14px FontAwesome',
                    fill: new ol.style.Fill({
                        color: routingOpts.elevationStyle.fill
                    }),
                    textBaseline: 'bottom',
                    offsetY: -20
                })
            })];
            vm.set('elevationStyle', elevationStyle);
        }

        if (routingOpts.avoidAreaStyle) {
            var avoidAreaStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: routingOpts.avoidAreaStyle.strokeColor,
                    width: routingOpts.avoidAreaStyle.width
                }),
                fill: new ol.style.Fill({
                    color: routingOpts.avoidAreaStyle.fillColor
                })
            });
            vm.set('avoidAreaStyle', avoidAreaStyle);

            if (routingOpts.avoidAreaStyle.opacity !== undefined && routingOpts.avoidAreaStyle.opacity !== null) {
                vm.set('avoidAreaOpacity', routingOpts.avoidAreaStyle.opacity);
            }
        }
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
        if (!me.getElevationLayer()) {
            var elevationLayer = me.createLayer('elevationStyle', view.elevationLayerName);
            elevationLayer.setZIndex(9999);
        }

        if (!me.getAvoidAreaLayer()) {
            var avoidAreaLayer = me.createLayer('avoidAreaStyle', view.avoidAreaLayerName);
            avoidAreaLayer.setOpacity(vm.get('avoidAreaOpacity'));
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
        var wayPointStore = vm.get('waypoints');

        // make waypoint layer empty
        var layer = me.getWaypointLayer();
        if (!layer) {
            return;
        }
        var layerSource = layer.getSource();
        layerSource.clear();

        // loop trought waypoints and recreate map icons
        wayPointStore.each(function(rec) {

            // only draw valid coordinates
            if (rec.get('hasLongitude') && rec.get('hasLatitude')) {
                var coordinate = rec.get('coordinate');
                var transformed = me.latLonToMapProjection(coordinate);

                var waypoint = new ol.Feature({
                    geometry: new ol.geom.Point(transformed),
                    description: rec.get('address')
                });

                layerSource.addFeature(waypoint);
            }
        });
    },

    /**
     * Convert a lat/lon coordinate to the current map projection.
     *
     * @param {ol.Coordinate} coordinate The coordinate in 'EPSG:4326' coordinate reference system.
     * @returns {ol.Coordinate} The coordinate in the current map projection.
     */
    latLonToMapProjection: function(coordinate) {
        var me = this;
        var view = me.getView();
        var map = view.map;
        if (!map) {
            return;
        }

        var sourceProjection = ol.proj.get('EPSG:4326');
        var targetProjection = map.getView().getProjection().getCode();

        return ol.proj.transform(
            coordinate,
            sourceProjection,
            targetProjection
        );
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
            view.map.un('singleclick', me.onWaypointClick);
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

        var params = {
            coordinates: waypoints,
            profile: vm.get('routingProfile'),
            preference: vm.get('routingPreference'),
            format: 'geojson',
            instructions: true,
            geometry: true,
            elevation: true,
            language: vm.get('language'),
            units: 'm',
            instructions_format: 'html',
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

    getResultPanel: function() {
        var me = this;
        var view = me.getView();
        return view.down('[name=' + view.routingResultPanelName + ']');
    }
});
