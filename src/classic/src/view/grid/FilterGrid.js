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
 * @class Koala.view.grid.FilterGrid
 */
Ext.define('Koala.view.grid.FilterGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'k-grid-filter',
    cls: 'k-grid-filter',

    requires: [
        'Koala.util.Grid'
    ],

    plugins: 'gridfilters',
    controller: 'k-grid-filter',
    viewModel: {
        type: 'k-grid-filter'
    },
    scrollable: true,
    height: 200,
    config: {
        /**
         * The layer to filter/sort.
         * @type {ol.layer.Layer}
         */
        layer: null
    },

    listeners: {
        filterchange: 'filterChanged',
        sortchange: 'sortChanged',
        boxready: 'addExtraMenuItems'
    },

    bbar: {
        xtype: 'pagingtoolbar',
        hidden: true
    },

    /**
     * Initialize the store with the layer's contents.
     */
    initComponent: function() {
        this.callParent();
        this.setupStore();
    },

    /**
     * Setup the store.
     */
    setupStore: function() {
        var store = Ext.create('Ext.data.Store', {
            autoLoad: true,
            data: []
        });
        this.setStore(store);
        var fmt = new ol.format.GeoJSON();
        var collection = fmt.writeFeaturesObject(this.getLayer().getSource().getFeatures());
        Koala.util.Grid.updateGridFeatures(this, collection.features);
    }

});
