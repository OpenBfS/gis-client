Ext.define('Koala.store.FilterOperators', {

    extend: 'Ext.data.Store',

    alias: 'store.filterOperators',

    fields: [{
        name: 'ogcType',
        type: 'string'
    },{
        name: 'operator',
        type: 'string'
    }],

    data: [{
        ogcType: 'PropertyIsEqualTo',
        operator: '='
    },{
        ogcType: 'PropertyIsNotEqualTo',
        operator: '!='
    },{
        ogcType: 'PropertyIsLessThan',
        operator: '<'
    },{
        ogcType: 'PropertyIsLessThanOrEqualTo',
        operator: '≤'
    },{
        ogcType: 'PropertyIsBetween',
        operator: '≤ x ≤'
    },{
        ogcType: 'PropertyIsGreaterThan',
        operator: '>'
    },{
        ogcType: 'PropertyIsGreaterThanOrEqualTo',
        operator: '≥'
    },{
        ogcType: 'PropertyIsLike',
        operator: 'is Like'
    },{
        ogcType: 'PropertyIsNull',
        operator: 'isNull'
    }]

});
