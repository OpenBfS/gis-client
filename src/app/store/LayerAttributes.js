Ext.define('Koala.store.LayerAttributes', {

    extend: 'Ext.data.Store',

    alias: 'store.layerattributes',

    requires: [
        'Ext.data.reader.Xml'
    ],

    proxy: {
        type: 'ajax',
        reader: {
            type: 'xml',
            namespace: 'xsd',
            record: 'element',
            rootProperty: 'sequence'
        }
    },

    fields: [{
        name: "name",
        mapping: "@name",
        type: 'string'
    },{
        name: "maxOccurs",
        mapping: "@maxOccurs",
        type: 'int'
    },{
        name: "minOccurs",
        mapping: "@minOccurs",
        type: 'int'
    },{
        name: "nillable",
        mapping: "@nillable",
        type: 'boolean'
    },{
        name: "type",
        mapping: "@type",
        type: 'string'
    }],

    filters: [function(item){
        var ignoreTypes = [
            'gml:GeometryPropertyType',
            'gml:PointPropertyType',
            'gml:LineStringPropertyType',
            'gml:SurfacePropertyType',
            'gml:MultiPointPropertyType',
            'gml:MultiLineStringPropertyType',
            'gml:MultiSurfacePropertyType'
        ];

        return !Ext.Array.contains(ignoreTypes, item.get('type'));
    }]

});
