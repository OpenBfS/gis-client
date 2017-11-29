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
         * @param  {ol.layer.Layer} layer the layer to clone
         * @param  {String} name the new layer name
         * @param  {Number} maxFeatures maximum features to request
         */
        cloneLayer: function(sourceLayer, name, maxFeatures, bbox) {
            var targetLayer = this.createLayer(sourceLayer, name);
            var SelectFeatures = Koala.util.SelectFeatures;

            if (sourceLayer instanceof ol.layer.Vector) {
                if (bbox) {
                    SelectFeatures.getFeaturesFromVectorLayerByBbox(
                        sourceLayer,
                        targetLayer,
                        bbox
                    );
                } else {
                    SelectFeatures.getAllFeaturesFromVectorLayer(
                        sourceLayer,
                        targetLayer
                    );
                }
            } else {
                SelectFeatures.getFeaturesFromWmsLayerByBbox(
                    sourceLayer,
                    targetLayer,
                    bbox,
                    maxFeatures
                );
            }
        },

        createLayer: function(layer, name) {
            var Layer = Koala.util.Layer;
            var metadata = Koala.util.Metadata.prepareClonedMetadata(layer.metadata);
            var source = new ol.source.Vector();
            var config = Layer.getInternalLayerConfig(metadata);
            config.source = source;
            config.metadata = metadata;
            config.name = name;
            var result = new ol.layer.Vector(config);
            result.set(Layer.FIELDNAME_ORIGINAL_METADATA, Ext.clone(metadata));
            result.metadata = Ext.clone(metadata);
            Koala.util.Layer.addOlLayerToMap(result);
            return result;
        }

    }

});
