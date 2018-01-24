/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
 * @class Koala.util.Clone
 */
Ext.define('Koala.util.Clone', {

    requires: [
        'Koala.util.Metadata',
        'Koala.util.Layer',
        'Koala.util.SelectFeatures'
    ],

    statics: {

        /**
         * Creates a clone of the given layer.
         * @param  {ol.layer.Layer} sourceLayer the layer to clone the metadata
         * from
         * @param  {String} name the new layer name
         * @param  {Number} maxFeatures maximum features to request
         * @param  {Array} bbox the bounding box to clone from, or undefined
         * @param  {ol.layer.Layer} dataSourceLayer the layer to clone the
         * data from, or undefined
         */
        cloneLayer: function(sourceLayer, name, maxFeatures, bbox, dataSourceLayer) {
            var targetLayer = this.createLayer(sourceLayer, name);
            var SelectFeatures = Koala.util.SelectFeatures;

            if (dataSourceLayer instanceof ol.layer.Vector) {
                if (bbox) {
                    SelectFeatures.getFeaturesFromVectorLayerByBbox(
                        dataSourceLayer,
                        targetLayer,
                        bbox
                    );
                } else {
                    SelectFeatures.getAllFeaturesFromVectorLayer(
                        dataSourceLayer,
                        targetLayer
                    );
                }
            } else if (dataSourceLayer) {
                SelectFeatures.getFeaturesFromWmsLayerByBbox(
                    dataSourceLayer,
                    targetLayer,
                    bbox,
                    maxFeatures
                );
            }
        },

        /**
         * Create a cloned layer and add it to the map.
         * @param  {ol.layer.Layer} layer the layer to clone the metadata from
         * @param  {String} name  the new layer's name
         * @return {ol.layer.Vector}       the new layer
         */
        createLayer: function(layer, name) {
            var Layer = Koala.util.Layer;
            var metadata = Koala.util.Metadata.prepareClonedMetadata(layer.metadata);
            var source = new ol.source.Vector({features: new ol.Collection()});
            var config = Layer.getInternalLayerConfig(metadata);
            config.source = source;
            config.metadata = metadata;
            config.name = name;
            config.persisted = false;
            var result = new ol.layer.Vector(config);
            result.set(Layer.FIELDNAME_ORIGINAL_METADATA, Ext.clone(metadata));
            result.metadata = Ext.clone(metadata);
            Koala.util.Layer.addOlLayerToMap(result);
            return result;
        }

    }

});
