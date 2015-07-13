Ext.define('Koala.store.Language', {
    extend: 'Ext.data.Store',

    alias: 'store.k-language',

    fields: [
        'code', 'name'
    ],

    data: [
        {code: 'de', name: 'DE'},
        {code: 'en', name: 'EN'},
        {code: 'fr', name: 'FR'}
    ],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            rootProperty: ''
        }
    }
});
