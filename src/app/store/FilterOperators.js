Ext.define('Koala.store.FilterOperators', {

    extend: 'Ext.data.Store',

    alias: 'store.filterOperators',

    fields: [{
        name: "ogcType",
        type: 'string'
    },{
        name: "operator",
        type: 'string'
    },{
        name: "dataTypes",
        type: 'auto'
    }],

    data : [{
        ogcType: "PropertyIsEqualTo",
        operator: "=",
        dataTypes: ["xsd:int", "xsd:double", "xsd:string", "xsd:boolean"]
    },{
        ogcType: "PropertyIsNotEqualTo",
        operator: "!=",
        dataTypes: ["xsd:int", "xsd:double", "xsd:string", "xsd:boolean"]
    },{
        ogcType: "PropertyIsLessThan",
        operator: "<",
        dataTypes: ["xsd:int", "xsd:double"]
    },{
        ogcType: "PropertyIsLessThanOrEqualTo",
        operator: "≤",
        dataTypes: ["xsd:int", "xsd:double"]
    },{
        ogcType: "PropertyIsBetween",
        operator: "≤ x ≤",
        dataTypes: ["xsd:int", "xsd:double"]
    },{
        ogcType: "PropertyIsGreaterThan",
        operator: ">",
        dataTypes: ["xsd:int", "xsd:double"]
    },{
        ogcType: "PropertyIsGreaterThanOrEqualTo",
        operator: "≥",
        dataTypes: ["xsd:int", "xsd:double"]
    },{
        ogcType: "PropertyIsGreaterThanOrEqualTo",
        operator: "≥",
        dataTypes: ["xsd:int", "xsd:double"]
    },{
        ogcType: "PropertyIsLike",
        operator: "is Like",
        dataTypes: ["xsd:string"]
    },{
        ogcType: "PropertyIsNull",
        operator: "isNull",
        dataTypes: ["xsd:int", "xsd:double", "xsd:string", "xsd:boolean"]
    }]

});
