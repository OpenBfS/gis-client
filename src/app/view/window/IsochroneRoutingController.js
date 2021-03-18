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
 * @class Koala.view.window.IsochroneRoutingController
 */
Ext.define('Koala.view.window.IsochroneRoutingController', {
    extend: 'Koala.view.window.RoutingController',
    alias: 'controller.k-window-isochrone-routing',

    requires: [
        'Ext.Object',
        'Koala.util.OpenRouteService',
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
     * Get the IsochroneLayer.
     * @returns {ol.layer.Vector} The IsochroneLayer.
     */
    getIsochroneLayer: function() {
        var me = this;
        var view = me.getView();

        if (!view.isochroneLayerName) {
            return;
        }

        return BasiGX.util.Layer.getLayerByName(view.isochroneLayerName);
    },

    /**
     * @override
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
        me.callParent(arguments);

        var wayPointStore = vm.get('waypoints');
        wayPointStore.on('datachanged',
            function() {
                view.fireEvent('updateWayPointLayer');
            }
        );

        // context menu
        var map = view.map;
        var mapViewport = map.getViewport();
        me.boundOpenContextMenu = me.openContextMenu.bind(me);
        mapViewport.addEventListener('contextmenu', me.boundOpenContextMenu);
    },

    /**
     * @override
     */
    fillViewModel: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var contextUtil = Koala.util.AppContext;
        var ctx = contextUtil.getAppContext();
        var routingOpts = contextUtil.getMergedDataByKey('routing', ctx);
        vm.set('routingOpts', routingOpts);
        if (!routingOpts) {
            return;
        }

        // waypoints
        var wayPointMarkerSize = 38;
        var wayPointMarkerColor = 'black';

        if (routingOpts.waypointStyle) {
            if (routingOpts.waypointStyle.markerSize) {
                wayPointMarkerSize = routingOpts.waypointStyle.markerSize;
            }
            if (routingOpts.waypointStyle.color) {
                wayPointMarkerColor = routingOpts.waypointStyle.color;
            }
        }

        var waypointStyle = new ol.style.Style({
            text: new ol.style.Text({
                // unicode for fontawesome map-marker
                text: '\uf041',
                font: 'normal ' + wayPointMarkerSize + 'px FontAwesome',
                fill: new ol.style.Fill({
                    color: wayPointMarkerColor
                }),
                textBaseline: 'bottom'
            })
        });
        vm.set('waypointStyle', waypointStyle);

        // avoid area
        var avoidAreaStrokeColor = '#000000';
        var avoidAreaWidth = 4;
        var avoidAreaFillColor = '#ff0000';
        var avoidAreaOpacity = 0.2;

        if (routingOpts.avoidAreaStyle) {
            if (routingOpts.avoidAreaStyle.strokeColor) {
                avoidAreaStrokeColor = routingOpts.avoidAreaStyle.strokeColor;
            }
            if (routingOpts.avoidAreaStyle.width !== undefined && routingOpts.avoidAreaStyle.width !== null) {
                avoidAreaWidth = routingOpts.avoidAreaStyle.width;
            }
            if (routingOpts.avoidAreaStyle.fillColor) {
                avoidAreaFillColor = routingOpts.avoidAreaStyle.fillColor;
            }
        }

        var avoidAreaStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: avoidAreaStrokeColor,
                width: avoidAreaWidth
            }),
            fill: new ol.style.Fill({
                color: avoidAreaFillColor
            })
        });
        vm.set('avoidAreaStyle', avoidAreaStyle);

        if (routingOpts.avoidAreaStyle.opacity !== undefined && routingOpts.avoidAreaStyle.opacity !== null) {
            avoidAreaOpacity = routingOpts.avoidAreaStyle.opacity;
        }
        vm.set('avoidAreaOpacity', avoidAreaOpacity);
    },

    /**
     * @override
     */
    createRoutingLayers: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        if (!me.getIsochroneLayer()) {
            me.createLayer('isochroneStyle', view.isochroneLayerName);
        }
        if (!me.getWaypointLayer()) {
            me.createLayer('waypointStyle', view.waypointLayerName);
            if (view.map !== null) {
                view.map.on('singleclick', me.onWaypointClick, me);
            }
        }

        if (!me.getAvoidAreaLayer()) {
            var avoidAreaLayer = me.createLayer('avoidAreaStyle', view.avoidAreaLayerName);

            avoidAreaLayer.setOpacity(vm.get('avoidAreaOpacity'));

            var source = avoidAreaLayer.getSource();
            source.on('change', function() {

                var deleteAvoidAreaButtonVisible = source.getFeatures().length > 0;
                vm.set('deleteAvoidAreaButtonVisible', deleteAvoidAreaButtonVisible);
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
     * @override
     */
    openContextMenu: function(evt) {
        var me = this;

        var view = me.getView();
        var vm = view.lookupViewModel();
        var map = view.map;

        var evtCoord = map.getEventCoordinate(evt);

        // suppress default browser behaviour
        evt.preventDefault();

        // transform coordinate
        var sourceProjection = map.getView().getProjection().getCode();
        var targetProjection = ol.proj.get('EPSG:4326');
        var transformed = ol.proj.transform(evtCoord, sourceProjection, targetProjection);

        var latitude = transformed[1];
        var longitude = transformed[0];

        var mapContextMenu = Ext.create('Ext.menu.Menu', {
            renderTo: Ext.getBody(),
            items: [
                {
                    bind: {
                        text: vm.get('i18n.addCenterContextText')
                    },
                    handler: function() {
                        me.storeMapClick(longitude, latitude);
                        mapContextMenu.destroy();
                    }
                }
            ]
        });

        mapContextMenu.showAt(evt.x, evt.y);
        vm.set('mapContextMenu', mapContextMenu);
    },


    /**
     * Get the OpenRouteService Isochrones API parameters.
     *
     * @param {Object} overwrites Overwrites default params with these values.
     * @returns {Object} The OpenRouteService Isochrones parameters.
     */
    getIsochronesParams: function(overwrites) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        if (!overwrites) {
            overwrites = {};
        }

        var wayPointStore = vm.get('waypoints');
        var waypoints = wayPointStore.getCoordinatesArray();

        var options = {};
        var avoidArea = me.getAvoidAreaGeometry();
        if (!Ext.Object.isEmpty(avoidArea)) {
            options.avoid_polygons = avoidArea;
        }
        /**
         * locations* [[8.681495,49.41461],[8.686507,49.41943]] [[lon, lat], [lon, lat]]
         * range* [300,200] [seconds, seconds] or [meters, meters] // TODO check what is acutally expected
         * attributes String[] ("area", "reachfactor", "total_pop")
         * id String
         * intersections Boolean default: false
         * interval Number seconds for time, meters for distance
         * location_type String ("start" | "destination"), default "start" (is waypoint treated as start or as destination)
         * options Object
         * range_type String ("time", "distance"), default "time"
         * smoothing Number between 0 and 100
         * area_units String ("m", "km", "mi") default "m"
         * units String ("m", "km", "mi") used when range_type = "distance", default "m"
         */
        var params = {
            locations: waypoints,
            range: vm.get('range'),
            attributes: ['area', 'reachfactor', 'total_pop'],
            interval: vm.get('interval'),
            location_type: vm.get('locationType'),
            range_type: vm.get('rangeType'),
            smoothing: vm.get('smoothing'),
            area_units: vm.get('areaUnits'),
            units: vm.get('units'),
            profile: vm.get('routingProfile'),
            options: options,
            // NOTE: isochrones API (currently) only supports GeoJSON
            format: 'geojson'
        };

        return Ext.Object.merge(params, overwrites);
    },

    /**
     * Request openrouteservice Isochrones API.
     */
    makeRoutingRequest: function(onSuccess, onError) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var wayPointStore = vm.get('waypoints');
        if (!wayPointStore.isValid()) {
            return;
        }

        var params = me.getIsochronesParams();

        if (!onSuccess) {
            onSuccess = function(json) {
                view.fireEvent('onRouteLoaded', json);
            };
        }

        if (!onError) {
            onError = function(err) {
                var str = 'An error occured: ' + err;
                Ext.Logger.log(str);
            };
        }

        var orsUtil = Koala.util.OpenRouteService;
        orsUtil.requestIsochronesApi(params)
            .then(onSuccess)
            .catch(onError);
    },

    /**
     * Handler for visualising the routing results.
     * @param {Object} geojson The routing GeoJSON.
     */
    onRouteLoaded: function(geojson) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var resultPanel = me.getResultPanel();

        if (!resultPanel) {
            return;
        }

        resultPanel.fireEvent('resultChanged', geojson);
        vm.set('showRoutingResults', true);
    },

    /**
     * Get the Isochrone Routing Result Panel.
     * @returns {Ext.Component} The result panel.
     */
    getResultPanel: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        return view.down('[name=isochronerouting-result-panel]');
    },

    /**
     * @override
     * Store the clicked coordinate as isochrone center.
     * Update the value in the geocoding combobox.
     *
     * @param {number} longitude The longitude of the new center.
     * @param {number} latitude The latitude of the new center.
     */
    storeMapClick: function(longitude, latitude) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();
        var language = vm.get('language');

        var geocoding = Koala.util.Geocoding;

        geocoding.doReverseGeocoding(longitude, latitude, language)
            .then(function(resultJson) {
                var features = resultJson.features;
                if (features.length === 0) {
                    Ext.toast(vm.get('i18n.errorGeoCoding'));
                    return;
                }
                var address = geocoding.createPlaceString(features[0].properties);

                // add place to store
                var wayPointStore = vm.get('waypoints');
                var waypoint = {
                    address: language,
                    latitude: latitude,
                    longitude: longitude
                };
                wayPointStore.loadRawData([waypoint]);

                // Update combobox with new address
                var isochroneForm = Ext.ComponentQuery.query('k-form-isochrone-routing-settings')[0];
                if (!isochroneForm) {
                    return;
                }
                var field = isochroneForm.down('[name=center]');
                if (!field) {
                    return;
                }
                var store = field.getStore();
                if (store) {
                    field.suspendEvents();
                    store.loadRawData([address]);
                    field.setSelection(store.first());
                    field.resumeEvents();
                }
            })
            .catch(function(err) {
                var str = 'An error occured: ' + err;
                Ext.Logger.log(str);
                Ext.toast(vm.get('i18n.errorGeoCoding'));
            });
    },

    /**
     * @override
     */
    onWindowClose: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        me.callParent(arguments);

        var isochroneLayer = me.getIsochroneLayer();
        if (isochroneLayer) {
            view.map.removeLayer(isochroneLayer);
        }

        // destroy context window
        if (vm.get('mapContextMenu') !== null) {
            var mapContextMenu = vm.get('mapContextMenu');
            mapContextMenu.destroy();
            vm.set('mapContextMenu', null);
        }

        // remove context menu listener
        var mapViewport = view.map.getViewport();
        mapViewport.removeEventListener('contextmenu', me.boundOpenContextMenu);
    }
});
