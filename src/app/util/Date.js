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

        /**
         * The format string which we use at several places to format all local
         * dates so that they are understood by the serverside. Most of the
         * time, this will end up as aparameter to #Ext.Date.format. If you look
         * a th the possibly formats from tghe doc, you'll probably notice 'C',
         * which is new in Ext6, and probably dependent of `Date.toISOString`.
         *
         * If we use this, then the calculations with regard to adding and
         * subtracting of offsets are done by the browser. Since we can change
         * (via the button) if we are currently viewing utc dates or not, we
         * cannot use it. We want to handle the calculations ourself and only
         * a format string.
         *
         * @type {string} A format string, ready to be used with the
         *     method #Ext.Date.format.
         */
        ISO_FORMAT: 'Y-m-d\\TH:i:s.u\\Z',

        /**
         * Returns an offset in minutes from a local date compared to UTC. The
         * offset is positive for zones ahead of UTC-0 and negative for zones
         * behind UTC-0. For Germany, this will be e.g. `60` or `120` (both
         * positive).
         *
         * "Why is this method not using Date.prototype.getTimezoneOffset?", you
         * may ask youself. According to [the MDN documentation][1], the support
         * in browsers still isn't reliable, that's why. Why we chose to use a
         * different 'view' on the offset (-60 versus 60) is another valid
         * question. This basically comes from the original implementation in
         * the GeoZG project. A future implementation should probably fix or
         * harmonize this behaviour. On the other hand, our deviation makes the
         * implementation of #makeLocal and #makeUtc very simple, because we can
         * directly use `Ext.Date.add` with the return value from this method.
         *
         * Here is an untested reference implementation using the mentioned
         * `Date.prototype.getTimezoneOffset`, which is API compatible:
         *
         *     var localDate = new Date();
         *     if ('getTimezoneOffset' in localDate) {
         *         return -1 * localDate.getTimezoneOffset();
         *     }
         *
         * If we were to adopt our internal usage / expectations / change the
         * API, the multiplication with `-1` could be removed.
         *
         * [1]: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
         *
         * @return {number} The offset in minutes from a local date compared to
         *     the UTC date.
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
         *     from the server are supposed to be UTC.
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
