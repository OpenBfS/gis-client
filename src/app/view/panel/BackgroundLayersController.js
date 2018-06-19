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
 * @class Koala.view.panel.BackgroundLayersController
 */
Ext.define('Koala.view.panel.BackgroundLayersController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-backgroundLayers',
    require: [
        'Koala.util.Layer'
    ],
    /**
     * checkChange function - change of checkbox triggers this function
     */
    checkChange: function(box, checked) {
        var map = BasiGX.util.Map.getMapComponent().map;
        var layerCollection = map.getLayers();
        var layer = this.layerInMap(box.uuid);
        if (!layer) {
            Koala.util.Layer.getMetadataFromUuid(box.uuid).then(function(metadata) {
                layer = Koala.util.Layer.layerFromMetadata(metadata);
                layerCollection.insertAt(0,layer);
                layer.setVisible(checked);
            });
        } else {
            layer.setVisible(checked);
        }
    },
    /**
     * layerInMap function -  Checks to see if the layer is already in the map and returns the layer
     */
    layerInMap: function(uuid) {
        var map = BasiGX.util.Map.getMapComponent().map;
        var layerCollection = map.getLayers();
        var layers = layerCollection.getArray();
        var layer ;
        layers.forEach(function(lyr) {
            if (lyr.metadata && lyr.metadata.id === uuid) {
                layer = lyr;
            }
        });
        return layer;
    }

});
