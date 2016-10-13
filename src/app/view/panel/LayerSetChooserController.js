/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.view.panel.LayerSetChooserController
 */
Ext.define('Koala.view.panel.LayerSetChooserController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-layersetchooser',
    requires: [
        'Koala.util.Layer'
    ],

    /**
     *
     */
    handleLayerSetSelect: function(view, rec) {
        var me = this;
        me.currentTask = new Ext.util.DelayedTask(function(){
                me.handleLayerSetClick(view, rec);
            });
        me.currentTask.delay(200);
    },

    /**
     *
     */
    handleLayerSetSelectionchange: function() {
        var tree = Ext.ComponentQuery.query('k-panel-themetree')[0],
            treeStore = tree.getStore(),
            resetFilteringBtn = tree.down('button[name="resetThemeTree"]');

        treeStore.each(function(item){
            if(item && item.collapse){
                item.collapse();
            }
        });
        treeStore.clearFilter();
        resetFilteringBtn.setDisabled(true);
    },

    /**
     *
     */
    handleLayerSetClick: function(view, rec) {
        var me = this,
            tree = Ext.ComponentQuery.query('k-panel-themetree')[0],
            treeStore = tree.getStore(),
            resetFilteringBtn = tree.down('button[name="resetThemeTree"]');

        if (me.getView().showLayerProfiles) {
            // handle singleclicks like dblclicks...
            me.handleLayerSetDblClick(view, rec);
        } else {
            var match = treeStore.findRecord('text', rec.get('text'));

            treeStore.filterBy(function(record){
                var display = false;
                if (record.get('text') === rec.get('text')) {
                    display = true;
                } else {
                    record.bubble(function(node){
                        if (node.get('text') === rec.get('text')) {
                            display = true;
                        }
                    });
                }
                return display;
            });

            if (match && match.expand) {
                match.expand();
            }

            resetFilteringBtn.setDisabled(false);
        }
    },

    /**
     *
     */
    handleLayerSetDblClick: function(view, rec) {
        var me = this;
        me.currentTask.cancel();
        var layers = rec.get('children');
        me.addLayers(layers);

        if (me.getView().showLayerProfiles) {
            me.getView().up('window').close();
        }
    },

    /**
     * Adds all passed layers in the correct order to the map.
     *
     * This is how we do it:
     * * We first flatten the list (so the hierarchical information is lost, but
     *   order is kept).
     * * Next we query for the metadata in parallel and asynchronous manner.
     * * As the result come in, we create OpenLayers layers for the metadata and
     *   store them at the correct position in an intermediate array.
     * * Once the last metadata call was received, we can add all the layers to
     *   the map.
     *
     * @param {Array} layers An array of layers. A layer has the key `leaf`
     *   to determine if it ids a leaf or a folder. In case of a folder,
     *   layers have a key `children` which again holds layers.
     */
    addLayers: function(layers) {
        var LayerUtil = Koala.util.Layer;

        var orderedFlatLayers = LayerUtil.getOrderedFlatLayers(layers);
        var orderedRealLayers = [];
         // falsies are gone already
        var numLayersToCreate = orderedFlatLayers.length;
        var numLayersCreated = 0;

        // Now that the array is filled in the right way, let's reverse it so
        // that the configurable layers are looking like in a tree. This feels
        // more natural to editors of the external sources.
        //
        // See also https://redmine-koala.bfs.de/issues/1491#note-6
        orderedFlatLayers.reverse();

        Ext.each(orderedFlatLayers, function(layer, index) {
            if (!layer.leaf) {
                Ext.log.error('getOrderedFlatLayers failed to flatten ', layer);
            } else {
                var uuid = layer.uuid;
                // handle layers which shall be added but not be visible
                // initially, https://redmine-koala.bfs.de/issues/1445
                var initiallyVisible = true;
                if('visible' in layer) {
                    initiallyVisible = layer.visible;
                }
                var increaseAndCheckIfDone = function() {
                    numLayersCreated++;
                    if (numLayersCreated === numLayersToCreate) {
                        LayerUtil.addOlLayersToMap(orderedRealLayers);
                    }
                };
                /**
                 * This is the success callback for the fetching of metadata:
                 *
                 * Add the layer to the list of layers and check if we are
                 * done yet.
                 */
                var successCallback = function(metadata) {
                    var metadataClone = Ext.clone(metadata);
                    var olLayer = LayerUtil.layerFromMetadata(metadata);
                    LayerUtil.setOriginalMetadata(olLayer, metadataClone);
                    olLayer.setVisible(initiallyVisible);
                    orderedRealLayers[index] = olLayer;
                    increaseAndCheckIfDone();
                };
                /**
                 * This is the error callback for the fetching of metadata:
                 *
                 * In case of errors, we have to count up as well, otherwise
                 * one erroring layer will lead not a single layer being
                 * loaded.
                 */
                var errorCallback = function() {
                    orderedRealLayers[index] = null;
                    increaseAndCheckIfDone();
                };

                LayerUtil.getMetadataFromUuidAndThen(
                    uuid, successCallback, errorCallback
                );
            }
        });
    },

    /**
     *
     */
    registerMenuBehaviour: function(layersetchooser){
        var view = this.getView();
        if (!view.showLayerProfiles) {
            var mapContainer = layersetchooser.up('basigx-panel-mapcontainer');
            var menu = mapContainer.down('basigx-panel-menu');
            menu.on('collapse', function() {
                if (!layersetchooser.isHidden()) {
                    layersetchooser.hide(menu);
                    menu.on('expand', layersetchooser.show, layersetchooser, {
                        single: true
                    });
                }
            }, layersetchooser);
        }
    },

    /**
     *
     */
    filterLayerSetsByText: function(filterField, newVal) {
        var layerSetChooser = filterField.up('k-panel-layersetchooser');
        var layerProfileView = layerSetChooser.down('basigx-view-layerset');
        var store = layerProfileView.getStore();
        var lowercaseEntered = (newVal || '').toLowerCase();

        var nameFilterFunction = function(item) {
            var text = item.get('text').toLowerCase();
            var keepItem = false;

            if (text.indexOf(lowercaseEntered) >= 0) {
                // current item contains filter text
                keepItem = true;
            } else if (item.get('children').length > 0) {
                var matchFound = false;
                Ext.each(item.get('children'), function(child) {
                    var childText = child.text.toLowerCase();
                    if (childText.indexOf(lowercaseEntered) >= 0) {
                        // at least one child contains filtertext
                        matchFound = true;
                        return false; // break early
                    }
                });
                keepItem = matchFound;
            }
            return keepItem;
        };
        store.getFilters().replaceAll([ nameFilterFunction ] );
    }
});
