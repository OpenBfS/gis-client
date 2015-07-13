Ext.define("Koala.view.view.LayerSet",{
    extend: "Ext.view.View",
    xtype: "k-view-layerset",

    requires: [
        "Koala.view.view.LayerSetController",
        "Koala.view.view.LayerSetModel",

        "Ext.data.Store"
    ],

    controller: "k-view-layerset",
    viewModel: {
        type: "k-view-layerset"
    },

    width: 400,
    height: 300,

    singleSelect: true,
    overItemCls: 'x-view-over',
    itemSelector: 'div.thumb-wrap',
    tpl: [
        '<tpl for=".">',
            '<div class="thumb-wrap">',
                '<div class="thumb">',
                    '<img src="classic/resources/img/themes/{thumb}" />',
                '</div>',
                '<span>{name}</span>',
            '</div>',
        '</tpl>'
    ],

    initComponent: function() {
        this.store = Ext.create('Ext.data.Store', {
            autoLoad: true,
            fields: ['name', 'thumb', 'url', 'type'],
            remoteSort: false,
            sorters: 'type',
            proxy: {
                type: 'ajax',
                url : 'classic/resources/layerset.json',
                reader: {
                    type: 'json'
                }
            }
        });

        this.callParent(arguments);
    }
});
