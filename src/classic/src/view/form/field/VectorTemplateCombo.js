/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * @class Koala.view.form.field.VectorTemplateCombo
 */
Ext.define('Koala.view.form.field.VectorTemplateCombo',{
    extend: 'Ext.form.field.ComboBox',

    xtype: 'k-form-field-vectortemplatecombo',

    requires: [
        'Koala.view.form.field.VectorTemplateComboModel',
        'Koala.view.form.field.VectorTemplateComboController',
        'Koala.store.VectorTemplates'
    ],

    controller: 'k-form-field-vectortemplatecombo',
    viewModel: {
        type: 'k-form-field-vectortemplatecombo'
    },

    name: 'template',
    allowBlank: false,
    bind: {
        fieldLabel: '{templateLabel}',
        value: '{templateUuid}'
    },
    valueField: 'uuid',
    displayField: 'label',
    queryMode: 'local',
    store: {
        autoLoad: true,
        type: 'k-vectortemplates'
    },
    config: {
        includeCloneLayers: false
    },
    listeners: {
        beforerender: 'beforeVectorTemplateComboRendered'
    }

});
