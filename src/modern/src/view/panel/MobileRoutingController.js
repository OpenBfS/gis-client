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
 * @class Koala.view.panel.MobileRoutingController
 */
Ext.define('Koala.view.panel.MobileRoutingController', {
    extend: 'Koala.view.window.RoutingController',
    alias: 'controller.k-panel-mobilerouting',

    onPainted: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        me.createRoutingLayers();

        var wayPointStore = vm.get('waypoints');
        wayPointStore.on('datachanged',
            function() {
                view.fireEvent('updateWayPointLayer');
            }
        );
    },

    /**
     * Add an empty via point to the store
     * which also will be visible in the UI.
     */
    addEmptyViaPoint: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();
        var wayPointStore = vm.get('waypoints');

        wayPointStore.addViaPoint(wayPointStore.dummyViaPoint);
    },

    onComputeRouteClick: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var wayPointStore = vm.get('waypoints');

        if (!wayPointStore.isValid() || wayPointStore.count() < 2) {
            return;
        }

        var onSuccess = function(json) {
            var menu = Ext.ComponentQuery.query('k-panel-mobilemenu')[0];
            if (menu) {
                menu.hide();
            }

            view.setMasked(false);
            view.hide(false);
            var resultPanel = Ext.ComponentQuery.query('[name=' + view.routingResultPanelName + ']')[0];
            if (resultPanel) {
                resultPanel.show();
                resultPanel.fireEvent('resultChanged', json);
            }
        };

        var onError = function(err) {
            var str = 'An error occured: ' + err;
            Ext.Logger.log(str);
            view.setMasked(false);
            view.fireEvent('resultChanged');
            // TODO add TOAST
        };

        view.setMasked({
            xtype: 'loadmask'
        });
        me.makeRoutingRequest(onSuccess, onError);
    },

    /**
     * Apply a suggestion to the input field.
     *
     * @param {Ext.grid.Grid} grid The suggestions grid.
     * @param {Ext.data.Model} suggestion A suggestion model instance.
     */
    applySuggestion: function(grid, suggestion) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var waypointStore = vm.get('waypoints');
        var suggestionStore = vm.get('geocodingsuggestions');
        var waypointId = suggestion.get('waypointId');

        var waypoint = waypointStore.getById(waypointId);
        if (waypoint) {
            var waypointIdx = waypointStore.indexOf(waypoint);
            waypointStore.replacePoint(waypointIdx, {
                address: suggestion.get('address'),
                latitude: suggestion.get('latitude'),
                longitude: suggestion.get('longitude')
            });
        }
        suggestionStore.removeAll();
    }

});
