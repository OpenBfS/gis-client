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
 * @class Koala.util.Layer
 */
Ext.define('Koala.util.Layer', {

    requires: [
        'BasiGX.util.Map',

        'Koala.util.Authentication',
        'Koala.util.Date',
        'Koala.util.Filter',
        'Koala.util.MetadataParser',
        'Koala.util.String',
        'Koala.util.Object'

    ],

    statics: {
        /* i18n */
        txtUntil: '',
        titleAddLayer: '',
        titleAddLayerFilter: '',
        textUnknownLayer: '',
        dspSignEq: '',
        dspSignNotEq: '',
        dspSignLtEq: '',
        dspSignGtEq: '',
        dspSignLt: '',
        dspSignGt: '',
        dspSignIn: '',
        dspSignInJoiner: '',
        dspSignInLastJoiner: '',
        dspSignNotIn: '',
        dspSignNotInJoiner: '',
        dspSignNotInLastJoiner: '',
        /* i18n */

        /**
         * A unique key for originally received and parsed GNOS metadata, will
         * be used as key in a `ol.Collection` (the layer, more specifically).
         */
        FIELDNAME_ORIGINAL_METADATA: 'k-originally-parsed-untainted-metadata',

        /**
         * Stores the passed metadata, which must be a clone of the originally
         * received and parsed metadata object from GNOS in the layer. We need
         * to have this in order to easily change active filters from the layer.
         *
         * Callers need to ensure that the passed object is not fiddled with and
         * is a clone (`Ext.clone`) of the originally received and parsed
         * metadata object from GNOS.
         *
         * @param {ol.layer.Layer} layer The layer where we will store the
         *     metadata on.
         * @param {Object} originalMetadata The metadata object to store. Must
         *     be a clone of the originally received and parsed GNOS Metadata.
         */
        setOriginalMetadata: function(layer, originalMetadata) {
            if (layer && layer.set) {
                layer.set(
                    Koala.util.Layer.FIELDNAME_ORIGINAL_METADATA,
                    originalMetadata
                );
            }
        },

        /**
         * Returns a previously stored metadata object. For further notes see
         * the documentation of #setOriginalMetadata.
         *
         * @param {ol.layer.Layer} layer The layer where we want the original
         *     metadata from.
         * @return {Object} the metadata object that was once stored.
         */
        getOriginalMetadata: function(layer) {
            return layer && layer.get && layer.get(
                Koala.util.Layer.FIELDNAME_ORIGINAL_METADATA
            );
        },

        /**
         * Checks whether the passed layer has it's original metadata stored at
         * the exected location. We need this method so that we can check the
         * various layers that might be passed to layer utility methods.
         *
         * @param {ol.layer.Layer} layer The layer where we want to check.
         * @return {boolean} Whether the layer had metdata at the expected
         *     location.
         */
        hasOriginalMetadata: function(layer) {
            var hasOriginalMetadata = false;
            var fieldname = Koala.util.Layer.FIELDNAME_ORIGINAL_METADATA;
            if (layer && layer.getKeys && layer.get) {
                var keys = layer.getKeys();
                var keyContained = Ext.Array.contains(keys, fieldname);
                if (keyContained) {
                    hasOriginalMetadata = Ext.isObject(
                        layer.get(fieldname)
                    );
                }
            }
            return hasOriginalMetadata;
        },

        /**
         * Gets the name of the first geometry field of the given layer by
         * issuing a WFS DescribeFeatureType request against the GeoServer
         *
         * @param {ol.layer.Layer} layer The layer to use
         * @param {Function} successCb The success callback function
         * @param {Function} errorCb The failure callback function
         */
        getGeometryFieldNameForLayer: function(layer, successCb, errorCb) {
            if (!layer || !successCb || !errorCb) {
                Ext.log.error('Invalid arguments for method ' +
                    '`getGeometryFieldNameForLayer`');
                return;
            }
            var url = Koala.util.Object.getPathStrOr(layer.metadata, 'layerConfig/wfs/url');
            if (!url) {
                Ext.log.error('No WFS URL for the given layer could be found');
                errorCb.call();
                return;
            }
            var name = Koala.util.Object.getPathStrOr(layer.metadata, 'layerConfig/wms/layers');
            url = Ext.String.urlAppend(url, 'request=DescribeFeatureType');
            url = Ext.String.urlAppend(url, 'typename=' + name);
            url = Ext.String.urlAppend(url, 'service=WFS');
            url = Ext.String.urlAppend(url, 'version=1.1.0');
            url = Ext.String.urlAppend(url, 'outputformat=application/json');

            Ext.Ajax.request({
                url: url,
                success: function(response) {
                    Koala.util.Layer.getDescribeFeatureTypeSuccess(
                        successCb,
                        response
                    );
                },
                failure: errorCb,
                timeout: 120000
            });
        },

        /**
         * Method tries to detect the name of the geometry field from a
         * DescribeFeatureType response and calls the success callback.
         * @param {Function} successCb The success callback function
         * @param {String} response The response to parse
         */
        getDescribeFeatureTypeSuccess: function(successCb, response) {
            try {
                var json = JSON.parse(response.responseText);
                var geometryField = '';
                var geometryWhiteList = [
                    'gml:Geometry',
                    'gml:MultiGeometry',
                    'gml:Surface',
                    'gml:MultiSurface',
                    'gml:Point',
                    'gml:MultiPoint',
                    'gml:LineString',
                    'gml:MultiLineString',
                    'gml:Polygon',
                    'gml:MultiPolygon'
                ];

                Ext.each(json.featureTypes, function(ft) {
                    Ext.each(ft.properties, function(prop) {
                        var t = prop.type;
                        if (Ext.Array.contains(geometryWhiteList, t)) {
                            geometryField = prop.name;
                            return false;
                        }
                    });
                    if (geometryField) {
                        return false;
                    }
                });
                successCb.call(geometryField);
            } catch (e) {
                Ext.log.error('Could not determine geometryfield for layer: ' +
                    e);
            }
        },

        /**
         * Checks the properties of the layer to see if it configured to show the
         * CartoWindow instead of the default behaviour.
         *
         * @param {ol.layer.Layer} layer The layer to check.
         * @return {boolean} Whether the layer will show a CartoWindow.
         */
        isCartoWindowLayer: function(layer) {
            return !!layer.get('showCartoWindow');
        },

        /**
         * Checks the properties of the layer to see if it configured to draw
         * timeseries or bar charts.
         *
         * @param {ol.layer.Layer} layer The layer to check.
         * @return {boolean} Whether the layer allows to draw timeseries or bar
         *     charts.
         */
        isChartableLayer: function(l) {
            var staticMe = Koala.util.Layer;
            return staticMe.isTimeseriesChartLayer(l) || staticMe.isBarChartLayer(l);
        },

        /**
         * Checks the properties of the layer to see if it configured to draw
         * timeseries charts.
         *
         * @param {ol.layer.Layer} layer The layer to check.
         * @return {boolean} Whether the layer allows to draw timeseries charts.
         */
        isTimeseriesChartLayer: function(layer) {
            var timeseriesProps = layer.get('timeSeriesChartProperties') || {};
            var numTimeseriesProps = Ext.Object.getSize(timeseriesProps);
            return numTimeseriesProps > 0;
        },

        /**
         * Checks the properties of the layer to see if it configured to draw
         * bar charts.
         *
         * @param {ol.layer.Layer} layer The layer to check.
         * @return {boolean} Whether the layer allows to draw bar charts.
         */
        isBarChartLayer: function(layer) {
            var barProps = layer.get('barChartProperties') || {};
            var numBarProps = Ext.Object.getSize(barProps);
            return numBarProps > 0;
        },

        /**
         * Checks the properties of the layer to see if it is configured to show
         * a timeseries grid.
         *
         * @param {ol.layer.Layer} layer The layer to check.
         * @return {boolean} Whether the layer allows to draw the grid.
         */
        showTimeseriesGrid: function(layer) {
            var timeseriesProps = layer.get('timeSeriesChartProperties') || {};
            return timeseriesProps.showTimeseriesGrid === true || timeseriesProps.showTimeseriesGrid === 'true';
        },

        /**
         * Checks the properties of the layer to see if it is configured to show
         * a bar chart grid.
         *
         * @param {ol.layer.Layer} layer The layer to check.
         * @return {boolean} Whether the layer allows to draw the grid.
         */
        showBarChartGrid: function(layer) {
            var barChartProps = layer.get('barChartProperties') || {};
            return barChartProps.showBarchartGrid === true || barChartProps.showBarchartGrid === 'true';
        },

        /**
         * Checks the properties of the layer to see if it is configured to draw
         * a table.
         *
         * @param  {ol.layer.Layer} layer the layer to check
         * @return {boolean}       whether the layer is configured to have a table tab
         */
        isTableLayer: function(layer) {
            var contentProp = layer.get('tableContentProperty');
            var contentUrl = layer.get('tableContentURL');
            return !!(contentProp || contentUrl);
        },

        /**
         * Checks the properties of the layer to see if it is configured to
         * render a custom html tab.
         *
         * @param  {ol.layer.Layer} layer the layer to check
         * @return {boolean}       whether the layer is configured to have a html content tab
         */
        isHtmlLayer: function(layer) {
            var contentProp = layer.get('htmlContentProperty');
            var contentUrl = layer.get('htmlContentURL');
            return !!(contentProp || contentUrl);
        },

        /**
         * Returns whether the specified layer is using a WMS source, i.e. is
         * this a WMS layer?
         *
         * @param {ol.layer.Layer} layer The layer to check.
         * @return {boolean} Whether the layer is a WMS layer.
         */
        isWmsLayer: function(layer) {
            var isWmsLayer = false;
            if (layer) {
                var wmsSourceNames = ['TileWMS', 'ImageWMS'];
                var wmsSources = [];
                Ext.each(wmsSourceNames, function(wmsSourceName) {
                    if (wmsSourceName in ol.source) {
                        wmsSources.push(ol.source[wmsSourceName]);
                    }
                });
                var source = layer.getSource();
                Ext.each(wmsSources, function(wmsSource) {
                    if (source instanceof wmsSource) {
                        isWmsLayer = true;
                    }
                });
            }
            return isWmsLayer;
        },

        /**
         * Returns whether the specified layer is using a vector source, i.e. is
         * this a vector layer?
         *
         * @param {ol.layer.Layer} layer The layer to check.
         * @return {boolean} Whether the layer is a vector layer.
         */
        isVectorLayer: function(layer) {
            var isVectorLayer = false;
            if (layer) {
                var vectorSources = [];
                if ('Vector' in ol.source) {
                    vectorSources.push(ol.source.Vector);
                }
                var source = layer.getSource();
                Ext.each(vectorSources, function(vectorSource) {
                    if (source instanceof vectorSource) {
                        isVectorLayer = true;
                    }
                });
            }
            return isVectorLayer;
        },

        /**
         * Returns whether the passed metadata object from GNOS has at least one
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
            var staticMe = Koala.util.Layer;
            if (!staticMe.metadataHasFilters(metadata)) {
                return null;
            }
            var filter = metadata.filter;
            var filters = metadata.filters || [];
            var testdataFilter;

            if (filter) {
                filters.push(filter);
            }

            Ext.each(filters, function(f) {
                if (f.param === 'test_data') {
                    testdataFilter = f;
                }
            });

            // test_data filters should only be allowed to be used by users who
            // have the userrole 'imis'.
            // TODO This should be replaced with a security/roles concept ;)
            if (testdataFilter) {
                var appContext = Koala.util.AppContext.getAppContext();
                var userroles = Koala.util.Object.getPathStrOr(appContext,
                    'data/merge/imis_user/userroles');

                // Check if the "user" is not allowed to see 'test_data'
                if (!(userroles && Ext.Array.contains(userroles, 'imis'))) {
                    filters = Ext.Array.filter(filters, function(fi) {
                        return fi.param !== 'test_data';
                    });
                }
            }

            return filters;
        },

        getEffectiveTimeFilterFromMetadata: function(metadata) {
            var staticMe = Koala.util.Layer;
            var filters = Ext.clone(staticMe.getFiltersFromMetadata(metadata));
            var timeTypes = ['pointintime', 'timerange'];
            var effectiveFilter = null;
            if (filters !== null) {
                // The effective timefilter is the last pit or tr filter:
                Ext.each(filters, function(filter) {
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
            var staticMe = Koala.util.Layer;
            if ('Application' in Koala) {
                return Koala.Application.isUtc();
            }
            return !staticMe.appIsLocal();
        },

        /**
         * Returns a textual representation of the filters in the metadata
         * object. This method is used for displaying the filters and as such it
         * respects the current UTC setting of the application.
         *
         * @param {object} || [array] metadata The metadata json object, a filters array or a filter object.
         * @returns {string} A textual representation of the filters or ''.
         */
        getFiltersTextFromMetadata: function(metadata) {
            var staticMe = Koala.util.Layer;
            var filters;
            if (Array.isArray(metadata)) { // it's a 'filters' array
                filters = metadata;
            } else if (metadata !== null && typeof(metadata) === 'object') {
                if (metadata.hasOwnProperty('filters')) { // it's a 'metadata' object
                    filters = staticMe.getFiltersFromMetadata(metadata);
                } else {
                    filters = [metadata]; // it's a 'filter' object
                }
            } else {
                return '';
            }

            var filterTxts = [];

            Ext.each(filters, function(filter) {
                if (!Ext.isDefined(filter)) {
                    return;
                }
                var filterType = filter.type;
                var filterTxt = '';

                switch (filterType) {
                    case 'timerange':
                        var startDate, startTime;
                        var endDate, endTime;

                        startDate = filter.effectivemindatetime;
                        endDate = filter.effectivemaxdatetime;

                        // startFormat
                        startTime = Koala.util.Date.getFormattedDate(startDate);
                        // endFormat
                        endTime = Koala.util.Date.getFormattedDate(endDate);

                        filterTxt += '' +
                            startTime +
                            ' ' + staticMe.txtUntil + ' ' +
                            endTime;
                        break;
                    case 'rodostime':
                    case 'pointintime':
                        var date, time;
                        date = filter.effectivedatetime;
                        time = Koala.util.Date.getFormattedDate(date);

                        filterTxt += time;
                        break;
                    case 'value':
                        // Empty or false "test_data" filters should not be shown in the legend
                        if (filter.param === 'test_data' &&
                            (filter.effectivevalue.toLowerCase() === 'false' ||
                                !filter.effectivevalue)
                        ) {
                            return;
                        }
                        filterTxt += staticMe.stringifyValueFilter(filter, true);
                        break;
                    default:
                        break;
                }

                filterTxts.push(filterTxt);
            });

            return filterTxts.join('<br />');
        },

        /**
         * This fetches the metadata from gnos by a the given uuid. It returns
         * an Ext.Promise to work with the metadata.
         *
         * @param {String} uuid The uuid of a gnos layer.
         * @returns {Ext.Promise} An Ext.Promise. The resolve function receives
         *                        the metadata as an object.
         */
        getMetadataFromUuid: function(uuid) {
            var staticMe = Koala.util.Layer;
            var appContext = BasiGX.view.component.Map.guess().appContext;
            var urls = appContext.data.merge.urls;
            var defaultHeaders;
            var authHeader = Koala.util.Authentication.getAuthenticationHeader();
            if (authHeader) {
                defaultHeaders = {
                    Authorization: authHeader,
                    Accept: 'application/json'
                };
            }

            return new Ext.Promise(function(resolve, reject) {
                Ext.Ajax.request({
                    url: urls['metadata-xml2json'] + uuid,
                    defaultHeaders: defaultHeaders,
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
                            obj = Koala.util.MetadataParser.parseMetadata(obj);
                        } catch (ex) {
                            Ext.toast('Metadaten JSON konnte nicht dekodiert werden.');
                        } finally {
                            if (Koala.util.Layer.minimumValidMetadata(obj)) {
                                // TODO Can we move this out of here?
                                staticMe.resolveMetadataLinks(obj)
                                    .then(function() {
                                        resolve(obj);
                                    });
                            } else {
                                reject('Für den Datensatz scheinen nicht ausreichend Metadaten vorzuliegen.');
                            }
                        }
                    },
                    failure: function(response) {
                        var msg = 'server-side failure with status code ' +
                        response.status;
                        reject(msg);
                    }
                });
            });

        },

        /**
         * Resolves special properties with the value url:http://xxx
         * @param  {object} metadata the unresolved metadata
         * @param  {mixed} promises should be called with undefined, is internally used for recursion
         * @return {Ext.Promise}          top level call returns a promise which is resolved after all replacements are done
         */
        resolveMetadataLinks: function(metadata, promises) {
            var staticMe = Koala.util.Layer;
            var first = promises === undefined;
            if (first) {
                promises = [];
            }
            var i;
            if (metadata instanceof Array) {
                for (i = 0; i < metadata.length; ++i) {
                    staticMe.resolveMetadataLinks(metadata[i], promises)
                        .then(staticMe.resolveMetadataLink(i, metadata));
                }
            } else if (metadata instanceof Object) {
                var keys = Object.keys(metadata);
                for (i = 0; i < keys.length; ++i) {
                    staticMe.resolveMetadataLinks(metadata[keys[i]], promises)
                        .then(staticMe.resolveMetadataLink(keys[i], metadata));
                }
            } else if (typeof metadata === 'string') {
                var ms = metadata.match(/^url:(.+)/);
                if (ms) {
                    var promise = staticMe.getMetadataValue(ms[1]);
                    promises.push(promise);
                    return promise;
                }
            }

            if (first) {
                return Ext.Promise.all(promises);
            }
            return new Ext.Promise(function(resolve) {
                resolve(metadata);
            });
        },

        /**
         * Returns a function that sets a resolved metadata property.
         * @param  {mixed} i        the index of the value
         * @param  {object} metadata the metadata part where the value should be set
         * @return {function}          a function that takes the value and sets it
         */
        resolveMetadataLink: function(i, metadata) {
            return function(data) {
                metadata[i] = data;
            };
        },

        /**
         * Fetches a metadata value from url.
         * @param  {string} url url to fetch the value from
         * @return {Ext.Promise}     a promise to the value
         */
        getMetadataValue: function(url) {
            var defaultHeaders;
            var authHeader = Koala.util.Authentication.getAuthenticationHeader();
            if (authHeader) {
                defaultHeaders = {
                    Authorization: authHeader
                };
            }

            return new Ext.Promise(function(resolve, reject) {
                Ext.Ajax.request({
                    url: url,
                    defaultHeaders: defaultHeaders,
                    method: 'GET',
                    success: function(response) {
                        resolve(response.responseText);
                    },
                    failure: function(response) {
                        reject(response.status);
                    }
                });
            });
        },

        minimumValidMetadata: function(metadata) {
            // catches undefined and false, which we'll receive if there isn't
            // an additional dataset stored
            if (!metadata) {
                return false;
            }
            // TODO implement checks for more minimum properties
            return true;
        },

        addLayerToMap: function(metadata) {
            var staticMe = Koala.util.Layer;
            var metadataClone = Ext.clone(metadata);
            var layer = staticMe.layerFromMetadata(metadata);
            staticMe.setOriginalMetadata(layer, metadataClone);
            staticMe.addOlLayerToMap(layer);
        },

        /**
         * This method finds the first RoutingLegendTree and updates the filters
         * text in the layer HTML suffix. This method is called multiple times,
         * e.g. after drag 'n drop of layeritems and right after new layers
         * (E.g from the filterpanel) have been added to the map and the tree.
         */
        repaintLayerFilterIndication: function() {
            var staticMe = Koala.util.Layer;
            var selector = 'k-panel-routing-legendtree';
            var treePanel = Ext.ComponentQuery.query(selector)[0];
            if (!treePanel) {
                return;
            }
            var store = treePanel.getStore();
            store.each(function(treeNode) {
                var layer = treeNode.getOlLayer();
                var suffixId = layer.get('__suffix_id__');
                if (suffixId) {
                    var txt = staticMe.getFiltersTextFromMetadata(layer.metadata);
                    var filterIndicator = Ext.get(suffixId);
                    if (filterIndicator) {
                        filterIndicator.setHtml(txt);
                    }
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
        getLayerNameSuffix: function(suffixId) {
            return '' +
                '<span' +
                ' class=\'layer-name-suffix\'' +
                ' id=\'' + suffixId + '\'>' +
                '</span>';
        },

        /**
         * Adds all the passed OpenLayers layers to the map.
         *
         * @param {Array<ol.layer.Base>} layers The array of layers to add.
         */
        addOlLayersToMap: function(layers) {
            var staticMe = Koala.util.Layer;
            Ext.each(layers, function(layer) {
                if (layer) {
                    staticMe.addOlLayerToMap(layer);
                }
            });
        },

        /**
         * Adds the passed OpenLayers layer to the map.
         *
         * @param {ol.layer.Base} layer The layer to add.
         */
        addOlLayerToMap: function(layer) {
            var staticMe = Koala.util.Layer;

            if (!staticMe.hasOriginalMetadata(layer)) {
                Ext.log.warn('Layer did not have original GNOS metadata ' +
                    'at the expected location');
            }

            var suffixId = staticMe.getSuffixId();
            var suffix = staticMe.getLayerNameSuffix(suffixId);

            layer.set('__suffix_id__', suffixId);
            layer.set('suffix', suffix);
            layer.set('nameWithSuffix', layer.get('name') + suffix);

            // TODO in the future we aren't allowed to guess here, as there will
            // be multiple maps!
            var mapComp = Ext.ComponentQuery.query('basigx-component-map')[0];
            // attach a listener to the new layer, so that hover artifacts on
            // the get cleaned up when visibility changes base-component-map
            staticMe.bindLayerVisibilityHandlers(layer, mapComp);
            mapComp.addLayer(layer);

            // Select the newly added layer in the legend tree (handles classic
            // and modern)
            staticMe.setAsActiveInLegendTree(layer);
        },

        /**
         * Sets the given ol.layer.Layer as selected in the legend tree. Handles
         * both classic and modern legend tree.
         *
         * @param {ol.layer.Layer} layer The layer to set selected/active in
         *                               the tree.
         */
        setAsActiveInLegendTree: function(layer) {
            if (!(layer instanceof ol.layer.Layer)) {
                return;
            }

            // Get the legend tree, either classic or modern
            var legendTree = Ext.ComponentQuery.query(
                'k-panel-routing-legendtree, k-panel-mobilelegend > treelist')[0];

            if (legendTree) {
                // Get the corresponding tree node.
                var treeNode = legendTree.getStore().findNode('id', layer.id);
                if (treeNode) {
                    // Select the tree node
                    legendTree.setSelection(treeNode);
                }
            }
        },

        /**
         *
         */
        bindLayerVisibilityHandlers: function(layer, mapComp) {
            var staticMe = Koala.util.Layer;
            if (!mapComp.getPlugin) {
                return;
            }
            var hoverPlugin = mapComp.getPlugin('hoverBfS');

            if (hoverPlugin) {
                layer.on('change:visible', hoverPlugin.cleanupHoverArtifacts, hoverPlugin);
                if (layer instanceof ol.layer.Group) {
                    // additionally, if the new layer is a group layer, we need to
                    // bind ourself for all sublayers
                    layer.getLayers().forEach(function(subLayer) {
                        staticMe.bindLayerVisibilityHandlers(subLayer, mapComp);
                    });
                }
            }
        },

        /**
         * Layer will be undefined in the case that we actiually want
         * to add a layer with the filter. It might also be a layer
         * if we actually want to show the filter window to change the
         * filter of a layer.
         *
         * @param {Object} metadata The metadata to construct the
         *     filter window form.
         * @param {ol.layer.layer} [layer] The layer (if any) whose
         *     filter we want to change. Optional, don't pass if you want a new
         *     layer with the filter added to the map.
         */
        showChangeFilterSettingsWin: function(metadata, layer) {
            var staticMe = Koala.util.Layer;
            var existingLayer = layer ? layer : null;
            var filters = staticMe.getFiltersFromMetadata(metadata);

            // TODO future enhancements may want to remove the ComponentQuery…
            var themeTree = Ext.ComponentQuery.query('k-panel-themetree')[0];
            var currentSelection = themeTree.getSelection()[0];
            var title = currentSelection ?
                currentSelection.data.text :
                metadata.legendTitle;

            var winName = 'filter-win-' + metadata.id;

            // only allow one filter-window to be open
            var filterPanelExisting = Ext.ComponentQuery.query(
                'k-form-layerfilter');

            if (filterPanelExisting.length > 0) {
                filterPanelExisting[0].up('window').close();
            }

            Ext.create('Ext.window.Window', {
                name: winName,
                title: title,
                layout: 'fit',
                minWidth: 400,
                items: {
                    xtype: 'k-form-layerfilter',
                    metadata: metadata,
                    filters: filters,
                    format: Ext.Date.defaultFormat,
                    layer: existingLayer
                }
            }).show();
        },

        /**
         * @public
         */
        addLayerByUuid: function(uuid) {
            var staticMe = Koala.util.Layer;
            return staticMe.getMetadataFromUuid(uuid).then(staticMe.addLayerToMap);
        },

        /**
         * @public
         */
        showChangeFilterSettingsWinByUuid: function(uuid) {
            var staticMe = Koala.util.Layer;
            return staticMe.getMetadataFromUuid(uuid).then(staticMe.showChangeFilterSettingsWin);
        },

        /**
         * @param ol.layer.Base
         */
        getCurrentLegendUrl: function(layer) {
            var width = layer.get('legendWidth');
            var height= layer.get('legendHeight');
            var legendUrl = layer.get('legendUrl') || '';
            var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
            var resolution = BasiGX.util.Map.getResolution(map);
            var scale = BasiGX.util.Map.getScale(map);
            var style;

            // determine the style to add
            if (Koala.util.Layer.isWmsLayer(layer)) {
                var source = layer.getSource();
                var params = source.getParams();
                var styles = params && 'STYLES' in params && params.STYLES;
                if (styles) {
                    style = styles.split(',')[0];
                }
            }

            if (!legendUrl) {
                return '';
            }
            if (width) {
                legendUrl = Ext.String.urlAppend(legendUrl, 'WIDTH=' + width);
            }
            if (height) {
                legendUrl = Ext.String.urlAppend(legendUrl, 'HEIGHT=' + height);
            }
            if (resolution) {
                legendUrl = Ext.String.urlAppend(legendUrl, 'SCALE=' + scale);
            }
            if (style) {
                legendUrl = Ext.String.urlAppend(legendUrl, 'STYLE=' + style);
                // requested by SB: replace any [[STYLES]] placeholders with the
                // current style
                legendUrl = Koala.util.String.replaceTemplateStrings(
                    legendUrl,
                    {STYLES: style}
                );
            }
            return legendUrl;
        },

        layerFromMetadata: function(metadata) {
            var staticMe = Koala.util.Layer;
            var layerClassDecision = staticMe.getLayerClassFromMetadata(metadata);
            var LayerClass = layerClassDecision.clazz;
            var SourceClass = staticMe.getSourceClassFromMetadata(metadata, layerClassDecision);
            var layerConfig;
            var sourceConfig;

            // apply default filter to layer, if needed
            metadata = Koala.util.Layer.adjustMetadataAccordingToFilters(metadata);

            var internalLayerConfig = staticMe.getInternalLayerConfig(metadata); //TODO arguments?
            var internalSourceConfig = staticMe.getInternalSourceConfig(metadata, SourceClass);

            var olProps = metadata.layerConfig ?
                metadata.layerConfig.olProperties || {} :
                {};
            var mdLayerConfig = Koala.util.Object.getConfigByPrefix(
                olProps, 'layer_', true);

            var mdSourceConfig = Koala.util.Object.getConfigByPrefix(
                olProps, 'source_', true);

            var mdParamConfig = Koala.util.Object.getConfigByPrefix(
                olProps, 'param_', false);

            layerConfig = Ext.apply(internalLayerConfig, mdLayerConfig);
            sourceConfig = Ext.apply(internalSourceConfig, mdSourceConfig);

            if (!Ext.isObject(sourceConfig.params)) {
                sourceConfig.params = {};
            }
            sourceConfig.params = Ext.Object.merge(sourceConfig.params, mdParamConfig);

            layerConfig.source = new SourceClass(sourceConfig);

            var layer = new LayerClass(layerConfig);
            layer.metadata = metadata;

            if (metadata.layerConfig.olProperties.printLayer) {
                var printUuid = metadata.layerConfig.olProperties.printLayer;
                var printLayer;

                staticMe.getMetadataFromUuid(printUuid).then(function(md) {
                    var metadataClone = Ext.clone(md);
                    printLayer = staticMe.layerFromMetadata(md);
                    staticMe.setOriginalMetadata(printLayer, metadataClone);
                    layer.set('printLayer', printLayer);
                });
            }
            return layer;
        },

        /**
         * @param Object metadata The JSON metadata from GNOS
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

            if (hint === 'wms' && layerCfg.olProperties &&
                layerCfg.olProperties.singleTile === 'true') {
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
                name: metadata.legendTitle || metadata.treeTitle,
                legendUrl: olProps.legendUrl || '',
                legendHeight: olProps.legendHeight,
                legendWidth: olProps.legendWidth,
                allowFeatureInfo: getBool(olProps.allowFeatureInfo, true),
                allowDownload: getBool(olProps.allowDownload, true),
                allowRemoval: getBool(olProps.allowRemoval, true),
                allowClone: getBool(olProps.allowClone, false),
                allowEdit: getBool(olProps.allowEdit, false),
                allowShortInfo: getBool(olProps.allowShortInfo, true),
                allowPrint: getBool(olProps.allowPrint, true),
                allowOpacityChange: getBool(olProps.allowOpacityChange, true),
                hoverable: shallHover,
                hoverTpl: olProps.hoverTpl,
                opacity: olProps.opacity || 1,
                minResolution: olProps.minResolution || 0, //allow almost verything if olProps.maxResolution exists but is empty
                maxResolution: olProps.maxResolution || 200000, //allow almost verything if olProps.maxResolution exists but is empty
                hoverStyle: olProps.hoverStyle,
                selectStyle: olProps.selectStyle || olProps.hoverStyle,
                hasLegend: getBool(olProps.hasLegend, true),
                downloadUrl: metadata.layerConfig.download ? metadata.layerConfig.download.url : undefined,
                attribution: olProps.attribution || '',
                // "treeId": metadata.inspireId, //TODO: is now routeId
                //"treeMenu": true, // TODO: remove / enhance due to new single item properties
                //routeId: olProps.routeId || metadata.inspireId, // TODO: get this back in when gnos is ready
                routeId: metadata.inspireId,
                showCartoWindow: getBool(olProps.showCartoWindow, false),
                tableContentProperty: olProps.tableContentProperty,
                tableContentURL: olProps.tableContentURL,
                htmlContentProperty: olProps.htmlContentProperty,
                htmlContentURL: olProps.htmlContentURL,
                cartoWindowLineStyle: olProps.cartoWindowLineStyle || '#294d71,4',
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
                olProps, 'param_');
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
                    var resolutions = [];
                    var matrixIds = [];
                    for (var z = 0; z < 19; ++z) {
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
         * Given a GNOS filter, this method checks if it is the one special case
         * defined by BfS where the STYLES (for WMS GetMap, e.g.) is being set.
         *
         * @param {Object} f The filter object to check.
         * @return {boolean} Whether the filter is the specially handled STYLES
         *     filter.
         */
        isSpecialStylesValueFilter: function(f) {
            var staticMe = Koala.util.Layer;
            if (staticMe.isViewParamFilter(f) &&
                f.type === 'value' &&
                f.param === 'STYLES') {
                return true;
            }
            return false;
        },

        /**
         * Given a GNOS filter, this method checks if it is the one special case
         * defined by BfS where the param is `'test_data'` (for marking the
         * layer in the tree, e.g.).
         *
         * @param {Object} f The filter object to check.
         * @return {boolean} Whether the filter is the specially handled
         *     `'test_data'`-filter.
         */
        isSpecialTestDataValueFilter: function(f) {
            var staticMe = Koala.util.Layer;
            if (staticMe.isViewParamFilter(f) &&
                f.type === 'value' &&
                f.param === 'test_data' &&
                f.value === 'true') {
                return true;
            }
            return false;
        },

        /**
         * Given a GNOS filter, this method checks if it is to be encoded in the
         * viewparams of any request.
         *
         * @param {Object} f The filter object to check.
         * @return {boolean} Whether the filter shall be encoded in the
         *     viewparams of any request.
         */
        isViewParamFilter: function(f) {
            return f ? f.encodeInViewParams === 'true' : false;
        },

        /**
         * Given a GNOS filter, this method checks if it is to be encoded in the
         * 'standard' location (e.g. CQL filter parameter) of any request.
         *
         * @param {Object} f The filter object to check.
         * @return {boolean} Whether the filter shall be encoded at the standard
         *     location of any request.
         */
        isStandardLocationFilter: function(f) {
            var staticMe = Koala.util.Layer;
            return !staticMe.isViewParamFilter(f);
        },

        /**
         * Checks the passed metadata and adjusts it according to the special
         * 'STYLES' value-filter defined by BfS.
         *
         * Will return a possibly altered metadata object, where the STYLES of
         * the OpenLayers layer will contain the value of the special styles
         * filter.
         *
         * @param {Object} The metadata object of the GNOS containing filters.
         * @return {Object} The possibly altered metadata object.
         */
        handleSpecialStylesViewParamFilter: function(metadata) {
            var staticMe = Koala.util.Layer;
            var filters = Ext.Array.clone(metadata.filters);
            var stylesFilter;
            Ext.each(filters, function(filter) {
                if (staticMe.isSpecialStylesValueFilter(filter)) {
                    stylesFilter = filter;
                }
            });

            if (stylesFilter) {
                // move it to the layerConfig…
                metadata.layerConfig.olProperties.param_STYLES = stylesFilter.effectivevalue;
            }

            return metadata;
        },

        /**
         * Checks the passed metadata and adjusts it according to the special
         * 'test_data' value-filter defined by BfS.
         *
         * Will return a possibly altered metadata object, where the
         * `legendTitle` is prefixed with a String indicating that the layer
         * contains test data.
         *
         * @param {Object} The metadata object of the GNOS containing filters.
         * @return {Object} The possibly altered metadata object.
         */
        handleSpecialTestDataViewParamFilter: function(metadata) {
            var staticMe = Koala.util.Layer;
            var filters = Ext.Array.clone(metadata.filters);
            var testDataFilter;
            Ext.each(filters, function(filter) {
                if (staticMe.isSpecialTestDataValueFilter(filter)) {
                    testDataFilter = filter;
                }
            });

            if (testDataFilter) {
                // adjust the legend title
                metadata.legendTitle = '#TESTDATA# ' + metadata.legendTitle;
            }

            return metadata;
        },

        /**
         *
         */
        adjustMetadataAccordingToFilters: function(metadata) {
            var staticMe = Koala.util.Layer;
            var filters = staticMe.getFiltersFromMetadata(metadata);

            if (!filters) {
                return metadata;
            }

            metadata = staticMe.applyDefaultsIfNotChangedByUser(metadata, filters);

            // TODO Rethink this handling, special wish by SB to get this in
            //      fast; building upon the handling of 'test_data' by BfS
            metadata = staticMe.handleSpecialStylesViewParamFilter(metadata);
            metadata = staticMe.handleSpecialTestDataViewParamFilter(metadata);

            // get them again, they may have changed…
            filters = staticMe.getFiltersFromMetadata(metadata);

            metadata = staticMe.moveFiltersToViewparams(metadata, filters);

            if (filters.length !== 0) {
                // The filters should not be encoded in the viewparams, but as
                // WMS-T and friends
                metadata = staticMe.adjustMetadataFiltersToStandardLocations(
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
            var staticMe = Koala.util.Layer;
            var adjustedFilters = [];
            Ext.each(filters, function(filter) {
                var filterType = (filter.type || '').toLowerCase();
                var adjFilter;
                switch (filterType) {
                    case 'timerange':
                        adjFilter = staticMe.applyDefaultsTimerangeFilter(filter);
                        break;
                    case 'rodostime':
                        adjFilter = staticMe.applyDefaultsRodosTimeFilter(filter);
                        break;
                    case 'pointintime':
                        adjFilter = staticMe.applyDefaultsPointInTimeFilter(filter);
                        break;
                    case 'value':
                        adjFilter = staticMe.applyDefaultsValueFilter(filter);
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
        applyDefaultsTimerangeFilter: function(filter) {
            if (!moment.isMoment(filter.effectivemindatetime)) {
                if (filter.defaultstarttimeinstant) {
                    try {
                        filter.effectivemindatetime = Koala.util.Date
                            .getUtcMoment(filter.defaultstarttimeinstant);
                    } catch (e) {
                        Ext.log.error('Could not set default timerange filter');
                    }
                } else {
                    Ext.log.warn('No defined start value for timerange filter' +
                        ' and no configured default start value for timerange' +
                        ' filter');
                }
            }
            if (!moment.isMoment(filter.effectivemaxdatetime)) {
                if (filter.defaultendtimeinstant) {
                    try {
                        filter.effectivemaxdatetime = Koala.util.Date
                            .getUtcMoment(filter.defaultendtimeinstant);
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

        applyDefaultsRodosTimeFilter: function(filter) {
            if (!moment.isMoment(filter.effectivedatetime)) {
                if (filter.defaultValue) {
                    try {
                        filter.effectivedatetime = Koala.util.Date
                            .getUtcMoment(filter.defaultValue);
                    } catch (e) {
                        Ext.log.error(
                            'Could not set default rodos time filter'
                        );
                    }
                } else {
                    Ext.log.warn('No defined rodos time filter and no ' +
                        'configured default rodos time filter');
                }
            }
            return filter;
        },

        applyDefaultsPointInTimeFilter: function(filter) {
            if (!moment.isMoment(filter.effectivedatetime)) {
                if (filter.defaulttimeinstant) {
                    try {
                        filter.effectivedatetime = Koala.util.Date
                            .getUtcMoment(filter.defaulttimeinstant);
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

        applyDefaultsValueFilter: function(filter) {
            if (!filter.effectivevalue) {
                filter.effectivevalue = filter.defaultValue;
            }
            return filter;
        },

        adjustMetadataFiltersToStandardLocations: function(metadata, filters) {
            var staticMe = Koala.util.Layer;
            Ext.each(filters, function(filter) {
                if (!filter || !staticMe.isStandardLocationFilter(filter)) {
                    // any non-standard, e.g. viewparam filters, are ignored.
                    return;
                }
                var filterType = (filter.type || '').toLowerCase();
                switch (filterType) {
                    case 'timerange':
                        metadata = staticMe.configureMetadataWithTimerange(metadata, filter);
                        break;
                    case 'pointintime':
                    case 'rodostime':
                        metadata = staticMe.configureMetadataWithPointInTime(metadata, filter);
                        break;
                    case 'value':
                        metadata = staticMe.configureMetadataWithValue(metadata, filter);
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
            var start = filter.effectivemindatetime;
            var end = filter.effectivemaxdatetime;
            var val = start.toISOString() + '/' + end.toISOString();
            olProps[wmstKey] = val;
            metadata.layerConfig.olProperties = olProps;
            return metadata;
        },

        configureMetadataWithPointInTime: function(metadata, filter) {
            // Point in time filter is an additional param TIME=effectivedatetime
            var olProps = metadata.layerConfig.olProperties;
            var wmstKey = 'param_TIME';
            if (wmstKey in olProps) {
                Ext.log.warn('Multiple time filters configured, ' +
                    'only the last will win');
            }
            var dateValue = filter.effectivedatetime;
            olProps[wmstKey] = dateValue.toISOString();
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
        stringifyValueFilter: function(filter, displayFriendly) {
            var LayerUtil = Koala.util.Layer;
            if (!Ext.isDefined(displayFriendly)) {
                displayFriendly = false;
            }

            // catch the cases where somebody submitted a (NOT) IN with
            // only one value in the array for displaying, we then simply
            // call ourself again with the only value or undefined as
            // non-array
            if (displayFriendly &&
                Ext.isArray(filter.effectivevalue) &&
                filter.effectivevalue.length < 2) {
                var clone = Ext.clone(filter);
                clone.effectivevalue = filter.effectivevalue[0];
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
            if (paramKey === keyFriendly && Ext.isEmpty(filter[keyFriendly])) {
                paramKey = keyCql;
            }
            var op = (filter.operator || '').toUpperCase();
            var adjusted = false;
            var stringified;

            if (!Ext.isArray(filter.effectivevalue)) {
                if (op === '!=' || op === 'NEQ' || op === 'NOT IN') {
                    op = '<>';
                    adjusted = true;
                } else if (op === '==' || op === 'EQ' || op === 'IN') {
                    op = '=';
                    adjusted = true;
                }
                var value = filter.effectivevalue;
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
                    op = 'IN';
                    adjusted = true;
                } else if (op === '!=' || op === '<>' || op === 'NEQ') {
                    op = 'NOT IN';
                    adjusted = true;
                }

                var valuesPart = '(' + filter.effectivevalue.join(',') + ')';

                // in case of userfriendly display, we need to adjust again, now
                // taking the current language into account, both for operation
                // and the value part
                if (displayFriendly) {
                    valuesPart = LayerUtil.getDisplayFriendlyValuesPart(
                        op, filter.effectivevalue, filter.allowedValues
                    );
                    op = LayerUtil.getDisplayFriendlyOperation(op);
                }

                stringified = filter[paramKey] + // name
                    ' ' + op + ' ' + // NOT IN
                    valuesPart; // ('kalle', 'jupp')
            }
            if (adjusted) {
                Ext.log.info('Filter operator has been adjusted from ' +
                    '\'' + filter.operator + '\' to \'' + op + '\'');
            }
            return stringified;
        },

        getDisplayFriendlyValue: function(rawValue, allowedValues) {
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

        valsToDisplayVals: function(vals, allowedVals) {
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
            var joined = '';
            for (; i < len - 2; i++) {
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
                    break;
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
            var trimmedParam = Ext.String.trim(filter.param);
            var effectiveDateTime = filter.effectivedatetime;
            var formattedTime = effectiveDateTime.toISOString();
            var cql = trimmedParam + '=' + formattedTime;
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
            var trimmedParam = Ext.String.trim(filter.param);
            var params = trimmedParam.split(',');
            var startParam = params[0];
            var endParam = params[1] || params[0];
            var effectiveMinDateTime = filter.effectivemindatetime;
            var effectiveMaxDateTime = filter.effectivemaxdatetime;
            var formattedStart = effectiveMinDateTime.toISOString();
            var formattedEnd = effectiveMaxDateTime.toISOString();
            var cql = '';

            if (startParam === endParam) {
                // We'll often be filtering on actually one attribute.
                // we then want to have the standard GeoServer functionality:
                // http://docs.geoserver.org/stable/en/user/filter/ecql_reference.html#temporal-predicate
                cql += startParam;
                cql += ' DURING ';
                cql += formattedStart + '/' + formattedEnd;
            } else {
                // This will not often be the case, but we need to make sure to
                // support it. If different attributes have the start/end values
                // we make a AND connected less than /greater than filter.
                cql += '(';
                cql += startParam + '>' + formattedStart;
                cql += ' AND ';
                cql += endParam + '<' + formattedEnd;
                cql += ')';
            }
            return cql;
        },

        /**
         */
        configureMetadataWithValue: function(metadata, filter) {
            // VALUE becomes a CQL filter
            var staticMe = Koala.util.Layer;
            var olProps = metadata.layerConfig.olProperties;
            var cqlKey = 'param_cql_filter';
            var stringified = staticMe.stringifyValueFilter(filter);
            if (cqlKey in olProps) {
                Ext.log.info('Overwriting existing CQL Filter in URL.' +
                    ' Is this intentional? If you changed a filter, the' +
                    ' answer is likely yes, else it might lead to ' +
                    ' misbehaviour of this layer.');
                Ext.log.info('Existing value is ' + olProps[cqlKey]);
                Ext.log.info('New value is ' + stringified);
            }
            olProps[cqlKey] = stringified;

            metadata.layerConfig.olProperties = olProps;
            return metadata;
        },

        moveFiltersToViewparams: function(metadata, filters) {
            var staticMe = Koala.util.Layer;
            var keyVals = {};
            Ext.each(filters, function(filter) {
                // Only consider viewparam filters here
                var isViewParam = filter && staticMe.isViewParamFilter(filter);
                // do not handle STYLES filter, this is done elsewhere
                var isSpecialStyles = filter && staticMe.isSpecialStylesValueFilter(filter);

                if (isViewParam && !isSpecialStyles) {
                    var params = filter.param.split(',');
                    var type = filter.type;

                    // we need to check the metadata for default filters to apply
                    switch (type) {
                        case 'timerange':
                            var rawDateMin = filter.effectivemindatetime;
                            keyVals[params[0]] = rawDateMin.toISOString();
                            var rawDateMax = filter.effectivemaxdatetime;
                            if (!params[1]) {
                                keyVals[params[0]] += '/' + rawDateMax.toISOString();
                            } else {
                                keyVals[params[1]] = rawDateMax.toISOString();
                            }
                            break;
                        case 'pointintime':
                        case 'rodostime':
                            var rawDate = filter.effectivedatetime;
                            keyVals[params[0]] = rawDate.toISOString();
                            break;
                        case 'value':
                            keyVals[params[0]] = filter.effectivevalue;
                            break;
                        default:
                            Ext.log.warn('Unexpected filter type ' + type
                                + ' specified');
                    }
                }
            });

            var existingViewParams = decodeURIComponent(
                Koala.util.Object.getPathStrOr(
                    metadata, 'layerConfig/olProperties/param_viewparams', '')
            );
            if (!Ext.String.endsWith(existingViewParams, ';') &&
                existingViewParams) {
                existingViewParams += ';';
            }

            Ext.iterate(keyVals, function(key, value) {
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
        getDownloadUrlWithFilter: function(layer) {
            var staticMe = Koala.util.Layer;
            var baseUrl = layer.get('downloadUrl');
            var url = baseUrl;
            var metadata = layer.metadata;
            var filters = staticMe.getFiltersFromMetadata(metadata);
            if (!filters) {
                return url;
            }
            var cql = staticMe.filtersToCql(filters);
            if (Ext.String.trim(cql) !== '') {
                var param = 'CQL_FILTER=' + encodeURIComponent(cql);
                // TODO check if we already have a CQL_FILTER in layer or base-url?!?
                url = Ext.String.urlAppend(url, param);
            }
            var existingViewParams = Koala.util.Object.getPathStrOr(
                metadata,
                'layerConfig/olProperties/param_viewparams',
                null
            );
            if (existingViewParams !== null) {
                var viewParams = 'VIEWPARAMS=' + existingViewParams;
                url = Ext.String.urlAppend(url, viewParams);
            }
            return url;
        },

        filtersToCql: function(filters) {
            var staticMe = Koala.util.Layer;
            if (!filters || filters.length < 1) {
                return '';
            }
            var cqlParts = [];
            Ext.each(filters, function(filter) {
                if (!staticMe.isViewParamFilter(filter)) {
                    cqlParts.push('(' + staticMe.filterToCql(filter) + ')');
                }
            });
            return cqlParts.join(' AND ');
        },

        filterToCql: function(filter) {
            var staticMe = Koala.util.Layer;
            var type = filter.type;
            var cql = '';
            switch (type) {
                case 'value':
                    cql = staticMe.stringifyValueFilter(filter);
                    break;
                case 'pointintime':
                case 'rodostime':
                    cql = staticMe.stringifyPointInTimeFilter(filter);
                    break;
                case 'timerange':
                    cql = staticMe.stringifyTimeRangeFilter(filter);
                    break;
                default:
                    Ext.log.warn('Unexpected filter type ' + type
                        + ' specified');
                    break;
            }
            return cql;
        },

        /**
         * Returns a flattened array of all layers in the passed structure (may
         * be hierarchical with children under the key `children`). This utility
         * ensures that layers sets (also possibly with a deep hierarchy) can be
         * added in the expected order, even though we have to query in an
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
            var staticMe = Koala.util.Layer;
            var flatList = [];

            Ext.each(layers, function(layer) {
                if (layer) {
                    if (!layer.leaf) {
                        var flatChildren = staticMe.getOrderedFlatLayers(
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
