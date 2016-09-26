Ext.define('Koala.model.StyleRule', {
    extend: 'Koala.model.Base',

    requires: [
        'Koala.model.StyleFilter',
        'Koala.model.StyleScaleDenominator',
        'Koala.model.StyleSymbolizer'
    ],

    fields: [{
        name: 'filterId',
        reference: {
            type: 'StyleFilter',
            unique: true
        }
    }, {
        name: 'scaleDenominatorId',
        reference: {
            type: 'StyleScaleDenominator',
            unique: true
        }
    }, {
        name: 'symbolizerId',
        reference: {
            type: 'StyleSymbolizer',
            unique: true
        }
    }]

});
