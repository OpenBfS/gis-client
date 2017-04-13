Ext.define('Koala.view.container.styler.ScaleDenominatorController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.container.styler.scaledenominator',

    /**
     *
     */
    onBoxReady: function() {
        var viewModel = this.getViewModel();
        var scaleDenominatorFromRule = viewModel.get('rule').getScaleDenominator();
        viewModel.set('scaleDenominator', scaleDenominatorFromRule);
        // this.setScaleDenominatorComponents();
        this.applyListeners();
    },

    /**
     *
     */
    applyListeners: function() {
        var view = this.getView();
        var viewModel = this.getViewModel();
        var fields = view.query('field');

        Ext.each(fields, function(field) {
            field.on('change', function() {
                var values = {};
                Ext.each(fields, function(f) {
                    if (f.name !== 'useScaleDenominatorCheckbox') {
                        values[f.name] = f.getValue();
                    }
                });

                view.fireEvent('scaledenominatorchanged', viewModel.get('scaleDenominator'));
            });
        });
    },

    // /**
    //  *
    //  */
    // setScaleDenominatorComponents: function() {
    //     var me = this;
    //     var scaleDenominator = me.getViewModel().get('scaleDenominator');
    //     this.addScaleDenominator(scaleDenominator);
    // },
    //
    // /**
    //  *
    //  */
    // addScaleDenominator: function(scaleDenominator) {
    //     var me = this;
    //     var view = me.getView();
    //     var combo = view.down('combo[name="operatorCombo"]');
    //     var fieldset = view.down('fieldset[name="scaledenominator-fieldset"]');
    //
    //     // TODO refactor
    //     if(scaleDenominator){
    //         // var operator = scaleDenominator.comparisonOps.name.localPart;
    //         // combo.setValue(operator);
    //         // fieldset.expand();
    //     }
    // },

    /**
     *
     */
    operatorComboChanged: function(combo, newValue) {
        var view = this.getView();
        var viewModel = this.getViewModel();
        var literalNumberField1 = view.down(
                'numberfield[name="literalNumberField1"]');
        var literalNumberField2 = view.down(
                'numberfield[name="literalNumberField2"]');

        switch (newValue) {
            case 'ScaleIsBetween':
                literalNumberField1.show();
                literalNumberField2.show();
                viewModel.set('literalNumberField2Label', 'Upper boundary');
                break;
            case 'ScaleIsLessThan':
            case 'ScaleIsLessThanOrEqualTo':
            case 'ScaleIsGreaterThan':
            case 'ScaleIsGreaterThanOrEqualTo':
                literalNumberField2.show();
                literalNumberField1.hide();
                viewModel.set('literalNumberField2Label', 'Boundary');
                break;
            default:
                break;
        }
    }

});
