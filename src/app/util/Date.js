/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 * @class Koala.util.Date
 */
Ext.define('Koala.util.Date', {

    statics: {
        ISO_FORMAT: 'C', // New in Ext6, probably dependent of Date.toISOString
        // ISO_FORMAT: 'Y-m-d\\TH:i:s\\Z' // missing milliseconds

        /**
         * Returns an offset in minutes from a local date compared to UTC. The
         * offset is positive for zones ahead of UTC-0 and negative for zones
         * behind UTC-0. For Germany, this will be e.g. `60` or `120` (both
         * positive).
         */
        getUTCOffsetInMinutes: function(){
            var localDate = new Date();

            var utcOffsetMinutes = 0;
            var utcOffsetHours = 0;
            var utcOffset = Ext.Date.getGMTOffset(localDate); // e.g. "+0100"
            var utcOffsetSign = utcOffset.substring(0, 1); // e.g. "+"

            if (utcOffset.length === 5) {
                utcOffsetMinutes = parseInt(utcOffset.substring(3, 5), 10);
                utcOffsetHours = parseInt(utcOffset.substring(1, 3), 10);
                utcOffsetMinutes = utcOffsetMinutes + (utcOffsetHours * 60);
                var modifier = (utcOffsetSign === "-") ? -1 : 1;
                return modifier * utcOffsetMinutes;
            } else {
                return 0;
            }
        },

        /**
         * Takes a Date which is utc (e.g. coming from the server) and adds
         * the UTC offset.
         *
         * @param {Date} utcDate A date supposed to be in UTC. All dates coming
         *     coming from the server are supposed to be UTC.
         */
        makeLocal: function(utcDate){
            var offsetMinutes = this.getUTCOffsetInMinutes();
            return Ext.Date.add(utcDate, Ext.Date.MINUTE, offsetMinutes);
        },

        /**
         * Takes a Date which is local and substracts the UTC difference.
         *
         * @param {Date} localDate A date supposed to be local. Dates in the
         *     frontend may very well be local ones (depending on a user
         *     setting), but when we are talking to the server, we need to
         *     convert these to UTC.
         */
        makeUtc: function(localDate){
            var offsetMinutes = -1 * this.getUTCOffsetInMinutes();
            return Ext.Date.add(localDate, Ext.Date.MINUTE, offsetMinutes);
        }


    }

});
