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

        'Basepackage.view.panel.Header',
        'Basepackage.view.panel.MapContainer',

        'Koala.view.chart.TimeSeries',
        'Koala.view.main.MainController',
        'Koala.view.main.MainModel',
        'Koala.view.window.Print'
    ],

    controller: 'main',
    viewModel: 'main',

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

    items: [
        {
            xtype: 'base-panel-mapcontainer',
            title: 'K-MapPanel',
            region: 'center',
            // we use our project specific map component
            mapComponentConfig: {
                xtype: 'k-component-map'
            },
            // define menu items
            menuConfig: {
                items: [
                    {
                        title: 'Teilen',
                        html: 'Panel content!'
                    },
                    {
                        xtype: 'base-form-print',
                        url: 'http://10.133.7.63/print-servlet-3.3-SNAPSHOT/print/'
                    },
                    {
                        title: 'Werkzeuge',
                        items: [{
                            xtype: 'base-button-addwms'
                        },{
                            xtype: 'button',
                            text: 'Kartendruck',
                            handler: function(){
                                Ext.create('Koala.view.window.Print').show();
                            }
                        }]
                    },
                    {
                        xtype: 'k-panel-themetree',
                        title: 'Auswahl',
                        tools:[{
                            type:'collapse',
                            bind: {tooltip: 'LayerSet wechseln'},
                            handler: 'toggleLayerSetView'
                        }]
                    }
                ]
            },
            legendPanelConfig: {
                xtype: 'k-panel-routing-legendtree'
            },
            additionalItems: [{
                xtype: 'k-panel-layersetchooser',
                x: 300,
                y: 0,
                floating: true,
                resizeHandles: 'se',
                resizable: true
            }]
        }
    ],

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
        var me = this;

        var searchFieldCombo = {
            xtype: 'k-form-field-searchcombo',
            width: 500
        };

        var clearSearchButton = {
            xtype: 'button',
            glyph:'xf057@FontAwesome',
            style: {
                borderRadius: 0
            },
            handler: function(btn, evt){
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
