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
 * @class Koala.util.Object
 */
Ext.define('Koala.util.Object', {

    statics: {

        /**
         * Returns a deeply nested value in the subobject specified by path,
         * which is basically the names of the keys of the objects in the
         * hierarchy divided by a forward slash (/).
         *
         * @param Object obj The top-level object to search in
         * @param String path The path to search.
         * @param Object valWhenEmpty The value to return if the path isn't
         *    found or the found value is empty.
         */
        getPathStrOr: function(obj, path, valWhenEmpty) {
            var parts = path.split('/');
            return Koala.util.Object.getPathOr(
                obj,
                parts,
                valWhenEmpty
            );
        },

        /**
         * Returns a deeply nested value in the subobject specified by parts,
         * which is basically a list of names of the keys of the objects in the
         * hierarchy..
         *
         * @param Object obj The top-level object to search in
         * @param String[] parts The ordered list of path parts
         * @param Object valWhenEmpty The value to return if the path isn't
         *    found or the found value is empty.
         */
        getPathOr: function(obj, parts, valWhenEmpty) {
            if (!obj) {
                return valWhenEmpty;
            }
            var lastIdx = parts.length - 1;
            var curObj = obj;
            var val;
            Ext.each(parts, function(part, idx) {
                if (idx !== lastIdx && !Ext.isObject(curObj[part])) {
                    return false; // and thus break early
                }
                if (idx < lastIdx) {
                    curObj = curObj[part];
                } else if (idx === lastIdx) {
                    val = curObj[part];
                }
            });
            if (Ext.isEmpty(val)) {
                val = valWhenEmpty;
            }
            return val;
        },

        /**
         * Returns a new Object containing the values of any keys
         * that starts with the given prefix.
         */
        getConfigByPrefix: function(obj, prefix, guessTypes) {
            if (!Ext.isDefined(guessTypes)) {
                guessTypes = false;
            }
            if (!Ext.isObject(obj)) {
                return {};
            }
            var clone = Ext.apply({}, obj);
            var cfg = {};

            Ext.iterate(clone, function(key, value) {
                if (Ext.String.startsWith(key, prefix)) {
                    var unprefixedKey = key.replace(prefix, '');
                    if (guessTypes) {
                        value = Koala.util.String.coerce(value);
                    }
                    cfg[unprefixedKey] = value;
                }
            });
            return cfg;
        },

        coerceAll: function(obj) {
            return this.getConfigByPrefix(obj, '', true);
        },

        /**
         * Returns a map from list[n][key] to list[n].
         * @param  {array} list an array of objects
         * @param  {string} key  the key to extract and use
         * @return {object}      the map
         */
        arrayToMap: function(list, key) {
            var map = {};
            Ext.each(list, function(obj) {
                map[obj[key]] = obj;
            });
            return map;
        },

        /**
         * Returns an object mapping list[n][key] to list[n][valueKey].
         * @param  {array} list     an array of objects
         * @param  {string} key      the key to extract and use
         * @param  {string} valueKey the key to extract the value
         * @return {object}          the object
         */
        arrayToObject: function(list, key, valueKey) {
            var map = {};
            Ext.each(list, function(obj) {
                map[obj[key]] = obj[valueKey];
            });
            return map;
        },

        /**
         * Returns the inverse object, mapping the values to their key in the
         * original object. Note that the values must be unique!
         * @param  {object} obj the original object
         * @return {object}     the inverse object
         */
        inverse: function(obj) {
            var map = {};
            Ext.iterate(obj, function(key, value) {
                map[value] = key;
            });
            return map;
        }
    }
});
