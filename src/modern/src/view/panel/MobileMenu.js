Ext.define('Koala.view.panel.MobileMenu',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobilemenu',

    requires: [
        'Koala.view.panel.MobileMenuController',
        'Koala.view.panel.MobileMenuModel',
        'Koala.store.MetadataSearch',
        'Koala.store.SpatialSearch'
    ],

    controller: 'k-panel-mobilemenu',
    viewModel: {
        type: 'k-panel-mobilemenu'
    },
    config: {
        title: 'Menu'
    },

    items: [{
        xtype: 'searchfield',
        name: 'searchVal',
        placeHolder: 'Suche in Daten und Diensten',
        listeners: {
            action: 'fetchNewData'
        }
    }, {
        xtype: 'list',
        itemTpl: '{name}',
        name: 'spatialsearchlist',
        hidden: true,
        store: {
            type: 'k-spatialsearch'
        },
        listeners: {
            itemtap: 'zoomToRecord'
        }
    }, {
        xtype: 'list',
        itemTpl: '{name}',
        name: 'metadatasearchlist',
        hidden: true,
        store: {
            type: 'k-metadatasearch'
        },
        listeners: {
            itemtap: 'addLayer'
        }
    }, {
        xtype: 'button',
        text: 'Layer hinzufügen',
        handler: function(btn){
            btn.up('app-main').down('k-panel-mobileaddlayer').show();
        }
    }
]
});
