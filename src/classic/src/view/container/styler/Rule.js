Ext.define('Koala.view.container.styler.Rule', {
    extend: 'Ext.container.Container',
    xtype: 'k_container_styler_rule',

    requires: [
        'Koala.view.container.styler.RuleController',
        'Koala.view.container.styler.RuleModel',

        'Koala.view.container.styler.Filter',
        'Koala.view.container.styler.Symbolizer'
    ],

    controller: 'container.styler.rule',
    viewModel: {
        type: 'container.styler.rule'
    },

    bodyStyle: {
        background: '#f6f6f6'
    },

    listeners: {
        boxready: 'onBoxReady'
    }

});
