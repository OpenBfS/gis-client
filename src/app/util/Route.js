/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.util.Route
 */
Ext.define('Koala.util.Route', {

    statics: {

        /**
         * Returns the given route hash while considering:
         *   * any other existing route set the to application hash
         *   * any existing route with the same identifier
         */
        getHash: function(newRoute) {
            var newRoutePrefix;
            var existingAppHash;
            var existingRoutes;
            var returnRoute = [];

            if (!Ext.isString(newRoute)) {
                Ext.Logger.warn("Input route has an invalid value.");
                return false;
            }

            // get the route hash prefix, e.g. map
            newRoutePrefix = newRoute.split('/')[0];

            // push the input route to the return set
            returnRoute.push(newRoute);

            // get the existing route hash set by the application
            existingAppHash = window.location.hash;

            // check if given route/hash is already existing in the app route,
            // in this case we need to preserve these routes
            if (existingAppHash && existingAppHash.split('#').length > 0) {

                // remove the trailing hash character, it's not needed here
                existingAppHash = window.location.hash.split('#')[1];

                // split the existing rules, multiple character is '|' per default
                existingRoutes = existingAppHash.split(
                        Ext.app.route.Router.multipleToken);

                Ext.each(existingRoutes, function(existingRoute) {
                    var existingRoutePrefix = existingRoute.split('/')[0];
                    if (existingRoutePrefix !== newRoutePrefix) {
                        returnRoute.push(existingRoute);
                    }
                });

            }

            return returnRoute.join(Ext.app.route.Router.multipleToken);
        },

        /**
         *
         */
        setRouteForView: function(route, view) {
            var viewController = view.getController() || view.lookupController();
            var finalRoute = Koala.util.Route.getHash(route);
            viewController.redirectTo(finalRoute);
        },

        /**
         * Check if the route prefix is present in the window.location.hash
         */
        isRouteSet: function(route) {
            var exp = new RegExp(route.split('/')[0] + '/', 'gi');
            return exp.test(window.location.hash);
        }
    }
});
