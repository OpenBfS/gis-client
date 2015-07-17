Ext.define('Koala.store.TimeSeries', {
    extend: 'Ext.data.Store',

    alias: 'store.k-timeseries',

    fields: [{
        name:'value',
        mapping: function(dataRec){
            return dataRec.properties.result_value;
        }
    },{
        name:'end_measure',
        type: 'date',
        mapping: function(dataRec){
            return dataRec.properties.end_measure;
        }
    }],

    autoLoad: false,

    pageSize: 0,

    useDefaultXhrHeader: false,

    proxy: {
        url: 'http://bfs-koala.intranet.terrestris.de/geoserver/BFS/ows',
        method: 'GET',
        type: 'ajax',
        extraParams: {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: 'BFS:result',
            outputFormat: 'application/json',
            maxFeatures: 5000
        },
        reader: {
            type: 'json',
            rootProperty: 'features'
        }
    }

});
