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
 * @class Koala.view.form.field.LanguageCombo
 */
Ext.define('Koala.view.form.field.LanguageSelect', {
    extend: 'Ext.field.Select',
    xtype: 'k-field-languageselect',
    requires: [
        'Koala.store.Language',

        'Koala.view.form.field.LanguageSelectController',
        'Koala.view.form.field.LanguageSelectModel'
    ],

    controller: 'k-field-languageselect',
    viewModel: {
        type: 'k-field-languageselect'
    },

    fields: ['code', 'name'],
    queryMode: 'local',
    displayField: 'name',
    valueField: 'code',
    autoSelect: true,
    forceSelection: true,
    editable: false,
    grow: true,
    //TODO: true is better for mobile devices, but see open issue: https://www.sencha.com/forum/showthread.php?306158-selectfield-selector-hides-item
    usePicker: false,
    store: {
        type: 'k-language'
    },
    config: {
        defaultLanguage: 'de'
    },
    listeners: {
        change: 'onLanguageChange',
        initialize: 'onInitialize'
    },

    bind: {
        label: '{fieldLabel}'
    }

});
