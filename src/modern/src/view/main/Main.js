Ext.define('Koala.view.main.Main', {
    extend: 'Ext.Panel',
    xtype: 'app-main',

    requires: [
        'BasiGX.view.component.Map',

        "BasiGX.view.button.ZoomIn",
        "BasiGX.view.button.ZoomOut",
        "BasiGX.view.button.ZoomToExtent",

        'Koala.view.panel.MobileLegend',
        'Koala.view.panel.MobileAddLayer',
        'Koala.view.panel.MobileMenu'
    ],

    defaults: {
        styleHtmlContent: true
    },

    layout: {
        type: 'float'
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
            appContextPath: 'resources/appContext.json',
            height: '100%',
            listeners: {
                painted: function(mapComponent){
                    var map = this.getMap();
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
            }]
        }, {
            xtype: 'button',
            iconCls: 'fa fa-bars fa-2x',
            style: {
                position: 'absolute',
                top: '20px',
                left: '20px'
            },
            handler: function(btn){
                btn.up('app-main').down('k-panel-mobilemenu').show();
            }
        }, {
            xtype: 'button',
            iconCls: 'fa fa-list-alt fa-2x',
            style: {
                position: 'absolute',
                bottom: '40px',
                right: '20px'
            },
            handler: function(btn){
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
        xtype: 'k-panel-mobileaddlayer',
        left: 0,
        hidden: true
    }]
});
