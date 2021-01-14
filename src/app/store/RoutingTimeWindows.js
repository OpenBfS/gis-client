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
 * @class Koala.store.RoutingTimeWindows
 */
Ext.define('Koala.store.RoutingTimeWindows', {
    extend: 'Ext.data.Store',

    requires: [
        'Ext.Array'
    ],

    alias: 'store.k-routingtimewindows',

    fields: [
        { name: 'startDay', type: 'date', dateFormat: 'time' },
        { name: 'startTime', type: 'date', dateFormat: 'time' },
        { name: 'endDay', type: 'date', dateFormat: 'time' },
        { name: 'endTime', type: 'date', dateFormat: 'time' }
    ],

    getAllAsTimestamp: function() {
        var me = this;
        var timeWindows = Ext.Array.map(me.getData().items, function(d) {
            var startDay = moment(d.get('startDay'));
            var endDay = moment(d.get('endDay'));
            var startTime = moment(d.get('startTime'));
            var endTime = moment(d.get('endTime'));

            var start = startDay.clone()
                .hour(startTime.hour())
                .minute(startTime.minute());

            var end = endDay.clone()
                .hour(endTime.hour())
                .minute(endTime.minute());

            var startUtc = Koala.util.Date.getUtcMoment(start);
            var endUtc = Koala.util.Date.getUtcMoment(end);
            return [startUtc.valueOf(), endUtc.valueOf()];
        });
        return timeWindows;
    },

    setAllFromTimestamp: function(timestamps) {
        var me = this;
        var dates = Ext.Array.map(timestamps, function(t) {
            return {
                startDay: t[0],
                startTime: t[0],
                endDay: t[1],
                endTime: t[1]
            };
        });
        me.loadRawData(dates);
    }

});
