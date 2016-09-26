Ext.define('Koala.view.container.styler.Filter', {
    extend: 'Ext.container.Container',
    xtype: 'k_container_styler_filter',

    requires: [
        'Koala.store.LayerAttributes',
        'Koala.store.FilterOperators'
    ],

    controller: 'container.styler.filter',
    viewModel: {
        type: 'container.styler.filter'
    },

    config: {
        filter: null
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
        name: 'comparison-fieldset',
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
            displayField: 'name',
            valueField: 'name',
            editable: false,
            bind: {
                fieldLabel: '{attributeComboLabel}'
            },
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="x-boundlist-item">{name}' +
                    '({[values.type.split("xsd:")[1]]})</div>',
                '</tpl>'
            ),
            store: {
                type: 'layerattributes'
            },
            listeners: {
                boxready: 'attributeComboBoxReady'
            }
        }, {
            xtype: 'numberfield',
            name: 'literalNumberField1',
            value: 0,
            bind: {
                fieldLabel: '{literalNumberField1Label}'
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
                fieldLabel: '{operatorComboLabel}'
            },
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="x-boundlist-item" ',
                    '<tpl if="!this.propertyFitsOperator(dataTypes)">',
                        'style="color:red; background-color: lightgray;"',
                        'title="Not an appropriate operator for the selected ',
                        'property.";',
                    '</tpl>',
                    '>{operator}</div>',
                '</tpl>',
                {
                    propertyFitsOperator: function(dataTypes){
                        var attrCombo = this.field.up('k_container_styler_filter')
                                .down('combobox[name="attributeCombo"]');
                        if(attrCombo){
                            var attr = attrCombo.getSelection().get('type');
                            return Ext.Array.contains(dataTypes, attr);
                        }
                        return true;
                    }
                }
            ),
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
                fieldLabel: '{literalNumberField2Label}'
            },
            hidden: true,
            flex: 5
        },{
            xtype: 'textfield',
            name: 'literalTextField',
            value: "",
            bind: {
                fieldLabel: '{literalTextFieldLabel}'
            },
            hidden: true,
            flex: 5
        }]
    }]
});
