Ext.define('Koala.view.container.styler.RuleModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.container.styler.rule',

    data: {
        titlePrefix: 'Feature Style Rule',
        removeRuleButtonText: 'Remove this rule',
        removeRuleButtonIconCls: 'fa fa-minus',
        oneRuleRequiredWarning: 'At least one rule is required.'
    },

    formulas: {
        fieldsetTitle: function(get) {
            var name = get('rule.name');
            var title = get('rule.title');
            var dsp = '';
            if (name) {
                dsp += name;
            }
            if (title) {
                dsp += ' (' + title + ')';
            }
            return dsp;
        }
    }

});
