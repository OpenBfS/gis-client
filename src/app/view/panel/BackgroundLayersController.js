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
     * checkChange function - change of checkbox triggers this function
     */
    checkChange: function(box, checked) {
        var view = this.getView();
        var map = BasiGX.util.Map.getMapComponent().map;
        var layerCollection = map.getLayers();
        var layers = layerCollection.getArray();
        var layer = this.layerInMap(box.uuid);
        layers.forEach(function(lyr) {
            if(lyr.isBackground){
                map.removeLayer(lyr);
            }
        });
        layerCollection = map.getLayers();
        if (!layer) {
            Koala.util.Layer.getMetadataFromUuid(box.uuid).then(function(metadata) {
                layer = Koala.util.Layer.layerFromMetadata(metadata);
                layer.isBackground = true;
                layerCollection.insertAt(0,layer);
                layer.setVisible(checked);
            });
        } else {
            layer.setVisible(checked);
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
                        var layerAlreadyInMap = layer && layer.getVisible() ? true : false;
                        var layerThumb = 'classic/resources/img/themes/' + layerObj.thumb;
                        var ele = [{
                            xtype: 'container',
                            layout: 'hbox',
                            flex: 1,
                            height: '100%',
                            width: '100%',
                            defaultType: 'radiofield',
                            items: [{
                                xtype: 'image',
                                height: 45,
                                src: layerThumb,
                                flex: 1
                            }, {
                                style: 'text-align: center;',
                                padding: 5,
                                name: 'backgroundlayers',
                                checked: layerAlreadyInMap,
                                boxLabel: metadata.legendTitle,
                                uuid: layerObj.uuid,
                                listeners: {
                                    focus: 'checkChange'
                                },
                                flex: 3
                            }]
                        }];
                        container.add(ele);
                    }
                });
            });
        }
    }

});
