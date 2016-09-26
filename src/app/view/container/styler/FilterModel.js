Ext.define('Koala.view.container.styler.FilterModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.container.styler.filter',

    data: {
        title: 'Use Filter',
        attributeComboLabel: 'Attribute',
        operatorComboLabel: 'Operator',
        literalNumberField1Label: 'Lower boundary',
        literalNumberField2Label: 'Value',
        literalTextFieldLabel: 'Is like pattern'
    }

});
