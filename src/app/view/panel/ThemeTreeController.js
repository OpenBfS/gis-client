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
 * @class Koala.view.panel.ThemeTreeController
 */
Ext.define('Koala.view.panel.ThemeTreeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-themetree',

    require: [
        'Koala.view.form.RodosFilter'
    ],

    currentTask: null,

    collapseAll: function() {
        var view = this.getView();
        view.collapseAll();
    },

    expandAll: function() {
        var view = this.getView();
        view.expandAll();
    },

    toggleLayerSetView: function() {
        var view = this.getView();
        var mapContainer = view.up('basigx-panel-mapcontainer');
        var layersetchooser = mapContainer.down('k-panel-layersetchooser');

        if (layersetchooser.isVisible()) {
            layersetchooser.hide();
        } else {
            layersetchooser.showAt(view.getWidth(), view.getLocalY());
        }
    },

    resetThemeTreeFiltering: function(btn) {
        var themeTree = this.getView();
        var themeStore = themeTree.getStore();
        var layersetView = Ext.ComponentQuery.query('basigx-view-layerset')[0];
        layersetView.setSelection(null);
        themeStore.clearFilter();
        themeStore.getRoot().expandChildren();
        btn.disable();
    },

    setupShowFilterWinCheck: function(treepanel, item) {
        var me = this;
        if (me.currentTask) {
            me.currentTask.cancel();
        }
        me.currentTask = new Ext.util.DelayedTask(function() {
            if (item.isLeaf()) {
                Koala.util.Layer.getMetadataFromUuid(item.get('uuid')).then(
                    function(metadata) {
                        if (item.get('isRodosLayer') && item.get('rodosFilters')) {
                            metadata.filters = Ext.Array.merge(
                                metadata.filters, item.get('rodosFilters')
                            );
                            metadata.isRodosLayer = item.get('isRodosLayer');
                            metadata.description = item.get('description');
                        }
                        Koala.util.Layer.showChangeFilterSettingsWin(metadata);
                    }
                );
            }
        });
        me.currentTask.delay(500);
    },

    /**
     * Dispatch between rodos window and refreshing the tree.
     */
    handleActionColumn: function(view, rowIndex, colIndex, item) {
        if (rowIndex === 0) {
            this.showRodosFilter(view, rowIndex, colIndex, item);
        } else if (rowIndex === 1) {
            this.showVideoSelection(view, rowIndex, colIndex, item);
        } else {
            this.getView().rebuildTree();
        }
    },

    showVideoSelection: function() {
        var viewModel = this.getViewModel();
        var appContext = BasiGX.view.component.Map.guess().appContext;
        var path = [
            'data',
            'merge',
            'urls',
            'videos'
        ];
        var videosUrl = Koala.util.Object.getPathOr(appContext, path, '/resources/videos');
        Ext.Ajax.request({
            url: videosUrl
        })
            .then(function(xhr) {
                var list = JSON.parse(xhr.responseText);
                Ext.create('Ext.window.Window', {
                    title: viewModel.get('videoWindowTitle'),
                    name: 'video-window',
                    layout: 'fit',
                    items: [{
                        xtype: 'combo',
                        displayField: 'name',
                        valueField: 'urls',
                        fieldLabel: viewModel.get('videoComboText'),
                        store: Ext.create('Ext.data.Store', {
                            fields: ['name', 'urls'],
                            data: list.videos
                        })
                    }]
                }).show();
            });
    },

    showRodosFilter: function(view, rowIndex, colIndex, item) {
        var viewModel = this.getViewModel();
        var win = Ext.ComponentQuery.query('window[name=rodos-window]')[0];
        if (!win) {
            var x = item.getX() + item.getWidth();
            var y = item.getY();
            Ext.create('Ext.window.Window', {
                title: viewModel.get('rodosWindowTitle'),
                name: 'rodos-window',
                layout: 'fit',
                items: [{
                    xtype: 'k-form-rodosfilter',
                    minWidth: 400
                }]
            }).showAt(x, y);
        } else {
            BasiGX.util.Animate.shake(win);
        }
    },

    addLayerWithDefaultFilters: function(treepanel, item) {
        // TODO if we want equal behaviour for sets and profiles, the
        //      changes from https://redmine-koala.bfs.de/issues/1445
        //      we have to share the logic in LayerSetChooserController
        //      method addLayers (`visible` setting)
        var me = this;
        if (me.currentTask) {
            me.currentTask.cancel();
        }
        if (item.isLeaf()) {
            Koala.util.Layer.getMetadataFromUuid(item.get('uuid')).then(
                function(metadata) {
                    if (item.get('isRodosLayer') && item.get('rodosFilters')) {
                        metadata.filters = Ext.Array.merge(
                            metadata.filters, item.get('rodosFilters')
                        );
                        metadata.isRodosLayer = item.get('isRodosLayer');
                        metadata.description = item.get('description');
                    }
                    Koala.util.Layer.addLayerToMap(metadata);
                }
            );
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
