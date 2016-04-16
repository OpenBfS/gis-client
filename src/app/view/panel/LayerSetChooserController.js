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
     *
     */
    //TODO The layerorder of the json is not respected.
    addLayers: function(layers) {
        var me = this;
        Ext.each(layers, function(layer) {
            if (!layer.leaf) {
                me.addLayers(layer.children);
            } else {
                var uuid = layer.uuid;
                Koala.util.Layer.addLayerByUuid(uuid);
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
