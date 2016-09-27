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

    bodyStyle: {
        background: '#f6f6f6'
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

    initComponent: function() {
        var me = this;
        me.callParent();
        me.initRuleComponents();
    },

    initRuleComponents: function() {
        var me = this;
        var viewModel = me.getViewModel();
        var style = viewModel.get('style');
        var rules = style.rules();

        rules.each(function(rule) {
            me.add({
                xtype: 'k_container_styler_rule',
                margin: 10,
                viewModel: {
                    data: {
                        rule: rule
                    }
                },
                listeners: {
                    rulechanged: 'onRuleChanged'
                }
            });
        })
    }
});
