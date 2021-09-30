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
 * @class Koala.view.window.ClassicRoutingController
 */
Ext.define('Koala.view.window.ClassicRoutingController', {
    extend: 'Koala.view.window.RoutingController',
    alias: 'controller.k-window-classic-routing',

    /**
     * Reference to openContextMenu function
     * with the controller's "this" in the scope.
     * Necessary for properly removing the listener
     * again.
     */
    boundOpenContextMenu: null,

    changeLanguage: function() {
        var me = this;
        var view = me.getView();

        me.callParent(arguments);

        view.fireEvent('makeRoutingRequest', undefined, undefined);
    },

    onBoxReady: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        me.callParent(arguments);
        var map = view.map;

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
    },

    onWindowClose: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        me.callParent(arguments);

        // destroy context window
        if (vm.get('mapContextMenu') !== null) {
            var mapContextMenu = vm.get('mapContextMenu');
            mapContextMenu.destroy();
            vm.set('mapContextMenu', null);
        }

        // remove context menu listener
        var mapViewport = view.map.getViewport();
        mapViewport.removeEventListener('contextmenu', me.boundOpenContextMenu);
    },

    /**
     * Extend the original 'createRoutingLayers' method by
     * adding the wayPointLayer for classic routing.
     */
    createRoutingLayers: function() {
        var me = this;
        var view = me.getView();

        me.callParent(arguments);

        if (!me.getWaypointLayer()) {
            me.createLayer('waypointStyle', view.waypointLayerName);

            if (view.map !== null) {
                view.map.on('singleclick', me.onWaypointClick);
            }
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
                    text: vm.get('i18n.addStartPoint'),
                    handler: function() {
                        me.storeMapClick(longitude, latitude, 'start');
                    }
                },
                {
                    text: vm.get('i18n.addViaPoint'),
                    handler: function() {
                        me.storeMapClick(longitude, latitude, 'via');
                    }
                },
                {
                    text: vm.get('i18n.addEndPoint'),
                    handler: function() {
                        me.storeMapClick(longitude, latitude, 'end');
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
                    throw new Error();
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
                var newWayPointJson = {
                    address: latitude + ', ' + longitude,
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
                var str = err.message;
                Ext.Logger.log(str);
                var info = vm.get('i18n.errorGeoCoding');
                if (!Ext.isEmpty(str)) {
                    info += ' ' + str;
                }
                Ext.toast(info);
            });
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
                if (!Ext.isModern) {
                    view.setLoading(false);
                }
            };
        }

        if (!onError) {
            onError = function(err) {
                vm.set('showDownloadButton', false);
                if (!Ext.isModern) {
                    view.setLoading(false);
                }

                var str;

                try {
                    str = err.response.body.error.message;
                } catch (e) {
                    str = '';
                }

                Ext.Logger.log(str);

                var info = vm.get('i18n.errorRoutingRequest');
                if (!Ext.isEmpty(str)) {
                    info += '<br/><i>(' + str + ')</i>';
                }

                Ext.toast(info);
            };
        }

        if (!Ext.isModern) {
            view.setLoading(true);
        }

        var orsUtil = Koala.util.OpenRouteService;
        orsUtil.requestDirectionsApi(params)
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
    }
});
