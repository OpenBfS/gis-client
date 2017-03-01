/* Copyright (c) 2015-2017 terrestris GmbH & Co. KG
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
 * @class Koala.view.container.date.DateTimePickerController
 */
Ext.define('Koala.view.container.date.DateTimePickerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-container-datetimepicker',

    requires: [
    ],

    /**
     * Validates the user input on a datefield picker. If the input is invalid,
     * it resets the value to the previous (and valid) value and shows a simple
     * toast with an warn message.
     *
     * @param {Ext.field.DatePicker} field The datefield picker this validator
     *                                     is bound to.
     * @param {Date} newDate The new date.
     * @param {Date} oldDate The old date.
     */
    onFieldChange: function(field, newVal, oldVal) {
        var me = this;
        var viewModel = me.getViewModel();
        var minValue = field.minValue;
        var maxValue = field.maxValue;

        // Only proceed if the field is rendered
        if (!field.isRendered()) {
            return;
        }

        if (Ext.isEmpty(minValue)) {
            minValue = -Infinity;
        }

        if (Ext.isEmpty(maxValue)) {
            maxValue = Infinity;
        }

        var minDateWarnMsg = viewModel.get('minDateWarnMsg');
        var maxDateWarnMsg = viewModel.get('maxDateWarnMsg');
        var dateFormat = viewModel.get('warnMsgDateFormat');
        var readableMinDate = Ext.Date.format(minValue, dateFormat);
        var readableMaxDate = Ext.Date.format(maxValue, dateFormat);

        // Check if the input value is larger than the accepted minimum
        if (newVal < minValue) {
            Ext.toast(Ext.String.format(
                    minDateWarnMsg,
                    readableMinDate
            ));
            field.setValue(oldVal);
            return;
        }

        // Check if the input value is smaller than the accepted maximum
        if (newVal > maxValue) {
            Ext.toast(Ext.String.format(
                    maxDateWarnMsg,
                    readableMaxDate
            ));
            field.setValue(oldVal);
            return;
        }

        // Check if the current time range fits into the accepted range (only
        // needed if we were called from a timerange field)
        if (field.type === 'timerange-min' || field.type === 'timerange-max') {
            var isValid = Koala.util.Filter.validateMaxDurationTimerange
                    .call(field);
            if (Ext.isString(isValid)) {
                Ext.toast(isValid);
                field.setValue(oldVal);
                return;
            }
        }
    }

});
