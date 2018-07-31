/* Copyright (c) 2015-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * This class is the main view for the application. It is specified in app.js as
 * the "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your
 *        application.
 *
 * @class Koala.view.main.Main
 */
Ext.define('Koala.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',

        'Koala.plugin.Hover',
        'BasiGX.view.panel.Header',
        'BasiGX.view.panel.MapContainer',
        'BasiGX.util.Animate',

        'Koala.util.AppContext',
        'Koala.util.Help',

        'Koala.view.button.Permalink',
        'Koala.view.button.ShowRedliningToolsContainer',
        'Koala.view.button.BackgroundLayers',
        'Koala.view.button.ToggleFullscreen',
        'Koala.view.button.SelectFeatures',
        'Koala.view.main.MainController',
        'Koala.view.main.MainModel',
        'Koala.view.panel.LayerSetChooser',
        'Koala.view.window.HelpWindow',
        'Koala.view.window.Print',

        'Koala.util.Layer',
        'Koala.util.LocalStorage'
    ],

    controller: 'main',
    viewModel: {
        type: 'app-main'
    },

    ui: 'navigation',

    layout: 'border',

    header: {
        xtype: 'k-panel-header',
        logoUrl: 'classic/resources/img/bfs-logo-75pct.png',
        logoHeight: 58,
        logoWidth: 150,
        logoMargin: '5 10 5 10',
        logoAltText: 'Logo Bundesamt für Strahlenschutz',
        additionalItems: []
    },

    responsiveConfig: {
        wide: {
            headerPosition: 'top'
        }
    },

    /**
     * open help window initially if user is neither "ruf", "imis" nor "bfs"
     * delay is necessary otherwise treelist.store is not ready for .setSelection()
     */
    listeners: {
        beforerender: {
            fn: function() {
                var headerTitle = Koala.util.AppContext.getMergedDataByKey('headerTitle');
                if (headerTitle) {
                    if (Koala.util.AppContext.getMergedDataByKey('imis_user').uid === 'hoe-fr') {
                        headerTitle = 'Höbler-GIS';
                    }
                    this.header.down('title').setText(headerTitle);
                } else {
                    this.header.down('title').setBind({text: '{headerTitle}'});
                }
            },
            delay: 500
        },
        afterrender: {
            fn: function() {
                var hideHelpWindow = Koala.util.LocalStorage.showHelpWindowOnStartup();
                if (!Koala.util.AppContext.intersectsImisRoles(['ruf', 'imis', 'bfs']) && !hideHelpWindow) {
                    var helpWin = Ext.create('Koala.view.window.HelpWindow').show();
                    helpWin.on('afterlayout', function() {
                        var helpWinController = this.getController();
                        helpWinController.setTopic('preface');
                    }, helpWin, {single: true});
                }
            },
            delay: 500
        }
    },

    items: [{
        xtype: 'basigx-panel-mapcontainer',
        title: 'K-MapPanel',
        region: 'center',
        mapComponentConfig: {
            xtype: 'k-component-map',
            appContextPath: Koala.appContextUrl || 'resources/appContext.json',
            plugins: [{
                ptype: 'hoverBfS',
                selectMulti: true,
                selectEventOrigin: 'interaction',
                maxHeight: 500,
                className: 'ol-overlay-container ol-selectable k-feature-hover'
            }]
        },
        toolbarConfig: {
            items: [{
                xtype: 'basigx-button-zoomin'
            }, {
                xtype: 'basigx-button-zoomout'
            }, {
                xtype: 'basigx-button-zoomtoextent'
            }, {
                xtype: 'k-button-showredliningtoolscontainer'
            }, {
                xtype: 'k-button-togglefullscreen'
            },{
                xtype: 'k-button-permalink'
            }, {
                xtype: 'k-button-selectfeatures',
                listeners: {
                    boxready: Koala.util.AppContext.generateCheckToolVisibility('selectFeaturesBtn')
                }
            },{
                xtype: 'k-button-backgroundlayers'
            }
            ]
        },
        listeners: {
            afterrender: function() {
                if (!location.hash) {
                    var lyrSetWin = Ext.create('Koala.view.window.LayerSetChooserWindow');

                    var hideHelpWindow = Koala.util.LocalStorage.showHelpWindowOnStartup();
                    if (!Koala.util.AppContext.intersectsImisRoles(['ruf', 'imis', 'bfs']) && !hideHelpWindow) {
                        lyrSetWin.setHelpTxt(true);
                    }

                    var hideWindow = Koala.util.LocalStorage.showLayersetChooserWindowOnStartup();
                    if (!hideWindow) {
                        lyrSetWin.show();
                    }
                }
                // This needs to happen in an afterrender handler, as
                // otherwise the BasiGX texts would count…
                var toggleOverviewBtnSel = 'button[' +
                    'helpKey="basigx-overview-map-button"' +
                    ']';
                var btn = Ext.ComponentQuery.query(toggleOverviewBtnSel)[0];
                btn.setBind({
                    tooltip: '{toogleOverviewBtnTooltip}'
                });

                // Bind the tooltops of certain map button
                // TODO refactor BasiGX to do this in a more sane way
                var btnSelectors = [
                    'basigx-button-zoomin',
                    'basigx-button-zoomout',
                    'basigx-button-zoomtoextent',
                    'basigx-button-togglelegend',
                    'k-button-togglefullscreen'
                ];
                var btns = this.query(btnSelectors.join(','));
                Ext.each(btns, function(b) {
                    var btnXtype = b.xtype;
                    b.setBind({
                        tooltip: '{' + btnXtype + '-tooltip}'
                    });
                });
            }
        },
        // define menu items
        menuConfig: {
            bodyPadding: 0,
            resizable: true,
            resizeHandles: 's se e',
            constrain: true,
            minWidth: 220,
            maxWidth: 700,
            hideCollapseTool: false,
            collapseDirection: 'top',
            header: {
                overCls: 'k-over-clickable'
            },
            dockedItems: [{
                xtype: 'buttongroup',
                columns: 3,
                bind: {
                    title: '{buttonGroupTopTitle}'
                },
                dock: 'top',
                defaults: {
                    scale: 'small'
                },
                items: [{
                    xtype: 'button',
                    glyph: 'xf0ac@FontAwesome',
                    bind: {
                        text: '{addWmsButtonText}',
                        tooltip: '{addWmsButtonTooltip}'
                    },
                    listeners: {
                        boxready: Koala.util.AppContext.generateCheckToolVisibility('addWmsBtn')
                    },
                    handler: function() {
                        var win = Ext.ComponentQuery.query(
                            '[name=add-wms-window]')[0];
                        if (!win) {
                            Ext.create('Ext.window.Window', {
                                name: 'add-wms-window',
                                title: 'WMS hinzufügen',
                                width: 500,
                                height: 450,
                                layout: 'fit',
                                tools: [{
                                    type: 'help',
                                    bind: {
                                        tooltip: '{helpTooltip}'
                                    },
                                    callback: function() {
                                        Koala.util.Help.showHelpWindow('toolsWms', 'tools');
                                    }
                                }],
                                items: [{
                                    xtype: 'basigx-form-addwms',
                                    hasCheckAllBtn: true,
                                    hasUncheckAllBtn: true,
                                    includeSubLayer: true,
                                    versionsWmsAutomatically: true,
                                    defaultUrl: BasiGX.util.Application.getAppContext().wmsUrls[0],
                                    wmsBaseUrls: BasiGX.util.Application.getAppContext().wmsUrls,
                                    listeners: {
                                        beforewmsadd: function(olLayer) {
                                            olLayer.set('nameWithSuffix', olLayer.get('name'));
                                            olLayer.set('allowRemoval', true);
                                        }
                                    }
                                }]
                            }).show();
                        } else {
                            BasiGX.util.Animate.shake(win);
                        }
                    }
                }, {
                    xtype: 'button',
                    glyph: 'xf02f@FontAwesome',
                    bind: {
                        text: '{printButtonText}',
                        tooltip: '{printButtonTooltip}'
                    },
                    listeners: {
                        boxready: Koala.util.AppContext.generateCheckToolVisibility('printBtn')
                    },
                    handler: function(btn) {
                        var win = Ext.ComponentQuery.query('k-window-print')[0];
                        if (!win) {
                            Ext.create('Koala.view.window.Print')
                                .showBy(btn.up('basigx-panel-menu'), 'tr');
                        } else {
                            BasiGX.util.Animate.shake(win);
                        }
                    }
                }, {
                    xtype: 'button',
                    glyph: 'xf093@FontAwesome',
                    bind: {
                        text: '{importLocalDataButtonText}',
                        tooltip: '{importLocalDataButtonTooltip}'
                    },
                    listeners: {
                        boxready: Koala.util.AppContext.generateCheckToolVisibility('importLocalDataBtn')
                    },
                    handler: function() {
                        var win = Ext.ComponentQuery.query(
                            '[name=add-wms-window]')[0];
                        if (!win) {
                            Ext.create('Ext.window.Window', {
                                name: 'add-wms-window',
                                bind: {
                                    title: '{importLocalDataButtonText}'
                                },
                                layout: 'fit',
                                tools: [{
                                    type: 'help',
                                    bind: {
                                        tooltip: '{helpTooltip}'
                                    },
                                    callback: function() {
                                        Koala.util.Help.showHelpWindow('toolsImport', 'tools');
                                    }
                                }],
                                items: [{
                                    xtype: 'k-form-importLocalData'
                                }]
                            }).show();
                        } else {
                            BasiGX.util.Animate.shake(win);
                        }
                    }
                }]
            }],
            items: [
                // Add an empty hidden panel to be able to collapse the last
                // accordion item
                {
                    xtype: 'panel',
                    hidden: true
                },
                {
                    xtype: 'k-panel-themetree',
                    collapsed: false
                }
            ]
        },
        legendPanelConfig: {
            xtype: 'k-panel-routing-legendtree',
            hideCollapseTool: false,
            resizable: true,
            constrain: true,
            resizeHandles: 'w nw n',
            collapsed: false,
            width: 300,
            minWidth: 250,
            maxWidth: 700,
            listeners: {
                afterrender: {
                    fn: 'resizeAndRepositionLegendTree',
                    single: true,
                    delay: 100
                },
                resize: 'repositionAttribution'
            }
        },
        additionalItems: [{
            xtype: 'k-panel-layersetchooser',
            hidden: true,
            x: 300,
            y: 0,
            floating: true,
            resizable: true
        }]
    }],

    /**
     *
     */
    constructor: function(config) {
        var me = this;

        me.header.additionalItems = me.getAdditionalHeaderItems();

        me.callParent([config]);
    },

    /**
     *
     */
    getAdditionalHeaderItems: function() {
        var title = {
            xtype: 'title',
            textAlign: 'center',
            autoEl: {
                tag: 'a',
                href: null
            },
            cls: 'k-application-title',
            initComponent: function() {
                var menuPanel = Ext.ComponentQuery.query('basigx-panel-menu')[0],
                    titleWidth = menuPanel.width || 300;
                this.setWidth(titleWidth);
            }
        };

        var searchFieldCombo = {
            xtype: 'k-form-field-searchcombo',
            flex: 1
        };

        var clearSearchButton = {
            xtype: 'button',
            glyph: 'xf057@FontAwesome',
            style: {
                borderRadius: 0
            },
            handler: function(btn) {
                btn.up().down('k-form-field-searchcombo').clearValue();
                var multiSearchPanel = this.up('k-panel-header')
                    .down('k-panel-multisearch');
                if (multiSearchPanel) {
                    multiSearchPanel.hide();
                }
            }
        };

        var multiSearchPanel = {
            xtype: 'k-panel-multisearch',
            width: 600,
            x: 0,
            y: 60,
            hidden: true,
            border: true,
            floating: true
        };

        var searchContainer = {
            xtype: 'container',
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'center',
                pack: 'left'
            },
            items: [searchFieldCombo, clearSearchButton, multiSearchPanel]
        };

        var headerToolbar = {
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'center',
                pack: 'right'
            },
            items: {
                xtype: 'k-toolbar-header'
            }
        };

        return [title, searchContainer, headerToolbar];
    }
});
