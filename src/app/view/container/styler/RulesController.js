Ext.define('Koala.view.container.styler.RulesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.container.styler.rules',

    require: [
        'Koala.model.StyleRule'
    ],

    /**
     *
     */
    addRule: function(){
        var me = this;
        var view = this.getView();
        var viewModel = this.getViewModel();
        var rules = viewModel.get('style').rules();
        var rule = Ext.create('Koala.model.StyleRule');

        rules.add(rule);
        view.insert(0, {
            xtype: 'k_container_styler_rule',
            margin: 10,
            viewModel: {
                data: {
                    rule: rule
                }
            },
            listeners: {
                rulechanged: function(){
                    view.fireEvent('rulesChanged', rules);
                }
            }
        });
    }
});
