Ext.define('Koala.store.Bar', {
    extend: 'Ext.data.Store',

    alias: 'store.k-bar',

    fields: [{
        name:'Te132',
        mapping: function(dataRec){
            return dataRec.properties.Te132;
        }
    },{
        name:'Bi214',
        mapping: function(dataRec){
            return dataRec.properties.Bi214;
        }
    },{
        name:'Ru103',
        mapping: function(dataRec){
            return dataRec.properties.Ru103;
        }
    },{
        name:'I131',
        mapping: function(dataRec){
            return dataRec.properties.I131;
        }
    },{
        name:'Pb212',
        mapping: function(dataRec){
            return dataRec.properties.Pb212;
        }
    },{
        name:'Cs137',
        mapping: function(dataRec){
            return dataRec.properties.Cs137;
        }
    },{
        name:'Pb214',
        mapping: function(dataRec){
            return dataRec.properties.Pb214;
        }
    },
//  The following elements might be null
    {
        name:'Bi212',
        mapping: function(dataRec){
            return dataRec.properties.Bi212;
        }
    },{
        name:'Zr97',
        mapping: function(dataRec){
            return dataRec.properties.Zr97;
        }
    },{
        name:'Mn54',
        mapping: function(dataRec){
            return dataRec.properties.Mn54;
        }
    },{
        name:'Na22',
        mapping: function(dataRec){
            return dataRec.properties.Na22;
        }
    },{
        name:'Te123m',
        mapping: function(dataRec){
            return dataRec.properties.Te123m;
        }
    },{
        name:'Cs134',
        mapping: function(dataRec){
            return dataRec.properties.Cs134;
        }
    },{
        name:'Nb95',
        mapping: function(dataRec){
            return dataRec.properties.Nb95;
        }
    },{
        name:'Ce144',
        mapping: function(dataRec){
            return dataRec.properties.Ce144;
        }
    },{
        name:'Co58',
        mapping: function(dataRec){
            return dataRec.properties.Co58;
        }
    },{
        name:'Sb125',
        mapping: function(dataRec){
            return dataRec.properties.Sb125;
        }
    },{
        name:'Zn65',
        mapping: function(dataRec){
            return dataRec.properties.Zn65;
        }
    },
    
    {
        name : 'Te_132',
        mapping : function(dataRec) {
            return 'Te-132';
        }
    },{
        name : 'Bi_214',
        mapping : function(dataRec) {
            return 'Bi-214';
        }
    },{
        name : 'Ru_103',
        mapping : function(dataRec) {
            return 'Ru-103';
        }
    },{
        name : 'I_131',
        mapping : function(dataRec) {
            return 'I-131';
        }
    },{
        name : 'Pb_212',
        mapping : function(dataRec) {
            return 'Pb-212';
        }
    },{
        name : 'Cs_137',
        mapping : function(dataRec) {
            return 'Cs-137';
        }
    },{
        name : 'Pb_214',
        mapping : function(dataRec) {
            return 'Pb-214';
        }
    },
//    The following elements might be null
    {
        name: 'Bi_212',
        mapping: function(dataRec){
            return 'Bi-212';
        }
    },{
        name:'Zr_97',
        mapping: function(dataRec){
            return 'Zr-97';
        }
    },{
        name:'Mn_54',
        mapping: function(dataRec){
            return 'Mn-54';
        }
    },{
        name:'Na_22',
        mapping: function(dataRec){
            return 'Na-22';
        }
    },{
        name:'Te_123m',
        mapping: function(dataRec){
            return 'Te-123m';
        }
    },{
        name:'Cs_134',
        mapping: function(dataRec){
            return 'Cs-134';
        }
    },{
        name:'Nb_95',
        mapping: function(dataRec){
            return 'Nb-95';
        }
    },{
        name:'Ce_144',
        mapping: function(dataRec){
            return 'Ce-144';
        }
    },{
        name:'Co_58',
        mapping: function(dataRec){
            return 'Co-58';
        }
    },{
        name:'Sb_125',
        mapping: function(dataRec){
            return 'Sb-125';
        }
    },{
        name:'Zn_65',
        mapping: function(dataRec){
            return 'Zn-65';
        }
    }],

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
            typeName: 'BFS:carto_sql_store',
            outputFormat: 'application/json'
        },
        reader: {
            type: 'json',
            rootProperty: 'features'
        }
    }

});
