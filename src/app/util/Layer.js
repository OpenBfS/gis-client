/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.util.Layer
 */
Ext.define('Koala.util.Layer', {

    requires: [
        'BasiGX.util.Map',

        'Koala.util.Date',
        'Koala.util.Filter',
        'Koala.util.String'

    ],

    statics: {
        /* i18n */
        txtUntil: "",
        titleAddLayer: "",
        titleAddLayerFilter: "",
        textUnknownLayer: "",
        dspSignEq: "",
        dspSignNotEq: "",
        dspSignLtEq: "",
        dspSignGtEq: "",
        dspSignLt: "",
        dspSignGt: "",
        dspSignIn: "",
        dspSignInJoiner: "",
        dspSignInLastJoiner: "",
        dspSignNotIn: "",
        dspSignNotInJoiner: "",
        dspSignNotInLastJoiner: "",
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

        getEffectiveTimeFilterFromMetadata: function(metadata) {
            var filters = Ext.clone(this.getFiltersFromMetadata(metadata));
            var timeTypes = ['pointintime', 'timerange'];
            var effectiveFilter = null;
            if (filters !== null) {
                // The effective timefilter is the last pit or tr filter:
                Ext.each(filters, function(filter){
                    var type = (filter.type || '').toLowerCase();
                    if (Ext.Array.contains(timeTypes, type)) {
                        effectiveFilter = filter;
                        return false; // stop iteration early;
                    }
                }, null, true);
            }
            return effectiveFilter;
        },

        /**
         * This static method is a wrapper around #Koala.Application.isLocal
         * which we'll always have if we are working inside an Ext.Application,
         * but never when we are running unit-tests. We cannot simply require
         * `Koala.Application`, since this would lead to a circular dependency.
         *
         * @return {boolean} Whether the application is currently running in
         *     local-mode.
         */
        appIsLocal: function() {
            if ('Application' in Koala) {
                return Koala.Application.isLocal();
            }
            return false;
        },

        /**
         * This static method is a wrapper around #Koala.Application.isUtc
         * which we'll always have if we are working inside an Ext.Application,
         * but never when we are running unit-tests. We cannot simply require
         * `Koala.Application`, since this would lead to a circular dependency.
         *
         * In unit tests this will simply return the opposite of #appIsLocal.
         *
         * @return {boolean} Whether the application is currently running in
         *     utc-mode.
         */
        appIsUtc: function() {
            if ('Application' in Koala) {
                return Koala.Application.isUtc();
            }
            return !this.appIsLocal();
        },

        /**
         * Returns a textual representation of the filters in the metadata
         * object. This method is used for displaying the filters and as such it
         * respects the current UTC setting of the application.
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
                var filterTxt = '';

                if (filterType === "rodos") {
                    // TODO
                } else if (filterType === "value") {
                    filterTxt += staticMe.stringifyValueFilter(filter, true);
                } else if (filterType === "pointintime") {
                    var date, format, time;

                    date = new Date(filter.timeinstant);
                    // respect the applications UTC setting
                    if (staticMe.appIsLocal()) {
                        date = Koala.util.Date.makeLocal(date);
                    }
                    format = filter.timeformat || defaultDateFormat;
                    time = Ext.Date.format(date, format);
                    filterTxt += time;
                } else if (filterType === "timerange") {
                    var startDate, startFormat, startTime;
                    var endDate, endFormat, endTime;

                    startDate = new Date(filter.mindatetimeinstant);
                    endDate = new Date(filter.maxdatetimeinstant);
                    // respect the applications UTC setting
                    if (staticMe.appIsLocal()) {
                        startDate = Koala.util.Date.makeLocal(startDate);
                        endDate = Koala.util.Date.makeLocal(endDate);
                    }
                    startFormat = filter.mindatetimeformat || defaultDateFormat;
                    endFormat = filter.maxdatetimeformat || defaultDateFormat;
                    startTime = Ext.Date.format(startDate, startFormat);
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

        /**
         * This method finds the first RoutingLegendTree and updates the filters
         * text in the layer HTML suffix. This method is called multiple times,
         * e.g. after drag 'n drop of layeritems and right after new layers
         * (E.g from the filterpanel) have been added to the map and the tree.
         */
        repaintLayerFilterIndication: function() {
            var me = this;
            var selector = 'k-panel-routing-legendtree';
            var treePanel = Ext.ComponentQuery.query(selector)[0];
            var store = treePanel.getStore();
            store.each(function(treeNode) {
                var layer = treeNode.getOlLayer();
                var suffixId = layer.get('__suffix_id__');
                if (suffixId) {
                    var txt = me.getFiltersTextFromMetadata(layer.metadata);
                    Ext.get(suffixId).setHtml(txt);
                }
            });
        },

        /**
         * Returns a unique id that can be used to later identify generated
         * layer suffix HTML. We don't use the metadata identifier hash as one
         * layer may be multiple time in the application, with differing
         * filters.
         *
         * @return {String} The id.
         */
        getSuffixId: function() {
            return 'layer-suffix-' + Ext.id();
        },

        /**
         * Returns an HTML-fragment which will be appended to layernames. The
         * passed `suffixId` can be used to update the actual content of the
         * suffix
         *
         * @param {String} suffixId The string to use as `id` for the returned
         *     element.
         * @return {String} The HTML-fragment ready to be used as container for
         *     additional layer information.
         */
        getLayerNameSuffix: function (suffixId) {
            return "" +
                "<span" +
                " class='layer-name-suffix'" +
                " id='" + suffixId + "'>" +
                "</span>";
        },

        /**
         * Adds all the passed OpenLayers layers to the map.
         *
         * @param {Array<ol.layer.Base>} layers The array of layers to add.
         */
        addOlLayersToMap: function(layers) {
            var me = Koala.util.Layer;
            Ext.each(layers, function(layer) {
                if (layer) {
                    me.addOlLayerToMap(layer);
                }
            });
        },

        /**
         * Adds the passed OpenLayers layer to the map.
         *
         * @param {ol.layer.Base} layer The layer to add.
         */
        addOlLayerToMap: function(layer) {
            var me = this;

            var suffixId = me.getSuffixId();
            var originalName = layer.get('name');
            var suffix = me.getLayerNameSuffix(suffixId);

            layer.set('__suffix_id__', suffixId);
            layer.set('name', originalName + suffix);

            var repaintTask = new Ext.util.DelayedTask(
                me.repaintLayerFilterIndication, me
            );
            repaintTask.delay(50);

            layer.on('change:visible', me.repaintLayerFilterIndication, me);

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
            var staticMe = this;
            var filters = staticMe.getFiltersFromMetadata(metadata);

            // TODO future enhancements may want to remove the ComponentQuery…
            var themeTree = Ext.ComponentQuery.query('k-panel-themetree')[0];
            var currentSelection = themeTree.getSelection()[0];
            var title = currentSelection ?
                currentSelection.data.text :
                metadata.dspTxt;

            var winName = 'filter-win-' + metadata.id;

            // only allow one filter-window to be open
            var filterPanelExisting = Ext.ComponentQuery.query(
                      'k-form-layerfilter');

            if (filterPanelExisting.length > 0){
                filterPanelExisting[0].up('window').close();
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
            var legendUrl = layer.get("legendUrl") || "";
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

            var shallHover = false;
            // TODO Is a hoverTpl really required to hover?
            if (!Ext.isEmpty(olProps.hoverTpl) && olProps.allowHover !== false) {
                shallHover = true;
            }

            return {
                name: metadata.dspTxt,
                legendUrl: olProps.legendUrl || '',
                legendHeight: olProps.legendHeight,
                legendWidth: olProps.legendWidth,
                allowFeatureInfo: getBool(olProps.allowFeatureInfo, true),
                allowDownload: getBool(olProps.allowDownload, true),
                allowRemoval: getBool(olProps.allowRemoval, true),
                allowShortInfo: getBool(olProps.allowShortInfo, true),
                allowPrint: getBool(olProps.allowPrint, true),
                allowOpacityChange: getBool(olProps.allowOpacityChange, true),
                hoverable: shallHover,
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

                        // Fire an event that indicates loading has started.
                        // This is essentially the same as the other sources
                        // (ImageSource or TileSource) do it.
                        vectorSource.dispatchEvent('vectorloadstart');
                        Ext.Ajax.request({
                            url: mdLayerCfg.url,
                            method: 'GET',
                            params: finalParams,
                            success: function(response) {
                                var format = new ol.format.GeoJSON();
                                var features = format.readFeatures(response.responseText);
                                // Fire an event that indicates loading has
                                // finished. This is essentially the same as the
                                // other sources (ImageSource or TileSource) do
                                // it.
                                vectorSource.dispatchEvent('vectorloadend');
                                vectorSource.addFeatures(features);
                            },
                            failure: function(response) {
                                // Fire an event that indicates loading has
                                // errored. This is essentially the same as the
                                // other sources (ImageSource or TileSource) do
                                // it.
                                vectorSource.dispatchEvent('vectorloaderror');
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
            var me = this,
            filters = this.getFiltersFromMetadata(metadata),
            viewParamFilters = [];

            if (!filters) {
                return metadata;
            }

            metadata = me.applyDefaultsIfNotChangedByUser(metadata, filters);

            // get them again, they may have changed…
            filters = this.getFiltersFromMetadata(metadata);

            for (var i=0; i<filters.length; i++){
                if (filters[i].encodeInViewParams === "true") {
                    viewParamFilters.push(filters[i]);
                    if (filters[i].param === "test_data" && filters[i].value === "true"){
                        metadata.dspTxt = "#TESTDATA# " + metadata.dspTxt;
                    }
                    filters.splice(i, 1);
                    metadata = me.moveFiltersToViewparams(metadata, viewParamFilters);
                }
            }
            if (filters.length !== 0){
                // The filters should not be encoded in the viewparams, but as
                // WMS-T and friends
                metadata = me.adjustMetadataFiltersToStandardLocations(
                    metadata,
                    filters
                );
            }
            return metadata;
        },

        /**
         *
         */
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

        /**
         *
         */
        applyDefaultsTimerangeFilter: function(filter){
            if (!Ext.isDate(filter.mindatetimeinstant)) {
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
                    Ext.log.warn('No defined start value for timerange filter' +
                        ' and no configured default start value for timerange' +
                        ' filter');
                }
            }
            if (!Ext.isDate(filter.maxdatetimeinstant)) {
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
                    Ext.log.warn('No defined end value for timerange filter' +
                        ' and no configured default end value for timerange' +
                        ' filter');
                }
            }
            return filter;
        },

        applyDefaultsPointInTimeFilter: function(filter){
            if (!Ext.isDate(filter.timeinstant)) {
                if (filter.defaulttimeinstant) {
                    try {
                        filter.timeinstant = Ext.Date.parse(
                            filter.defaulttimeinstant,
                            filter.defaulttimeformat
                        );
                    } catch (e) {
                        Ext.log.error(
                            'Could not set default point in time filter'
                        );
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
            var start = filter.mindatetimeinstant;
            var end = filter.maxdatetimeinstant;

            var format = Koala.util.Date.ISO_FORMAT;
            var val = Ext.Date.format(start, format) + '/' + Ext.Date.format(end, format);
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
            var dateValue = filter.timeinstant;
            var format = Koala.util.Date.ISO_FORMAT;
            var val = Ext.Date.format(dateValue, format);
            olProps[wmstKey] = val;
            metadata.layerConfig.olProperties = olProps;
            return metadata;
        },

        /**
         * Returns a stringified version of the passed value filter. The
         * stringified version is a CQL and can be used for filtering (e.g. via
         * the query parameter `CQL_FILTER`) or for displaying the filter (e.g.
         * in the legendpanel). If the second parameter `displayFriendly` is
         * set, you'll not receive technical-looking CQL, but instead a more
         * user friendly variant which can be presented to users.
         *
         * @param {object} filter The value-filter.
         * @param {boolean} [displayFriendly] Whether the string representation
         *     shall be display friendly (used e.g. in the legendpanel).
         *     Optional, defaults to `false`.
         * @return {string} A stringified variant of the filter as CQL (or in a
         *     display friendly format).
         */
        stringifyValueFilter: function(filter, displayFriendly){
            var LayerUtil = Koala.util.Layer;
            if (!Ext.isDefined(displayFriendly)) {
                displayFriendly = false;
            }

            // catch the cases where somebody submitted a (NOT) IN with
            // only one value in the array for displaying, we then simply
            // call ourself again with the only value or undefined as
            // non-array
            if (displayFriendly &&
                Ext.isArray(filter.value) &&
                filter.value.length < 2) {
                var clone = Ext.clone(filter);
                clone.value = filter.value[0];
                return LayerUtil.stringifyValueFilter(
                    clone, displayFriendly
                );
            }

            var keyFriendly = 'alias';
            var keyCql = 'param';

            // Holds the key to use for lookup for the part before the
            // operation…
            var paramKey = displayFriendly ? keyFriendly : keyCql;
            // …But since alias is optional, we need to check if isn't empty
            if(paramKey === keyFriendly && Ext.isEmpty(filter[keyFriendly])) {
                paramKey = keyCql;
            }
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
                var value = filter.value;
                // in case of userfriendly display, we need to adjust again, now
                // taking the current language into account.
                if (displayFriendly) {
                    op = LayerUtil.getDisplayFriendlyOperation(op);
                    value = LayerUtil.getDisplayFriendlyValue(
                        value, filter.allowedValues
                    );
                }
                // name='jubbes'
                stringified = filter[paramKey] + op + value;
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

                var valuesPart = '(' + filter.value.join(',') + ')';

                // in case of userfriendly display, we need to adjust again, now
                // taking the current language into account, both for operation
                // and the value part
                if (displayFriendly) {
                    valuesPart = LayerUtil.getDisplayFriendlyValuesPart(
                        op, filter.value, filter.allowedValues
                    );
                    op = LayerUtil.getDisplayFriendlyOperation(op);
                }

                stringified = filter[paramKey] +        // name
                    ' ' + op + ' ' +                    // NOT IN
                    valuesPart; // ('kalle', 'jupp')
            }
            if (adjusted) {
                Ext.log.info("Filter operator has been adjusted from " +
                    "'" + filter.operator + "' to '" + op + "'");
            }
            return stringified;
        },

        getDisplayFriendlyValue: function(rawValue, allowedValues){
            var displayFriendly = rawValue;
            if (!allowedValues) {
                return displayFriendly;
            }
            var FilterUtil = Koala.util.Filter;
            var VAL_FIELD = FilterUtil.COMBO_VAL_FIELD;
            var DSP_FIELD = FilterUtil.COMBO_DSP_FIELD;
            var store = FilterUtil.getStoreFromAllowedValues(allowedValues);
            var record = store.findRecord(VAL_FIELD, rawValue);
            if (record) {
                displayFriendly = record.get(DSP_FIELD);
            }
            return displayFriendly;
        },

        valsToDisplayVals: function(vals, allowedVals){
            var staticMe = Koala.util.Layer;
            var displayVals = [];
            Ext.each(vals, function(val) {
                var dspVal = staticMe.getDisplayFriendlyValue(val, allowedVals);
                displayVals.push(dspVal);
            });
            return displayVals;
        },

        /**
         * @private
         */
        getDisplayFriendlyValuesPart: function(sanitizedOp, vals, allowedVals) {
            var displayFriendly;
            var LayerUtil = Koala.util.Layer;
            var dspVals = LayerUtil.valsToDisplayVals(vals, allowedVals);

            switch (sanitizedOp) {
                case 'IN':
                    displayFriendly = LayerUtil.arrJoinWith(
                        dspVals,
                        LayerUtil.dspSignInJoiner,
                        LayerUtil.dspSignInLastJoiner
                    );
                    break;
                case 'NOT IN':
                    displayFriendly = LayerUtil.arrJoinWith(
                        dspVals,
                        LayerUtil.dspSignNotInJoiner,
                        LayerUtil.dspSignNotInLastJoiner
                    );
                    break;
                default:
                    // 'should never happen'™
                    displayFriendly = LayerUtil.arrJoinWith(dspVals, ',', ',');
            }
            return displayFriendly;
        },

        /**
         * @private
         */
        arrJoinWith: function(arr, joiner, lastJoiner) {
            var len = arr.length;
            var i = 0;
            var joined = "";
            for(; i < len - 2; i++) {
                joined += arr[i] + joiner;
            }
            joined += arr[len - 2];
            joined += lastJoiner;
            joined += arr[len - 1];
            return joined;
        },

        /**
         * @private
         */
        getDisplayFriendlyOperation: function(sanitizedOp) {
            var displayFriendly;
            var LayerUtil = Koala.util.Layer;
            switch (sanitizedOp) {
                case '<>':
                    displayFriendly = LayerUtil.dspSignNotEq;
                    break;
                case '=':
                    displayFriendly = LayerUtil.dspSignEq;
                    break;
                case '<=':
                    displayFriendly = LayerUtil.dspSignLtEq;
                    break;
                case '>=':
                    displayFriendly = LayerUtil.dspSignGtEq;
                    break;
                case '<':
                    displayFriendly = LayerUtil.dspSignLt;
                    break;
                case '>':
                    displayFriendly = LayerUtil.dspSignGt;
                    break;
                case 'IN':
                    displayFriendly = LayerUtil.dspSignIn;
                    break;
                case 'NOT IN':
                    displayFriendly = LayerUtil.dspSignNotIn;
                default:
                    // catches some other unexpected filter
                    displayFriendly = sanitizedOp;
            }
            return displayFriendly;
        },

        /**
         * Returns a stringified version of the passed pointintime filter. The
         * stringified version is a CQL and can be used for filtering (e.g. via
         * the query parameter `CQL_FILTER`) or for displaying the filter (e.g.
         * in the legendpanel). For displaying a time-related filter, this may
         * not be the best choice though.
         *
         * @param {object} filter The pointintime-filter.
         * @return {string} A stringified variant of the filter as CQL.
         */
        stringifyPointInTimeFilter: function(filter) {
            var format = Koala.util.Date.ISO_FORMAT;
            var trimmedParam = Ext.String.trim(filter.param);
            var timeinstant = filter.timeinstant;
            var formattedTime = Ext.Date.format(timeinstant, format);
            var cql = trimmedParam + "=" + formattedTime;
            return cql;
        },

        /**
         * Returns a stringified version of the passed timerange filter. The
         * stringified version is a CQL and can be used for filtering (e.g. via
         * the query parameter `CQL_FILTER`) or for displaying the filter (e.g.
         * in the legendpanel). For displaying a time-related filter, this may
         * not be the best choice though.
         *
         * @param {object} filter The timerange-filter.
         * @return {string} A stringified variant of the filter as CQL.
         */
        stringifyTimeRangeFilter: function(filter) {
            var format = Koala.util.Date.ISO_FORMAT;
            var trimmedParam = Ext.String.trim(filter.param);
            var params = trimmedParam.split(",");
            var startParam = params[0];
            var endParam = params[1] || params[0];
            var mindatetimeinstant = filter.mindatetimeinstant;
            var maxdatetimeinstant = filter.maxdatetimeinstant;
            var formattedStart = Ext.Date.format(mindatetimeinstant, format);
            var formattedEnd = Ext.Date.format(maxdatetimeinstant, format);
            var cql = "";
            if (startParam === endParam) {
                // We'll often be filtering on actually one attribute.
                // we then want to have the standard GeoServer functionality:
                // http://docs.geoserver.org/stable/en/user/filter/ecql_reference.html#temporal-predicate
                cql += startParam;
                cql += " DURING ";
                cql += formattedStart + "/" + formattedEnd;
            } else {
                // This will not often be the case, but we need to make sure to
                // support it. If different attributes have the start/end values
                // we make a AND connected less than /greater than filter.
                cql += "(";
                cql += startParam + ">" + formattedStart;
                cql += " AND ";
                cql += endParam + "<" + formattedEnd;
                cql += ")";
            }
            return cql;
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
            var format = Koala.util.Date.ISO_FORMAT;
            var keyVals = {};
            Ext.each(filters, function(filter) {
                var params = filter.param.split(",");
                var type = filter.type;

                // we need to check the metadata for default filters to apply
                if (type === "timerange") {
                    var rawDateMin = filter.mindatetimeinstant;
                    keyVals[params[0]] = Ext.Date.format(rawDateMin, format);

                    var rawDateMax = filter.maxdatetimeinstant;
                    if(!params[1]) {
                        keyVals[params[0]] += "/" +
                            Ext.Date.format(rawDateMax, format);
                    } else {
                        keyVals[params[1]] = Ext.Date.format(
                                rawDateMax, format
                            );
                    }
                } else if (type === "pointintime") {
                    var rawDate = filter.timeinstant;
                    keyVals[params[0]] = Ext.Date.format(rawDate, format);
                } else if (type === "value") {
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
            /* eslint camelcase:0 */
            metadata.layerConfig.olProperties.param_viewparams = existingViewParams;
            return metadata;
        },

        /**
         * Gets an appropriate URL where the current layer filters are
         * respected. The Base URL can be configured in `downloadUrl` on the
         * GNOS-side.
         *
         * @param {ol.layer.Base} layer The Layer to get the URL from. Any
         *     active filters will be serialized as a CQL filter.
         * @return {string} The download URL.
         */
        getDownloadUrlWithFilter: function(layer){
            var staticMe = this;
            var baseUrl = layer.get('downloadUrl');
            var url = baseUrl;
            var metadata = layer.metadata;
            var filters = staticMe.getFiltersFromMetadata(metadata);
            if (!filters) {
                return url;
            }
            var cql = staticMe.filtersToCql(filters);
            var param = "CQL_FILTER=" + encodeURIComponent(cql);
            // TODO check if we already have a CQL_FILTER in layer or base-url?!?
            url = Ext.String.urlAppend(url, param);

            var existingViewParams = Koala.util.Object.getPathStrOr(
                    metadata,
                    "layerConfig/olProperties/param_viewparams",
                    null
                );
            if (existingViewParams !== null) {
                var viewParams = "VIEWPARAMS=" + existingViewParams;
                url = Ext.String.urlAppend(url, viewParams);
            }
            return url;
        },

        filtersToCql: function(filters) {
            var staticMe = this;
            if (!filters || filters.length < 1) {
                return "";
            }
            var cqlParts = [];
            Ext.each(filters, function(filter){
                cqlParts.push("(" + staticMe.filterToCql(filter) + ")");
            });
            return cqlParts.join(" AND ");
        },

        filterToCql: function(filter){
            var staticMe = this;
            var type = filter.type;
            var cql = "";
            switch(type) {
                case "rodos":
                    // TODO to be specified
                    break;
                case "value":
                    cql = staticMe.stringifyValueFilter(filter);
                    break;
                case "pointintime":
                    cql = staticMe.stringifyPointInTimeFilter(filter);
                    break;
                case "timerange":
                    cql = staticMe.stringifyTimeRangeFilter(filter);
                    break;
                default:
                    Ext.log.warn("Unexpected filter type " + type
                        + " specified");
                    break;
            }
            return cql;
        },

        /**
         * Returns a flattened array of all layers in the passed structure (may
         * be hierarchical with children under the key `children`). This utility
         * ensures that layers sets (also possibly with a deep hierarchy) can be
         * added in the exoected order, even though we have to query in an
         * asynchronous for their metadata. Undefined layers will be skipped.
         *
         * See also https://redmine-koala.bfs.de/issues/1491.
         *
         * @param {Array} layers An array of layers. A layer has the key `leaf`
         *   to determine if it ids a leaf or a folder. In case of a folder,
         *   layers have a key `children` which again holds layers.
         * @return {Array} A flattened and correctly ordered list of plain
         *   layers; e.g. no folders.
         */
        getOrderedFlatLayers: function(layers) {
            var me = Koala.util.Layer;
            var flatList = [];

            Ext.each(layers, function(layer) {
                if(layer) {
                    if (!layer.leaf) {
                        var flatChildren = me.getOrderedFlatLayers(
                            layer.children
                        );
                        flatList = Ext.Array.push(flatList, flatChildren);
                    } else {
                        flatList.push(layer);
                    }
                }
            });
            return flatList;
        }

    }
});
