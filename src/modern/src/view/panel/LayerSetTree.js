/**
 * Plugin used for serversided (GeoServer SQL-View) Clustering. And clientsided
 * (OL3) styling.
 */
Ext.define('Koala.view.panel.LayerSetTree', {
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-treepanel',

    requires: [
        'Koala.view.panel.LayerSetTreeController',
        'Koala.view.panel.LayerSetTreeModel',

        'Ext.list.Tree'
    ],

    controller: 'k-panel-layersettree',
    viewModel: {
        type: 'k-panel-layersettree'
    },

    bind: {
        title: '{panelTitleText}'
    },

    closeToolAlign: 'left',

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
        selectOnExpander: true,
        listeners: {
            singletap: {
                fn: function() {
                    this.component.lookupController().setupShowFilterWinCheck();
                },
                element: 'element'
            }
            // doubletap: {
            //     fn: function() {
            //         this.component.lookupController().addLayerWithDefaultFilters();
            //     },
            //     element: 'element'
            // }
        }
    }]
});
