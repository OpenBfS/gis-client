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
 * @class Koala.view.form.field.LanguageCombo
 */
Ext.define('Koala.view.form.field.LanguageCombo', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'k-form-field-languagecombo',
    requires: [
        'Koala.store.Language',

        'Koala.view.form.field.LanguageComboController',
        'Koala.view.form.field.LanguageComboModel'
    ],

    controller: 'k-form-field-languagecombo',
    viewModel: {
        type: 'k-form-field-languagecombo'
    },

    fields: ['code', 'name'],
    queryMode: 'local',
    displayField: 'name',
    valueField: 'code',
    autoSelect: true,
    forceSelection: true,
    editable: false,
    grow: true,
    store: {
        type: 'k-language'
    },
    config: {
        defaultLanguage: 'de'
    },
    listeners: {
        change: 'onLanguageChange'
    },
    initComponent: function() {
        this.callParent();
        this.setValue(this.getDefaultLanguage());
    }
});
