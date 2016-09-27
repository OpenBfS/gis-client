Ext.define('Koala.view.container.styler.Filter', {
    extend: 'Ext.container.Container',
    xtype: 'k_container_styler_filter',

    requires: [
        'Koala.store.FilterOperators'
    ],

    controller: 'container.styler.filter',
    viewModel: {
        type: 'container.styler.filter'
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
        name: 'filter-fieldset',
        collapsed: true,
        checkboxToggle: true,
        checkboxName: 'useFilterCheckbox',
        layout: {
            type: 'hbox',
            align: 'stretchmax'
        },
        defaults: {
            margin: '0 5px 0 5px',
            labelAlign: 'top'
        },
        items: [{
            xtype: 'combobox',
            name: 'attributeCombo',
            editable: false,
            bind: {
                fieldLabel: '{attributeComboLabel}',
                value: '{filter.attribute}'
            },
            store: [],
            listeners: {
                boxready: 'attributeComboBoxReady'
            }
        }, {
            xtype: 'numberfield',
            name: 'literalNumberField1',
            value: 0,
            bind: {
                fieldLabel: '{literalNumberField1Label}',
                value: '{filter.number1}'
            },
            hidden: true,
            flex: 5
        },{
            xtype: 'combobox',
            name: 'operatorCombo',
            width: '100px',
            displayField: 'operator',
            valueField: 'ogcType',
            editable: false,
            bind: {
                fieldLabel: '{operatorComboLabel}',
                value: '{filter.operator}'
            },
            store: {
                type: 'filterOperators'
            },
            listeners: {
                change: 'operatorComboChanged'
            }
        },{
            xtype: 'numberfield',
            name: 'literalNumberField2',
            value: 0,
            bind: {
                fieldLabel: '{literalNumberField2Label}',
                value: '{filter.number2}'
            },
            hidden: true,
            flex: 5
        },{
            xtype: 'textfield',
            name: 'literalTextField',
            value: "",
            bind: {
                fieldLabel: '{literalTextFieldLabel}',
                value: '{filter.text}'
            },
            hidden: true,
            flex: 5
        }]
    }]
});
