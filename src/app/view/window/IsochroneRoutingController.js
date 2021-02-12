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
        'Koala.util.OpenRouteService'
    ],

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

    // TODO
    onRouteLoaded: function(geojson) {
        // TODO remove this. just here so the linter does not fail
        return geojson;
    }

});
