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
 * @class Koala.view.grid.SpatialSearchController
 */
Ext.define('Koala.view.grid.SpatialSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-grid-spatialsearch',

    /**
     * The handler for the mouse enter event of a grid record.
     * @param {Koala.view.grid.SpatialSearch} grid The grid.
     * @param {Koala.model.SpatialRecord} record A record of the spatialsearch
     *                                           grid.
     */
    onItemMouseEnter: function(grid, record){
        var store = grid.getStore();
        var layer = store.layer;
        var feature = this.getFeatureFromRecord(record);

        layer.getSource().addFeature(feature);
    },

    /**
     * The handler for the mouse enter event of a grid record.
     * @param {Koala.view.grid.SpatialSearch} grid The grid.
     *
     */
    onItemMouseLeave: function(grid){
        var store = grid.getStore();
        var layer = store.layer;
        layer.getSource().clear();
    },

    /**
     * The handler for the clickevent of a grid record.
     * @param {Koala.view.grid.SpatialSearch} grid The grid.
     * @param {Koala.model.SpatialRecord} record A record of the spatialsearch
     *                                           grid.
     */
    onItemClick: function(grid, record){
        var store = grid.getStore();
        var map = store.map;
        var view = map.getView();
        var feature = this.getFeatureFromRecord(record);
        var extent = feature.getGeometry().getExtent();

        view.fit(extent, map.getSize());
    },

    // TODO onStoreBeforeload / onStoreLoad / setupStatusLineListeners and
    //      teardownStatusLineListeners are the same in the
    //      MetadataSearchController.

    /**
     * Find a wkt or geometry inside of an grid record and returns a corresponding
     * feature;
     * @param {Koala.model.SpatialRecord} record A record of the spatialsearch
     *                                           grid.
     * @return {ol.Feature} The feature contained in this record.
     */
    getFeatureFromRecord: function(record) {
      var store = this.getView().getStore();
      var map = store.map;
      var view = map.getView();
      var wkt = record.get('wkt');
      var geom = record.get('geometry');
      var format;
      var feature;

      if(wkt){
        format = new ol.format.WKT();
        feature = format.readFeature(wkt);
      } else if (geom) {
        format = new ol.format.GeoJSON({
          geometryName: record.get('geometry_name') || 'the_geom',
          featureProjection: view.getProjection()
        });
        feature = format.readFeature(record.getData());
      }

      return feature;
    },

    /**
     * Before the store loads, we'll show the footer of the grid which contains
     * the status line. We'll also update the visible text with something like
     * 'Searching…'.
     */
    onStoreBeforeload: function() {
        var grid = this.getView();
        var footer = grid.down('toolbar[name="footer"]');
        var statusLine = footer.down('[name="status-line"]');
        statusLine.setHtml(grid.getViewModel().get('searchInProgressText'));
        footer.show();
    },

    /**
     * Whenever the store has loaded, we examine the resulting records. If we
     * haven't received any records, we'll tell the user (e.g. 'nothing found').
     * Otherwise we'll hide the statusbar (shown before the query was issued),
     * so that the user can browse the results.
     *
     * @param {Ext.data.Store} store The store that just loaded.
     * @param {Ext.data.Model[]} records The records that the last query
     *     returned.
     */
    onStoreLoad: function(store, records){
        var grid = this.getView();
        var footer = grid.down('toolbar[name="footer"]');
        var statusLine = footer.down('[name="status-line"]');
        if (!records || records.length < 1) {
            statusLine.setHtml(grid.getViewModel().get('noRecordsFoundText'));
            footer.show();
        } else {
            statusLine.setHtml('');
            footer.hide();
        }
    },

    /**
     * Called on the `boxready`-event, this methods adds listeners to store
     * events, which will update the status line of the grids (e.g. 'no data
     * found'), see also #teardownStatusLineListeners.
     *
     * @private
     */
    setupStatusLineListeners: function() {
        var me = this;
        var store = me.getView().getStore();
        store.on({
            load: me.onStoreLoad,
            beforeload: me.onStoreBeforeload,
            scope: me
        });
    },

    /**
     * Called on the beforedestroy event, this methods removes listeners to
     * store events, which we added to show information in the status line
     * (see #setupStatusLineListeners).
     *
     * @private
     */
    teardownStatusLineListeners: function() {
        var me = this;
        var store = me.getView().getStore();
        store.un({
            load: me.onStoreLoad,
            beforeload: me.onStoreBeforeload,
            scope: me
        });
    }
});
