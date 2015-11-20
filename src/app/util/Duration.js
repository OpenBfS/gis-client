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
Ext.define('Koala.util.Duration', {

    statics: {
        /**
         * Based upon http://stackoverflow.com/a/29153059
         */
        durationRegex: /(-)?P(?:([\.,\d]+)Y)?(?:([\.,\d]+)M)?(?:([\.,\d]+)W)?(?:([\.,\d]+)D)?T(?:([\.,\d]+)H)?(?:([\.,\d]+)M)?(?:([\.,\d]+)S)?/,

        /**
         */
        secondsInOne: {
            YEAR: 31536000, // assuming 365 days, not 365.25
            MONTH: 2628000, // 1/12 of a year; or 2419200 => 4 weeks in a month
            WEEK: 604800, // 7 days in on week
            DAY: 86400, // 24 hours in one day
            HOUR: 3600, // 60 minutes in one hour
            MINUTE: 60 // 60 seconds in one minute
        },

        /**
         */
        zeroDurationObj: {
            sign: '+',
            years: 0,
            months: 0,
            weeks: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        },

        /**
         * Turn the given ISO 8601 string duration into an object that has keys
         * for all the parts that possibly make up a duration.Based upon this
         * stackoverflow answer http://stackoverflow.com/a/29153059
         *
         * @param {string} isoDuration An ISO 8601 duration as string
         * @return {object} An object with numbers for `years`, `month`, `weeks`,
         *     `days`, `hours`, `minutes` and `seconds`. Also included is a key
         *     `sign` which is either `'+'` or `'-'` for negative durations.
         */
        isoDurationToObject: function(isoDuration) {
            var staticMe = this;
            if (!Ext.isString(isoDuration)) {
                // caled with undefined or other non-string => 0 duration
                return Ext.clone(staticMe.zeroDurationObj);
            }
            var matches = (isoDuration).match(staticMe.durationRegex);
            if (!matches) {
                // illegal format => 0 duration
                return Ext.clone(staticMe.zeroDurationObj);
            }
            // all is fine, the string could be parsed:
            return {
                sign: Ext.isDefined(matches[1]) ? '-' : '+',
                years: Ext.isDefined(matches[2]) ? parseFloat(matches[2]) : 0,
                months: Ext.isDefined(matches[3]) ? parseFloat(matches[3]) : 0,
                weeks: Ext.isDefined(matches[4]) ? parseFloat(matches[4]) : 0,
                days: Ext.isDefined(matches[5]) ? parseFloat(matches[5]) : 0,
                hours: Ext.isDefined(matches[6]) ? parseFloat(matches[6]) : 0,
                minutes: Ext.isDefined(matches[7]) ? parseFloat(matches[7]) : 0,
                seconds: Ext.isDefined(matches[8]) ? parseFloat(matches[8]) : 0
            };
        },

        /**
         */
        secondsFromDuration: function(isoDuration) {
            var durationObject = this.isoDurationToObject(isoDuration);
            return this.secondsFromDurationObject(durationObject);
        },

        /**
         */
        absoluteSecondsFromDuration: function(isoDuration) {
            var absoluteDuration = this.abs(isoDuration);
            var durationObject = this.isoDurationToObject(absoluteDuration);
            return this.secondsFromDurationObject(durationObject);
        },

        /**
         */
        secondsFromDurationObject: function(durationObject) {
            var multiplyForSign = durationObject.sign === '-' ? -1 : 1;
            var secondsInOne = this.secondsInOne;
            return multiplyForSign * (
                    durationObject.years * secondsInOne.YEAR +
                    durationObject.months * secondsInOne.MONTH +
                    durationObject.weeks * secondsInOne.WEEK +
                    durationObject.days * secondsInOne.DAY +
                    durationObject.hours * secondsInOne.HOUR +
                    durationObject.minutes * secondsInOne.MINUTE +
                    durationObject.seconds
                );
        },

        /**
         */
        abs: function(duration){
            if (duration[0] === '-') {
                return duration.substr(1);
            }
            return duration;
        },

        /**
         */
        dateAddDuration: function(baseDate, duration) {
            var durationInSeconds = this.secondsFromDuration(duration);
            return Ext.Date.add(baseDate, Ext.Date.SECOND, durationInSeconds);
        },

        /**
         */
        dateSubtractAbsoluteDuration: function(baseDate, duration) {
            var durationInSeconds = this.absoluteSecondsFromDuration(duration);
            var unit = Ext.Date.SECOND;
            return Ext.Date.add(baseDate, unit, -1 * durationInSeconds);
        },

        /**
         */
        dateAddAbsoluteDuration: function(baseDate, duration) {
            var durationInSeconds = this.absoluteSecondsFromDuration(duration);
            var unit = Ext.Date.SECOND;
            return Ext.Date.add(baseDate, unit, durationInSeconds);
        }
    }
});
