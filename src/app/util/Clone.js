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
 * @class Koala.util.Clone
 */
Ext.define('Koala.util.Clone', {

    requires: [
        'Koala.util.Metadata',
        'Koala.util.Layer'
    ],

    statics: {

        /**
         * Creates a clone of the given layer.
         * @param  {ol.layer.Layer} layer the layer to clone
         */
        cloneLayer: function(layer) {
            var url = Koala.util.Object.getPathStrOr(layer.metadata, 'layerConfig/wfs/url');
            if (url) {
                this.cloneLayerFromWfs(layer, url);
            }
        },

        /**
         * Clones the given layer from WFS using the given url.
         * @param  {ol.layer.Layer} layer the layer to cloneBtn
         * @param  {String} url   the WFS base url
         */
        cloneLayerFromWfs: function(layer, url) {
            var name = Koala.util.Object.getPathStrOr(layer.metadata, 'layerConfig/wms/layers');
            var filter = Koala.util.Object.getPathStrOr(layer.metadata, 'layerConfig/olProperties/param_cql_filter');
            url = Ext.String.urlAppend(url, 'request=GetFeature');
            // TODO remove maxfeatures
            url = Ext.String.urlAppend(url, 'maxFeatures=50');
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
                success: this.getFeatureSuccess.bind(this, layer, metadata),
                failure: this.getFeatureFail.bind(this),
                timeout: 120000
            });
        },

        /**
         * The success callback after features have been loaded.
         * @param  {ol.layer.Layer} originalLayer the original layerRec
         * @param  {Object} metadata      the layer metadata
         * @param  {Object} response      the xhr response object
         */
        getFeatureSuccess: function(originalLayer, metadata, response) {
            var Layer = Koala.util.Layer;
            var source = new ol.source.Vector();
            var config = Layer.getInternalLayerConfig(metadata);
            config.source = source;
            config.metadata = metadata;
            var layer = new ol.layer.Vector(config);
            layer.set(Layer.FIELDNAME_ORIGINAL_METADATA, Ext.clone(metadata));

            var fmt = new ol.format.GeoJSON();
            try {
                var features = fmt.readFeatures(response.responseText);
                source.addFeatures(features);
                Koala.util.Layer.addOlLayerToMap(layer);
            } catch (e) {
                Ext.Msg.alert('Fehler', 'Die Daten konnten nicht ausgewertet werden.');
            }
        },

        /**
         * The failure callback when features could not be loaded.
         */
        getFeatureFail: function() {
            Ext.Msg.alert('Fehler', 'Die Daten konnten nicht geladen werden.');
        }

    }

});
