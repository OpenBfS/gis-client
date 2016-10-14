Ext.define('Koala.view.container.styler.Styler', {
    extend: 'Ext.panel.Panel',
    xtype: 'k_container_styler_styler',

    requires: [
        'Koala.view.container.styler.StylerController',
        'Koala.view.container.styler.StylerModel'
    ],

    controller: 'container.styler.styler',
    viewModel: {
        type: 'container.styler.styler'
    },

    scrollable: 'vertical',

    bbar: {
        reference: 'styler-toolbar',
        items: [{
            xtype: 'button',
            bind: {
                text: '{btnTextReloadCurrentStyle}'
            },
            handler: 'reloadCurrentStyle'
        },
        '->',
        {
            xtype: 'button',
            bind: {
                text: '{btnTextApplyAndSave}'
            },
            handler: 'applyAndSave'
        }]
    },

    listeners: {
        boxready: 'onBoxReady'
    }

});
