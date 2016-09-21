/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
Ext.define("Koala.view.form.ImportLocalData",{
    extend: "Ext.form.Panel",

    xtype: "k-form-importLocalData",

    requires: [
        "Koala.view.form.ImportLocalDataController",
        "Koala.view.form.ImportLocalDataModel"
    ],

    controller: "k-form-importlocaldata",
    viewModel: {
        type: "k-form-importlocaldata"
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
            title: 'Upload of {file.name}'
        },
        items: [{
            xtype: 'filefield',
            // TODO i18n
            buttonText: 'Durchsuchen',
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
            name: 'template',
            allowBlank: false,
            bind: {
                fieldLabel: '{templateLabel}',
                value: '{templateUuid}'
            },
            // TODO extract to real store
            store: [
                ["241ae25f-c180-475b-9734-4947f75137e1", "Local Vector Data Template (drinkwater)"],
                ["5fdc824d-dc67-46cc-a87e-1c99f13557cf", "Local Vector Data Template (buildings)"]
            ]
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
