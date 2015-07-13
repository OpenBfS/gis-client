Ext.define('Koala.view.grid.SpatialSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-grid-spatialsearch',

    onItemMouseEnter: function(grid, record, item, index, e, eOpts){
        var store = grid.getStore();
        var map = store.map;
        var layer = store.layer;
        var projection = store.map.getView().getProjection().getCode();
        var format = new ol.format.WKT();
        var wkt = record.get('wkt');
        var feature = format.readFeature(wkt);
        feature.getGeometry().transform('EPSG:4326', projection);
        layer.getSource().addFeature(feature);
    },

    onItemMouseLeave: function(grid, record, item, index, e, eOpts){
        var store = grid.getStore();
        var layer = store.layer;
        layer.getSource().clear();
    },

    onItemClick: function(grid, record, item, index, e, eOpts){
        var store = grid.getStore();
        var format = new ol.format.WKT();
        var wkt = record.get('wkt');
        var projection = store.map.getView().getProjection().getCode();
        var feature = format.readFeature(wkt);
        feature.getGeometry().transform('EPSG:4326', projection);
        var map = store.map;
        var view = map.getView();

        var extent = feature.getGeometry().getExtent();
        view.fitExtent(extent, map.getSize());
    }
});
