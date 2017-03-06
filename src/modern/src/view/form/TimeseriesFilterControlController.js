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
 * @class Koala.view.form.TimeseriesFilterControlController
 */
Ext.define('Koala.view.form.TimeseriesFilterControlController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-timeseriesfiltercontrol',

    requires: [
    ],

    /**
     * Validates if the current datetime values are valid. Either delegates
     * the newly passed valies or shows a toast if not valid.
     *
     * @method onSetFilterButtonClick
     */
    onSetFilterButtonClick: function() {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var timeseriesPanel = view.up('k-panel-timeserieschart');
        var timeseriesController = timeseriesPanel.getController();
        var isValid = me.isValid();

        if (isValid) {
            timeseriesController.applyChangedFilterToChart();
        } else {
            Ext.toast(viewModel.get('invalidInputErrMsg'));
        }
    },

    /**
     * Checks if the current datetime values are valid.
     *
     * @method isValid
     * @return {Boolean} The valid state.
     */
    isValid: function() {
        var me = this;
        var view = me.getView();
        var dateTimePickers = view.query('k-container-datetimepicker');
        var isValid = true;

        Ext.each(dateTimePickers, function(dateTimePicker) {
            if (!isValid) {
                return;
            }
            isValid = dateTimePicker.isValidDateTime();
        });

        return isValid;
    }
});
