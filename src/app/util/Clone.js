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
         * Load and apply a style for a vector layer.
         * @param {String} baseUrl the GeoServer base url
         * @param {String} styleName the style name to load
         * @param {ol.layer.Vector} targetLayer the layer to apply the style to
         */
        loadStyle: function(baseUrl, styleName, targetLayer) {
            var url = baseUrl + '/rest/styles/' + styleName + '.sld';
            Ext.Ajax.request({
                url: url,
                method: 'GET'
            })
                .then(function(response) {
                    var sldParser = new GeoStylerSLDParser.SldStyleParser();
                    targetLayer.set('SLD', response.responseText);
                    sldParser.readStyle(response.responseText)
                        .then(function(gsStyle) {
                            var olParser = new GeoStylerOpenlayersParser.OlStyleParser(ol);
                            olParser.writeStyle(gsStyle)
                                .then(function(olStyle) {
                                    targetLayer.setStyle(olStyle);
                                });
                        });
                });
        },

        /**
         * Creates a clone of the given layer.
         * @param  {ol.layer.Layer} sourceLayer the layer to clone the metadata
         * from
         * @param  {String} name the new layer name
         * @param  {Number} maxFeatures maximum features to request
         * @param  {Array} bbox the bounding box to clone from, or undefined
         * @param  {ol.layer.Layer} dataSourceLayer the layer to clone the
         * @param  {String} uuid the uuid of the template to clone metadata from
         * data from, or undefined
         * @param  {Boolean} copyStyle whether to copy the source layer's style
         */
        cloneLayer: function(sourceLayer, name, maxFeatures, bbox, dataSourceLayer, uuid, copyStyle) {
            var targetLayerPromise = this.createLayer(sourceLayer, name, uuid);
            var SelectFeatures = Koala.util.SelectFeatures;

            targetLayerPromise.then(function(targetLayer) {
                if (copyStyle) {
                    if (sourceLayer.get('SLD')) {
                        targetLayer.set('SLD', sourceLayer.get('SLD'));
                        targetLayer.setStyle(sourceLayer.getStyle());
                    } else {
                        var wmsConfig = sourceLayer.metadata.layerConfig.wms;
                        var ms = /^(.+ogc).+$/g.exec(wmsConfig.url);
                        var styleName = wmsConfig.styles;
                        if (!styleName) {
                            Ext.Ajax.request({
                                url: ms[1] + '/rest/layers/' + wmsConfig.layers + '.json',
                                method: 'GET'
                            })
                                .then(function(response) {
                                    styleName = JSON.parse(response.responseText);
                                    styleName = styleName.layer.defaultStyle.name;
                                    Koala.util.Clone.loadStyle(ms[1], styleName, targetLayer);
                                });
                        } else {
                            Koala.util.Clone.loadStyle(ms[1], styleName, targetLayer);
                        }
                    }
                }
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
            });
            return targetLayerPromise;
        },

        /**
         * Create a cloned layer and add it to the map.
         * @param  {ol.layer.Layer} layer the layer to clone the metadata from
         * @param  {String} name  the new layer's name
         * @param  {String} uuid the uuid of the metadata template to clone
         * @return {Ext.Promise} a promise resolving to the new layer
         */
        createLayer: function(layer, name, uuid) {
            var Layer = Koala.util.Layer;
            var promise = new Ext.Promise(function(resolve, reject) {
                Layer.getMetadataFromUuid(uuid)
                    .then(function(metadata) {
                        metadata = Koala.util.Metadata.prepareClonedMetadata(metadata);
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
                        resolve(result);
                    })
                    .catch(reject);
            });
            return promise;
        }

    }

});
