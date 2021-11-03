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
        'GeoExt.data.store.Features'
    ],

    featureStore: null,
    features: null,
    layer: null,
    storeData: null,

    init: function() {
        this.callParent();
        this.layer = this.getView().getLayer();
        this.layer.originalFeatures = this.features;
    },

    /**
     * Adds extra entries to the Column Menu. e.g the check null value filter
     */
    addExtraMenuItems: function() {
        var me = this;
        var view = this.getView();
        var viewModel = this.getViewModel();
        // Add custom entry to grid menu
        var menu = view.headerCt.getMenu();
        menu.add([{
            xtype: 'menucheckitem',
            text: viewModel.get('filterNullValues'),
            checkHandler: function(evt) {
                me.toggleNullValueFilter(evt);
            }
        }]);
    },

    /**
     * Update the layer with the new filters manually.
     *
     * @param {Ext.data.Store} store the view's store
     * @param {Object} filters the new filters
     */
    filterChanged: function(store) {
        var featureGrid = Ext.ComponentQuery.query('k-panel-featuregrid')[0];
        if (featureGrid) {
            featureGrid.close();
        }
        var fmt = new ol.format.GeoJSON();
        var source = this.layer.getSource();
        var newFeatures = [];
        store.each(function(record) {
            var feature = fmt.readFeature(record.data.feature);
            newFeatures.push(feature);
        });
        source.clear();
        source.addFeatures(newFeatures);
    },

    /**
     * Toggles the null value filter
     *
     * @param {CheckChangeEvent} evt The checkchange event
     */
    toggleNullValueFilter: function(evt) {
        var checked = evt.checked;
        var column = evt.getQueryRoot().up('gridcolumn');
        var store = this.getView().getStore();
        var dataIndex = column.dataIndex;
        var filterId = dataIndex + '_null_value_filter';
        var nullValueFilter = store.getFilters().findBy(function(item) {
            return item.getId() === filterId;
        });
        if (!nullValueFilter && checked) {
            nullValueFilter = new Ext.util.Filter({
                id: filterId,
                filterFn: function(item) {
                    var value = item.getData()[dataIndex];
                    return !!value;
                }
            });
            store.addFilter(nullValueFilter);
        } else {
            store.removeFilter(nullValueFilter);
        }
    },

    /**
     * Update the layer's rendering order.
     *
     * @param {Ext.grid.header.Container} ct the grid's header container
     * @param {Ext.grid.column.Column} column the sort column
     * @param {String} direction the sort direction
     */
    sortChanged: function(ct, column, direction) {
        var sorters = this.getView().getStore().getSorters();
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
    }

});
