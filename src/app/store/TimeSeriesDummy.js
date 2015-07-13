Ext.define('Koala.store.TimeSeriesDummy', {
    extend: 'Ext.data.Store',

    alias: 'store.k-timeseriesdummy',

    fields: [
        'code', 'name'
    ],

    autoLoad: false,

    proxy: {
        url: 'resources/data/timeseries_odlinfo_data.json',
        method: 'GET',
        type: 'ajax',
        extraParams: {
            stationId: null
        },
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }

});
