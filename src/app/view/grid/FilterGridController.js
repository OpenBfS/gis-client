/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * @class Koala.view.grid.FilterGridController
 */
Ext.define('Koala.view.grid.FilterGridController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-grid-filter',

    requires: [
    ],

    featureStore: null,
    features: null,
    layer: null,
    storeData: null,

    /**
     * Initialize the controller by preparing an internal store to
     * manage filtering.
     */
    init: function() {
        var me = this;
        this.callParent();
        this.layer = this.getView().getLayer();
        this.features = this.layer.getSource().getFeatures().slice();
        var features = this.features.map(function(feat) {
            return feat.getProperties();
        });
        this.featureStore = Ext.create('Ext.data.Store', {
            data: features
        });
        this.storeData = [];
        this.featureStore.getData().each(function(item) {
            me.storeData.push(item);
        });
    },

    /**
     * Update the internal store and the layer with the new filters.
     *
     * @param {Ext.data.Store} store the view's store
     * @param {Object} filters the new filters
     */
    filterChanged: function(store, filters) {
        this.featureStore.clearFilter();
        this.featureStore.setFilters(filters);
        this.updateLayer();
    },

    /**
     * Update the layer's rendering order.
     *
     * @param {Ext.grid.header.Container} ct the grid's header container
     * @param {Ext.grid.column.Column} column the sort column
     * @param {String} direction the sort direction
     */
    sortChanged: function(ct, column, direction) {
        var sorters = this.featureStore.getSorters();
        sorters.clear();
        sorters.add({
            property: column.dataIndex,
            direction: direction
        });
        this.layer.set('renderOrder', function(feat1, feat2) {
            var v1 = feat1.get(column.dataIndex);
            var v2 = feat2.get(column.dataIndex);
            if (direction === 'DESC') {
                return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
            }
            return v1 < v2 ? 1 : v1 > v2 ? -1 : 0;
        });
    },

    /**
     * Update the layer's features in accordance with the internal store's
     * contents.
     */
    updateLayer: function() {
        var me = this;
        var data = this.featureStore.getData();
        var newFeatures = [];
        data.each(function(item) {
            newFeatures.push(me.features[me.storeData.indexOf(item)]);
        });
        var src = this.layer.getSource();
        src.clear();
        src.addFeatures(newFeatures);
        this.layer.originalFeatures = this.features;
    }

});
