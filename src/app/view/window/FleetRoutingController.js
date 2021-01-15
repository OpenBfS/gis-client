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
 * @class Koala.view.window.FleetRoutingController
 */
Ext.define('Koala.view.window.FleetRoutingController', {
    extend: 'Koala.view.window.RoutingController',
    alias: 'controller.k-window-fleet-routing',
    requires: [
        'Koala.util.VroomFleetRouting',
        'Koala.util.OpenRouteService'
    ],

    /**
     * Perform a route optimization request.
     */
    optimizeRoute: function() {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var vehicleStore = view.down('k-grid-routing-vehicles').getStore();
        var vehicles = vehicleStore.getVroomArray();
        if (!vehicles) {
            // TODO: deactivate "optimize" button when the
            // minimal requirements are not fulfilled
            // so this check becomes obsolete
            return;
        }

        var jobsStore = view.down('k-grid-routing-jobs').getStore();
        var jobs = jobsStore.getVroomArray();
        if (!jobs) {
            // TODO: deactivate "optimize" button when the
            // minimal requirements are not fulfilled
            // so this check becomes obsolete
            return;
        }

        var avoidArea = me.getAvoidAreaGeometry();

        Koala.util.VroomFleetRouting.performOptimization(vehicles, jobs, avoidArea)
            .then(me.handleVroomResponse.bind(me))
            .catch(function(error) {
                Ext.toast(vm.get('i18n.errorFleetRouting'));
                Ext.log.error(error);
            });
    },

    /**
     * Handle the VROOM response.
     *
     * Forward the retrieved routes to the OpenRouteservice API.
     * This is necessary for obtaining detailed information
     * like directions or elevation.
     *
     * @param {Object} vroomResponse The response from the VROOM API.
     */
    handleVroomResponse: function(vroomResponse) {

        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        // loop through the computed routes
        // we collect the promises of the routing requests in an array
        var promises = [];
        Ext.each(vroomResponse.routes, function(vroomRoute) {

            // convert coordinates in ORS format
            var orsCoords = [];
            Ext.each(vroomRoute.steps, function(step) {
                orsCoords.push(step.location);
                // TODO: maybe add step information to job store
                //      e.g. duration, type of step, arrival time
            });

            // create input parameter for routing request
            var orsParams = me.getORSParams({
                coordinates: orsCoords
                // TODO: take profile from vehicle input of the UI
                // profile: ...,
            });

            var orsUtil = Koala.util.OpenRouteService;
            var routingPromise = orsUtil.requestDirectionsApi(orsParams);
            promises.push(routingPromise);
        });

        // we handle the response once all routing requests have succeeded
        Ext.Promise.all(promises)
            .then(function(orsResponses) {
                var resultPanel = me.getResultPanel();
                resultPanel.fireEvent('optimizationResultAvailable', vroomResponse, orsResponses);

                vm.set('showRoutingResults', true);
            })
            .catch(function(error) {
                Ext.toast(vm.get('i18n.errorFleetRouting'));
                Ext.log.error(error);
            });
    }
});
