Ext.define('Koala.view.main.Main', {
    extend: 'Ext.Panel',
    xtype: 'app-main',

    requires: [
        'BasiGX.view.component.Map',

        "BasiGX.view.button.ZoomIn",
        "BasiGX.view.button.ZoomOut",
        "BasiGX.view.button.ZoomToExtent",

        'Koala.view.button.Hamburger',
        'Koala.view.button.MobileAddLayer',
        'Koala.view.button.MobileShowLegend',

        'Koala.view.container.MobileLegend',
        'Koala.view.container.MobileAddLayer',
        'Koala.view.container.MobileMenu'
    ],

    defaults: {
        styleHtmlContent: true
    },

    layout: {
        type: 'card'
    },

    items: [{
        title: 'Map',
        name: 'mapcontainer',
        // iconCls: 'x-fa fa-map-marker',
        items: [{
            xtype: 'basigx-component-map',
            appContextPath: 'resources/appContext.json',
            height: '100%'
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
            xtype: 'k-button-hamburger',
            style: {
                top: '20px',
                position: 'absolute',
                left: '20px'
            }
        }, {
            xtype: 'k-button-mobileshowlegend',
            style: {
                bottom: '20px',
                position: 'absolute',
                right: '20px'
            }
        }]
    }, {
        xtype: 'k-container-mobileaddlayer'
    }]
});
