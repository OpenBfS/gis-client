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
Ext.define('Koala.util.String', {

    statics: {
        /**
         * The format to use as fallback when cobnverting dates to string.
         */
        defaultDateFormat: "", // actual value comes from locale

        /**
         * Checks whether a passed string is a valid level 1-5 uuid (RFC4122).
         *
         * @param String candidate The string to test
         * @return Boolean whether the string conformed to the fixed layout of a
         *     uuid.
         */
        isUuid: (function(){
            var regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return function isUuid(candidate){
                return regex.test(candidate);
            };
        }()),

        /**
         * Replaces 'named' template strings in the given tpl with values
         * derived fromn the passed gettable. A gettable is any object that
         * exposes a method `get` to access properties. Both Ext.data.Model
         * instances and o.Objects qualify as gettable.
         */
        replaceTemplateStrings: function(tpl, getable, showWarnings) {
            // capture alphanumeric values in between double square brackets:
            // will yield an array aof matches including their boundaries:
            // tpl = "Hello [[whom-to-greet]], how are you [[another_string]]";
            // matches = ["[[whom-to-greet]]", "[[another_string]]"]
            var regex = /\[\[([a-zA-Z0-9_-])+?\]\]/gi;
            var matches = tpl.match(regex);
            var keys = [];
            Ext.each(matches, function(match) {
                keys.push(match.replace(/[\]\[]/g, ""));
            });
            Ext.each(keys, function(key) {
                var re = new RegExp("\\[\\[" + key + "\\]\\]");
                var replacement = getable.get(key);
                if (!Ext.isDefined(replacement)) {
                    if (showWarnings === true) {
                        Ext.log.warn(key + " could not be found for replacement!");
                    }
                } else {
                    tpl = tpl.replace(re, replacement);
                }
            });
            return tpl;
        },

        /**
         * Gets a value from an comma separated string with given index
         * @param {string} sequence - the comma separated sequence
         * @param {index} - the index to access the value_
         * @param {mixed} - the default return value
         * @returns {string} - the desired value in the sequence, if found
         */
        getValueFromSequence: function(sequence, index, defaultValue) {
            if (Ext.isEmpty(sequence)) {
                return defaultValue;
            }
            var seqArr = sequence.split(",");
            if (Ext.isEmpty(seqArr[index])) {
                return defaultValue;
            } else {
                return seqArr[index];
            }
        },

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
         *
         */
        coerce: function(string) {
            if (!Ext.isString(string)) {
                return string;
            }
            string = Ext.String.trim(string);

            if (string.toLowerCase() === "true") {
                return true;
            } else if (string.toLowerCase() === "false") {
                return false;
            } else if (/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/.test(string)) {
                return parseFloat(string);
            } else if (Ext.String.startsWith(string, "[") &&
                !Ext.String.startsWith(string, "[[")) {
                return Ext.decode(string);
            } else if (Ext.String.startsWith(string, "{") &&
                      !Ext.String.startsWith(string, "{{")) {
                return Ext.decode(string);
            } else if (Ext.String.startsWith(string, 'eval:')) {
                return eval(string.substr(5)); // eslint-disable-line no-eval
            } else {
                return string;
            }
        }
    }
});
