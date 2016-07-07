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

    config: {
        /**
         * The route (template) to apply for this menu component.
         */
        route: 'menu/1/0/0/0/{0}'
    },

    bind: {
        title: '{title}'
    },

    listeners: {
        show: 'onShow',
        hide: 'onHide'
    },

    scrollable: 'y',

    items: [{
        xtype: 'fieldset',
        padding: 5,
        bind: {
            title: '{helpTitle}',
            html: '{helpHtml}'
        }
    }, {
        xtype: 'fieldset',
        padding: 5,
        bind: {
            title: '{imprintTitle}',
            html: '{imprintHtml}'
        }
    }]
});
