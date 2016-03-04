/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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

        'BasiGX.plugin.Hover',
        'BasiGX.view.panel.Header',
        'BasiGX.view.panel.MapContainer',
        'BasiGX.util.Animate',

        'Koala.view.chart.TimeSeries',
        'Koala.view.main.MainController',
        'Koala.view.main.MainModel',
        'Koala.view.window.Print'
    ],

    controller: 'main',
    viewModel: {
        type: "app-main"
    },

    ui: 'navigation',

    layout: 'border',

    header: {
        xtype: 'basigx-panel-header',
        logoUrl: 'classic/resources/img/bfs-logo.png',
        logoHeight: 78,
        logoAltText: 'Logo Bundesamt für Strahlenschutz',
        additionalItems: []
    },

    responsiveConfig: {
        wide: {
            headerPosition: 'top'
        }
    },

    items: [{
        xtype: 'basigx-panel-mapcontainer',
        title: 'K-MapPanel',
        region: 'center',
        mapComponentConfig: {
            xtype: 'k-component-map',
            plugins: [{
                ptype: 'hover',
                selectMulti: true,
                selectEventOrigin: 'interaction'
            }]
        },
        listeners: {
            afterrender: function(){
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
                    "basigx-button-zoomin",
                    "basigx-button-zoomout",
                    "basigx-button-zoomtoextent",
                    "basigx-button-togglelegend"
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
            dockedItems: [{
                xtype: 'buttongroup',
                columns: 2,
                bind: {
                    title: '{buttonGroupTopTitle}'
                },
                dock: 'top',
                defaults: {
                    scale: 'small',
                    width: 100
                },
                items: [{
                    xtype: 'basigx-button-addwms',
                    glyph: 'xf0ac@FontAwesome',
                    listeners: {
                        // This needs to happen in an afterrender handler, as
                        // otherwise the BasiGX texts would count…
                        afterrender: function(btn){
                            btn.setBind({
                                text: '{addWmsButtonText}',
                                tooltip: '{addWmsButtonTooltip}'
                            });
                        }
                    }
                }, {
                    xtype: 'button',
                    glyph: 'xf02f@FontAwesome',
                    bind: {
                        text: '{printButtonText}',
                        tooltip: '{printButtonTooltip}'
                    },
                    handler: function(btn){
                        var win = Ext.ComponentQuery.query('k-window-print')[0];
                        if(!win){
                            Ext.create('Koala.view.window.Print')
                            .showBy(btn.up('basigx-panel-menu'), 'tr');
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
                    xtype: 'k-panel-themetree'
                }
            ]
        },
        legendPanelConfig: {
            xtype: 'k-panel-routing-legendtree',
            resizable: true,
            listeners: {
                afterrender: {
                    fn: 'resizeLegendTreeToMaxHeight',
                    single: true,
                    delay: 100
                }
            }
        },
        additionalItems: [{
            xtype: 'k-panel-layersetchooser',
            hidden: true,
            x: 300,
            y: 0,
            floating: true,
            resizeHandles: 'se',
            resizable: true
        }]
    }],

    /**
     *
     */
    constructor: function(config) {
        var me = this;

        me.header.additionalItems = me.getAdditionalHeaderItems();

        this.callParent([config]);
    },

    /**
     *
     */
    getAdditionalHeaderItems: function() {
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
            handler: function(btn){
                btn.up().down('k-form-field-searchcombo').clearValue();
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

        return [searchContainer, headerToolbar];
    }
});
