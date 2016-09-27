Ext.define('Koala.view.container.styler.ScaleDenominator', {
    extend: 'Ext.container.Container',
    xtype: 'k_container_styler_scaledenominator',

    requires: [
        'Koala.store.ScaleDenominatorOperators'
    ],

    controller: 'container.styler.scaledenominator',
    viewModel: {
        type: 'container.styler.scaledenominator'
    },

    listeners: {
        boxready: 'onBoxReady'
    },

    bodyStyle: {
        background: '#f6f6f6'
    },

    items: [{
        xtype: 'fieldset',
        height: 140,
        bind:{
            title: '{title}'
        },
        name: 'scaledenominator-fieldset',
        collapsed: true,
        checkboxToggle: true,
        checkboxName: 'useScaleDenominatorCheckbox',
        layout: {
            type: 'hbox',
            align: 'stretchmax'
        },
        defaults: {
            margin: '0 5px 0 5px',
            labelAlign: 'top'
        },
        items: [{
            xtype: 'numberfield',
            name: 'literalNumberField1',
            minValue: 0,
            step: 5000,
            bind: {
                fieldLabel: '{literalNumberField1Label}',
                value: '{scaleDenominator.number1}'
            },
            hidden: true,
            flex: 5
        }, {
            xtype: 'combobox',
            name: 'operatorCombo',
            width: '100px',
            displayField: 'operator',
            valueField: 'ogcType',
            editable: false,
            bind: {
                fieldLabel: '{operatorComboLabel}',
                value: '{scaleDenominator.operator}'
            },
            store: {
                type: 'scaleDenominatorOperators'
            },
            listeners: {
                change: 'operatorComboChanged'
            }
        }, {
            xtype: 'numberfield',
            name: 'literalNumberField2',
            minValue: 0,
            step: 5000,
            bind: {
                fieldLabel: '{literalNumberField2Label}',
                value: '{scaleDenominator.number2}'
            },
            hidden: true,
            flex: 5
        }]
    }]
});
