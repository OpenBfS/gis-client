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
 * @class Koala.view.form.field.TemplateEditor
 */
Ext.define('Koala.view.form.field.TemplateEditor', {
    extend: 'Ext.form.FieldSet',
    xtype: 'k-form-field-templateeditor',

    requires: [
    ],

    controller: 'k-form-field-templateeditor',
    viewModel: {
        type: 'k-form-field-templateeditor'
    },

    config: {
        templates: [],
        properties: [],
        metadata: null
    },

    items: [{
        xtype: 'combo',
        bind: {
            fieldLabel: '{selectTemplate}',
            store: '{templates}',
            value: '{selectedTemplate}'
        },
        listeners: {
            change: 'templateSelected'
        }
    }, {
        xtype: 'textfield',
        bind: {
            fieldLabel: '{templateLabel}',
            value: '{templateValue}'
        },
        listeners: {
            change: 'templateEdited'
        }
    }],

    /**
     * Updates the view model with the values from the config.
     */
    initComponent: function() {
        this.callParent();
        var viewModel = this.getViewModel();
        viewModel.set('templates', this.getTemplates());
        viewModel.set('selectedTemplate', this.getTemplates()[0]);
    }

});
