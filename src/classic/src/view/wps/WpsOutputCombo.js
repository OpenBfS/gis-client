/* Copyright (c) 2021-present terrestris GmbH & Co. KG
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
 * @class Koala.view.wps.WpsOutputCombo
 */
Ext.define('Koala.view.wps.WpsOutputCombo', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'wps-output-combo',

    requires: [
        'Koala.view.wps.WpsOutputComboModel',
        'Koala.view.wps.WpsOutputComboController'
    ],

    controller: 'wps-output-combo',
    viewModel: {
        type: 'wps-output-combo'
    },

    padding: '5px unset unset unset',

    labelSeparator: '',

    valueField: 'identifier',
    displayField: 'label',
    bind: {
        fieldLabel: '{i18n.label}'
    },
    editable: false,

    allowBlank: false,

    version: undefined,

    generateOutput: function() {
        var generator = new OutputGenerator();
        var selection = this.getSelection();
        var mimeType;

        var complexData = selection.get('complexData');
        if (complexData && complexData.formats && complexData.formats.length > 0) {
            // TODO how do we decide which (raster) format to use

            mimeType = complexData.formats[0].mimeType;
            Ext.each(complexData.formats, function(format) {
                if (format.mimeType === 'application/json') {
                    mimeType = 'application/json';
                }
            });
        }

        if (this.version === '1.0.0') {
            return generator.createComplexOutput_WPS_1_0(
                selection.get('identifier'),
                mimeType,
                selection.get('schema'),
                selection.get('encoding'),
                selection.get('uom'),
                selection.get('asReference'),
                selection.get('title'),
                selection.get('abstractValue')
            );
        } else {
            return generator.createComplexOutput_WPS_2_0(
                selection.get('identifier'),
                mimeType,
                selection.get('schema'),
                selection.get('encoding'),
                selection.get('transmission')
            );
        }
    }
});
