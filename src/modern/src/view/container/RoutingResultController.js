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
 * @class Koala.view.container.ModernRoutingResultController
 */
Ext.define('Koala.view.container.ModernRoutingResultController', {
    extend: 'Koala.view.container.RoutingResultController',
    alias: 'controller.k-container-modernroutingresult',

    /**
     * Handler for the routingResultChanged event.
     *
     * @param {Object} newResult The new result as GeoJSON.
     */
    onRoutingResultChanged: function(newResult) {
        var me = this;
        var view = me.getView();

        if (newResult) {
            me.addRouteToMap(newResult);
            me.zoomToRoute();
            me.updateRoutingSummaries(newResult);
            me.useFirstRoutingSummary();
        } else {
            me.clearRoutingInstructions();
            me.clearRoutingSummaries();
            view.hide();
        }
    },

    /**
     * Use first routing summary for the
     * routing instructions and elevation panel.
     */
    useFirstRoutingSummary: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var summaryStore = vm.get('routingsummaries');
        if (!summaryStore) {
            return;
        }

        var firstSummary = summaryStore.first();

        if (firstSummary) {
            me.updateRoutingInstructions(firstSummary);

            var elevationPanel = view.down('[name=' + view.elevationProfilePanelName + ']');
            if (elevationPanel) {
                elevationPanel.fireEvent('dataChanged', firstSummary.getData());
            }
        }
    }
});
