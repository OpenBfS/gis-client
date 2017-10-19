Ext.define('Koala.view.panel.MobileHelp',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobilehelp',

    requires: [
        'Koala.view.panel.MobileHelpController',
        'Koala.view.panel.MobileHelpModel'
    ],

    controller: 'k-panel-mobilehelp',
    viewModel: {
        type: 'k-panel-mobilehelp'
    },

    closeToolAlign: 'left',

    bind: {
        title: '{title}'
    },

    scrollable: 'y',

    items: [{
        xtype: 'fieldset',
        padding: 5,
        bind: {
            title: '{helpPrefaceTitle}',
            html: '{helpPrefaceHtml}'
        }
    }, {
        xtype: 'fieldset',
        padding: 5,
        bind: {
            title: '{helpQuickRefTitle}',
            html: '{helpQuickRefHtml}'
        }
    }, {
        xtype: 'fieldset',
        padding: 5,
        bind: {
            title: '{helpMapTitle}',
            html: '{helpMapHtml}'
        }
    }, {
        xtype: 'fieldset',
        padding: 5,
        bind: {
            title: '{helpMenuTitle}',
            html: '{helpMenuHtml}'
        }
    }, {
        xtype: 'fieldset',
        padding: 5,
        bind: {
            title: '{helpNavigationTitle}',
            html: '{helpNavigationHtml}'
        }
    }, {
        xtype: 'fieldset',
        padding: 5,
        bind: {
            title: '{helpLegendTitle}',
            html: '{helpLegendHtml}'
        }
    }, {
        xtype: 'fieldset',
        padding: 5,
        bind: {
            title: '{helpSoftwareVersionTitle}',
            html: (Ext.manifest) ? Ext.manifest.version : '{helpSoftwareVersionHtml}'
        }
    }]
});
