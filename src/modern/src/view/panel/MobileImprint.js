Ext.define('Koala.view.panel.MobileImprint',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobileimprint',

    requires: [
        'Koala.view.panel.MobileImprintController',
        'Koala.view.panel.MobileImprintModel'
    ],

    controller: 'k-panel-mobileimprint',
    viewModel: {
        type: 'k-panel-mobileimprint'
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
            title: '{helpScaleBarTitle}',
            html: '{helpScaleBarHtml}'
        }
    }]
});
