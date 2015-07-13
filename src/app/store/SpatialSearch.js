Ext.define('Koala.store.SpatialSearch', {
    extend : 'Ext.data.Store',

    alias : 'store.k-spatialsearch',

    storeID : 'spatialsearch',

    layer: null,

    map: null,

    constructor: function(config){
        if(!this.map){
            this.map = Basepackage.view.component.Map.guess().getMap();
        }
        if(!this.layer){
            this.layer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            this.map.addLayer(this.layer);
        }
        this.callParent([config]);
    },

    proxy : {
        url : 'http://10.133.7.63/geoserver/BFS/ows',
        method : 'GET',
        type : 'ajax',
        extraParams : {
            service : 'WFS',
            version : '1.0.0',
            request : 'GetFeature',
            outputFormat : 'application/json',
            typeName : 'BFS:verwaltung_4326_geozg_sort'
        },
        limitParam : 'maxFeatures',
        reader : {
            type : 'json',
            rootProperty : 'features'
        }
    },

    fields: [{
        name: 'name',
        mapping: function(data) {
            return data.properties.MYNAME;
        }
    },{
        name: 'wkt',
        mapping: function(data) {
            return data.properties.BOX_GEO;
        }
    },{
        name: 'nnid',
        mapping: function(data) {
            return data.properties.NNID;
        }
    }]
});
