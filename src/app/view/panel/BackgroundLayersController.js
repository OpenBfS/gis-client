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
        'Ext.util.DelayedTask',
        'Koala.util.Layer',
        'Koala.util.AppContext'
    ],

    /**
     * onClick function
     */
    onClick: function(checked) {
        var view = this.getView();
        // can happen if one of the layers is not available
        if (!checked) {
            return;
        }
        var map = BasiGX.util.Map.getMapComponent().map;
        var layerCollection = map.getLayers();
        var layers = layerCollection.getArray();
        var layer = this.layerInMap(checked.uuid);
        layers.forEach(function(lyr) {
            if (lyr.isBackground) {
                map.removeLayer(lyr);
            }
        });

        layerCollection = map.getLayers();
        if (!layer) {
            Koala.util.Layer.getMetadataFromUuid(checked.uuid).then(function(metadata) {
                layer = Koala.util.Layer.layerFromMetadata(metadata);
                layer.isBackground = true;
                layerCollection.insertAt(0, layer);
                layer.setVisible(true);
            });
        } else {
            layerCollection.insertAt(0, layer);
        }
        view.up('[name=backgroundLayers-window]').close();
        return false;
    },


    /**
     * layerInMap function -  Checks to see if the layer is already in the map and returns the layer
     */
    layerInMap: function(uuid) {
        var map = BasiGX.util.Map.getMapComponent().map;
        var layerCollection = map.getLayers();
        var layers = layerCollection.getArray();
        var layer;
        layers.forEach(function(lyr) {
            if (lyr.metadata && (lyr.metadata.id === uuid)) {
                layer = lyr;
            }
        });
        return layer;
    },

    /**
     * onBoxReady - renderes the radio list for the background layers
     */
    onBoxReady: function() {
        var me = this;
        var appContext = Koala.util.AppContext.getAppContext();
        if (appContext && appContext.data && appContext.data.merge) {
            var backgroundLayers = appContext.data.merge.backgroundLayers;
            var container = this.getView().down('container[name=backgroundlayer-radio-list]');
            Ext.each(backgroundLayers, function(layerObj) {
                Koala.util.Layer.getMetadataFromUuid(layerObj.uuid).then(function(metadata) {
                    if (metadata) {
                        var layer = me.layerInMap(layerObj.uuid);
                        if (layer) {
                            layer.isBackground = true;
                        }
                        var layerThumb = 'classic/resources/img/themes/' + layerObj.thumb;
                        var ele = [{
                            xtype: 'container',
                            layout: 'hbox',
                            flex: 1,
                            height: '100%',
                            width: '100%',
                            items: [{
                                xtype: 'image',
                                height: 58,
                                width: 110,
                                src: layerThumb
                            }, {
                                xtype: 'button',
                                cls: 'text-button',
                                textAlign: 'center',
                                padding: 5,
                                margin: '15 5 5 5',
                                name: 'backgroundlayers',
                                text: metadata.legendTitle,
                                uuid: layerObj.uuid,
                                flex: 1,
                                handler: me.onClick.bind(me)
                            }]
                        }];
                        container.add(ele);
                    }
                });
            });
        }
    }

});
