/**
 * Plugin used for serversided (GeoServer SQL-View) Clustering. And clientsided
 * (OL3) styling.
 */
Ext.define('Koala.view.panel.LayerSetTree', {
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-treepanel',

    requires: [
        'Koala.view.panel.LayerSetTreeController',

        'Ext.list.Tree'
    ],

    controller: 'k-panel-layersettree',

    title: 'Themenwahl',

    name: 'treepanel',

    scrollable: true,

    listeners: {
        show: 'onShow'
    },

    items: [{
        xtype: 'treelist',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        listeners: {
            singletap: {
                fn: function(event, element) {
                    this.lookupController().setupShowFilterWinCheck();
                },
                element: 'element'
            },
            doubletap: {
                fn: function(event, element) {
                    this.lookupController().addLayerWithDefaultFilters();
                },
                element: 'element'
            }
        }
    }]
});
