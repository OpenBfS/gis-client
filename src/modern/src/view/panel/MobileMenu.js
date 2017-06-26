Ext.define('Koala.view.panel.MobileMenu',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobilemenu',

    requires: [
        'Koala.store.MetadataSearch',
        'Koala.store.SpatialSearch',

        'Koala.util.AppContext',

        'Koala.view.panel.MobileMenuController',
        'Koala.view.panel.MobileMenuModel'
    ],

    controller: 'k-panel-mobilemenu',
    viewModel: {
        type: 'k-panel-mobilemenu'
    },
    bind: {
        title: '{menuTitle}'
    },

    defaults: {
        margin: 5
    },

    closeToolAlign: 'left',

    layout: 'vbox',

    scrollable: {
        direction: 'vertical',
        directionLock: true
    },

    header: {
        margin: 0
    },

    items: [{
        xtype: 'container',
        name: 'searchcontainer',
        items: [{
            xtype: 'searchfield',
            name: 'searchVal',
            bind: {
                placeHolder: '{searchFieldPlaceHolderText}'
            },
            listeners: {
                action: 'fetchNewData',
                clearicontap: 'onClearIconTap'
            }
        }, {
            xtype: 'titlebar',
            name: 'spatialsearchtitle',
            hidden: true,
            bind: {
                title: '{spatialSearchTitle}'
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
            xtype: 'titlebar',
            name: 'metadatasearchtitle',
            hidden: true,
            bind: {
                title: '{metadataSearchTitle}'
            }
        }, {
            xtype: 'dataview',
            scrollable: false,
            itemCls: 'koala-list-item koala-list-item-metadata',
            itemTpl: '<img src="modern/resources/img/information.png" class="modernMenuIcon" title="getInfo">&nbsp;&nbsp;&nbsp;' +
                '<img src="modern/resources/img/map_add.png" class="modernMenuIcon" title="addLayer">&nbsp;&nbsp;&nbsp; {name}',
            name: 'metadatasearchlist',
            hidden: true,
            store: {
                type: 'k-metadatasearch'
            }
            ,
            listeners: {
                itemtap: 'onItemTap'
            }
        }
        ]
    }, {
        xtype: 'button',
        bind: {
            text: '{moreLayersButtonText}'
        },
        handler: function(btn) {
            btn.up('app-main').down('k-panel-treepanel').show();
        }
    }, {
        xtype: 'button',
        bind: {
            text: '{addLayerButtonText}'
        },
        handler: function(btn) {
            btn.up('app-main').down('k-panel-mobileaddlayer').show();
        },
        listeners: {
            painted: Koala.util.AppContext.generateCheckToolVisibility('addWmsBtn')
        }
    }, {
        xtype: 'button',
        bind: {
            text: '{permalinkButtonText}'
        },
        handler: function(btn) {
            btn.up('app-main').down('k-panel-mobilepermalink').show();
        }
    }, {
        xtype: 'button',
        bind: {
            text: '{settingsButtonText}'
        },
        handler: function(btn) {
            btn.up('app-main').down('k-panel-settings').show();
        }
    }, {
        xtype: 'button',
        bind: {
            text: '{helpButtonText}'
        },
        handler: function(btn) {
            btn.up('app-main').down('k-panel-mobilehelp').show();
        }
    }, {
        xtype: 'button',
        bind: {
            text: '{imprintButtonText}'
        },
        handler: function(btn) {
            btn.up('app-main').down('k-panel-mobileimprint').show();
        }
    }]
});
