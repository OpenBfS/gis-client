Ext.define("Koala.view.grid.SpatialSearch",{
    extend: "Ext.grid.Panel",
    xtype: "k-grid-spatialsearch", 

    requires: [
        "Koala.view.grid.SpatialSearchController",
        "Koala.view.grid.SpatialSearchModel",

        "Koala.store.SpatialSearch"
    ],

    controller: "k-grid-spatialsearch",
    viewModel: {
        type: "k-grid-spatialsearch"
    },

    store: {
        type: 'k-spatialsearch'
    },

    bind: {
        title: '{spatialSearchTitle}'
    },

    hideHeaders: true,

    columns:{
        items:[{
            text: 'Name',
            dataIndex: 'name'
        }],
        defaults: {
            flex: 1
        }
    },

    listeners: {
        itemmouseenter: 'onItemMouseEnter',
        itemmouseleave: 'onItemMouseLeave',
        itemclick: 'onItemClick'
    }
});