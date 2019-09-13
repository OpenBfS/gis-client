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
        sortchange: 'sortChanged'
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
        var colDefs = this.extractSchema();
        this.setupStore(colDefs);
    },

    /**
     * Extract the column definitions from the layer's contents.
     */
    extractSchema: function() {
        var layer = this.getLayer();
        var feats = layer.getSource().getFeatures();
        var attributes = [];
        Ext.each(feats, function(feat) {
            Ext.iterate(feat.getProperties(), function(key) {
                if (attributes.indexOf(key) === -1 && key !== 'geometry') {
                    attributes.push(key);
                }
            });
        });
        var colDefs = [];
        Ext.each(attributes, function(attribute) {
            colDefs.push({
                text: attribute,
                dataIndex: attribute,
                editor: 'textfield',
                filter: true
            });
        });
        return colDefs;
    },

    /**
     * Setup the store with the given column definitions. Adds only the
     * first four features to the store.
     *
     * @param {Object[]} columns
     */
    setupStore: function(columns) {
        this.setColumns(columns);
        var features = this.getLayer().getSource().getFeatures();
        features = features.map(function(feat) {
            return feat.getProperties();
        });
        var store = Ext.create('Ext.data.Store', {
            data: features
        });
        this.setStore(store);
    }

});
