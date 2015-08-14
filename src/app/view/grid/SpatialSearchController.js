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
Ext.define('Koala.view.grid.SpatialSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-grid-spatialsearch',

    onItemMouseEnter: function(grid, record){
        var store = grid.getStore();
        var layer = store.layer;
        var projection = store.map.getView().getProjection().getCode();
        var format = new ol.format.WKT();
        var wkt = record.get('wkt');
        var feature = format.readFeature(wkt);
        feature.getGeometry().transform('EPSG:4326', projection);
        layer.getSource().addFeature(feature);
    },

    onItemMouseLeave: function(grid){
        var store = grid.getStore();
        var layer = store.layer;
        layer.getSource().clear();
    },

    onItemClick: function(grid, record){
        var store = grid.getStore();
        var format = new ol.format.WKT();
        var wkt = record.get('wkt');
        var projection = store.map.getView().getProjection().getCode();
        var feature = format.readFeature(wkt);
        feature.getGeometry().transform('EPSG:4326', projection);
        var map = store.map;
        var view = map.getView();

        var extent = feature.getGeometry().getExtent();
        view.fit(extent, map.getSize());
    }
});
