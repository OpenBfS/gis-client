Ext.define('Koala.model.Style', {
    extend: 'Koala.model.Base',

    requires: [
        'Koala.model.StyleRule'
    ],

    hasMany: [{
        model: 'StyleRule',
        name: 'rules'
    }]

});
