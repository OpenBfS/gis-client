Ext.define('Koala.model.StyleScaleDenominator', {
    extend: 'Koala.model.Base',

    fields: [{
         name: 'operator',
         type: 'string'
    }, {
        name: 'scale',
        type: 'int'
    }],

    validators: {
        /**
         * The opertor of a StyleScaleDenominator must be one of the following.
         */
        operator: {
            type: 'inclusion',
            list: [
                'IsLessThan',
                'IsLessThanOrEqualTo',
                'IsGreaterThan',
                'IsGreaterThanOrEqualTo'
            ]
        }
    }

});
