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
        'Koala.view.list.TreeMenu',
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

    responsiveConfig: {
        wide: {
            headerPosition: 'top'
        }
    },

    /**
     * delay is necessary otherwise treelist.store is not ready for .setSelection()
     */
    listeners: {
        beforerender: {
            fn: function() {
                var mapComp = BasiGX.view.component.Map.guess();
                var me = this;
                mapComp.on('afterrender', function() {
                    var headerTitle = Koala.util.AppContext.getMergedDataByKey('headerTitle');
                    var header = me.down('k-panel-header');
                    if (headerTitle) {
                        if (Koala.util.AppContext.getMergedDataByKey('imis_user').uid === 'hoe-fr') {
                            headerTitle = 'Höbler-GIS';
                        }
                        header.getViewModel().set('headerTitle', headerTitle);
                    } else {
                        header.down('title').setBind({text: '{headerTitle}'});
                    }
                    document.title = headerTitle + ' | Bundesamt für Strahlenschutz';
                    Ext.create('Koala.view.window.ElanScenarioWindow');

                    me.getController().initElanScenarios();
                });
            }
        }
    },

    items: [{
        xtype: 'k-panel-header',
        region: 'north',
        height: 67,
        weight: 100
    }, {
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
                xtype: 'basigx-button-zoomin',
                componentCls: 'k-navigation-button'
            }, {
                xtype: 'basigx-button-zoomout',
                componentCls: 'k-navigation-button'
            }, {
                xtype: 'basigx-button-zoomtoextent',
                componentCls: 'k-navigation-button'
            }, {
                xtype: 'k-button-selectfeatures',
                hidden: true // UI moved to TreeMenu. Logic kept in hidden button
            },{
                xtype: 'k-button-backgroundlayers'
            }]
        },
        listeners: {
            afterrender: function() {
                var hideHelpWindow = Koala.util.LocalStorage.showHelpWindowOnStartup();
                if (!location.hash) {
                    var lyrSetWin = Ext.create('Koala.view.window.LayerSetChooserWindow');

                    if (!Koala.util.AppContext.intersectsImisRoles(['ruf', 'imis', 'bfs']) && !hideHelpWindow) {
                        lyrSetWin.setHelpTxt(true);
                    }

                    ////deactivate until window can be personalized
                    //var hideWindow = Koala.util.LocalStorage.showLayersetChooserWindowOnStartup();
                    var hideWindow = true;
                    if (!hideWindow) {
                        lyrSetWin.show();
                    }
                }
                // open help window initially if user is neither "ruf", "imis" nor "bfs"
                if (!Koala.util.AppContext.intersectsImisRoles(['ruf', 'imis', 'bfs']) && !hideHelpWindow) {
                    var helpWin = Ext.create('Koala.view.window.HelpWindow').show();
                    helpWin.on('afterlayout', function() {
                        var helpWinController = helpWin.getController();
                        helpWinController.setTopic('preface');
                    }, helpWin, {single: true});
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
            xtype: 'k-panel-themetree',
            cls: 'k-panel-themetree',
            bodyPadding: 0,
            resizable: true,
            resizeHandles: 's e se'
        },
        // If removed BasiGX adds a panel automaticaly
        legendPanelConfig: {
            xtype: 'panel',
            hidden: true
        },
        additionalItems: [{
            xtype: 'k-panel-layersetchooser',
            hidden: true,
            x: 300,
            y: 0,
            floating: true,
            resizable: true
        }]
    }, {
        region: 'east',
        cls: 'east-container',
        xtype: 'k-panel-routing-legendtree',
        hideCollapseTool: false,
        resizable: true,
        collapsed: false,
        weight: 0
    }, {
        region: 'west',
        xtype: 'k-treemenu',
        weight: 200
    }, {
        xtype: 'container',
        region: 'south',
        layout: 'fit',
        resizable: true,
        resizeHandles: 'n',
        name: 'south-container',
        cls: 'south-container',
        weight: -100,
        hidden: true
    }]

});
