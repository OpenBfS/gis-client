Ext.define('Koala.view.container.styler.Label', {
    extend: 'Ext.container.Container',
    xtype: 'k_container_styler_label',

    requires: [
        'Koala.view.container.styler.LabelController',
        'Koala.view.container.styler.LabelModel'
    ],

    controller: 'container.styler.label',
    viewModel: {
        type: 'container.styler.label'
    },

    listeners: {
        boxready: 'onBoxReady'
    },

    items: [{
        xtype: 'fieldset',
        layout: 'anchor',
        name: 'labelFieldSet',
        bind: {
            title: '{labelFieldSetTitle}'
        },
        checkboxToggle: true,
        collapsed: true,
        defaults: {
            anchor: '100%'
        },
        listeners: {
            collapse: 'onFieldSetToggle',
            expand: 'onFieldSetToggle'
        },
        items: [{
            xtype: 'textfield',
            name: 'text',
            bind: {
                fieldLabel: '{textFieldLabel}',
                value: '{textValue}'
            },
            enableKeyEvents: true,
            listeners: {
                keyup: 'onLabelPropChange'
            }
        }, {
            xtype: 'combo',
            name: 'font-family',
            bind: {
                fieldLabel: '{fontFamilyFieldLabel}',
                value: '{fontFamilyValue}'
            },
            queryMode: 'local',
            store: [
                ['monospace', 'monospace'],
                ['serif', 'serif'],
                ['sans-serif', 'sans-serif']
            ],
            listeners: {
                select: 'onLabelPropChange'
            }
        }, {
            xtype: 'combo',
            name: 'font-style',
            bind: {
                fieldLabel: '{fontStyleFieldLabel}',
                value: '{fontStyleValue}'
            },
            queryMode: 'local',
            store: [
                ['normal, normal', 'normal'],
                ['italic, normal', 'italic'],
                ['italic, bold', 'italic bold'],
                ['normal, bold', 'bold']
            ],
            listeners: {
                select: 'onLabelPropChange'
            }
        }, {
            xtype: 'numberfield',
            name: 'font-size',
            bind: {
                fieldLabel: '{fontSizeFieldLabel}',
                value: '{fontSizeValue}'
            },
            minValue: 1,
            maxValue: 50,
            listeners: {
                spin: 'onLabelPropChange'
            }
        }, {
            xtype: 'container',
            layout: 'hbox',
            name: 'fill',
            items: [{
                xtype: 'displayfield',
                width: 100,
                bind: {
                    value: '{fontColorFieldLabel}'
                }
            }, {
                xtype: 'colorbutton',
                name: 'textfill',
                width: 80,
                format: 'hex8',
                margin: '5 0 0 10',
                value: '#000000ff',
                bind: {
                    value: '{fillValue}'
                },
                listeners: {
                    change: 'onLabelPropChange'
                }
            }]
        }, {
            xtype: 'container',
            layout: 'hbox',
            name: 'stroke',
            items: [{
                xtype: 'displayfield',
                width: 100,
                bind: {
                    value: '{fontStrokeColorFieldLabel}'
                }
            }, {
                xtype: 'colorbutton',
                name: 'textstroke',
                width: 80,
                format: 'hex8',
                margin: '5 0 0 10',
                value: '#ffffffff',
                bind: {
                    value: '{strokeValue}'
                },
                listeners: {
                    change: 'onLabelPropChange'
                }
            }]
        }, {
            xtype: 'numberfield',
            name: 'rotation',
            bind: {
                fieldLabel: '{rotationFieldLabel}',
                value: '{rotationValue}'
            },
            minValue: 0,
            maxValue: 359,
            listeners: {
                spin: 'onLabelPropChange'
            }
        }, {
            xtype: 'numberfield',
            name: 'offsetX',
            bind: {
                fieldLabel: '{offsetXFieldLabel}',
                value: '{offsetXValue}'
            },
            minValue: -100,
            maxValue: 100,
            listeners: {
                spin: 'onLabelPropChange'
            }
        }, {
            xtype: 'numberfield',
            name: 'offsetY',
            bind: {
                fieldLabel: '{offsetYFieldLabel}',
                value: '{offsetYValue}'
            },
            minValue: -100,
            maxValue: 100,
            listeners: {
                spin: 'onLabelPropChange'
            }
        }]
    }]

});
