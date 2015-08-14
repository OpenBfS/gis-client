/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
Ext.define('Koala.view.panel.RoutingLegendTreeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-routing-legendtree',

    requires: [
        'Koala.util.String'
    ],

    /**
     *
     */
    setRouting: function(store){
        var layers = [];
        store.each(function(rec){
            var olLayer = rec.getOlLayer();
            var routeId = olLayer.get('routeId');
            var visible = rec.getOlLayer().getVisible() ? "1" : "0";

            if (routeId && Koala.util.String.isUuid(routeId)) {
                var serialized = routeId + "_" + visible;
                if (!Ext.Array.contains(layers, serialized)) {
                    layers.push(serialized);
                }
            }
        });
        this.redirectTo('layers/' + layers.join(','));
    },

    onSelectionChange: function(selectionModel, selectedRecords){
        var store = this.getView().getStore();

        // Sets topic to false on every not selected layer that has an hoverfield
        if(selectedRecords.length > 0){
            store.each(function(layerRec){
                if(layerRec.getOlLayer().get('hoverfield')){
                    layerRec.getOlLayer().set('topic', false);
                }
            });
            // Sets topic to true for the selected layers that have an hoverfield
            Ext.each(selectedRecords, function(selectedRecord){
                var olLayer = selectedRecord.getOlLayer();
                if(olLayer && olLayer.get('hoverfield')){
                    olLayer.set('topic', true);
                }
            });
        // Sets topic to true on every layer that has an hoverfield, if none is selected
        } else {
            store.each(function(layerRec){
                if(layerRec.getOlLayer().get('hoverfield')){
                    layerRec.getOlLayer().set('topic', true);
                }
            });
        }
    }
});
