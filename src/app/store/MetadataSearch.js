Ext.define('Koala.store.MetadataSearch', {
    extend : 'Ext.data.Store',

    requires: 'Koala.model.MetadataRecord',

    alias: 'store.k-metadatasearch',

    storeID: 'metadatasearch',

    model: 'Koala.model.MetadataRecord',

    groupField: 'type',

    proxy: {
        type: 'ajax',
        url: 'http://10.133.7.63/geonetwork/srv/ger/csw?',
        startParam: 'from',
        limitParam: 'to',
        pageParam: '', // Hack to satisfy GNos: empty string > do not send it
        extraParams: {
            service: 'CSW',
            fast: 'index',
            _content_type: 'json',
            version: '2.0.2',
            request: 'GetRecords',
            resultType: 'results',
            constraintLanguage: 'CQL_TEXT',
            constraint_language_version: '1.1.0',
            outputSchema: 'http://www.isotc211.org/2005/gmd',
            typeNames: 'csw:Record'
        },
        noCache: false,
        reader : {
            type : 'json',
            rootProperty : function(data){
                return data['csw:SearchResults']['gmd:MD_Metadata'];
            }
        }
    },

     listeners: {
         load: function(store, records, successful, eOpts ){
         }
     }
});
