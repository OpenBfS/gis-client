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
 * @class Koala.view.container.FleetRoutingResultController
 */
Ext.define('Koala.view.container.FleetRoutingResultController', {
    extend: 'Koala.view.container.RoutingResultController',
    alias: 'controller.k-container-fleetroutingresult',

    requires: [
        'BasiGX.util.Layer'
    ],

    /**
     * @override
     */
    onRoutingResultChanged: function(newResult) {
        var me = this;

        me.callParent([newResult]);

        if (newResult) {
            me.removeAllRoutesFromMap();
        }
    },

    /**
     * Handler for the optimizationResultAvailable event.
     *
     * @param {Object} fleetSummary The response of the VROOM API.
     * @param {Array} orsRoutes The routes computed with OpenRouteService.
     */
    onOptimizationResultAvailable: function(fleetSummary, orsRoutes) {

        var me = this;

        me.clearRoutingSummaries();
        me.clearFleetSummary();
        me.removeAllRoutesFromMap();
        me.addFleetSummary(fleetSummary);


        var jobStore = me.getView().up('window').down('k-grid-routing-jobs').getStore();
        if (!jobStore) {
            return;
        }

        // clear VROOM specific properties from jobStore
        // otherwise old might will stay in the new request
        jobStore.each(function(rec) {
            rec.set(
                {
                    waiting_time: null,
                    arrival: null,
                    vehicle_id: null,
                    unassigned: false
                }
            );
        });

        // mark not succesful jobs
        if (fleetSummary.unassigned) {
            Ext.each(fleetSummary.unassigned, function(job) {
                var jobRecord = jobStore.getById(job.id);
                jobRecord.set({
                    unassigned: true
                });
            });
        }

        Ext.each(orsRoutes, function(orsRoute, index) {
            var correspondingVroomRoute = fleetSummary.routes[index];
            me.addRoutingSummary(orsRoute, correspondingVroomRoute);
            me.addRouteToMap(orsRoute);
            me.addJobSummary(correspondingVroomRoute);
        });
    },

    /**
     * Remove all routes from the map.
     */
    removeAllRoutesFromMap: function() {
        var me = this;
        var layer = me.getRouteLayer();
        if (!layer) {
            return;
        }
        layer.getSource().clear();
    },

    /**
     * Add the routing summary to its store.
     *
     * If a VROOM route is available, its properties will be merged
     * with the ORS route.
     *
     * @param {GeoJson} orsRoute The ORS route.
     * @param {Object} vroomRoute The VROOM route.
     * @returns {Ext.data.Model} The created summary instance.
     */
    addRoutingSummary: function(orsRoute, vroomRoute) {
        var me = this;

        var summary = me.callParent([orsRoute]);

        if (vroomRoute) {
            summary.set({
                vehicle: vroomRoute.vehicle,
                waiting_time: vroomRoute.waiting_time,
                service: vroomRoute.service,
                // we overwrite the ORS duration with the VROOM duration
                // because it is takes breaks and waiting times into account
                duration: vroomRoute.duration,
                steps: vroomRoute.steps
            });
        }

        return summary;
    },

    /**
     * Add VROOM specific information to job records.
     *
     * @param {Object} vroomRoute The VROOM route.
     */
    addJobSummary: function(vroomRoute) {
        var me = this;
        var jobStore = me.getView().up('window').down('k-grid-routing-jobs').getStore();
        if (!jobStore) {
            return;
        }

        Ext.each(vroomRoute, function(route) {
            var steps = route.steps;
            Ext.each(steps, function(step) {

                var type = step.type;
                if (type === 'job') {
                    var jobRecord = jobStore.getById(step.id);

                    jobRecord.set({
                        waiting_time: step.waiting_time,
                        arrival: step.arrival,
                        vehicle_id: route.vehicle
                    });
                }

            });
        });
    },

    /**
     * Clear the fleet routing summary store.
     */
    clearFleetSummary: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var summaryStore = vm.get('fleetroutingsummary');
        summaryStore.removeAll();
    },

    /**
     * Add the fleet routing summary into its store.
     *
     * @param {Object} vroomResponse The whole JSON response from the VROOM API.
     */
    addFleetSummary: function(vroomResponse) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        if (!vroomResponse.summary) {
            return;
        }
        var fleetSummaryStore = vm.get('fleetroutingsummary');
        if (fleetSummaryStore) {
            fleetSummaryStore.add(vroomResponse.summary);
        }
    }
});
