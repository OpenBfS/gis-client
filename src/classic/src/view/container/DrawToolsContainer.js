/* Copyright (c) 2016-present terrestris
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
 * Container containing the redlining tools for the temporary drawing in the
 * client.
 *
 * @class Koala.view.container.DrawToolsContainer
 */
Ext.define('Koala.view.container.DrawToolsContainer', {
    extend: 'Ext.container.Container',

    xtype: 'k-container-drawtoolscontainer',

    requires: [
        'Ext.button.Button',

        'Koala.view.container.DrawToolsContainerModel'
    ],

    viewModel: 'k-container-drawtoolscontainer',

    width: 350,

    map: null,

    defaults: {
        xtype: 'button',
        scale: 'large',
        ui: 'default-toolbar',
        margin: '0 0 10px 10px'
    },

    drawLayerStyle: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    }),

    initComponent: function() {
        var me = this;
        var viewModel = me.getViewModel();
        var mapComponent = BasiGX.util.Map.getMapComponent();
        var map = mapComponent.getMap();
        me.setupLayerAndCollection(map);
        me.items = [{
            map: map,
            layer: me.drawVectorLayer,
            xtype: 'basigx-button-digitize-point',
            glyph: 'xf100@Flaticon',
            viewModel: {
                data: {
                    tooltip: viewModel.get('pointTooltip')
                }
            }
        }, {
            map: map,
            layer: me.drawVectorLayer,
            xtype: 'basigx-button-digitize-line',
            glyph: 'xf104@Flaticon',
            viewModel: {
                data: {
                    tooltip: viewModel.get('lineTooltip')
                }
            }
        }, {
            map: map,
            layer: me.drawVectorLayer,
            xtype: 'basigx-button-digitize-polygon',
            glyph: 'xf107@Flaticon',
            viewModel: {
                data: {
                    tooltip: viewModel.get('polygonTooltip')
                }
            }
        }, {
            map: map,
            collection: me.drawFeatures,
            xtype: 'basigx-button-digitize-postit',
            glyph: 'f10a@Flaticon',
            viewModel: {
                data: {
                    tooltip: viewModel.get('postItTooltip'),
                    drawPostItBtnText: '',
                    postItWindowTitle: viewModel.get('postItWindowTitle'),
                    postItWindowCreatePostItBtnText: viewModel.get('postItWindowCreatePostItBtnText'),
                    postItInputTooLongText: viewModel.get('postItInputTooLongText')
                }
            }
        }, {
            map: map,
            collection: me.drawFeatures,
            xtype: 'basigx-button-digitize-modify-object',
            glyph: 'xf044@FontAwesome',
            viewModel: {
                data: {
                    tooltip: viewModel.get('modifyTooltip'),
                    postItWindowTitle: viewModel.get('postItWindowTitle'),
                    postItWindowCreatePostItBtnText: viewModel.get('postItWindowCreatePostItBtnText'),
                    postItInputTooLongText: viewModel.get('postItInputTooLongText')
                }
            }
        }, {
            map: map,
            collection: me.drawFeatures,
            xtype: 'basigx-button-digitize-delete-object',
            glyph: 'xf12d@FontAwesome',
            viewModel: {
                data: {
                    tooltip: viewModel.get('deleteTooltip')
                }
            }
        }, {
            xtype: 'button',
            glyph: 'f014@FontAwesome',
            tooltip: viewModel.get('clearTooltip'),
            handler: function() {
                me.drawVectorLayer.getSource().clear();
            }
        }];
        me.callParent(arguments);
    },

    setupLayerAndCollection: function(map) {
        var me = this;
        var appContext = Koala.util.AppContext.getAppContext();
        var drawLayerName = appContext.data.merge.drawLayerName || me.getViewModel().get('layerLegendName');

        me.drawVectorLayer = BasiGX.util.Layer.getLayerByName(drawLayerName);

        if (me.drawVectorLayer) {
            me.drawFeatures = me.drawVectorLayer.getSource().getFeaturesCollection();
        } else {
            me.drawFeatures = new ol.Collection();
            me.drawVectorLayer = new ol.layer.Vector({
                name: drawLayerName,
                source: new ol.source.Vector({
                    features: me.drawFeatures
                }),
                style: me.drawLayerStyle,
                printSpecial: true,
                // TODO We do a check manually check on the RoutingLegendTree to
                // disbale styling for this layer.
                disableStyling: true,
                allowRemoval: true
            });
            map.addLayer(me.drawVectorLayer);
        }
    }

});
