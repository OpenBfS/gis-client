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
        xtype: 'k-panel-mobilelegend',
        right: 0,
        top: 0,
        width: '80%',
        height: '100%',
        margin: 0,
        modal: true,
        hidden: true
    }]
});
