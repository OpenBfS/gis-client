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
 * @class Koala.view.panel.ThemeTreeController
 */
Ext.define('Koala.view.panel.ThemeTreeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-themetree',

    toggleLayerSetView: function () {
        var view = this.getView();
        var menu = view.up('basigx-panel-menu');
        var mapContainer = view.up('basigx-panel-mapcontainer');
        var layersetchooser = mapContainer.down('k-panel-layersetchooser');

        if (layersetchooser.isVisible()) {
            layersetchooser.hide();
        } else {
            layersetchooser.showAt(menu.getWidth(), view.getLocalY());
        }
    },

    resetThemeTreeFiltering: function (btn) {
        var themeTree = this.getView();
        var themeStore = themeTree.getStore();
        themeStore.clearFilter();
        themeStore.getRoot().expandChildren();
        btn.disable();
    },

    currentTask: null,

    setupShowFilterWinCheck: function(treepanel, item) {
        var me = this;
        if (me.currentTask) {
            me.currentTask.cancel();
        }
        me.currentTask = new Ext.util.DelayedTask(function(){
            if (item.isLeaf()) {
                Koala.util.Layer.showChangeFilterSettingsWinByUuid(
                    item.get('uuid')
                );
            }
        });
        me.currentTask.delay(500);
    },

    addLayerWithDefaultFilters:  function(treepanel, item) {
        // TODO if we want equal behaviour for sets and profiles, the
        //      changes from https://redmine-koala.bfs.de/issues/1445
        //      we have to share the logic in LayerSetChooserController
        //      method addLayers (`visible` setting)
        var me = this;
        if (me.currentTask) {
            me.currentTask.cancel();
        }
        if (item.isLeaf()) {
            Koala.util.Layer.addLayerByUuid(item.get('uuid'));
        } else {
            Ext.each(item.children, function(layer) {
                Koala.util.Layer.addLayerByUuid(layer.uuid);
            });
        }
        // TODO similar code is in the LayerFilterController, we should
        //      try to reuse code there.
        var treeSelModel = treepanel && treepanel.getSelectionModel();
        if (treeSelModel) {
            treeSelModel.deselectAll();
        }
    }
});
