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
            if (styleName.indexOf('url:') === 0) {
                url = styleName;
            }
            Ext.Ajax.request({
                url: url,
                method: 'GET'
            })
                .then(function(response) {
                    var sldParser = new GeoStylerSLDParser.SldStyleParser();
                    targetLayer.set('SLD', response.responseText);
                    sldParser.readStyle(response.responseText)
                        .then(function(gsStyle) {
                            // You're reading this correctly, we're reexporting to SLD again
                            // because even if GeoServer understands SLD/SE 1.1.0 when configuring
                            // with it it seems uploading SLD/SE 1.1.0 leads to GeoServer dropping
                            // all occuring SvgParameter elements presumably by parsing them as
                            // SLD/SE 1.0.0.
                            // Since GeoStyler supports reading SLD/SE in both versions and
                            // exports as SLD/SE 1.0.0 this fixes things.
                            var reexport = sldParser.writeStyle(gsStyle);
                            reexport.then(function(reexportedStyle) {
                                targetLayer.set('SLD', reexportedStyle);
                            });
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
         * @param  {String} templateStyle The templateStyle to choose if copyStyle is false
         */
        cloneLayer: function(sourceLayer, name, maxFeatures, bbox, dataSourceLayer, uuid, copyStyle, templateStyle) {
            var appContext = Koala.util.AppContext.getAppContext();
            var targetLayerPromise = this.createLayer(sourceLayer, name, uuid);
            var SelectFeatures = Koala.util.SelectFeatures;
            var geoserverBaseUrl = Koala.util.Object.getPathStrOr(appContext, 'data/merge/urls/geoserver-base-url');

            targetLayerPromise.then(function(targetLayer) {
                if (copyStyle) {
                    if (sourceLayer.get('SLD')) {
                        targetLayer.set('SLD', sourceLayer.get('SLD'));
                        targetLayer.setStyle(sourceLayer.getStyle());
                    } else {
                        var wmsConfig = sourceLayer.metadata.layerConfig.wms;
                        // TODO think about a better way of doing this
                        // The RODOS WMS is a separate GeoServer instance
                        // living under /ogc/rodos, ie. a sub path of the
                        // standard WMS
                        var ms = /^(.+ogc\/rodos).+$/g.exec(wmsConfig.url);
                        if (!ms || !ms[1]) {
                            ms = /^(.+ogc).+$/g.exec(wmsConfig.url);
                        }
                        var styleName = wmsConfig.styles;
                        if (!styleName) {
                            styleName = sourceLayer.getSource().getParams().STYLES;
                        }
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
                } else {
                    Koala.util.Clone.loadStyle(geoserverBaseUrl, templateStyle, targetLayer);
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
                        if (layer.get('SLD')) {
                            delete metadata.layerConfig.olProperties.styleReference;
                        }
                        var source = new ol.source.Vector({features: new ol.Collection()});
                        var config = Layer.getInternalLayerConfig(metadata);
                        config.source = source;
                        config.metadata = metadata;
                        config.name = name;
                        config.persisted = false;
                        var result = new ol.layer.Vector(config);
                        result.set(Layer.FIELDNAME_ORIGINAL_METADATA, Ext.clone(metadata));
                        result.metadata = Ext.clone(metadata);
                        if (layer.metadata.isRodosLayer) {
                            result.metadata.wasRodosLayer = true;
                            var ms = /^tablename:(.+);$/.exec(layer.metadata.layerConfig.olProperties.param_viewparams);
                            result.metadata.rodosTablename = ms[1];
                        }
                        Koala.util.Layer.addOlLayerToMap(result);
                        resolve(result);
                    })
                    .catch(reject);
            });
            return promise;
        }

    }

});
