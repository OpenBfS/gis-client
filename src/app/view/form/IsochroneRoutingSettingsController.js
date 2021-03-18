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

    requires: [

    ],

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
    }
});
