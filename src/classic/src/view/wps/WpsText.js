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
 * @class Koala.view.wps.WpsText
 */
Ext.define('Koala.view.wps.WpsText', {
    extend: 'Ext.form.field.Text',
    xtype: 'wps-textfield',

    requires: [
        'Ext.Promise'
    ],

    labelSeparator: '',

    allowBlank: true,

    identifier: undefined,
    dataType: undefined,
    unitOfMeasure: undefined,

    generateInput: function() {
        var dataType = this.dataType ? this.dataType.type : undefined;
        var generator = new InputGenerator();
        var val = this.getValue();
        if (val === undefined) {
            if (!this.allowBlank) {
                return Ext.Promise.reject({
                    identifier: this.identifier,
                    label: this.fieldLabel
                });
            }
            return Ext.Promise.resolve();
        }
        var input = generator.createLiteralDataInput_wps_1_0_and_2_0(
            this.identifier, dataType, this.unitOfMeasure, val
        );

        return Ext.Promise.resolve(input);
    }
});
