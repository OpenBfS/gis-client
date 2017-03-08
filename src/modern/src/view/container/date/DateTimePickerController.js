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
        'Ext.Toast'
    ],

    /**
     * Called on field's change event.
     *
     * @method onFieldChange
     * @param {Ext.field.DatePicker} field The datefield picker this validator
     *                                     is bound to.
     * @param {Date} newDate The new date.
     */
    onFieldChange: function(field, newVal) {
        var me = this;
        me.validateDateField(field, newVal, true);
    },

    /**
     * Validates the user input on a datefield picker. If the input is invalid,
     * it resets the value to the previous (and valid) value and shows a simple
     * toast with an warn message.
     *
     * @param {Ext.field.DatePicker} field The datefield picker this validator
     *                                     is bound to.
     * @param {Date} newDate The new date.
     */
    validateDateField: function(field, newVal, validatePartnerField) {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var minValue = view.getMinValue();
        var maxValue = view.getMaxValue();

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
        var isValid = true;
        var validationMessage = '';

        // Check if the input value is larger than the accepted minimum
        if (newVal < minValue) {
            isValid = false;
            validationMessage += Ext.String.format(
                    minDateWarnMsg,
                    readableMinDate
            ) + ' ';
        }

        // Check if the input value is smaller than the accepted maximum
        if (newVal > maxValue) {
            isValid = false;
            validationMessage += Ext.String.format(
                    maxDateWarnMsg,
                    readableMaxDate
            ) + ' ';
        }

        // Check if the current time range fits into the accepted range (only
        // needed if we were called from a timerange field).
        var validTimeRangeMessage = me.validateTimeRangePartnerField(
            field, newVal, validatePartnerField);

        if (validTimeRangeMessage) {
            isValid = false;
            validationMessage += validTimeRangeMessage;
        }

        viewModel.set('isValidDateTime', isValid);
        viewModel.set('validationMessage', validationMessage);
    },

    /**
     * Validate the timerange (if given) and returns an error message if
     * validation fails.
     *
     * @method validateMaxDurationTimerange
     * @return {String} The error message.
     */
    validateTimeRangePartnerField: function(field, newVal, validatePartnerField) {
        var me = this;
        var viewModel = me.getViewModel();
        var durationUtil = Koala.util.Duration;
        var emptyMessage = '';
        // The picker container the value was changed in.
        var dateTimePickerField = field.up('k-container-datetimepicker');
        // The associated partner field.
        var partnerDateTimePickerField = Ext.ComponentQuery.query(
                'k-container-datetimepicker[name=' +
                dateTimePickerField.getPartnerFieldName() + ']')[0];

        // No partner field found, we're not in a timerange.
        if (!dateTimePickerField) {
            return emptyMessage;
        }

        // Detect the start- and endfields based in the current field which
        // was changed.
        var startField = dateTimePickerField.isStartPartner() ?
                dateTimePickerField : partnerDateTimePickerField;
        var endField = dateTimePickerField.isEndPartner() ?
                dateTimePickerField : partnerDateTimePickerField;

        // Detect the start- and enddates based in the current field which
        // was changed and take the changed value into account. This is neede
        // because the viewModel and the real value of the field hasn't been
        // updated yet.
        var startDate = (startField === dateTimePickerField) ?
                newVal : startField.getValue();
        var endDate = (endField === dateTimePickerField) ?
                newVal : endField.getValue();

        // Get the max. allowed duration.
        var maxDuration = startField.getMaxDuration();

        // Only proceed if both start- and enddate are set
        if (!startDate || !endDate) {
            return emptyMessage;
        }

        // Check if the start date is before the end date.
        if (startDate > endDate) {
            return viewModel.get('endBeforeStartWarnMsg');
        }

        // Only proceed if a maxDuration is set.
        if (Ext.isEmpty(maxDuration)) {
            return emptyMessage;
        }

        // Only proceed if the maximum duration is set to a valid value, the
        // value of 0 may be returned if only a number was entered instead of a
        // vaild duration string.
        if (durationUtil.absoluteSecondsFromDuration(maxDuration) === 0) {
            return emptyMessage;
        }

        var withinDuration = durationUtil.datesWithinDuration(
            startDate, endDate, maxDuration
        );

        // Check if the timerange is inside the allowed duration.
        if (!withinDuration) {
            return viewModel.get('exceedsMaxDurationWarnMsg');
        }

        // Revalidate the partner field
        if (validatePartnerField) {
            var partnerField = partnerDateTimePickerField.down(
                    'datepickerfield[name=valueField]');
            var partnerFieldValue = partnerField.getValue();
            partnerDateTimePickerField.getController().validateDateField(
                    partnerField, partnerFieldValue, false);
        }

        return emptyMessage;
    },

    /**
     * Shows a toast message with the current validation result.
     *
     * @method onValidateMessageTap
     */
    onValidateMessageTap: function() {
        var me = this;
        var view = me.getView();
        var viewModel = view.getViewModel();
        var errMsg = viewModel.get('validationMessage');
        if (errMsg) {
            Ext.toast(errMsg);
        }
    }

});
