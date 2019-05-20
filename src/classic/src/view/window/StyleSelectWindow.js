/* Copyright (c) 2019-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class Koala.view.window.StyleSelectWindow
 */
Ext.define('Koala.view.window.StyleSelectWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-styleselect',
    cls: 'k-window-styleselect',

    requires: [
        'Koala.util.Data'
    ],

    controller: 'k-window-styleselect',

    viewModel: {
        type: 'k-window-styleselect'
    },

    bind: {
        title: '{title}'
    },

    height: 350,
    width: 500,
    autoShow: true,
    layout: {
        type: 'vbox'
    },

    config: {
        features: [],
        setStyleCallback: null,
        setSelectedTemplateStyle: null
    },

    items: [{
        xtype: 'tabpanel',
        width: '100%',
        height: '100%',
        bodyPadding: 5,
        items: [{
            name: 'fileTab',
            bind: {
                title: '{fileFieldTab}'
            },
            items: [{
                xtype: 'filefield',
                bind: {
                    fieldLabel: '{fileFieldText}'
                }
            }]
        }, {
            name: 'environmentFieldTab',
            bind: {
                title: '{getFromEnvironmentFieldTab}'
            },
            items: [{
                xtype: 'combo',
                bind: {
                    fieldLabel: '{selectEnvironmentFieldFieldText}',
                    store: '{attributes}'
                },
                listeners: {
                    change: 'attributeSelected'
                }
            }, {
                xtype: 'combo',
                name: 'environmentFieldStyles',
                bind: {
                    fieldLabel: '{selectStyleText}',
                    value: '{selectedEnvironmentFieldStyle}'
                },
                valueField: 'val',
                displayField: 'dsp'
            }]
        }, {
            name: 'templateTab',
            bind: {
                title: '{templateTab}'
            },
            items: [{
                xtype: 'k-form-field-vectortemplatecombo',
                listeners: {
                    change: 'selectVectorTemplate'
                },
                bind: {
                    fieldLabel: '{selectTemplateText}',
                    value: '{selectedTemplate}'
                }
            }, {
                xtype: 'combo',
                bind: {
                    disabled: '{!stylesAvailable}',
                    store: '{templateStyles}',
                    value: '{selectedTemplateStyle}',
                    fieldLabel: '{selectStyleText}'
                }
            }]
        }]
    }],

    bbar: [{
        xtype: 'button',
        bind: {
            text: '{geoStylerText}'
        },
        handler: 'useGeoStylerDefault'
    }, {
        xtype: 'button',
        bind: {
            text: '{applyText}'
        },
        handler: 'applyStyle'
    }, {
        xtype: 'button',
        bind: {
            text: '{cancelText}'
        },
        handler: 'onCancel'
    }],

    /**
     * Initialize the environment field field list.
     */
    initComponent: function() {
        this.callParent();
        var attributes = Koala.util.Data.extractProperties(this.getFeatures());
        this.getViewModel().set('attributes', attributes);
    }

});
