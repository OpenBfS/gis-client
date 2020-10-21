/* Copyright (c) 2020-present terrestris GmbH & Co. KG
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
 * @class Koala.view.button.FeatureSelectButtonController
 */
Ext.define('Koala.view.button.FeatureSelectButtonController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-button-featureselect',
    requires: [
        'Koala.util.SelectFeatures'
    ],
    targetLayer: null,

    init: function() {
        this.callParent();
        var me = this;
        this.targetLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        Ext.on('selectFeatures:featuresReceived', this.featureListener = function() {
            var grid = me.getView().window.down('grid');
            var fmt = new ol.format.GeoJSON();
            var olFeatures = me.targetLayer.getSource().getFeatures();
            var features = fmt.writeFeaturesObject(olFeatures).features;
            Koala.util.Grid.updateGridFeatures(grid, features);
            me.getView().setDisabled(false);
            if (!me.selectionSet) {
                grid.getSelectionModel().selectAll();
                me.selectionSet = true;
            }
        });
        this.updateFeatures();
    },

    onClick: function() {
        this.getView().window.show();
    },

    onBeforeDestroy: function() {
        Ext.un('selectFeatures:featuresReceived', this.featureListener);
    },

    updateFeatures: function() {
        var view = this.getView();
        var layer = view.getLayer();
        this.targetLayer.getSource().clear();
        if (!view.getTransformInteraction()) {
            return;
        }
        var boxFeature = view.getTransformInteraction().layers_[0].getSource().getFeatures()[0];
        var extent = boxFeature.getGeometry().getExtent();

        if (layer instanceof ol.layer.Vector) {
            Koala.util.SelectFeatures.getFeaturesFromVectorLayerByBbox(layer, this.targetLayer, extent);
        } else {
            Koala.util.SelectFeatures.getFeaturesFromWmsLayerByBbox(layer, this.targetLayer, extent);
        }
    }

});
