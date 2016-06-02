Ext.define('Koala.view.main.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'app-main',

    requires: [
        'BasiGX.view.component.Map',

        "BasiGX.view.button.ZoomIn",
        "BasiGX.view.button.ZoomOut",
        "BasiGX.view.button.ZoomToExtent",

        'Koala.view.button.Hamburger'
    ],

    fullscreen: true,
    tabBarPosition: 'bottom',

    defaults: {
        styleHtmlContent: true
    },

    items: [
        {
            title: 'Home',
            iconCls: 'home',
            html: 'Home Screen'
        },
        {
            title: 'Contact',
            iconCls: 'user',
            html: 'Contact Screen'
        },
        {
            title: 'GeoExt3 OL3 Map',
            iconCls: 'x-fa fa-map-marker',
            layout: 'fit',
            items: [{
                xtype: 'basigx-component-map',
                appContextPath: 'resources/appContext.json',
                height: '300px'

            },
            {
                xtype: 'toolbar',
                vertical: true,
                width: 50,
                cls: 'basigx-map-tools',
                x: 0,
                y: 0,
                style: {
                    top: '20px',
                    position: 'absolute'
                },
                defaults: {
                    scale: 'large'
                },
                items: [

                    {
                        xtype: 'basigx-button-zoomin'
                    }, {
                        xtype: 'basigx-button-zoomout'
                    }, {
                        xtype: 'basigx-button-zoomtoextent'
                    }
                ]
            },
            {
                xtype: 'toolbar',
                vertical: true,
                width: 50,
                cls: 'koala-hamburger-toolbar',
                x: 0,
                y: 0,
                style: {
                    top: '20px',
                    position: 'absolute',
                    left: '20px'
                },
                defaults: {
                    scale: 'large'
                },
                items: [
                    {
                        xtype: 'k-button-hamburger'
                    }
                ]
            },
            {
                xtype: 'toolbar',
                vertical: true,
                width: 50,
                cls: 'koala-mobilelegend-toolbar',
                x: 0,
                y: 0,
                style: {
                    bottom: '20px',
                    position: 'absolute',
                    right: '0'
                },
                defaults: {
                    scale: 'large'
                },
                items: [
                    {
                        xtype: 'k-button-mobilelegend'
                    }
                ]
            }]
        }
    ]
});
