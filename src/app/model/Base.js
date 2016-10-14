Ext.define('Koala.model.Base', {
    extend: 'Ext.data.Model',

    fields: [{
        name:'id',
        type:'int',
        allowNull: true
    }],

    schema: {
        namespace: 'Koala.model'
    }

});
