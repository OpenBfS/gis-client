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
 * @class Koala.view.container.IsochroneRoutingResultController
 */
Ext.define('Koala.view.container.IsochroneRoutingResultController', {
    extend: 'Koala.view.container.RoutingResultController',
    alias: 'controller.k-container-isochroneroutingresult',

    requires: [
        'Ext.Array',
        'BasiGX.util.Layer'
    ],

    /**
     * @override
     */
    onRoutingResultChanged: function(newResult) {
        var me = this;

        if (newResult) {
            // TODO add data cleanup
            me.addIsochrones(newResult);
        }
    },

    /**
     * Overwrite the isochronesStore with the given isochrones.
     *
     * @param {Object} orsIsochrones Response object of the ORS Isochrones API.
     * @returns {Ext.data.Model[]} The added isochrone models.
     */
    addIsochrones: function(orsIsochrones) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }
        var isochronesStore = vm.get('isochrones');
        if (!isochronesStore) {
            return;
        }

        var features = orsIsochrones.features || [];
        var rangeType;
        try {
            rangeType = orsIsochrones.metadata.query.range_type;
        } catch (err) {
            // default range_type according to API specification
            rangeType = 'time';
        }
        var isochrones = Ext.Array.map(features, function(feature) {
            var props = feature.properties || {};

            return {
                geometry: Ext.clone(feature.geometry),
                area: props.area,
                center: Ext.clone(props.center),
                group_index: props.group_index,
                reachfactor: props.reachfactor,
                value: props.value,
                range_type: rangeType,
                // TODO currently the API does not provide population
                population: props.total_pop
            };
        });

        return isochronesStore.loadRawData(isochrones);
    }

});
