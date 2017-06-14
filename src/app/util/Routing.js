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
 * @class Koala.util.Routing
 */
Ext.define('Koala.util.Routing', {

    requires: [
        'Ext.util.DelayedTask',
        'Koala.util.Layer',
        'Ext.util.DelayedTask',
        'BasiGX.util.Map',
        'BasiGX.util.Layer'
    ],

    statics: {
        /* begin i18n */
        illegalFilter: '',
        unknownFilter: '',
        /* end i18n */

        /**
         * A look-up object that will be filled in #beforeLayerTreeRoute so that
         * the actual #onLayerTreeRoute can do its work. Consist of uuids as keys
         * and actual OpenLayers layers as values.
         *
         * @private
         */
        routeCreatedLayers: null,

        /**
         * Stores the permalinkFilters of the permalink after parsing it.
         *
         * @private
         */
        permalinkFilters: {},

        /**
         * Handles an unmachted routing hashstring;
         * @param  {String} hash The hashstring.
         */
        onUnmatchedRoute: function(hash) {
            Ext.log.info('Unmatched route: ', hash);
        },

        /**
         * Listens to the 'map/:lon/:lat/:zoom' route and sets the map to the
         * specified values.
         * @param {Integer} lon Longituted of the mapView center.
         * @param {Integer} lat Latitued of the mapView center.
         * @param {Integer} zoom Zoom of the mapView.
         */
        onMapRoute: function(lon, lat, zoom) {
            var view = Koala.app.getMainView();
            var map = view.down('basigx-component-map').getMap();
            var mapView = map.getView();

            mapView.setCenter([parseInt(lon, 10), parseInt(lat, 10)]);
            mapView.setZoom(zoom);
        },

        /**
         * Reads the projectUid from the url and calls
         * #Koala.util.Rodos.requestLayersOfProject to prepare the tree.
         */
        onRodosProjectRoute: function(projectUuid) {
            Koala.util.Rodos.requestLayersOfProject(projectUuid);
        },

        /**
         * Called before the actual #onLayerTreeRoute handlers layer adding to the
         * map, this method ensures that the correct openlayers objects are build
         * asynchronously via their UUID. Created layers are saved in the private
         * property #routeCreatedLayers, and the routing action is only then
         * resumed when all layers have been build.
         *
         * @param {String} layers The has part that triggered the route and
         *     that looks like 'uuid:state,otheruuid:otherstate'
         * @param {Object} action A routing action element
         * @private
         */
        beforeLayerTreeRoute: function(layers, action) {
            var me = Koala.util.Routing;
            var LayerUtil = Koala.util.Layer;
            var expectedLayers = 0;
            var gotLayers = 0;
            var routeCreatedLayers = {};

            if (Ext.isEmpty(layers)) {
                return false;
            }

            var permaObj = JSON.parse(decodeURIComponent(layers));

            Ext.iterate(permaObj, function(uuid, config) {
                if (Koala.util.String.isUuid(uuid)) {
                    expectedLayers++;
                    LayerUtil.getMetadataFromUuid(uuid)
                    .then(me.checkForRodosFilters)
                    .then(function(md) {
                        gotLayers++;
                        var metadataClone = Ext.clone(md);
                        me.applyPermalinkFiltersToMetadata(uuid, md, config.filters);

                        var olLayer = LayerUtil.layerFromMetadata(md);

                        LayerUtil.setOriginalMetadata(olLayer, metadataClone);
                        routeCreatedLayers[uuid] = olLayer;

                        if (gotLayers === expectedLayers) {
                            me.routeCreatedLayers = routeCreatedLayers;
                            action.resume();
                        }
                    });
                } else {
                    Ext.log.info('Skipping route part ', uuid);
                }
            });
        },

        /**
         * Applies the filters stored in me.permalinkFilters to the metadata of a
         * layer. parseFiltersFromPermalink should be executed before.
         * @param {String} uuid The metadataidentifier of the layer to apply the
         *                      filters to.
         * @param {Array} metadataFilters An array of objects representing a
         *                                metadataFilter.
         * @param {Object} configFilters The filters from the permalink
         * @private
         */
        applyPermalinkFiltersToMetadata: function(uuid, metadata, configFilters) {
            var me = Koala.util.Routing;
            var metadataFilters = metadata.filters;
            Ext.each(metadataFilters, function(mdFilter) {
                var permalinkFilter = Ext.Array.findBy(configFilters, function(filter) {
                    var isRodosTime = filter.type === 'rodostime';
                    var isPointInTime = filter.type === 'pointintime';
                    var isTimeRange = filter.type === 'timerange';
                    var sameType = mdFilter.type === filter.type;
                    var sameAlias = mdFilter.alias === filter.alias;

                    if (sameType) {
                        if (isPointInTime || isTimeRange || sameAlias || isRodosTime) {
                            return true;
                        }
                        return false;
                    }
                    return false;
                });

                var minDate;
                var maxDate;
                if (permalinkFilter) {
                    switch (mdFilter.type) {
                        case 'rodostime':
                            var isAllowed = false;
                            var effectiveRodosTime = Koala.util.Date.getUtcMoment(
                                permalinkFilter.effectivedatetime, 'x');
                            Ext.each(mdFilter.allowedValues, function(allowedValue) {
                                if (effectiveRodosTime.isSame(allowedValue.val)) {
                                    isAllowed = true;
                                    return false;
                                }
                            });
                            if (isAllowed) {
                                permalinkFilter.effectivedatetime = effectiveRodosTime;
                                Ext.apply(mdFilter, permalinkFilter);
                            } else {
                                Ext.toast(Ext.String.format(me.illegalFilter, mdFilter.type));
                            }
                            break;
                        case 'pointintime':
                            maxDate = Koala.util.Date.getUtcMoment(
                                mdFilter.maxdatetimeinstant);
                            minDate = Koala.util.Date.getUtcMoment(
                                mdFilter.mindatetimeinstant);
                            var effectiveDateTime = Koala.util.Date.getUtcMoment(
                                permalinkFilter.effectivedatetime, 'x');
                            // '[]': Include both min and max value.
                            if (effectiveDateTime.isBetween(minDate, maxDate, null, '[]')) {
                                permalinkFilter.effectivedatetime = effectiveDateTime;
                                Ext.apply(mdFilter, permalinkFilter);
                            } else {
                                Ext.toast(Ext.String.format(me.illegalFilter, mdFilter.type));
                            }
                            break;
                        case 'timerange':
                            maxDate = Koala.util.Date.getUtcMoment(
                                mdFilter.maxdatetimeinstant);
                            minDate = Koala.util.Date.getUtcMoment(
                                mdFilter.mindatetimeinstant);
                            var effectiveMinDateTime = Koala.util.Date.getUtcMoment(
                                permalinkFilter.effectivemindatetime, 'x');
                            var effectiveMaxDateTime = Koala.util.Date.getUtcMoment(
                                permalinkFilter.effectivemaxdatetime, 'x');
                            if (effectiveMinDateTime.isBetween(minDate, maxDate, null, '[]') &&
                                    effectiveMaxDateTime.isBetween(minDate, maxDate, null, '[]')) {
                                permalinkFilter.effectivemindatetime =
                                    effectiveMinDateTime;
                                permalinkFilter.effectivemaxdatetime =
                                    effectiveMaxDateTime;
                                Ext.apply(mdFilter, permalinkFilter);
                            } else {
                                Ext.toast(Ext.String.format(me.illegalFilter, mdFilter.type));
                            }
                            break;
                        case 'value':
                            var allowedStore = Koala.util.Filter.getStoreFromAllowedValues(mdFilter.allowedValues);
                            var containsIllegal = false;

                            Ext.each(permalinkFilter.effectivevalue, function(value) {
                                var matchingRecord = allowedStore.findRecord('val', value);
                                if (!matchingRecord) {
                                    containsIllegal = true;
                                }
                            });

                            if (!containsIllegal) {
                                Ext.apply(mdFilter, permalinkFilter);
                            } else {
                                Ext.toast(Ext.String.format(me.illegalFilter, mdFilter.type));
                            }
                            break;
                        default:
                            Ext.toast(me.unknownFilter);
                            break;
                    }
                }
            });
        },

        /**
         * Checks for evntual rodos filters for the relevant layer. Applies them
         * and
         *
         * @param {object} metadata The metadata json object.
         * @returns {Ext.Promise} An Ext.Promise. The resolve function receives
         *                        the metadata as an object.
         */
        checkForRodosFilters: function(metadata) {
            var me = Koala.util.Routing;
            var rodosProperty = Koala.util.Object.getPathStrOr(metadata,
                'layerConfig/olProperties/rodosLayer', false);
            var isRodosLayer = Koala.util.String.coerce(rodosProperty);
            var appContext = Koala.util.AppContext.getAppContext();
            var baseUrl = Koala.util.Object.getPathStrOr(appContext,
                'data/merge/urls/rodos-results');
            var routeObj = me.parseCurrentHash();
            var rodosProjectUuid = routeObj.rodosproject;

            if (isRodosLayer && baseUrl && rodosProjectUuid) {
                var defaultHeaders;
                var authHeader = Koala.util.Authentication.getAuthenticationHeader();
                if (authHeader) {
                    defaultHeaders = {
                        Authorization: authHeader
                    };
                }

                return new Ext.Promise(function(resolve, reject) {
                    Ext.Ajax.request({
                        url: baseUrl + rodosProjectUuid,
                        defaultHeaders: defaultHeaders,
                        method: 'GET',
                        success: function(response) {
                            var responseObj = Ext.decode(response.responseText);
                            var layerCfgs = responseObj.rodos_results.layers;
                            var layerCfg = Ext.Array.findBy(layerCfgs, function(cfg) {
                                return cfg.gnos_uid === metadata.id;
                            });

                            if (layerCfg) {
                                // NOTE The merge seems not to work correctly. So
                                // use this with causion.
                                metadata.filters = Ext.Array.merge(metadata.filters,
                                    layerCfg.filters);
                            }
                            resolve(metadata);
                        },
                        failure: function(response) {
                            reject(response.status);
                        }
                    });
                });
            } else {
                return new Ext.Promise(function(resolve) {
                    resolve(metadata);
                });
            }
        },

        /**
         * Called as handler for routes matching 'layers/:layers', but only if the
         * before handler #beforeLayerTreeRoute was able to create all required
         * layers and store them in #routeCreatedLayers.
         *
         * @param {String} layersString The has part that triggered the route and
         *     that looks like 'uuid:state,otheruuid:otherstate'
         * @private
         */
        onLayerTreeRoute: function(layersString) {
            var me = Koala.util.Routing;
            var permaObj = JSON.parse(decodeURIComponent(layersString));

            Ext.iterate(permaObj, function(uuid, config) {
                var booleanState = config.isVisible;
                var olLayer = me.routeCreatedLayers[uuid];
                if (Koala.util.String.isUuid(uuid) && Ext.isDefined(olLayer)) {
                    olLayer.set('visible', booleanState);
                    Koala.util.Layer.addOlLayerToMap(olLayer);
                }
            });
            me.routeCreatedLayers = null;
        },

        /**
         * Updates the current permalink.
         * @param {String} route A route expression representing the application
         *                       state.
         * @param {Ext.Base} view An ext view class.
         * @param {integer} delay [optional] Milliseconds to delay the redirect.
         */
        setRouteForView: function(view, delay, skipLayers) {
            var me = Koala.util.Routing;
            var viewController = view.getController() || view.lookupController();
            var route = me.getRoute(skipLayers);

            if (Ext.isNumber(delay)) {
                new Ext.util.DelayedTask(function() {
                    viewController.redirectTo(route);
                }).delay(delay);
            } else {
                viewController.redirectTo(route);
            }
        },

        /**
         * Parses the current routing hash and returns a object representation.
         * @return {Object} An object representation of the current hash.
         */
        parseCurrentHash: function() {
            var hash = window.location.hash.replace('#', '');
            var hashParts = hash.split('|');
            var routeObj = {};
            Ext.each(hashParts, function(part) {
                var partParts = part.split('/');
                partParts = Ext.Array.map(partParts, function(value, index) {
                    if (index > 0) {
                        var uriComponent = decodeURIComponent(value);
                        return Ext.decode(uriComponent, true) || uriComponent;
                    } else {
                        return value;
                    }
                });
                routeObj[partParts[0]] = Ext.Array.slice(partParts, 1);
                // Just one value for our route
                if (partParts.length === 2) {
                    routeObj[partParts[0]] = partParts[1];
                }
            });
            return routeObj;
        },

        /**
         * Creates the route (hash) for the current map state. Including
         * mapcenter, mapzoom and layers with all their filters.
         * @return {String} A route expression representing the applications
         *                  state.
         */
        getRoute: function(skipLayers) {
            var me = Koala.util.Routing;
            var mapComponent = BasiGX.util.Map.getMapComponent('gx_map');
            var map = mapComponent.getMap();
            var zoom = map.getView().getZoom();
            var lon = map.getView().getCenter()[0];
            var lat = map.getView().getCenter()[1];
            var allLayers = BasiGX.util.Layer.getAllLayers(map);
            var appContext = Koala.util.AppContext.getAppContext(mapComponent);
            var mapLayers = [];
            if (appContext && appContext.data && appContext.data.merge) {
                mapLayers = appContext.data.merge.mapLayers;
            }

            var filteredLayers = Ext.Array.filter(allLayers, function(layer) {
                // Skip system layers like hoverLayer etc.
                if (!layer.metadata) {
                    return false;
                }

                // Skip baselayers configured in appContext
                if (Ext.Array.contains(mapLayers, layer.metadata.id)) {
                    return false;
                }

                return true;
            });

            if (!skipLayers) {
                var layersString = '';
                var permaObj = {};

                Ext.each(filteredLayers, function(layer) {
                    var metadata = layer.metadata;
                    var uuid = metadata.id;
                    var isVisible = layer.get('visible') ? 1 : 0;
                    var filters = [];

                    permaObj[uuid] = {};
                    permaObj[uuid].isVisible = isVisible;

                    Ext.each(metadata.filters, function(filter) {
                        if (filter) {
                            filters.push(me.filterToPermaObj(filter));
                        }
                    });

                    permaObj[uuid].filters = filters;
                });

                if (!Ext.Object.isEmpty(permaObj)) {
                    layersString += JSON.stringify(permaObj);
                    layersString = encodeURIComponent(layersString);
                    layersString = 'layers/' + layersString;
                }
            }

            var mapString = Ext.String.format('map/{0}/{1}/{2}',
                    Math.round(lon),
                    Math.round(lat),
                    zoom
                );

            var treeQueryString = Ext.isModern ?
                'k-panel-treepanel > treelist' :
                'k-panel-themetree';
            var treePanel = Ext.ComponentQuery.query(treeQueryString)[0];
            var treePanelViewModel = treePanel.getViewModel();
            var rodosProjectUuid = treePanelViewModel.get('selectedRodosProject');

            if (rodosProjectUuid) {
                var rodosProjectString = 'rodosproject/' + rodosProjectUuid;
            }

            var hash = Ext.String.format('{0}|{1}|{2}',
                mapString,
                layersString,
                rodosProjectString);

            return hash;
        },

        /**
         * Transforms the real layerfilters to smaller permalinkObjects.
         * @param {Object} filter The filterobject from the layer metadata.
         * @return {Object} The returned object contains just the needed values.
         */
        filterToPermaObj: function(filter) {
            var permaObj = {
                type: filter.type
            };

            switch (filter.type) {
                // valueOf() returns the timestamp value of the moment date.
                case 'rodostime':
                    permaObj.effectivedatetime = filter.effectivedatetime
                        .valueOf();
                    break;
                case 'pointintime':
                    permaObj.effectivedatetime = filter.effectivedatetime
                        .valueOf();
                    break;
                case 'timerange':
                    permaObj.effectivemindatetime = filter.effectivemindatetime
                        .valueOf();
                    permaObj.effectivemaxdatetime = filter.effectivemaxdatetime
                        .valueOf();
                    break;
                case 'value':
                    permaObj.effectivevalue = filter.effectivevalue;
                    permaObj.alias = filter.alias;
                    permaObj.param = filter.param;
                    break;
                default:
            }
            return permaObj;
        }
    }

});
