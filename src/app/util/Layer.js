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

    requires: [
        'BasiGX.util.Map',
        'Koala.util.String'
    ],

    statics: {
        /* i18n */
        txtUntil: "",
        txtFilter: "",
        /* i18n */

        /**
         * Returns whether the passed metadat object from GNOS has at least one
         * filter configured.
         *
         * @param {object} metadata The metadata json object.
         * @returns {boolean} Whether the metadat conatins at least one filter.
         */
        metadataHasFilters: function(metadata) {
            // for backwards compatibility
            var filter = metadata && metadata.filter;
            // that is the new key
            var filters = metadata && metadata.filters;
            if (filter) {
                return true;
            }
            if (!filters || !Ext.isArray(filters) || filters.length < 1) {
                return false;
            }
            return true;
        },

        /**
         * Returns an array of filters or null if there are no filters. Takes
         * care of the old way of specifying only one filter under `filter` and
         * the way of having an array of filters under `filters`.
         *
         * @param {object} metadata The metadata json object.
         * @returns {Object[]} Always an array of filters, regardless where they
         *     were found or null if the metadata did not contain either `filter`
         *     or `filters`.
         */
        getFiltersFromMetadata: function(metadata) {
            if (!this.metadataHasFilters(metadata)) {
                return null;
            }
            var filter = metadata.filter;
            var filters = metadata.filters || [];
            if (filter) {
                filters.push(filter);
            }
            return filters;
        },

        /**
         * Returns a textual representation of the filters in the metadata
         * object.
         *
         * @param {object} metadata The metadata json object.
         * @returns {string} A textual representation of the filters or ''.
         */
        getFiltersTextFromMetadata: function(metadata) {
            var staticMe = this;
            var filters = staticMe.getFiltersFromMetadata(metadata);
            if (filters === null) {
                return "";
            }

            var defaultDateFormat = Koala.util.String.defaultDateFormat;

            var filterTxts = [];

            Ext.each(filters, function(filter){
                if(!Ext.isDefined(filter)) {
                    return;
                }
                var filterType = filter.type;
                var filterTxt = '<b>' + staticMe.txtFilter +
                    ' (' + filterType + ') </b><br />';

                if (filterType === "rodos") {
                    // TODO
                } else if (filterType === "value") {
                    filterTxt += staticMe.stringifyValueFilter(filter);
                } else if (filterType === "pointintime") {
                    var date, format, time;

                    date = new Date(filter.timeinstant);
                    format = filter.timeformat || defaultDateFormat;
                    time = Ext.Date.format(date, format);
                    filterTxt += time;
                } else if (filterType === "timerange") {
                    var startDate, startFormat, startTime;
                    var endDate, endFormat, endTime;

                    startDate = new Date(filter.mindatetimeinstant);
                    startFormat = filter.mindatetimeformat || defaultDateFormat;
                    startTime = Ext.Date.format(startDate, startFormat);

                    endDate = new Date(filter.maxdatetimeinstant);
                    endFormat = filter.maxdatetimeformat || defaultDateFormat;
                    endTime = Ext.Date.format(endDate, endFormat);

                    filterTxt += "" +
                        startTime +
                        " " + staticMe.txtUntil + " " +
                        endTime;
                }
                filterTxts.push(filterTxt);
            });

            return filterTxts.join("<br />");
        },

        /**
         * @param {string} uuid
         * @returns {object} metadata json object
         */
        getMetadataFromUuidAndThen: function(uuid, ajaxCb) {
            var me = this;

            var appContext = BasiGX.view.component.Map.guess().appContext;
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
                        // replace any occurencies of \{\{ (as it may still be
                        // stored in db) with the new delimiters [[
                        //
                        // These arrive here as \\{\\{ (the backslash has been
                        // escaped for the JSON format)
                        //
                        // Since both { and \ have a special meaning in regular
                        // expressions, we need to escape them again with a \
                        var escapedCurlyOpen = /\\\\\{\\\\\{/g;
                        var escapedCurlyClose = /\\\\\}\\\\\}/g;
                        var txt = response.responseText;

                        txt = txt.replace(escapedCurlyOpen, '[[');
                        txt = txt.replace(escapedCurlyClose, ']]');
                        obj = Ext.decode(txt);
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
            var mapComp = Ext.ComponentQuery.query('basigx-component-map')[0];
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
            var filters = this.getFiltersFromMetadata(metadata);
            if (!filters) {
                return;
            }

            // TODO i18n
            var title = Ext.String.format(
                    'Layerfilter "{0}"',
                    metadata.title || metadata.dspTxt || 'Unbekannt'
                );
            var winName = 'filter-win-' + metadata.id;
            var cntExisting = Ext.ComponentQuery.query(
                    '[name="' + winName + '"]'
                ).length;
            if (cntExisting > 0) {
                title += " (#" + (cntExisting + 1) +")";
            }

            Ext.create('Ext.window.Window', {
                name: winName,
                title: title,
                layout: 'fit',
                items: {
                    xtype: 'k-form-layerfilter',
                    metadata: metadata,
                    filters: filters
                }
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

        /**
         * @param ol.layer.Base
         */
        getCurrentLegendUrl: function (layer) {
            var width = layer.get("legendWidth");
            var height= layer.get("legendHeight");
            var legendUrl = layer.get("legendUrl");
            var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
            var resolution = BasiGX.util.Map.getResolution(map);
            var scale = BasiGX.util.Map.getScale(map);

            if (width) {
                legendUrl = Ext.String.urlAppend(legendUrl, "WIDTH="+width);
            }
            if (height){
                legendUrl = Ext.String.urlAppend(legendUrl, "HEIGHT="+height);
            }
            if (resolution) {
                legendUrl = Ext.String.urlAppend(legendUrl, "SCALE="+scale);
            }

            return legendUrl;
        },

        layerFromMetadata: function(metadata) {
            var layerClassDecision = this.getLayerClassFromMetadata(metadata);
            var LayerClass = layerClassDecision.clazz;
            var SourceClass = this.getSourceClassFromMetadata(metadata, layerClassDecision);
            var layerConfig = {};
            var sourceConfig = {};

            // apply default filter to layer, if needed
            metadata = Koala.util.Layer.adjustMetadataAccordingToFilters(metadata);

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
                olProps, "param_", false);

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
                legendHeight: olProps.legendHeight,
                legendWidth: olProps.legendWidth,
                topic: isTopic, // TODO: rename this prop in the application
                hoverable: isTopic,
                allowFeatureInfo: getBool(olProps.allowFeatureInfo, true),
                allowDownload: getBool(olProps.allowDownload, true),
                allowRemoval: getBool(olProps.allowRemoval, true),
                allowShortInfo: getBool(olProps.allowShortInfo, true),
                allowPrint: getBool(olProps.allowPrint, true),
                allowOpacityChange: getBool(olProps.allowOpacityChange, true),
                hoverTpl: olProps.hoverTpl,
                hoverStyle: olProps.hoverStyle,
                selectStyle: olProps.selectStyle || olProps.hoverStyle,
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
         * TODO refactor into single methods
         */
        getInternalSourceConfig: function(md, SourceClass) {
            var cfg;
            var olProps = md.layerConfig.olProperties;
            var extraParams = Koala.util.Object.getConfigByPrefix(
                    olProps, "param_");
            var map = Ext.ComponentQuery.query('basigx-component-map')[0].getMap();
            var projection = map.getView().getProjection();
            var projCode = projection.getCode();
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
        adjustMetadataAccordingToFilters: function(metadata) {
            var me = this;
            // if the olProperty encodeFilterInViewparams is 'true',
            // we run this code, otherwise we will filter via dimension
            // or sth. else
            var encodeInViewParams = Koala.util.Object.getPathStrOr(
                    metadata,
                    "layerConfig/olProperties/encodeFilterInViewparams",
                    "false"
                );

            var filters = this.getFiltersFromMetadata(metadata);

            if (!filters) {
                return metadata;
            }

            metadata = me.applyDefaultsIfNotChangedByUser(metadata, filters);
            if (encodeInViewParams === "true") {
                metadata = me.moveFiltersToViewparams(metadata, filters);
            } else {
                // The filters should not be encoded in the viewparams, but as
                // WMS-T and friends
                metadata = me.adjustMetadataFiltersToStandardLocations(
                    metadata,
                    filters
                );
            }
            return metadata;
        },

        applyDefaultsIfNotChangedByUser: function(metadata, filters) {
            var me = this;
            var adjustedFilters = [];
            Ext.each(filters, function(filter) {
                var filterType = (filter.type || "").toLowerCase();
                var adjFilter;
                switch (filterType) {
                    case 'timerange':
                        adjFilter = me.applyDefaultsTimerangeFilter(filter);
                        break;
                    case 'pointintime':
                        adjFilter = me.applyDefaultsPointInTimeFilter(filter);
                        break;
                    case 'value':
                        adjFilter = me.applyDefaultsValueFilter(filter);
                        break;
                    default:
                        break;
                }
                adjustedFilters.push(adjFilter);
            });

            metadata.filters = adjustedFilters;

            return metadata;
        },

        applyDefaultsTimerangeFilter: function(filter){
            if (!filter.mindatetimeinstant) {
                if (filter.defaultstarttimeinstant) {
                    try {
                        filter.mindatetimeinstant = Ext.Date.parse(
                            filter.defaultstarttimeinstant,
                            filter.defaultstarttimeformat
                        );
                    } catch (e) {
                        Ext.log.error('Could not set default timerange filter');
                    }
                } else {
                    Ext.log.warn('No defined start value for timerange filter and no ' +
                        'configured default start value for timerange filter');
                }
            // TODO: MJ Fix fallback calc
            } else if (Ext.isString(filter.mindatetimeinstant)) {
                filter.mindatetimeinstant = Ext.Date.parse(
                    filter.defaultstarttimeinstant,
                    filter.defaultstarttimeformat
                );
            }
            if (!filter.maxdatetimeinstant) {
                if (filter.defaultendtimeinstant) {
                    try {
                        filter.maxdatetimeinstant = Ext.Date.parse(
                            filter.defaultendtimeinstant,
                            filter.defaultendtimeformat
                        );
                    } catch (e) {
                        Ext.log.error('Could not set default timerange filter');
                    }
                } else {
                    Ext.log.warn('No defined end value for timerange filter and no ' +
                        'configured default end value for timerange filter');
                }
            // TODO: MJ Fix fallback calc
            } else if (Ext.isString(filter.maxdatetimeinstant)) {
                filter.maxdatetimeinstant = Ext.Date.parse(
                    filter.defaultendtimeinstant,
                    filter.defaultendtimeformat
                );
            }
            return filter;
        },

        applyDefaultsPointInTimeFilter: function(filter){
            if (!filter.timeinstant) {
                if (filter.defaulttimeinstant) {
                    try {
                        filter.timeinstant = Ext.Date.parse(
                            filter.defaulttimeinstant,
                            filter.defaulttimeformat
                        );
                    } catch (e) {
                        Ext.log.error('Could not set default point in time filter');
                    }
                } else {
                    Ext.log.warn('No defined point in time filter and no ' +
                        'configured default point in time filter');
                }
            }
            return filter;
        },

        applyDefaultsValueFilter: function(filter){
            if (!filter.value) {
                filter.value = filter.defaultValue;
            }
            return filter;
        },

        adjustMetadataFiltersToStandardLocations: function(metadata, filters){
            var me = this;
            Ext.each(filters, function(filter) {
                var filterType = (filter.type || "").toLowerCase();
                switch (filterType) {
                    case 'timerange':
                        metadata = me.configureMetadataWithTimerange(metadata, filter);
                        break;
                    case 'pointintime':
                        metadata = me.configureMetadataWithPointInTime(metadata, filter);
                        break;
                    case 'value':
                        metadata = me.configureMetadataWithValue(metadata, filter);
                        break;
                    default:
                        break;
                }
            });

            return metadata;
        },

        configureMetadataWithTimerange: function(metadata, filter) {
            // timerange filter is an additional param TIME=start/end
            var olProps = metadata.layerConfig.olProperties;
            var wmstKey = 'param_TIME';
            if (wmstKey in olProps) {
                Ext.log.warn('Multiple time filters configured, ' +
                    'only the last will win');
            }
            // TODO check UTC!
            var start = filter.mindatetimeinstant;
            var end = filter.maxdatetimeinstant;
            var val = Ext.Date.format(start, 'C') + '/' + Ext.Date.format(end, 'C');
            olProps[wmstKey] = val;
            metadata.layerConfig.olProperties = olProps;
            return metadata;
        },

        configureMetadataWithPointInTime: function(metadata, filter) {
            // Point in time filter is an additional param TIME=timeinstant
            var olProps = metadata.layerConfig.olProperties;
            var wmstKey = 'param_TIME';
            if (wmstKey in olProps) {
                Ext.log.warn('Multiple time filters configured, ' +
                    'only the last will win');
            }
            // TODO check UTC!
            var dateValue = filter.timeinstant;
            var val = Ext.Date.format(dateValue, 'C');
            olProps[wmstKey] = val;
            metadata.layerConfig.olProperties = olProps;
            return metadata;
        },

        /**
         */
        stringifyValueFilter: function(filter){
            var op = (filter.operator || '').toUpperCase();
            var adjusted = false;
            var stringified = "";
            if (!Ext.isArray(filter.value)) {
                if (op === '!=' || op === 'NEQ' || op === 'NOT IN') {
                    op = "<>";
                    adjusted = true;
                } else if (op === '==' || op === 'EQ' || op === 'IN') {
                    op = "=";
                    adjusted = true;
                }
                // name='jubbes'
                stringified = filter.param + op + filter.value;
            } else {
                // only makes sense for operator IN and NOT IN, let's adjust for
                // common errors
                if (op === '=' || op === '==' || op === 'EQ') {
                    op = "IN";
                    adjusted = true;
                } else if (op === '!=' || op === '<>' || op === 'NEQ') {
                    op = "NOT IN";
                    adjusted = true;
                }
                stringified = filter.param +                   // name
                    ' ' + op + ' ' +                    // NOT IN
                    '(' + filter.value.join(',') + ')'; // ('kalle', 'jupp')
            }
            if (adjusted) {
                Ext.log.info("Filter operator has been adjusted from " +
                    "'" + filter.operator + "' to '" + op + "'");
            }
            return stringified;
        },

        /**
         */
        configureMetadataWithValue: function(metadata, filter) {
            // VALUE becomes a CQL filter
            var olProps = metadata.layerConfig.olProperties;
            var cqlKey = 'param_cql_filter';
            var val = "";
            if (cqlKey in olProps) {
                val = olProps[cqlKey];
            }
            if (val !== "") {
                val += ";";
            }

            var stringified = this.stringifyValueFilter(filter);
            val += stringified;

            olProps[cqlKey] = val;
            metadata.layerConfig.olProperties = olProps;
            return metadata;
        },

        moveFiltersToViewparams: function(metadata, filters){
            var keyVals = {};
            Ext.each(filters, function(filter) {
                var params = filter.param.split(",");
                var type = filter.type;
                // we need to check the metadata for default filters to apply
                // TODO the format is surely totally off!!!
                if (type === "timerange") {
                    keyVals[params[0]] = filter.mindatetimeinstant;
                    if(!params[1]) {
                        keyVals[params[0]] += "/" + filter.maxdatetimeinstant;
                    } else {
                        keyVals[params[1]] = filter.maxdatetimeinstant;
                    }
                } else if (type === "pointintime") {
                    keyVals[params[0]] = filter.timeinstant;
                } else if (type === 'value') {
                    keyVals[params[0]] = filter.value;
                }
            });

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
