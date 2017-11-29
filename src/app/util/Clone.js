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
        'Koala.util.Layer'
    ],

    statics: {

        /* i18n */
        error: '',
        couldNotLoad: '',
        couldNotParse: '',
        /* i18n */

        /**
         * Creates a clone of the given layer.
         * @param  {ol.layer.Layer} layer the layer to clone
         * @param  {String} name the new layer name
         * @param  {Number} maxFeatures maximum features to request
         */
        cloneLayer: function(layer, name, maxFeatures) {
            var url = Koala.util.Object.getPathStrOr(layer.metadata, 'layerConfig/wfs/url');

            if (layer instanceof ol.layer.Vector) {
                this.cloneVectorLayer(layer);
            } else if (url) {
                this.cloneLayerFromWfs(layer, url, name, maxFeatures);
            }
        },

        /**
         * Clones the given layer by cloning all contained features.
         * @param  {ol.layer.Vector} layer the vector layerRec
         */
        cloneVectorLayer: function(layer) {
            var Layer = Koala.util.Layer;
            var features = layer.getSource().getFeatures();
            var metadata = Koala.util.Metadata.prepareClonedMetadata(layer.metadata);
            var source = new ol.source.Vector();
            Ext.each(features, function(feature) {
                source.addFeature(feature.clone());
            });
            var config = Layer.getInternalLayerConfig(metadata);
            config.source = source;
            config.metadata = metadata;
            config.name = layer.get('name') + '_vector';
            var result = new ol.layer.Vector(config);
            result.set(Layer.FIELDNAME_ORIGINAL_METADATA, Ext.clone(metadata));
            Koala.util.Layer.addOlLayerToMap(result);
        },

        /**
         * Clones the given layer from WFS using the given url.
         * @param  {ol.layer.Layer} layer the layer to cloneBtn
         * @param  {String} url   the WFS base url
         * @param  {String} layerName  the new layer name
         * @param  {Number} maxFeatures maximum features to request
         */
        cloneLayerFromWfs: function(layer, url, layerName, maxFeatures) {
            var name = Koala.util.Object.getPathStrOr(layer.metadata, 'layerConfig/wms/layers');
            var filter = Koala.util.Object.getPathStrOr(layer.metadata, 'layerConfig/olProperties/param_cql_filter');
            url = Ext.String.urlAppend(url, 'request=GetFeature');
            url = Ext.String.urlAppend(url, 'maxFeatures=' + maxFeatures);
            url = Ext.String.urlAppend(url, 'typename=' + name);
            url = Ext.String.urlAppend(url, 'service=WFS');
            url = Ext.String.urlAppend(url, 'version=1.1.0');
            url = Ext.String.urlAppend(url, 'outputformat=application/json');
            if (filter) {
                url = Ext.String.urlAppend(url, 'cql_filter=' + filter);
            }

            var metadata = Koala.util.Metadata.prepareClonedMetadata(layer.metadata);

            Ext.Ajax.request({
                url: url,
                success: this.getFeatureSuccess.bind(this, layer, metadata, layerName),
                failure: this.getFeatureFail.bind(this),
                timeout: 120000
            });
        },

        /**
         * The success callback after features have been loaded.
         * @param  {ol.layer.Layer} originalLayer the original layerRec
         * @param  {Object} metadata      the layer metadata
         * @param  {String} name          the new layer name
         * @param  {Object} response      the xhr response object
         */
        getFeatureSuccess: function(originalLayer, metadata, name, response) {
            var Layer = Koala.util.Layer;
            var source = new ol.source.Vector();
            var config = Layer.getInternalLayerConfig(metadata);
            config.source = source;
            config.metadata = metadata;
            config.name = name;
            var layer = new ol.layer.Vector(config);
            layer.set(Layer.FIELDNAME_ORIGINAL_METADATA, Ext.clone(metadata));
            layer.metadata = metadata;

            var fmt = new ol.format.GeoJSON();
            try {
                var features = fmt.readFeatures(response.responseText);
                source.addFeatures(features);
                Koala.util.Layer.addOlLayerToMap(layer);
            } catch (e) {
                Ext.Msg.alert(this.error, this.couldNotParse);
            }
        },

        /**
         * The failure callback when features could not be loaded.
         */
        getFeatureFail: function() {
            Ext.Msg.alert(this.error, this.couldNotLoad);
        }

    }

});
