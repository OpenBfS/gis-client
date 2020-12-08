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
 * @class Koala.view.main.Main
 */
Ext.define('Koala.view.main.Main', {
    extend: 'Ext.Panel',
    xtype: 'app-main',

    requires: [
        'Koala.view.container.LockableCarousel',
        'Koala.view.main.MobileMainModel',
        'Koala.view.main.MobileMainController',

        'BasiGX.view.component.Map',

        'BasiGX.view.button.ZoomIn',
        'BasiGX.view.button.ZoomOut',
        'BasiGX.view.button.ZoomToExtent',

        'Koala.view.form.LayerFilter',

        'Koala.util.Carto',
        'Koala.util.Routing',
        'Koala.util.Fullscreen',

        'Koala.view.form.RodosFilter',
        'Koala.view.panel.BarChart',
        'Koala.view.panel.MobilePanel',
        'Koala.view.panel.MobileLegend',
        'Koala.view.panel.MobileAddLayer',
        'Koala.view.panel.MobileMenu',
        'Koala.view.panel.MobileHelp',
        'Koala.view.panel.MobileImprint',
        'Koala.view.panel.LayerSetTree',
        'Koala.view.panel.MobilePermalink',
        'Koala.view.panel.Settings',
        'Koala.view.panel.TimeseriesChart',
        'Koala.view.panel.MobileEvents',
        'Koala.view.panel.MobileRouting',
        'Koala.view.container.RoutingResult'
    ],

    controller: 'mobile-main',
    viewModel: {
        type: 'mobile-main'
    },

    defaults: {
        styleHtmlContent: true
    },

    layout: {
        type: 'float'
    },

    listeners: {
        painted: 'onMainPanelPainted',
        initialize: function() {
            this.getController().initElanScenarios();
        }
    },

    items: [{
        title: 'Map',
        name: 'mapcontainer',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        items: [{
            xtype: 'basigx-component-map',
            appContextPath: Koala.appContextUrl || 'resources/appContext.json',
            height: '100%',
            listeners: {
                painted: function() {
                    var me = this;
                    var map = me.getMap();

                    map.getControls().clear();

                    var attribution = new ol.control.Attribution({
                        collapsible: false,
                        logo: false,
                        target: document.querySelector('#footer')
                    });

                    var scaleLine = new ol.control.ScaleLine({
                        target: document.querySelector('#footer')
                    });

                    map.addControl(attribution);
                    map.addControl(scaleLine);
                }
            }
        }, {
            xtype: 'container',
            cls: 'imis-map-tools',
            layout: 'vbox',
            style: {
                top: '20px',
                right: '20px',
                position: 'absolute'
            },
            defaults: {
                margin: '0 0 5 0',
                scale: 'large'
            },
            items: [{
                xtype: 'basigx-button-zoomin'
            }, {
                xtype: 'basigx-button-zoomout'
            }, {
                xtype: 'basigx-button-zoomtoextent'
            }, {
                xtype: 'button',
                hidden: '{!fullscreenSupported}',
                html: '<i class="fa fa-expand fa-2x"></i>',
                handler: 'toggleFullscreen'
            }]
        }, {
            xtype: 'button',
            cls: 'imis-map-tools',
            html: '<i class="fa fa-bars fa-2x"></i>',
            style: {
                position: 'absolute',
                top: '20px',
                left: '20px'
            },
            handler: function(btn) {
                btn.up('app-main').down('k-panel-mobilemenu').show();
            }
        }, {
            xtype: 'button',
            cls: 'imis-map-tools',
            html: '<i class="fa fa-list-alt fa-2x"></i>',
            style: {
                position: 'absolute',
                bottom: '40px',
                right: '20px'
            },
            handler: function(btn) {
                btn.up('app-main').down('k-panel-mobilelegend').show();
            }
        }]
    }, {
        xtype: 'container',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '20px',
        id: 'footer'
    }, {
        xtype: 'k-panel-mobilelegend',
        right: 0,
        hidden: true,
        showAnimation: {
            direction: 'left'
        },
        hideAnimation: {
            type: 'slideOut',
            direction: 'right'
        }
    }, {
        xtype: 'k-panel-mobilemenu',
        left: 0,
        hidden: true
    }, {
        xtype: 'k-panel-mobilemetadatainfo',
        left: 0,
        hidden: true
    }, {
        xtype: 'k-panel-mobileaddlayer',
        left: 0,
        hidden: true
    }, {
        xtype: 'k-panel-mobilerouting',
        name: 'routing-panel',
        left: 0,
        hidden: true
    }, {
        xtype: 'k-container-routingresult',
        name: 'routing-result-panel',
        hidden: true
    }, {
        xtype: 'k-panel-mobilepermalink',
        left: 0,
        hidden: true
    }, {
        xtype: 'k-panel-settings',
        left: 0,
        hidden: true
    }, {
        xtype: 'k-panel-mobilehelp',
        left: 0,
        hidden: true
    }, {
        xtype: 'k-panel-mobileimprint',
        left: 0,
        hidden: true
    }, {
        xtype: 'k-panel-mobileevents',
        left: 0,
        hidden: true
    }, {
        xtype: 'k-panel-treepanel',
        left: 0,
        hidden: true
    }, {
        xtype: 'panel',
        name: 'cartopanel',
        header: false,
        modal: true,
        width: '100%',
        height: '100%',
        zIndex: 9998,
        hidden: true,
        items: [{
            xtype: 'lockable-carousel',
            name: 'cartocarousel',
            width: '100%',
            height: '100%',
            items: []
        }]
    }, {
        xtype: 'k-panel-mobilepanel',
        bind: {
            title: '{rodosPanelTitle}'
        },
        name: 'rodosContainer',
        left: 0,
        hidden: true,
        closeToolAlign: 'left',
        items: [{
            xtype: 'k-form-rodosfilter'
        }]
    }, {
        xtype: 'k-panel-mobilepanel',
        name: 'filterContainer',
        left: 0,
        hidden: true,
        scrollable: 'vertical',
        closeToolAlign: 'left'
    }],

    constructor: function() {
        this.callParent(arguments);
        var viewModel = this.getViewModel();
        viewModel.set('fullscreenSupported', Koala.util.Fullscreen.isFullscreenSupported());
    }
});
