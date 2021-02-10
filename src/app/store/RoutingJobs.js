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
 * @class Koala.store.RoutingJobs
 */
Ext.define('Koala.store.RoutingJobs', {
    extend: 'Ext.data.Store',

    requires: [
        'Koala.model.RoutingJob'
    ],

    alias: 'store.k-routingjobs',

    model: 'Koala.model.RoutingJob',

    /**
     * Convert the records into an array
     * that works with the VROOM API.
     *
     * See https://github.com/VROOM-Project/vroom/blob/master/docs/API.md#input
     *
     * @returns {Array} The jobs array.
     */
    getVroomArray: function() {
        var me = this;
        var jobs = [];
        me.each(function(jobRecord) {
            var job = Ext.clone(jobRecord.getData());

            // these properties are filled from the API response
            // after the request and are therefore not needed
            // for the current request
            delete job.waiting_time;
            delete job.arrival;
            delete job.vehicle_id;
            delete job.unassigned;

            // coordinates are hidden inside 'address' property
            var lat = job.address.latitude;
            var lon = job.address.longitude;
            job['location'] = [lon, lat];
            // address property is not needed anymore
            delete job.address;

            // Delete empty properties, because the API
            // cannot handle it
            Ext.Object.each(job, function(prop) {
                if (Ext.isEmpty(job[prop])) {
                    delete job[prop];
                }
            });

            jobs.push(job);
        });
        return jobs;
    }
});
