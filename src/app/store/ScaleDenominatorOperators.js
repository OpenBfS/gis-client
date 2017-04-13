Ext.define('Koala.store.ScaleDenominatorOperators', {

    extend: 'Ext.data.Store',

    alias: 'store.scaleDenominatorOperators',

    fields: [{
        name: 'ogcType',
        type: 'string'
    },{
        name: 'operator',
        type: 'string'
    }],

    data: [{
        ogcType: 'ScaleIsLessThan',
        operator: '<'
    },{
        ogcType: 'ScaleIsLessThanOrEqualTo',
        operator: '≤'
    },{
        ogcType: 'ScaleIsBetween',
        operator: '≤ x ≤'
    },{
        ogcType: 'ScaleIsGreaterThan',
        operator: '>'
    },{
        ogcType: 'ScaleIsGreaterThanOrEqualTo',
        operator: '≥'
    }]

});
