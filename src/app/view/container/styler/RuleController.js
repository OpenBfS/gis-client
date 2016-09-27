Ext.define('Koala.view.container.styler.RuleController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.container.styler.rule',

    /**
     *
     */
    onBoxReady: function(){
        var me = this;
        var view = me.getView();
        var rule = me.getViewModel().get('rule');

        var hasFilter = !!rule.getFilter();
        var hasSymbolizer = !!rule.getSymbolizer();
        var hasScaleDenominator = !!rule.getScaleDenominator();

        if(!hasFilter){
            rule.setFilter(Ext.create('Koala.model.StyleFilter'));
        }
        if(!hasSymbolizer){
            rule.setSymbolizer(Ext.create('Koala.model.StyleSymbolizer'));
        }
        if(!hasScaleDenominator){
            rule.setScaleDenominator(Ext.create('Koala.model.StyleScaleDenominator'));
        }

        me.initBaseFieldset();
        me.initComponents();

        if(hasFilter && rule.getFilter().get('operator')){
            var filterFieldset = view.down('fieldset[name="filter-fieldset"]');
            filterFieldset.expand();
        }
        if(hasScaleDenominator && rule.getScaleDenominator().get('operator')){
            var scaleDenominatorFieldset = view.down('fieldset[name="scaledenominator-fieldset"]');
            scaleDenominatorFieldset.expand();
        }
    },

    /**
     *
     */
    initBaseFieldset: function(){
        var view = this.getView();
        var viewModel = this.getViewModel();

        view.add({
            xtype: 'fieldset',
            title: viewModel.get('titlePrefix'),
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
                items: [{
                    xtype: 'button',
                    bind: {
                        text: '{removeRuleButtonText}',
                        iconCls: '{removeRuleButtonIconCls}'
                    },
                    handler: 'removeRule'
                }]
            }]
        });
    },

    /**
     *
     */
    initComponents: function() {
        var view = this.getView();
        var viewModel = this.getViewModel();
        var rule = viewModel.get('rule');

        view.down('fieldset').add({
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
                xtype: 'container',
                flex: 3,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [{
                    xtype: 'k_container_styler_scaledenominator',
                    viewModel: {
                        data: {
                            scaleDenominator: rule.getScaleDenominator()
                        }
                    },
                    margin: '0 10px',
                    listeners: {
                        scaledenominatorchanged: 'onScaleDenominatorChanged'
                    }
                }, {
                    xtype: 'k_container_styler_filter',
                    viewModel: {
                        data: {
                            filter: rule.getFilter()
                        }
                    },
                    margin: '0 10px',
                    listeners: {
                        filterchanged: 'onFilterChanged'
                    }
                }]
            }]
        });
    },

    /**
     *
     */
    removeRule: function(){
        var view = this.getView();
        var viewModel = this.getViewModel();
        var rulesPanel = view.up('k_container_styler_rules');

        var rules = viewModel.get('style.rules');
        var rule = viewModel.get('rule');

        if(rules.getCount() > 1){
            rulesPanel.remove(view);
            rules.remove(rule);
            view.fireEvent('rulechanged', rule);
        } else {
            Ext.toast('At least one rule is required.');
        }
    },

    /**
     *
     */
    onOlStyleChanged: function(){
        var view = this.getView();
        var viewModel = this.getViewModel();
        var rule = viewModel.get('rule');
        view.fireEvent('rulechanged', rule);
    },

    /**
     *
     */
    onFilterChanged: function(filter){
        var view = this.getView();
        var viewModel = this.getViewModel();
        var rule = viewModel.get('rule');
        var filterCheckbox = view.down('checkbox[name="useFilterCheckbox"]');

        if(rule && filter){
            if(filterCheckbox.checked){
                rule.setFilter(filter);
            } else {
                delete rule.setFilter(null);
            }
            view.fireEvent('rulechanged', rule);
        }
    },

    /**
     *
     */
    onScaleDenominatorChanged: function(scaleDenominator){
        var view = this.getView();
        var viewModel = this.getViewModel();
        var rule = viewModel.get('rule');
        var scaleDenominatorCheckbox = view.down('checkbox[name="useScaleDenominatorCheckbox"]');

        if(rule && scaleDenominator){
            if(scaleDenominatorCheckbox.checked){
                rule.setScaleDenominator(scaleDenominator);
            } else {
                delete rule.setScaleDenominator(null);
            }
            view.fireEvent('rulechanged', rule);
        }
    }

});
