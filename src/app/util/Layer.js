/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
Ext.define('Koala.util.Layer', {

    statics: {
        /**
         * @param {string} uuid
         * @returns {object} metadata json object
         */
        getMetadataFromUuidAndThen: function(uuid, ajaxCb) {
            var me = this;

            var appContext = Basepackage.view.component.Map.guess().appContext;
            var urls = appContext.data.merge.urls;

            Ext.Ajax.request({
                url: urls['metadata-xml2json'],
                params: {
                    uuid: uuid
                },
                method: 'GET',

                success: function(response) {
                    var obj;
                    try {
                        obj = Ext.decode(response.responseText);
                    } catch(ex) {
                        // TODO i18n
                        Ext.toast('Metadaten JSON konnte nicht dekodiert werden.');
                    } finally {
                        if (Koala.util.Layer.minimumValidMetadata(obj)) {
                            ajaxCb.call(me, obj);
                        } else {
                            // TODO i18n
                            Ext.toast('Für den Datensatz scheinen nicht ausreichend Metadaten vorzuliegen.');
                        }
                    }
                },

                failure: function(response) {
                    Ext.raise('server-side failure with status code ' + response.status);
                }
            });
        },

        minimumValidMetadata: function(metadata) {
            // catches undefined and false, which we'll receive if there isn't
            // an additiona dataset stored
            if (!metadata) {
                return false;
            }
            // TODO implement checks for more minimum properties
            return true;
        },

        addLayerToMap: function(metadata) {
            var me = this;
            var layer = me.layerFromMetadata(metadata);
            me.addOlLayerToMap(layer);
        },

        addOlLayerToMap: function(layer){
            var me = this;
            // TODO in the future we aren't allowed to guess here, as there will
            // be multiple maps!
            var mapComp = Ext.ComponentQuery.query('base-component-map')[0];
            // attach a listener to the new layer, so that hover artifacts on
            // the get cleaned up when visibility changes base-component-map
            me.bindLayerVisibilityHandlers(layer, mapComp);
            mapComp.addLayer(layer);
        },

        /**
         *
         */
        bindLayerVisibilityHandlers: function(layer, mapComp){
            var me = this;
            var hoverPlugin = mapComp.getPlugin('hover');
            layer.on('change:visible', hoverPlugin.cleanupHoverArtifacts, hoverPlugin);
            if (layer instanceof ol.layer.Group) {
                // additionally, if the new layer is a group layer, we need to
                // bind ourself for all sublayers
                layer.getLayers().forEach(function(subLayer){
                    me.bindLayerVisibilityHandlers(subLayer, mapComp);
                });
            }
        },

        showChangeFilterSettingsWin: function(metadata) {
            if (Ext.isEmpty(metadata.filter)) {
                return;
            }
            Ext.create('Ext.window.Window', {
                title: 'Layerfilter',
                layout: 'fit',
                items: [{
                    xtype: 'k-form-layerfilter',
                    metadata: metadata
                }]
            }).show();
        },

        /**
         * @public
         */
        addLayerByUuid: function(uuid){
            this.getMetadataFromUuidAndThen(uuid, this.addLayerToMap);
        },

        /**
         * @public
         */
        showChangeFilterSettingsWinByUuid: function(uuid){
            this.getMetadataFromUuidAndThen(uuid, this.showChangeFilterSettingsWin);
        },

        layerFromMetadata: function(metadata) {
            var layerClassDecision = this.getLayerClassFromMetadata(metadata);
            var LayerClass = layerClassDecision.clazz;
            var SourceClass = this.getSourceClassFromMetadata(metadata, layerClassDecision);
            var layerConfig = {};
            var sourceConfig = {};

            // apply default filter to layer
            metadata = Koala.util.Layer.moveFilterToParams(metadata);

            var internalLayerConfig = this.getInternalLayerConfig(metadata); //TODO arguments?
            var internalSourceConfig = this.getInternalSourceConfig(metadata, SourceClass);

            var olProps = metadata.layerConfig ?
                    metadata.layerConfig.olProperties || {} :
                    {};

            var mdLayerConfig = Koala.util.Object.getConfigByPrefix(
                olProps, "layer_", true);

            var mdSourceConfig = Koala.util.Object.getConfigByPrefix(
                olProps, "source_", true);

            var mdParamConfig = Koala.util.Object.getConfigByPrefix(
                olProps, "param_", true);

            layerConfig = Ext.apply(internalLayerConfig, mdLayerConfig);
            sourceConfig = Ext.apply(internalSourceConfig, mdSourceConfig);

            if (!Ext.isObject(sourceConfig.params)) {
                sourceConfig.params = {};
            }
            sourceConfig.params = Ext.Object.merge(sourceConfig.params, mdParamConfig);

            layerConfig.source = new SourceClass(sourceConfig);

            var layer = new LayerClass(layerConfig);
            layer.metadata = metadata;

            if(metadata.layerConfig.olProperties.printLayer){
                var printUuid = metadata.layerConfig.olProperties.printLayer;
                var printLayer;

                this.getMetadataFromUuidAndThen(printUuid, function(md){
                        printLayer = this.layerFromMetadata(md);
                        layer.set('printLayer', printLayer);
                    }
                );
            }

            return layer;
        },

        /**
         * @param Object metadata The JSON metadata form GNOS
         */
        getLayerClassFromMetadata: function(metadata) {
            var layerCfg = metadata.layerConfig;

            if (!layerCfg) {
                Ext.log.error('Failed to find layerConfig object in metadata');
            }

            var LayerClazz;
            var hint;

            var cntVector = Ext.Object.getSize(layerCfg['vector']);
            var cntWms = Ext.Object.getSize(layerCfg['wms']);
            var cntWmts = Ext.Object.getSize(layerCfg['wmts']);

            if (cntVector === 0 && cntWms === 0 && cntWmts === 0) {
                Ext.log.error('Non-deterministic layer config in metadata');
            }

            if (cntVector > cntWms && cntVector > cntWmts) {
                // vector biggest of all
                LayerClazz = ol.layer.Vector;
                hint = 'vector';
            } else if (cntWms > cntVector && cntWms > cntWmts) {
                // wms biggest of all
                LayerClazz = ol.layer.Tile;
                hint = 'wms';
            } else if (cntWmts > cntVector && cntWmts > cntWms) {
                // wmts biggest of all
                LayerClazz = ol.layer.Tile;
                hint = 'wmts';
            }

            if (!LayerClazz) {
                LayerClazz = ol.layer.Tile;
                hint = 'wms';
            }

            if(hint === 'wms' && layerCfg.olProperties &&
                layerCfg.olProperties.singleTile === 'true'){
                LayerClazz = ol.layer.Image;
            }

            return {
                clazz: LayerClazz,
                hint: hint
            };
        },

        /**
         * @param Object metadata The JSON metadat form GNOS
         */
        getSourceClassFromMetadata: function(metadata, layerClassDecision) {
            // we ignore the metadata param for now
            // This method may very well receive more params (e.g. the detected
            // layer class), but not for now.
            var LayerClazz = layerClassDecision.clazz;
            var hint = layerClassDecision.hint;

            var SourceClazz = ol.source.Vector;

            if (LayerClazz === ol.layer.Vector && hint === 'vector') {
                SourceClazz = ol.source.Vector;
            } else if (LayerClazz === ol.layer.Tile && hint === 'wms') {
                SourceClazz = ol.source.TileWMS;
            } else if (LayerClazz === ol.layer.Image && hint === 'wms') {
                SourceClazz = ol.source.ImageWMS;
            } else if (LayerClazz === ol.layer.Tile && hint === 'wmts') {
                SourceClazz = ol.source.WMTS;
            }

            return SourceClazz;
        },

        /**
         * mainly a mapping from metadata props to layer keys that
         * have special meaning in our application
         */
        getInternalLayerConfig: function(metadata) {
            var olProps = metadata.layerConfig.olProperties;
            olProps = Koala.util.Object.coerceAll(olProps);
            var getBool = Koala.util.String.getBool;

            var isTopic = false;
//            TODO Is a hoverTpl rly required to hover?
            if (!Ext.isEmpty(olProps.hoverTpl) && olProps.allowHover !== false) {
                isTopic = true;
            }

            return {
                name: metadata.dspTxt,
                legendUrl: olProps.legendUrl || '',
                legendHeight: olProps.legendHeight || 40,
                topic: isTopic, // TODO: rename this prop in the application
                hoverable: isTopic,
                allowFeatureInfo: getBool(olProps.allowFeatureInfo, true),
                allowDownload: getBool(olProps.allowDownload, true),
                allowRemoval: getBool(olProps.allowRemoval, true),
                allowShortInfo: getBool(olProps.allowShortInfo, true),
                allowPrint: getBool(olProps.allowPrint, true),
                allowOpacityChange: getBool(olProps.allowOpacityChange, true),
                hoverTpl: olProps.hoverTpl,
                hasLegend: getBool(olProps.hasLegend, true),
                downloadUrl: metadata.layerConfig.download.url,
                // "treeId": metadata.inspireId, //TODO: is now routeId
                //"treeMenu": true, // TODO: remove / enhance due to new single item properties
                //routeId: olProps.routeId || metadata.inspireId, // TODO: get this back in when gnos is ready
                routeId: metadata.inspireId,
                timeSeriesChartProperties: metadata.layerConfig.timeSeriesChartProperties,
                barChartProperties: metadata.layerConfig.barChartProperties
            };
        },

        /**
         * TODO refactor into soingle methods
         */
        getInternalSourceConfig: function(md, SourceClass) {
            var cfg;
            var olProps = md.layerConfig.olProperties;
            var extraParams = Koala.util.Object.getConfigByPrefix(
                    olProps, "param_");
            var map = Ext.ComponentQuery.query('base-component-map')[0].getMap();
            var projection = map.getView().getProjection();
            var projCode = map.getView().getProjection().getCode();
            var mdLayerCfg;

            if (SourceClass === ol.source.Vector) {
                mdLayerCfg = md.layerConfig.vector;
                cfg = {
                    loader: function(extent/*, resolution, projection */) {
                        var vectorSource = this;

                        var finalParams = Ext.apply({
                            service: 'WFS',
                            version: '1.1.0',
                            request: 'GetFeature',
                            outputFormat: 'application/json',
                            srsname: projCode,
                            bbox: extent.join(',') + ',' + projCode
                        }, extraParams || {});

                        Ext.Ajax.request({
                            url: mdLayerCfg.url,
                            method: 'GET',
                            params: finalParams,
                            success: function(response) {
                                var format = new ol.format.GeoJSON();
                                var features = format.readFeatures(response.responseText);
                                vectorSource.addFeatures(features);
                            },
                            failure: function(response) {
                                Ext.log.info('server-side failure with status code ' + response.status);
                            }
                        });

                    },
                    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                        maxZoom: 28
                    }))
                };
            } else if (SourceClass === ol.source.TileWMS || SourceClass === ol.source.ImageWMS) {

                cfg = {
                    url: md.layerConfig.wms.url,
                    crossOrigin: 'Anonymous',
                    params: {
                        LAYERS: md.layerConfig.wms.layers,
                        TRANSPARENT: md.layerConfig.wms.transparent || false,
                        VERSION: '1.1.1'
                    }
                };
            } else if (SourceClass === ol.source.WMTS) {
                var tileGrid = Koala.util.Object.getPathStrOr(
                    md,
                    'layerConfig/olProperties/source_tileGrid'
                );
                // Here is the deal, we first check if we were configured with
                // metadata that has a key source_tileGrid. If so we use it.
                if (tileGrid) {
                    tileGrid = Koala.util.String.coerce(tileGrid);
                } else {
                    // otherwise we could query the wmts for its capabilities,
                    // but for now we simply assume it is a worldwide layer
                    var origin = ol.extent.getTopLeft(projection.getExtent());
                    var projectionExtent = projection.getExtent();
                    var size = ol.extent.getWidth(projectionExtent) / 256;
                    var resolutions = new Array(14);
                    var matrixIds = new Array(14);
                    for (var z = 0; z < 14; ++z) {
                        // generate resolutions and matrixIds arrays for this
                        // WMTS
                        resolutions[z] = size / Math.pow(2, z);
                        matrixIds[z] = z;
                    }
                    tileGrid = new ol.tilegrid.WMTS({
                        origin: origin,
                        resolutions: resolutions,
                        matrixIds: matrixIds
                    });
                }

                mdLayerCfg = md.layerConfig.wmts;
                cfg = {
                    url: mdLayerCfg.url,
                    layer: mdLayerCfg.layers,
                    matrixSet: mdLayerCfg.tilematrixset,
                    format: mdLayerCfg.format,
                    projection: projection,
                    tileGrid: tileGrid,
                    style: mdLayerCfg.style
                };
            }

            return cfg;
        },

        /**
         *
         */
        moveFilterToParams: function(metadata, keyVals) {
            if (Ext.isEmpty(metadata.filter)) {
                return metadata;
            }

            if (!Ext.isDefined(keyVals) || Ext.Object.getSize(keyVals) === 0) {
                keyVals = {};
                var params = metadata.filter.param.split(",");
                var type = metadata.filter.type;
                // we need to check the metadata for default filters to apply
                if (type === "timerange") {
                    keyVals[params[0]] = metadata.filter.mindatetimeinstant;
                    keyVals[params[1]] = metadata.filter.maxdatetimeinstant;
                } else if (type === "pointintime") {
                    keyVals[params[0]] = metadata.filter.timeinstant;
                } else if (type === 'value') {
                    keyVals[params[0]] = metadata.filter.value;
                }
            }

            var existingViewParams = decodeURIComponent(
                Koala.util.Object.getPathStrOr(
                    metadata, "layerConfig/olProperties/param_viewparams", "")
            );
            if (!Ext.String.endsWith(existingViewParams, ";") &&
                existingViewParams) {
                existingViewParams += ";";
            }

            Ext.iterate(keyVals, function(key, value){
                existingViewParams += key + ':' + value + ';';
            });
            metadata.layerConfig.olProperties.param_viewparams =/* eslint camelcase:0 */
                encodeURIComponent(existingViewParams);

            return metadata;
        }
    }
});
