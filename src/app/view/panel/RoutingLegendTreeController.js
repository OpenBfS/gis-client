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
 * @class Koala.view.panel.RoutingLegendTreeController
 */
Ext.define('Koala.view.panel.RoutingLegendTreeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-routing-legendtree',

    requires: [
        'Koala.util.Layer',
        'Koala.util.String'
    ],

    /**
     * Ensure the layer filter text indicator will be drawn.
     */
    onFirstExpand: function() {
        Koala.util.Layer.repaintLayerFilterIndication();
    },

    /**
     *
     */
    setRouting: function(store) {
        var layers = [];
        store.each(function(rec) {
            var olLayer = rec.getOlLayer();
            var routeId = olLayer.get('routeId');
            var visible = rec.getOlLayer().getVisible() ? '1' : '0';

            if (routeId && Koala.util.String.isUuid(routeId)) {
                var serialized = routeId + '_' + visible;
                if (!Ext.Array.contains(layers, serialized)) {
                    layers.push(serialized);
                }
            }
        });
        this.redirectTo('layers/' + layers.join(','));
    },

    onSelectionChange: function(selectionModel, selectedRecords) {
        var store = this.getView().getStore();
        var keyHoverable = BasiGX.plugin.Hover.LAYER_HOVERABLE_PROPERTY_NAME;
        var keyHovertpl = 'hoverTpl';
        var olLayer;
        if (selectedRecords.length > 0) {
            // Sets keyHoverable to false on every not selected layer
            store.each(function(layerRec) {
                olLayer = layerRec.getOlLayer();
                if (olLayer /* && olLayer.get(keyHovertpl) */ ) {
                    olLayer.set(keyHoverable, false);
                }
            });
            // Sets keyHoverable to true for the selected layers that have an
            // hoverTpl
            Ext.each(selectedRecords, function(selectedRecord) {
                olLayer = selectedRecord.getOlLayer();
                //TODO: 2nd if-clause is a workaround cause keyHoverable gets misused as boolean to see whether layer is selected or not
                //      -> logical fix in BasiGX necessary
                var hoverPath = 'metadata/layerConfig/olProperties/allowHover';
                var allowHover = Koala.util.Object.getPathStrOr(olLayer, hoverPath, undefined);
                if (!olLayer.metadata) {
                    allowHover = '' + olLayer.get('allowHover');
                }
                if (olLayer && olLayer.get( keyHovertpl ) && (allowHover === 'true')) {
                    olLayer.set(keyHoverable, true);
                }
            });
        } else {
            // Sets keyHoverable to true on every layer that has an hoverTpl,
            // if none is selected
            store.each(function(layerRec) {
                olLayer = layerRec.getOlLayer();
                if (olLayer && olLayer.get( keyHovertpl )) {
                    olLayer.set(keyHoverable, true);
                }
            });
        }
    },

    bindUtcBtnToggleHandler: function() {
        var util = Koala.util.Layer;
        var utcBtns = Ext.ComponentQuery.query('k-button-timereference');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.on('toggle', util.repaintLayerFilterIndication, util);
        });
    },

    unbindUtcBtnToggleHandler: function() {
        var util = Koala.util.Layer;
        var utcBtns = Ext.ComponentQuery.query('k-button-timereference');
        Ext.each(utcBtns, function(utcBtn) {
            utcBtn.un('toggle', util.repaintLayerFilterIndication, util);
        });
    },

    updateLayerOrder: function() {
        var me = this;
        var view = me.getView();
        if (view === null) {
            return;
        }
        var treeView = view.getView();
        var recs = treeView.getStore().getData().items;
        Ext.each(recs, function(rec, idx) {
            var layer = rec.getOlLayer();
            layer.setZIndex(recs.length - idx);
        });
    },

    onLegendItemDrop: function() {
        var LayerUtil = Koala.util.Layer;
        LayerUtil.repaintLayerFilterIndication();
        this.updateLayerOrder();
    },

    checkLayerAndLegendVisibility: function(node, visible) {
        var me = this;
        var view = me.getView();
        var treeView = view.getView();
        var layer = node.getOlLayer();
        var rowExpanderPlugin = view.getPlugin('rowexpanderwithcomponents');
        var idx = treeView.indexOfRow(node);
        var legendVisible = layer[view.itemExpandedKey];
        // collapse the legend when node is set to invisible
        if (!visible && legendVisible) {
            rowExpanderPlugin.toggleRow(idx, node);
        }
        // expand the legend when node is set to visible
        if (visible && !legendVisible) {
            rowExpanderPlugin.toggleRow(idx, node);
        }
        // go over all nodes and check if the visibility must be updated
        var recs = treeView.getStore().getUpdatedRecords();
        Ext.each(recs, function(rec) {
            var row = treeView.getRowByRecord(rec);
            if (!row || rec === node) {
                return;
            }
            var el = Ext.get(row).dom;
            var body = el.nextElementSibling;
            if (body.classList.contains('x-grid-row-body-hidden')) {
                return;
            }
            idx = treeView.indexOfRow(rec);
            // Looks like the rows all get recreated if anything on the
            // records changes. Unfortunately, record changes are not to
            // be avoided in case the checkbox is clicked, so we're back
            // to the old workaround in this case. Perhaps this can be
            // avoided somehow by capturing the appropriate event, but
            // since this works and doesn't seem to have ill side effects,
            // this is the workaround for now (this only happens when
            // toggling layers anyway).
            treeView.fireEvent('expandbody', treeView.getNode(idx), rec, Ext.fly(treeView.getNode(idx)).down('.' + Ext.baseCSSPrefix + 'grid-rowbody-tr', true));
        });
    },

    /**
     * Makes sure that any dragged layer will not stay on top even if configured
     * with the alwaysOnTop property.
     * @param  {Ext.data.NodeInterface} node the dragged tree node
     */
    removeAlwaysOnTopProperty: function(node) {
        var layer = node.getOlLayer();
        var path = 'metadata/layerConfig/olProperties/alwaysOnTop';
        var alwaysOnTop = Koala.util.Object.getPathOr(layer, path, false);
        if (alwaysOnTop) {
            layer.metadata.layerConfig.olProperties.alwaysOnTop = false;
        }
    }
});
