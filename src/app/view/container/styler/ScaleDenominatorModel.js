Ext.define('Koala.view.container.styler.ScaleDenominatorModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.container.styler.scaledenominator',

    data: {
        scaleDenominator: Ext.create('Koala.model.StyleScaleDenominator'),
        title: 'Use ScaleDenominator',
        operatorComboLabel: 'Operator',
        literalNumberField1Label: 'Lower boundary',
        literalNumberField2Label: 'Upper boundary'
    }

});
