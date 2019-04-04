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
 * @class Koala.view.form.ChartDataForm
 */
Ext.define('Koala.view.form.ChartDataForm',{
    extend: 'Ext.form.Panel',

    xtype: 'k-form-chartdata',

    requires: [
    ],

    controller: 'k-form-chartdata',
    viewModel: {
        type: 'k-form-chartdata'
    },

    minWidth: 400,

    layout: 'form',

    items: [{
        xtype: 'fieldset',
        layout: 'form',
        bind: {
            title: '{titleText}'
        },
        items: []
    }],

    buttons: [{
        bind: {
            text: '{cancelButtonText}'
        },
        handler: 'onCancel'
    },{
        formBind: true,
        bind: {
            text: '{okButtonText}'
        },
        handler: 'onOk'
    }],

    config: {
        fields: [
            'yAxisAttribute',
            'yAxisScale',
            'groupAttribute',
            'detectionLimitAttribute',
            'uncertaintyAttribute'
        ],
        metadata: null,
        done: function() {},
        cancel: function() {}
    },

    initComponent: function() {
        this.callParent();
        var fs = this.down('fieldset');
        Ext.each(this.fields, function(field) {
            fs.add({
                xtype: 'textfield',
                name: field,
                bind: {
                    fieldLabel: '{' + field + '}'
                }
            });
        });
    }

});
