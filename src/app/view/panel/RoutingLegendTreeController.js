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
                if (olLayer && olLayer.get( keyHovertpl )) {
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

    onLegendItemDrop: function() {
        var LayerUtil = Koala.util.Layer;
        LayerUtil.repaintLayerFilterIndication();
    }
});
