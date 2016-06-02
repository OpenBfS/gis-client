Ext.define('Koala.view.main.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'app-main',

    requires: [
        'BasiGX.view.component.Map'
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
            }]
        }
    ]
});
