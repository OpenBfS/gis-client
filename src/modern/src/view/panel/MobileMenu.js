Ext.define('Koala.view.panel.MobileMenu', {
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
        xtype: 'button',
        name: 'ScenarioAlertBtn',
        cls: 'button-routine',
        iconCls: 'fas fa-check',
        iconAlign: 'center',
        bind: {
            text: '{alertBtnText}'
        },
        listeners: {
            tap: function(btn) {
                var me = this,
                    viewmodel = Ext.ComponentQuery.query('k-panel-mobileevents')[0].getViewModel();

                me.dokpoolEvents = Koala.util.LocalStorage.getDokpoolEvents();
                // if (buttonStatus === 'alert') {
                //     messageHeader = 'alertMessageHeader';
                //     me.status = 'routine';
                // } else {
                //     messageHeader = 'routineMessageHeader';
                // }

                var htmlMessage = '';
                var eventNames = Object.keys(me.dokpoolEvents);
                eventNames.forEach(function(key) {
                    var messageHeader = '';

                    var replaceObject = Object.defineProperties({}, {
                        'title': {
                            value: Koala.util.Object.getPathStrOr(this.dokpoolEvents[key], 'title', ''),
                            enumerable: true
                        },
                        'modified': {
                            value: Koala.util.Object.getPathStrOr(this.dokpoolEvents[key], 'modified', ''),
                            enumerable: true
                        },
                        'modified_by': {
                            value: Koala.util.Object.getPathStrOr(this.dokpoolEvents[key], 'modified_by', ''),
                            enumerable: true
                        },
                        'Exercise': {
                            value: Koala.util.String.getStringFromBool(Koala.util.Object.getPathStrOr(this.dokpoolEvents[key], 'Exercise', '')),
                            enumerable: true
                        },
                        'id': {
                            value: Koala.util.Object.getPathStrOr(this.dokpoolEvents[key], 'id', ''),
                            enumerable: true
                        },
                        'description': {
                            value: Koala.util.Object.getPathStrOr(this.dokpoolEvents[key], 'description', ''),
                            enumerable: true
                        },
                        'TimeOfEvent': {
                            value: Koala.util.Object.getPathStrOr(this.dokpoolEvents[key], 'TimeOfEvent', ''),
                            enumerable: true
                        },
                        'ScenarioPhase.title': {
                            value: Koala.util.Object.getPathStrOr(this.dokpoolEvents[key], 'ScenarioPhase/title', ''),
                            enumerable: true
                        },
                        'ScenarioLocation.title': {
                            value: Koala.util.Object.getPathStrOr(this.dokpoolEvents[key], 'ScenarioLocation/title', ''),
                            enumerable: true
                        }
                    });

                    if (me.triggerEvent && me.triggerEvent === this.dokpoolEvents[key].id) {
                        messageHeader = 'alertMessageHeader';
                        me.triggerEvent = null;
                    } else {
                        messageHeader = 'routineMessageHeader';
                    }

                    messageHeader = Koala.util.String.replaceTemplateStrings(messageHeader, replaceObject);
                    htmlMessage = htmlMessage +
                        viewmodel.get(messageHeader) +
                        viewmodel.get('htmlMessageBody') +
                        '<br><br>';
                    htmlMessage = Koala.util.String.replaceTemplateStrings(htmlMessage, replaceObject);
                }, me);
                me.dokpoolEvents = null;

                var mobileEventPanel = btn.up('app-main').down('k-panel-mobileevents');
                mobileEventPanel.setHtml(htmlMessage);

                me.setIconCls('fas fa-check');
                me.removeCls('button-alert');
                me.addCls('button-routine');

                mobileEventPanel.show();
            },
            initialize: function() {
                //run once to get immediate information
                Koala.util.DokpoolRequest.updateActiveElanScenarios();
                window.setInterval(function() {
                    Koala.util.DokpoolRequest.updateActiveElanScenarios();
                }, 30000);
            }
        }
        // handler: function(btn) {
        //     btn.up('app-main').down('k-panel-mobileevents').show();
        // }
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
                Koala.util.AppContext.generateCheckToolVisibility('addWmsBtn')();
            }
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
