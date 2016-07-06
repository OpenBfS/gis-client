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
    viewModel: {
        type: 'k-panel-layersettree'
    },

    bind: {
        title: '{panelTitleText}'
    },

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
                fn: function() {
                    this.lookupController().setupShowFilterWinCheck();
                },
                element: 'element'
            },
            doubletap: {
                fn: function() {
                    this.lookupController().addLayerWithDefaultFilters();
                },
                element: 'element'
            }
        }
    }]
});
