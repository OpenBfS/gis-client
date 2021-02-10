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
 * @class Koala.view.form.field.GeocodingCombo
 */
Ext.define('Koala.view.form.field.GeocodingCombo', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'k-form-field-geocodingcombo',

    requires: [
        'Koala.view.form.field.GeocodingComboController'
    ],

    controller: 'k-form-field-geocodingcombo',

    store: {
        fields: [
            {name: 'address', type: 'string'},
            {name: 'latitude', type: 'float', convert: null},
            {name: 'longitude', type: 'float', convert: null}
        ]
    },

    displayField: 'address',

    minChars: 3,

    hideTrigger: true,

    validator: function() {
        if (this.getSelection()) {
            return true;
        }
        var vm = this.lookupViewModel();
        if (vm) {
            return vm.get('i18n.geocodingErrorText');
        }
        return this.invalidText;
    },

    listeners: {
        change: 'onComboChange'
    }
});
