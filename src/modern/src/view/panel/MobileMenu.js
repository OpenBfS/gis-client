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

    defaults: {
        margin: '5 5 5 5'
    },

    layout: 'vbox',

    scrollable: {
        direction: 'vertical',
        directionLock: true
    },

    items: [{
        xtype: 'container',
        name: 'searchcontainer',
        items: [{
            xtype: 'searchfield',
            name: 'searchVal',
            placeHolder: 'Suche in Daten und Diensten',
            listeners: {
                action: 'fetchNewData',
                clearicontap: 'onClearIconTap'
            }
        }, {
            xtype: 'dataview',
            scrollable: false,
            itemCls: 'koala-list-item koala-list-item-spatial',
            itemTpl: '<i class="fa fa-map-marker" aria-hidden="true"></i> {name}',
            name: 'spatialsearchlist',
            hidden: true,
            store: {
                type: 'k-spatialsearch'
            },
            listeners: {
                itemtap: 'zoomToRecord'
            }
        }, {
            xtype: 'dataview',
            scrollable: false,
            itemCls: 'koala-list-item koala-list-item-metadata',
            itemTpl: '<i class="fa fa-info" aria-hidden="true"></i> {name}',
            name: 'metadatasearchlist',
            hidden: true,
            store: {
                type: 'k-metadatasearch'
            },
            listeners: {
                itemtap: 'addLayer'
            }
        }]
    }, {
        xtype: 'button',
        text: 'Layer hinzufügen',
        handler: function(btn){
            btn.up('app-main').down('k-panel-mobileaddlayer').show();
        }
    }, {
        xtype: 'button',
        text: 'Weitere Themen',
        // handler: function(btn){
        //     btn.up('app-main').down('k-panel-mobileaddlayer').show();
        // }
    }, {
        xtype: 'button',
        text: 'Einstellungen',
        handler: function(btn){
            btn.up('app-main').down('k-panel-settings').show();
        }
    }, {
        xtype: 'button',
        text: 'Hilfe / Impressum',
        // handler: function(btn){
        //     btn.up('app-main').down('k-panel-mobileaddlayer').show();
        // }
    }
]
});
