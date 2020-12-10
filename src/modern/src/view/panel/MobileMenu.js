Ext.define('Koala.view.panel.MobileMenu', {
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobilemenu',

    requires: [
        'Ext.Button',
        'Koala.store.MetadataSearch',
        'Koala.store.SpatialSearch',

        'Koala.util.AppContext',
        'Koala.util.DokpoolRequest',
        'Koala.util.LocalStorage',
        'Koala.store.RodosProjects',
        'Koala.view.form.RodosFilterModel',
        'Koala.view.panel.MobileMetadataInfo',
        'Koala.view.form.RodosFilter',
        'Koala.view.form.RodosFilterController',
        'Koala.view.button.ElanScenarioButton',
        'Koala.view.panel.MobileRouting',

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
        xtype: 'k-button-elanscenariobutton',
        name: 'ScenarioAlertBtn',
        action: 'elanscenarios',
        cls: 'button-routine',
        iconCls: 'fa fa-check',
        iconAlign: 'center',
        bind: {
            text: '{alertBtnText}'
        },
        listeners: {
            tap: function(btn) {
                this.dokpoolEvents = Koala.util.LocalStorage.getDokpoolEvents();
                var mobileEventPanel = btn.up('app-main').down('k-panel-mobileevents');
                mobileEventPanel.show();
            }
        }
    }, {
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
            },
            listeners: {
                itemtap: 'onItemTap'
            }
        }],
        listeners: {
            initialize: function() {
                var stationSearchTileBar = {
                    xtype: 'titlebar',
                    name: 'stationsearchtitle',
                    hidden: true,
                    bind: {
                        title: '{stationSearchTitle}'
                    }
                };
                var stationSearchDataView = {
                    xtype: 'dataview',
                    scrollable: false,
                    itemCls: 'koala-list-item koala-list-item-station',
                    itemTpl: '<i class="fa fa-circle-o" aria-hidden="true"></i> {name}',
                    name: 'stationsearchlist',
                    hidden: true,
                    store: {
                        type: 'k-stationsearch'
                    },
                    listeners: {
                        itemtap: 'zoomToStation'
                    }
                };
                var appContext = BasiGX.view.component.Map.guess().appContext;
                var stationsearchtypename = appContext.data.merge['stationSearchTypeName'];
                if (stationsearchtypename && stationsearchtypename !== '') {
                    this.insert(3, stationSearchTileBar);
                    this.insert(4, stationSearchDataView);
                }
            }
        }
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
            painted: function() {
                var fn = Koala.util.AppContext.generateCheckToolVisibility('addWmsBtn').bind(this);
                fn();
            }
        }
    }, {
        xtype: 'button',
        bind: {
            text: '{routingButtonText}'
        },
        handler: function(btn) {
            btn.up('app-main').down('k-panel-mobilerouting').show();
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
    }, {
        xtype: 'button',
        bind: {
            text: '{privacyButtonText}'
        },
        handler: function() {
            var mobileMenu = this.up('k-panel-mobilemenu');
            window.open(mobileMenu.config.data.privacyUrl);
        }
    }]
});
