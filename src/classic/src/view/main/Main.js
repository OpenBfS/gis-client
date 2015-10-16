/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Koala.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',

        'Basepackage.plugin.Hover',
        'Basepackage.view.panel.Header',
        'Basepackage.view.panel.MapContainer',
        'Basepackage.util.Animate',

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
        xtype: 'base-panel-header',
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
        xtype: 'base-panel-mapcontainer',
        title: 'K-MapPanel',
        region: 'center',
        mapComponentConfig: {
            xtype: 'k-component-map',
            plugins: [{
                    ptype: 'hover'
            }]
        },
        // define menu items
        menuConfig: {
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
                    xtype: 'base-button-addwms',
                    glyph: 'xf0ac@FontAwesome',
                    viewModel: {
                        data: {
                            tooltip: '',
                            text: ''
                        }
                    }
                }, {
                    xtype: 'button',
                    glyph: 'xf02f@FontAwesome',
                    bind: {
                        text: '{printButtonText}'
                    },
                    handler: function(btn){
                        var win = Ext.ComponentQuery.query('k-window-print')[0];
                        if(!win){
                            Ext.create('Koala.view.window.Print')
                            .showBy(btn.up('base-panel-menu'), 'tr');
                        } else {
                            Basepackage.util.Animate.shake(win);
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
                }]
        },
        legendPanelConfig: {
            xtype: 'k-panel-routing-legendtree'
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
            width: 500
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
