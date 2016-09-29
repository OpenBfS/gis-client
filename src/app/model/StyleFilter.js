Ext.define('Koala.model.StyleFilter', {
    extend: 'Ext.data.Model',

    fields: [{
         name: 'operator',
         type: 'string',
         default: 'IsEqualTo'
    },{
        name: 'attribute',
        type: 'string'
    }, {
        name: 'number1',
        type: 'number'
    }, {
        name: 'number2',
        type: 'number'
    }, {
        name: 'text',
        type: 'string'
    }],

    validators: {
        /**
         * The opertor of a StyleFilter must be one of the following.
         */
        operator: {
            type: 'inclusion',
            list: [
                'IsEqualTo',
                'IsNotEqualTo',
                'IsBetween',
                'IsLike',
                'IsNull',
                'IsLessThan',
                'IsLessThanOrEqualTo',
                'IsGreaterThan',
                'IsGreaterThanOrEqualTo'
            ]
        }
    }

});
