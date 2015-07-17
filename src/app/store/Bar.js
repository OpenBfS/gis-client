Ext.define('Koala.store.Bar', {
    extend: 'Ext.data.Store',

    alias: 'store.k-bar',

    fields: [
        'code', 'name'
    ],

    autoLoad: false,

    pageSize: 0,

    useDefaultXhrHeader: false,

    proxy: {
//        url: 'http://10.133.7.63/geoserver/BFS/ows',
        url: 'http://bfs-koala.intranet.terrestris.de/geoserver/BFS/ows',
        method: 'GET',
        type: 'ajax',
        extraParams: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            outputFormat: 'application/json',
            maxFeatures: 1000
        },
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }

});
