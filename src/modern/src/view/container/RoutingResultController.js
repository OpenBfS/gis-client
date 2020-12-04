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
        debugger;

        if (newResult) {
            me.addRouteToMap(newResult);
            me.zoomToRoute();
            me.updateRoutingSummaries(newResult);
            me.clearRoutingInstructions();
            me.setRoutingInstructionsVisiblity(false);
            me.setElevationPanelVisibility(false);
            me.resetToggleButtons();
        } else {
            me.clearRoutingInstructions();
            me.clearRoutingSummaries();
            me.resetToggleButtons();
            me.setRoutingInstructionsVisiblity(false);
            me.setElevationPanelVisibility(false);
        }
    },

});
