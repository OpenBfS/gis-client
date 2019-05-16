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
        'Koala.util.Data'
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
        cancel: function() {},
        features: null
    },

    initComponent: function() {
        var metadata = this.getMetadata().layerConfig.barChartProperties;
        var context = Koala.util.AppContext.getAppContext().data.merge;
        var attributeFields = context.paramIsAttributeName;
        this.callParent();
        var fs = this.down('fieldset');
        var attributes = Koala.util.Data.extractProperties(this.getFeatures());
        Ext.each(this.fields, function(field) {
            var config = {
                xtype: 'textfield',
                name: field,
                bind: {
                    fieldLabel: '{' + field + '}'
                }
            };
            if (attributeFields.indexOf(field) !== -1) {
                config.xtype = 'combo';
                config.store = Ext.create('Ext.data.Store', {
                    fields: ['value'],
                    data: attributes.map(function(value) {
                        return {
                            value: value
                        };
                    })
                });
                config.displayField = 'value';
                config.valueField = 'value';
                if (metadata[field] && attributes.indexOf(metadata[field] !== -1)) {
                    config.value = metadata[field];
                }
            }
            fs.add(config);
        });
    }

});
