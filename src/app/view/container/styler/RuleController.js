Ext.define('Koala.view.container.styler.RuleController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.container.styler.rule',

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
    onOlStyleChanged: function(olStyle){
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
    }

});
