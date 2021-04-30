/* Copyright (c) 2021-present terrestris GmbH & Co. KG
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
 * @class Koala.view.button.ElevationProfileSwitcherController
 */
Ext.define('Koala.view.button.ElevationProfileSwitcherController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-button-elevationprofileswitcher',

    requires: [
        'Ext.Array',
        'Ext.Object'
    ],

    /**
     * Update the button menu based on the properties
     * of polygon layers in the legendTree.
     */
    updateMenu: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var treeStore = me.getLegendTreeStore();
        if (!treeStore) {
            view.setMenu([]);
            return;
        }

        var polygonLayers = me.getPolygonLayers(treeStore);
        var layerProps = me.getNumericProps(polygonLayers, view.blacklist);
        var menu = me.createMenuForProps(layerProps);
        Ext.Array.insert(menu, 0, [me.createMenuItem('elevation', null)]);
        view.setMenu(menu);
    },

    /**
     * Get all polygon layer from store.
     *
     * @param {Ext.data.Store} store The store to filter.
     * @returns {ol.layer.Vector[]} The polygon layers.
     */
    getPolygonLayers: function(store) {
        var me = this;
        var polygonLayers = [];

        // We do not want to use filter here,
        // as we do not want to change the store.
        store.each(function(rec) {
            var olLayer = rec.getOlLayer();
            var isVectorLayer = olLayer instanceof ol.layer.Vector;

            if (!isVectorLayer) {
                return;
            }

            var feature = olLayer.getSource().getFeatures()[0];
            if (!feature) {
                // Features of cloned layers will be loaded asynchronously.
                // Therefore we have to update the menu again, as soon as
                // the first feature was added to the layer.
                olLayer.getSource().once('addFeature', me.updateMenu.bind(me));
                return;
            }
            var geometryType = feature.getGeometry().getType();
            var isPolygonLayer = geometryType === 'Polygon' || geometryType === 'MultiPolygon';

            if (!isPolygonLayer) {
                return;
            }

            polygonLayers.push(olLayer);
        });

        return polygonLayers;
    },

    /**
     * Get the numeric properties for a given list of layers.
     *
     * @param {ol.layer.Vector[]} layers The layers to get the props from.
     * @param {String[]} blacklist A blacklist of properties that should be ignored.
     * @returns {Object} An object containing the layer props for each layer.
     */
    getNumericProps: function(layers, blacklist) {
        var props = {};
        blacklist = blacklist || [];

        Ext.Array.each(layers, function(olLayer) {
            // var layerProps = olLayer.getProperties();
            var layerProps = olLayer.getSource().getFeatures()[0].getProperties();
            var propKeys = Ext.Object.getKeys(layerProps);
            var layerName = olLayer.get('name');
            var layerId = olLayer.id;

            Ext.Array.each(propKeys, function(key) {

                if (Ext.Array.contains(blacklist, key)) {
                    return;
                }

                if (!Ext.isNumber(layerProps[key])) {
                    return;
                }

                if (!Ext.isDefined(props[layerId])) {
                    props[layerId] = {
                        name: layerName,
                        props: []
                    };
                }

                props[layerId].props.push(key);
            });
        });

        return props;
    },

    /**
     * Get the legendTreeStore.
     *
     * @returns {Ext.data.Store} The legendTreeStore.
     */
    getLegendTreeStore: function() {
        var legendTree = Ext.ComponentQuery.query('k-panel-routing-legendtree')[0];
        if (!legendTree) {
            return;
        }
        return legendTree.getStore();
    },

    /**
     * Create (sub-)menu buttons for each property.
     *
     * @param {Object} props The object containing the props.
     * @returns {Ext.button.Button} The menu buttons.
     */
    createMenuForProps: function(props) {
        var me = this;

        var layerIds = Ext.Object.getKeys(props);

        return Ext.Array.map(layerIds, function(layerId) {
            var layerName = props[layerId].name;

            var items = Ext.Array.map(props[layerId].props, function(prop) {
                return me.createMenuItem(prop, layerName);
            });

            return {
                text: layerName,
                menu: items
            };
        });
    },

    /**
     * Create a menu item with click handler.
     *
     * @param {String} prop Name of the property.
     * @param {String} layerName Name of the layer.
     * @returns {Object} Menu item object.
     */
    createMenuItem: function(prop, layerName) {
        var me = this;
        return {
            text: prop,
            handler: function() {
                me.onItemClick(prop, layerName);
            }
        };
    },

    /**
     * Handle the menu item click event.
     *
     * Fires the changeGraph event of the wrapping elevationProfile panel
     * with the provided arguments.
     *
     * @param {String} layerName The name of the layer.
     * @param {String} propKey The name of the property to visualize.
     */
    onItemClick: function(layerName, propKey) {
        var view = this.getView();
        if (!view) {
            return;
        }
        var elevationProfile = view.up('k-panel-elevationprofile');
        if (!elevationProfile) {
            return;
        }

        elevationProfile.fireEvent('changeGraph', layerName, propKey);
    }
});
