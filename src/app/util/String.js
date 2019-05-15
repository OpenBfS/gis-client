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
 * @class Koala.util.String
 */
Ext.define('Koala.util.String', {

    statics: {
        /**
         * The format to use as fallback when cobnverting dates to string.
         */
        defaultDateFormat: '', // actual value comes from locale

        /**
         * fi18n formatted bool Values
         */
        bool2StringTrue: '',
        bool2StringFalse: '',

        /**
         * Checks whether a passed string is a valid level 1-5 uuid (RFC4122).
         *
         * @param String candidate The string to test
         * @return Boolean whether the string conformed to the fixed layout of a
         *     uuid.
         */
        isUuid: (function() {
            var regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return function(candidate) {
                return regex.test(candidate);
            };
        }()),

        /**
         * Replaces 'named' template strings in the given tpl with values
         * derived fromn the passed gettable. A gettable is any object that
         * exposes a method `get` to access properties. Both Ext.data.Model
         * instances and o.Objects qualify as gettable.
         */
        replaceTemplateStrings: function(tpl, getable, showWarnings, prefix) {
            if (getable && !('get' in getable)) {
                getable = new ol.Object(getable);
            }
            var keyPrefix = prefix ? prefix : '';

            // capture alphanumeric values in between double square brackets:
            // will yield an array of matches including their boundaries:
            // tpl = "Hello [[whom-to-greet]], how are you [[another_string]]";
            // matches = ["[[whom-to-greet]]", "[[another_string]]"]
            var regex = /\[\[([a-zA-Z0-9\._-])+?\]\]/gi;
            var matches = tpl.match(regex);
            var keys = [];
            Ext.each(matches, function(match) {
                var key = match.replace(/[\]\[]/g, '');
                keys.push(key.replace(prefix, ''));
            });
            Ext.each(keys, function(key) {
                var re = new RegExp('\\[\\[' + keyPrefix + key + '\\]\\]');
                var replacement = getable.get(key);
                if (!Ext.isDefined(replacement)) {
                    if (showWarnings === true) {
                        Ext.log.warn(key + ' could not be found for replacement!');
                    }
                } else { // check if 'replacement' represents a date
                    // it is already a Moment/date
                    if (moment.isMoment(replacement)) {
                        replacement = Koala.util.Date.getFormattedDate(replacement);
                    } else if (isNaN(Number(replacement)) && moment(replacement, moment.ISO_8601, true).isValid()) {
                        // keep in mind, numbers are NOT parsed to a date-object
                        // this includes unix timestamps (time in milliseconds since Jan 01 1970)
                        var momentDate = Koala.util.Date.getUtcMoment(replacement);
                        replacement = Koala.util.Date.getFormattedDate(momentDate);
                    }
                    tpl= tpl.replace(re, replacement);
                }
            });
            return tpl;
        },

        /**
         * Same as #replaceTemplateStrings, but resolves url: or featureurl: prefixed
         * templates and returns an Ext.Promise instead of the value. Resolves
         * url values after applying #replaceTemplateStrings to the url template.
         */
        replaceTemplateStringsWithPromise: function(tpl, gettable, showWarnings, prefix) {
            var val = Koala.util.String.replaceTemplateStrings(tpl, gettable, showWarnings, prefix);
            if (Ext.String.startsWith(val, 'featureurl:') || Ext.String.startsWith(val, 'url:')) {
                var defaultHeaders;
                var authHeader = Koala.util.Authentication.getAuthenticationHeader();
                if (authHeader) {
                    defaultHeaders = {
                        Authorization: authHeader
                    };
                }
                var url;
                if (Ext.String.startsWith(val, 'featureurl:')) {
                    url = val.substring('featureurl:'.length);
                } else {
                    url = val.substring('url:'.length);
                }

                return new Ext.Promise(function(resolve, reject) {
                    Ext.Ajax.request({
                        url: url,
                        defaultHeaders: defaultHeaders,
                        method: 'GET',
                        success: function(response) {
                            resolve(response.responseText);
                        },
                        failure: function(response) {
                            reject(response.status);
                        }
                    });
                });
            }
            return new Ext.Promise(function(resolve) {
                resolve(val);
            });
        },

        /**
         * Gets a value from an comma separated string with given index
         * @param {string} sequence - the comma separated sequence
         * @param {index} index - the index to access the value_
         * @param {mixed} defaultValue - the default return value
         * @returns {string} - the desired value in the sequence, if found
         */
        getValueFromSequence: (function() {
            // cache splitted sequences by their string representation
            var sequenceCache = {};
            return function(sequence, index, defaultValue) {
                if (Ext.isEmpty(sequence)) {
                    return defaultValue;
                }
                var seqArr = sequenceCache[sequence];
                if (!seqArr) {
                    seqArr = sequence.split(',');
                    sequenceCache[sequence] = seqArr;
                }
                if (Ext.isEmpty(seqArr[index])) {
                    return defaultValue;
                } else {
                    return seqArr[index];
                }
            };
        }()),

        /**
         * @param {string} string - the string containing the bool
         * @returns the boolean value of the given String
         */
        getBool: function(string, defaultValWhenEmpty) {
            if (!Ext.isDefined(defaultValWhenEmpty)) {
                defaultValWhenEmpty = false;
            } else {
                // pass in anything, we'll bool it
                defaultValWhenEmpty = !!defaultValWhenEmpty;
            }

            var coerced = Koala.util.String.coerce(string);
            if (Ext.isBoolean(coerced)) {
                return coerced;
            } else if (Ext.isEmpty(string)) {
                return defaultValWhenEmpty;
            } else {
                return true;
            }
        },

        /**
         * @param {string} value or {number} value- the string or number containing the bool
         * @returns the i18n String for bool
         */
        getStringFromBool: function(boolValue) {
            if (boolValue.toLowerCase() === 'true' || boolValue.toLowerCase() === '1' || boolValue.toString() === '1') {
                return this.bool2StringTrue;
            } else {
                return this.bool2StringFalse;
            }
        },
        /**
         *
         */
        coerce: function(string) {
            if (!Ext.isString(string)) {
                return string;
            }
            string = Ext.String.trim(string);

            if (string.toLowerCase() === 'true') {
                return true;
            } else if (string.toLowerCase() === 'false') {
                return false;
            } else if (/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(string)) {
                return parseFloat(string);
            } else if (Ext.String.startsWith(string, '[') &&
                !Ext.String.startsWith(string, '[[')) {
                return Ext.decode(string);
            } else if (Ext.String.startsWith(string, '{') &&
                      !Ext.String.startsWith(string, '{{')) {
                return Ext.decode(string);
            } else if (Ext.String.startsWith(string, 'eval:')) {
                return eval(string.substr(5)); // eslint-disable-line no-eval
            } else {
                return string;
            }
        },


        /**
        * replaces special Characters
        * mainly used for sorting of strings with 'UMLAUT'
        * @param {string} string - the string containing special character
        * @returns {string} - the string where special characters have been replaced
        */
        replaceSpecialChar: function(string) {
            var value = string;
            value = value.replace(/Ä/g, 'Ae');
            value = value.replace(/ä/g, 'ae');
            value = value.replace(/Ö/g, 'Oe');
            value = value.replace(/ö/g, 'oe');
            value = value.replace(/Ü/g, 'Ue');
            value = value.replace(/ü/g, 'ue');
            value = value.replace(/ß/g, 'ss');
            return value;
        },

        /**
         * Transforms an utf-8 string to a base-64 encoded ASCII string.
         *
         * @param {String} str The utf-8 input string.
         * @return {String} The base-64 encoded output string.
         */
        utf8_to_b64: function(str) {
            return window.btoa(unescape(encodeURIComponent(str)));
        },

        /**
         * Transforms a  base-64 encoded ASCII string to anutf-8 string.
         *
         * @param {String} str The base-64 encoded input string.
         * @return {String} The utf-8 output string.
         */
        b64_to_utf8: function(str) {
            return decodeURIComponent(escape(window.atob(str)));
        }
    }
});
