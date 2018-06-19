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
 * @class Koala.view.panel.BackgroundLayers
 */
Ext.define('Koala.view.panel.BackgroundLayers', {
    extend: 'Ext.panel.Panel',
    xtype: 'k-panel-backgroundLayers',

    requires: [
        'Koala.view.panel.BackgroundLayersController',
        'Koala.view.panel.BackgroundLayersModel',
        'Koala.util.Layer',
        'Koala.util.MetadataParser'
    ],

    controller: 'k-panel-backgroundLayers',
    viewModel: {
        type: 'k-panel-backgroundLayers'
    },
    /**
     * initComponent function rendering the checkbox for each background image
     */
    initComponent: function () {
        this.callParent();
        var me = this;
        var appContext = Ext.ComponentQuery.query('k-component-map')[0].appContext;
        if (appContext && appContext.data && appContext.data.merge) {
            var backgroundLayers = appContext.data.merge.backgroundLayers;
            var container = this.down('container[name=backgroundlayer-checkbox-list]');
            Ext.each(backgroundLayers, function (layerObj) {
                Koala.util.Layer.getMetadataFromUuid(layerObj.uuid).then(function (metadata) {
                    if (metadata) {
                        var config = metadata.layerConfig;
                        var map = BasiGX.util.Map.getMapComponent().map;
                        var layerCollection = map.getLayers();
                        var layers = layerCollection.getArray();
                        var layer = me.getController().layerInMap(layerObj.uuid);
                        var layerAlreadyInMap = layer && layer.getVisible() ? true : false;
                        if (config.olProperties && config.olProperties.toggleBgLayerMenuIcon) {
                            var ele = [
                                {
                                    xtype: 'image',
                                    alt: 'background image ',
                                    height: 45,
                                    width: 45,
                                    src: 'classic/resources/img/themes/' + layerObj.thumb,
                                }, {
                                    xtype: 'checkbox',
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
                    }
                });
            });
        }
    },
    items: [{
        xtype: 'container',
        defaultType: 'checkboxfield',
        name: 'backgroundlayer-checkbox-list',
        layout: 'hbox',
        minWidth: 350,
        minHeight: 150,
        items: []
    }]
});
