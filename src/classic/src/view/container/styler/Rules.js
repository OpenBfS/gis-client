Ext.define('Koala.view.container.styler.Rules', {
    extend: 'Ext.container.Container',
    xtype: 'k_container_styler_rules',

    requires: [
        'Koala.view.container.styler.Rule',
        'Koala.view.container.styler.RulesController',
        'Koala.view.container.styler.RulesModel'
    ],

    controller: 'container.styler.rules',
    viewModel: {
        type: 'container.styler.rules'
    },

    items: [{
        xtype: 'container',
        layout: {
            type: 'vbox',
            align: 'middle'
        },
        items: [{
            xtype: 'button',
            bind: {
                text: '{addRuleButtonText}',
                iconCls: '{addRuleButtonIconCls}'
            },
            handler: 'addRule'
        }]
    }],

    listeners: {
        boxready: 'onBoxReady'
    }

});
