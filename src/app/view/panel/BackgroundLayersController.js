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
        'Koala.util.Layer',
        'Koala.util.AppContext'
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
    },
    /**
     * onBoxReady - renderes the checkbox list for the background layers
     */
    onBoxReady: function() {
        var me = this;
        var appContext = Koala.util.AppContext.getAppContext();
        if (appContext && appContext.data && appContext.data.merge) {
            var backgroundLayers = appContext.data.merge.backgroundLayers;
            var container = Ext.ComponentQuery.query('container[name=backgroundlayer-checkbox-list]')[0];
            Ext.each(backgroundLayers, function(layerObj) {
                Koala.util.Layer.getMetadataFromUuid(layerObj.uuid).then(function(metadata) {
                    if (metadata) {
                        var layer = me.layerInMap(layerObj.uuid);
                        var layerAlreadyInMap = layer && layer.getVisible() ? true : false;
                        var layerThumb = 'classic/resources/img/themes/' + layerObj.thumb;
                        var ele = [
                            {
                                xtype: 'image',
                                alt: 'background image ',
                                style: 'display: inline;',
                                height: 45,
                                src: layerThumb
                            }, {
                                xtype: 'checkbox',
                                style: 'display: inline-block; text-align: center;',
                                padding: 5,
                                checked: layerAlreadyInMap,
                                boxLabel: metadata.legendTitle,
                                uuid: layerObj.uuid,
                                listeners: {
                                    change: 'checkChange'
                                }
                            }];
                        container.add(ele);
                    }
                });
            });
        }
    }

});
