/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.CloneWindow
 */
Ext.define('Koala.view.window.CloneWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-clone',
    cls: 'k-window-clone',

    requires: [
    ],

    controller: 'k-window-clone',

    viewModel: {
        type: 'k-window-clone'
    },

    bind: {
        title: '{title}'
    },

    autoShow: true,
    bodyPadding: 5,
    constrainHeader: true,
    collapsible: true,
    maxHeight: 800,
    height: 320,
    width: 500,
    layout: 'vbox',

    defaults: {
        flex: 1,
        width: '100%'
    },

    config: {
        /**
         * The layer to possibly clone.
         * @type {ol.layer.Layer}
         */
        sourceLayer: null
    },

    items: [{
        xtype: 'form',
        width: 495,
        bbar: [{
            xtype: 'button',
            bind: {
                text: '{okButtonLabel}'
            },
            handler: 'cloneHandler'
        }, {
            xtype: 'button',
            bind: {
                text: '{cancelButtonLabel}'
            },
            handler: 'cancelHandler'
        }],
        items: [{
            xtype: 'textfield',
            labelWidth: 200,
            width: '95%',
            bind: {
                fieldLabel: '{layerNameLabel}'
            }
        }, {
            xtype: 'checkbox',
            name: 'bbox',
            bind: {
                boxLabel: '{boundingBoxLabel}'
            }
        }, {

        }, {
            xtype: 'numberfield',
            labelWidth: 200,
            width: '95%',
            value: 1000,
            bind: {
                fieldLabel: '{maxFeaturesLabel}'
            }
        }, {
            xtype: 'fieldcontainer',
            bind: {
                fieldLabel: 'Daten übernehmen'
            },
            labelWidth: 200,
            name: 'datasource-radios',
            defaultType: 'radiofield',
            layout: 'vbox',
            items: [{
                boxLabel: 'Daten des ausgewählten Layers verwenden',
                inputValue: 'useLayer',
                name: 'layer',
                checked: true,
                handler: 'handleDatasourceChange'
            }, {
                xtype: 'checkbox',
                name: 'copystyle',
                checked: true,
                margin: '0 0 0 20',
                bind: {
                    boxLabel: '{copyStyleLabel}',
                    hidden: '{noLayerSelected}'
                }
            }, {
                boxLabel: 'keine Daten übernehmen',
                inputValue: 'emptyLayer',
                name: 'layer',
                handler: 'handleDatasourceChange'
            }, {
                boxLabel: 'Daten aus Selektion übernehmen',
                inputValue: 'selectionLayer',
                name: 'layer',
                handler: 'handleDatasourceChange'
            }, {
                xtype: 'label',
                name: 'selection-enabled',
                hidden: true,
                margin: '0 0 0 20',
                bind: {
                    text: '{selectionEnabled}'
                }
            }]
        }, {
            xtype: 'k-form-field-vectortemplatecombo',
            includeCloneLayers: true
        }]
    }]

});
