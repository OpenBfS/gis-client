
Ext.define('Koala.view.container.MobileMenu',{
    extend: 'Ext.form.Panel',
    xtype: 'k-container-mobilemenu',

    requires: [
        'Koala.view.container.MobileMenuController',
        'Koala.view.container.MobileMenuModel',
        'Koala.store.MetadataSearch',
        'Koala.store.SpatialSearch'
    ],

    controller: 'k-container-mobilemenu',
    viewModel: {
        type: 'k-container-mobilemenu'
    },
    config: {
        title: 'Menu'
    },
    items: [
        {
            xtype: 'searchfield',
            name: 'searchVal',
            placeHolder: 'Suche in Daten und Diensten',
            listeners: {
                action: 'fetchNewData'
            }
        },
        {
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
        },
        {
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
        },
        {
            xtype: 'k-button-mobileaddlayer',
            text: 'Layer hinzufügen'
        }
    ]
});
