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
 * @class Koala.view.form.IsochroneRoutingSettingsController
 */
Ext.define('Koala.view.form.IsochroneRoutingSettingsController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-isochrone-routing-settings',

    onSubmit: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        // routingProfile
        var routingProfileBtn = view.down('k-button-routing-profile');
        var routingProfile = 'driving-car';
        if (routingProfileBtn) {
            routingProfile = routingProfileBtn.getValue();
        }
        vm.set('routingProfile', routingProfile);

        // range
        var rangeType = vm.get('rangeType');

        var rangeField;
        var rangeValue;
        var range;

        var intervalField;
        var intervalValue;
        var interval;

        if (rangeType === 'distance') {
            rangeField = view.down('[name="range_distance"]');
            rangeValue = rangeField.getValue(); // kilometer
            // convert to meter
            range = rangeValue * 1000;

            intervalField = view.down('[name="interval_distance"]');
            intervalValue = intervalField.getValue(); // kilometer
            // convert to meter
            if (intervalValue) {
                interval = intervalValue * 1000;
            }
        } else if (rangeType === 'time') {
            rangeField = view.down('[name="range_time"]');
            rangeValue = rangeField.getValue(); // minutes
            // convert to seconds
            range = rangeValue * 60;

            intervalField = view.down('[name="interval_time"]');
            intervalValue = intervalField.getValue(); // minutes
            // convert to seconds
            if (intervalValue) {
                interval = intervalValue * 60;
            }
        } else {
            // this should not happen
            return;
        }

        // needs to be an array
        vm.set('range', [range]);

        if (interval) {
            // round in case user provides many decimals
            interval = Math.round(interval);
        }
        // also works in case of no value i.d. 'null'
        vm.set('interval', interval);

        var parentView = view.up('k-window-isochrone-routing');
        if (!parentView) {
            return;
        }
        parentView.fireEvent('makeRoutingRequest', null, null);
    },

    /**
     * Add selected record to the waypoint store.
     *
     * @param {Ext.form.field.ComboBox} combo The combobox.
     * @param {Ext.data.Model} record The selected record.
     */
    onCenterSelect: function(combo, record) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();
        var wayPointStore = vm.get('waypoints');

        var waypoint = {
            address: record.get('address'),
            latitude: record.get('latitude'),
            longitude: record.get('longitude')
        };
        wayPointStore.loadRawData([waypoint]);
    },

    /**
     * Activate submit button if all required
     * input fields are valid.
     */
    activateSubmitButtonIfValid: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var centerField = view.down('[name="center"]');

        var rangeType = vm.get('rangeType');
        var rangeField;
        var intervalField;
        if (rangeType === 'distance') {
            rangeField = view.down('[name="range_distance"]');
            intervalField = view.down('[name="interval_distance"]');

        } else if (rangeType === 'time') {
            rangeField = view.down('[name="range_time"]');
            intervalField = view.down('[name="interval_time"]');
        } else {
            // this should not happen
            return false;
        }
        var formIsValid = centerField.isValid() &&
                         rangeField.isValid() &&
                          intervalField.isValid();
        vm.set('disableSubmitButton', !formIsValid);
    }
});
