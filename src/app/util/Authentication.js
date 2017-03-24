/* Copyright (c) 2015-2017 terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * A utility class to handle authentication stuff.
 *
 * @class Koala.util.Authentication
 */
Ext.define('Koala.util.Authentication', {

    requires: [
        'Koala.util.AppContext',
        'Koala.util.String'
    ],

    statics: {

        /**
         * Returns the authentication from a given or guessed context.
         *
         * @param {Object} context An optional context object. If not
         *                         given, Koala.util.AppContext.getAppContext
         *                         will be used to guess it.
         * @return {String} The Authentication header string which looks
         *                      like: "Basic [hash]"
         */
        getAuthenticationHeader: function(context) {
            context = context || Koala.util.AppContext.getAppContext();

            var username = context.data.merge.application_user.username;
            var password = context.data.merge.application_user.password;
            var authHeader;

            if (username && password) {
                var tok = username + ':' + password;
                var hash = Koala.util.String.utf8_to_b64(tok);
                authHeader = "Basic " + hash;
            }

            return authHeader;
        }
    }

});
