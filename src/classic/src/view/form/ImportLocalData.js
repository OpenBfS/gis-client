/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * @class Koala.view.form.ImportLocalData
 */
Ext.define('Koala.view.form.ImportLocalData',{
    extend: 'Ext.form.Panel',

    xtype: 'k-form-importLocalData',

    requires: [
        'Koala.view.form.ImportLocalDataController',
        'Koala.view.form.ImportLocalDataModel',

        'Koala.store.Projections',
        'Koala.store.VectorTemplates'
    ],

    controller: 'k-form-importlocaldata',
    viewModel: {
        type: 'k-form-importlocaldata'
    },

    minWidth: 400,

    layout: 'form',

    listeners: {
        boxready: 'onBoxReady'
    },

    items: [{
        xtype: 'fieldset',
        layout: 'form',
        bind: {
            title: '{fieldSetTitle} {file.name}'
        },
        items: [{
            xtype: 'filefield',
            bind: {
                fieldLabel: '{fileFieldLabel}',
                hidden: '{layerName}'
            },
            name: 'file',
            listeners: {
                change: 'fileFieldChanged'
            }
        }, {
            xtype: 'textfield',
            name: 'layerName',
            bind: {
                fieldLabel: '{layerNameLabel}',
                value: '{layerName}'
            }
        }, {
            xtype: 'combobox',
            name: 'projection',
            allowBlank: false,
            bind: {
                fieldLabel: '{projectionLabel}',
                value: '{projection}',
                disabled: '{!couldBeGml}'
            },
            valueField: 'code',
            displayField: 'label',
            queryMode: 'local',
            store: {
                type: 'k-projections'
            },
            listeners: {
                beforerender: 'beforeProjectionComboRendered'
            }
        }, {
            xtype: 'k-form-field-vectortemplatecombo',
            listeners: {
                change: 'onVectorTemplateChange'
            }
        }, {
            xtype: 'combo',
            bind: {
                disabled: '{!stylesAvailable}',
                fieldLabel: '{templateStyleLabel}',
                store: '{templateStyles}',
                value: '{selectedTemplateStyle}'
            }
        }]
    }],

    buttons: [{
        bind: {
            text: '{cancelButtonText}'
        },
        handler: 'cancelClicked'
    },{
        formBind: true,
        bind: {
            text: '{importButtonText}'
        },
        handler: 'importClicked'
    }]
});
