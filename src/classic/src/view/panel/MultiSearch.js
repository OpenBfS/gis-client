Ext.define("Koala.view.panel.MultiSearch",{
    extend: "Ext.panel.Panel",
    xtype: "k-panel-multisearch", 

    requires: [
        "Koala.view.panel.MultiSearchController",
        "Koala.view.panel.MultiSearchModel",

        "Koala.view.grid.SpatialSearch",
        "Koala.store.SpatialSearch",

        "Koala.view.grid.MetadataSearch",
        "Koala.store.MetadataSearch"
    ],

    controller: "k-panel-multisearch",
    viewModel: {
        type: "k-panel-multisearch"
    },

    layout: 'vbox',

    items: [{
        xtype: 'k-grid-spatialsearch',
        maxHeight: 200,
        width: 600
    },{
        xtype: 'k-grid-metadatasearch',
        maxHeight: 200,
        width: 600
    }]
});
