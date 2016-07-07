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
 * @class Koala.view.main.MobileMainController
 */
Ext.define('Koala.view.main.MobileMainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mobile-main',

    requires: [
    ],

    layersAlreadyAdded: [],

    routes: {
        'map/:lon/:lat/:zoom': {
            action: 'onMapRoute'
        }
    },

    /**
     *
     */
    onMapRoute: function(lon, lat, zoom) {
        var me = this;
        var view = me.getView();
        var map = view.down('basigx-component-map').getMap();
        var mapView = map.getView();

        mapView.setCenter([lon, lat]);
        mapView.setZoom(zoom);
    },

    /**
     *
     */
    onFilterContainerShow: function(panel) {
        // this route is only available if directly called by the client,
        // a permalink can't use this route, because we don't know the
        // selected layer.
        var routeValueToSet = 0;

        if (panel.getRefItems().length > 0) {
            routeValueToSet = 1;
        }

        // no getter for config available :/
        Koala.util.Route.setRouteForView(Ext.String.format(
                panel.config['route'], routeValueToSet), panel);
    },

    /**
     *
     */
    onFilterContainerHide: function(panel) {
        if (panel.isRendered()) {
            // no getter for config available :/
            Koala.util.Route.setRouteForView(Ext.String.format(
                panel.config['route'], 0), panel);
        }
    }

});
