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

    layout: 'fit',

    initComponent: function() {
        var me = this;
        me.callParent();
        var rule = me.getViewModel().get('rule');

        if(!rule.getFilter()){
            rule.setFilter(Ext.create('Koala.model.StyleFilter'));
        }
        if(!rule.getSymbolizer()){
            rule.setSymbolizer(Ext.create('Koala.model.StyleSymbolizer'));
        }

        me.initBaseFieldset();
        me.initFilterSymbolizerComponents();
    },

    initBaseFieldset: function(){
        this.add({
            xtype: 'fieldset',
            title: this.getViewModel().get('titlePrefix'),
            bind: {
                title: '{titlePrefix} {fieldsetTitle}'
            },
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'center'
                },
                defaultType: 'textfield',
                items: [
                //     {
                //     fieldLabel: 'Name',
                //     labelAlign: 'right',
                //     bind: {
                //         value: '{rule.name}'
                //     },
                //     margin: '0 10px 0 0',
                //     flex: 1,
                //     listeners: {
                //         change: function(){
                //             var view = this.up('k_container_styler_rule');
                //             var rule = this.getViewModel().get('rule');
                //             view.fireEvent('rulechanged', rule);
                //         }
                //     }
                // },
                // {
                //     fieldLabel: 'Symbol Description',
                //     labelAlign: 'right',
                //     bind: {
                //         value: '{rule.title}'
                //     },
                //     margin: '0 10px 0 0',
                //     flex: 1,
                //     listeners: {
                //         change: function(){
                //             var view = this.up('k_container_styler_rule');
                //             var rule = this.getViewModel().get('rule');
                //             view.fireEvent('rulechanged', rule);
                //         }
                //     }
                // },
                {
                    xtype: 'button',
                    ui: 'mapmavin',
                    bind: {
                        text: '{removeRuleButtonText}',
                        iconCls: '{removeRuleButtonIconCls}'
                    },
                    handler: 'removeRule'
                }]
            }]
        });
    },

    initFilterSymbolizerComponents: function() {
        var viewModel = this.getViewModel();
        var rule = viewModel.get('rule');

        this.down('fieldset').add({
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            margin: '10px 0 0 0',
            items: [{
                xtype: 'k_container_styler_symbolizer',
                flex: 1,
                viewModel: {
                    data: {
                        symbolizer: rule.getSymbolizer()
                    }
                },
                listeners: {
                    olstylechanged: 'onOlStyleChanged'
                }
            },{
                xtype: 'k_container_styler_filter',
                viewModel: {
                    data: {
                        filter: rule.getFilter()
                    }
                },
                flex: 1,
                margin: '0 10px 0 0',
                listeners: {
                    filterchanged: 'onFilterChanged'
                }
            }]
        });
    }

});
