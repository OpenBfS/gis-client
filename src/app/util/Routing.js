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
        beforeLayerTreeRoute: function(layers, action){
            var me = Koala.util.Routing;
            var layerUuidsWithStates = layers.split(",");
            var expectedLayers = 0;
            var gotLayers = 0;
            var routeCreatedLayers = {};
            var LayerUtil = Koala.util.Layer;

            if (Ext.isEmpty(layerUuidsWithStates[0])) {
                return;
            }

            Ext.each(layerUuidsWithStates, function(uuidWithState) {
                var uuid = uuidWithState.split("_")[0];
                var filtersString = uuidWithState.split("_")[2];

                if (Koala.util.String.isUuid(uuid)) {
                    expectedLayers++;
                    me.parseFiltersFromPermalink(uuid, filtersString);
                    LayerUtil.getMetadataFromUuidAndThen(uuid, function(md){
                        gotLayers++;
                        var metadataClone = Ext.clone(md);

                        me.applyPermalinkFiltersToMetadata(uuid, md.filters);

                        var olLayer = LayerUtil.layerFromMetadata(md);
                        LayerUtil.setOriginalMetadata(olLayer, metadataClone);
                        routeCreatedLayers[uuid] = olLayer;
                        if (gotLayers === expectedLayers) {
                            me.routeCreatedLayers = routeCreatedLayers;
                            action.resume();
                        }
                    });
                } else {
                    Ext.log.info('Skipping route part ', uuidWithState);
                }
            });
        },

        /**
         * Parses the String representation of a filter an stores the filters in
         * me.permalinkFilters.
         *
         * @param {String} uuid The metadataidentifier comming from gnos.
         * @param {String} filtersString The string representation of filtersString.
         *     pointintime: "pt{t[timestamp]}"
         *     e.g.: Wed Jan 18 2017 15:10:14 GMT+0100 (CET)
         *         "pt{t1484748614084}"
         *
         *     timerange: "tr{s[starttimestamp]e[endtimestamp]}"
         *     e.g. From Mon Jun 01 2015 02:00:00 GMT+0200 (CEST)
         *          Till Tue Jun 30 2015 02:00:00 GMT+0200 (CEST):
         *         "tr{s1433116800000e1435622400000}"
         *
         *     attribute: "at{[filteralias]=[value]}"
         *     e.g.: Messnetz = KFÜ
         *          "at{Messnetz='triangle'}"
         *
         *     style: "st{[stylename]}"
         *     e.g.: Style should be 'blue-point'
         *          "st{point}"
         * @private
         */
        parseFiltersFromPermalink: function(uuid, filtersString){
            var me = Koala.util.Routing;
            if (filtersString) {
                me.permalinkFilters[uuid] = {};

                var filtersArray = filtersString.split(";");
                Ext.each(filtersArray, function(filter){
                    var filterParts = filter.split('{');
                    var prefix = filterParts[0];
                    var filterValues = filterParts[1].replace('}', '');

                    switch (prefix) {
                        case 'pt':
                            var t = parseInt(filterValues.split('t')[1], 10);
                            if (Ext.isNumber(t)) {
                                me.permalinkFilters[uuid].pointintime = {
                                    effectivedatetime: new Date(t)
                                };
                            }
                        break;
                        case 'tr':
                            var s = parseInt(filterValues.split('s')[1], 10);
                            var e = parseInt(filterValues.split('e')[1], 10);
                            if (Ext.isNumber(s) && Ext.isNumber(s)) {
                                me.permalinkFilters[uuid].timerange = {
                                    effectivemindatetime: new Date(s),
                                    effectivemaxdatetime: new Date(e)
                                };
                            }
                        break;
                        case 'at':
                            //TODO Check for special 'test_data'
                            var alias = filterValues.split("=")[0];
                            var val = filterValues.split("=")[1];
                            me.permalinkFilters[uuid].value = {
                                alias: alias,
                                effectivevalue: val
                            };
                        break;
                        case 'st':
                            me.permalinkFilters[uuid].Stil = {
                                alias: 'Stil',
                                effectivevalue: filterValues
                            };
                        break;
                        default:
                            Ext.log.warn('Could not parase filter from permalink ' +
                                filter);
                        break;
                    }
                });
            }
        },

        /**
         * Applies the filters stored in me.permalinkFilters to the metadata of a
         * layer. parseFiltersFromPermalink should be executed before.
         * @param {String} uuid The metadataidentifier of the layer to apply the
         *                      filters to.
         * @param {Array} metadataFilters An array of objects representing a
         *                                metadataFilter.
         * @private
         */
        applyPermalinkFiltersToMetadata: function(uuid, metadataFilters) {
            var me = Koala.util.Routing;
            Ext.each(metadataFilters, function(mdFilter) {
                if(!me.permalinkFilters[uuid]){
                    return false;
                }

                var permalinkFilter = me.permalinkFilters[uuid][mdFilter.alias] || me.permalinkFilters[uuid][mdFilter.type];
                var minDate;
                var maxDate;
                if(permalinkFilter){
                    if (mdFilter.type === "pointintime") {
                        maxDate = Ext.Date.parse(mdFilter.maxdatetimeinstant, mdFilter.maxdatetimeformat);
                        minDate = Ext.Date.parse(mdFilter.mindatetimeinstant, mdFilter.mindatetimeformat);
                        if(minDate <= permalinkFilter.effectivedatetime && maxDate >= permalinkFilter.effectivedatetime){
                            Ext.apply(mdFilter, permalinkFilter);
                        } else {
                            Ext.toast('Permalink contains illegal pointintime filter');
                        }
                    }
                    if (mdFilter.type === "timerange") {
                        maxDate = Ext.Date.parse(mdFilter.maxdatetimeinstant, mdFilter.maxdatetimeformat);
                        minDate = Ext.Date.parse(mdFilter.mindatetimeinstant, mdFilter.mindatetimeformat);
                        if(minDate <= permalinkFilter.effectivemindatetime && maxDate >= permalinkFilter.effectivemindatetime &&
                            minDate <= permalinkFilter.effectivemaxdatetime && maxDate >= permalinkFilter.effectivemaxdatetime){
                            Ext.apply(mdFilter, permalinkFilter);
                        } else {
                            Ext.toast('Permalink contains illegal timerange filter');
                        }
                    }
                    if (mdFilter.type === "value") {
                        var allowedStore = Koala.util.Filter.getStoreFromAllowedValues(mdFilter.allowedValues);
                        var matchingRecord = allowedStore.findRecord('val', permalinkFilter.effectivevalue);
                        if(matchingRecord){
                            Ext.apply(mdFilter, permalinkFilter);
                        } else {
                            Ext.toast('Permalink contains illegal value filter');
                        }
                    }
                }
            });
        },

        /**
         * Called as handler for routes matching 'layers/:layers', but only if the
         * before handler #beforeLayerTreeRoute was able to create all required
         * layers and store them in #routeCreatedLayers. This method splits the
         * matched hash and adds the layers contained in the object in the correct
         * order.
         *
         * @param String layers The has part that triggered the route and
         *     that looks like 'uuid:state,otheruuid:otherstate'
         * @private
         */
        onLayerTreeRoute: function(layers){
            var me = Koala.util.Routing;
            var layerUuidsWithStates = layers.split(",");
            Ext.each(layerUuidsWithStates, function(uuidWithState) {
                var uuidWithStateParts = uuidWithState.split("_");
                var uuid = uuidWithStateParts[0];
                var state = uuidWithStateParts[1] || '1'; // default to visible

                var booleanState = state === '1';
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
                new Ext.util.DelayedTask(function(){
                    viewController.redirectTo(route);
                }).delay(delay);
            } else {
                viewController.redirectTo(route);
            }
        },

        /**
         * Creates the route (hash) for the current map state. Including
         * mapcenter, mapzoom and layers with all their filters.
         * @return {String} A route expression representing the applications
         *                  state.
         */
        getRoute: function(skipLayers){
            var me = Koala.util.Routing;
            var mapComponent = BasiGX.util.Map.getMapComponent('gx_map');
            var map = mapComponent.getMap();
            var zoom = map.getView().getZoom();
            var lon = map.getView().getCenter()[0];
            var lat = map.getView().getCenter()[1];
            var allLayers = BasiGX.util.Layer.getAllLayers(map);

            var filteredLayers = Ext.Array.filter(allLayers, function(layer){
                return !Ext.isEmpty(layer.metadata);
            });

            if(!skipLayers){
                var layersString = '';
                Ext.each(filteredLayers, function(layer, i, layers){
                    var metadata = layer.metadata;
                    var uuid = metadata.id;
                    var isVisible = layer.get('visible') ? 1 : 0;
                    var filtersString = '';

                    Ext.each(metadata.filters, function(filter, j, filters){
                        filtersString += me.filterToPermalinkString(filter);
                        if(j+1 < filters.length){
                            filtersString += ';';
                        }
                    });

                    layersString += Ext.String.format('{0}_{1}_{2}',
                    uuid,
                    isVisible,
                    filtersString);

                    if(i+1 < layers.length){
                        layersString += ',';
                    }
                });
            }

            var hash = Ext.String.format('map/{0}/{1}/{2}|layers/{3}',
                Math.round(lon),
                Math.round(lat),
                zoom,
                layersString);

            return hash;
        },

        /**
         * Transforms the values of a layer metadata filter to an permalink
         * expression.
         * @param {Object} filter A layer metadat filter object.
         * @return {String} The permalink expression.
         */
        filterToPermalinkString: function(filter) {
            var permalinkString;
            switch (filter.type) {
                case "pointintime":
                    var t = filter.effectivedatetime.getTime();
                    permalinkString = 'pt{t' + t + '}';
                    break;
                case "timerange":
                    var s = filter.effectivemindatetime.getTime();
                    var e = filter.effectivemaxdatetime.getTime();
                    permalinkString = 'tr{s' + s + 'e' + e + '}';
                    break;
                case "value":
                    var value = filter.effectivevalue;
                    var alias = filter.alias;
                    var param = filter.param;

                    if(alias === "Stil"){
                        permalinkString = 'st{' + value + '}';
                    } else if (param === "test_data") {
                        permalinkString = 'at{' + param + '=true}';
                    } else {
                        permalinkString = 'at{' + alias + '=' + value + '}';
                    }
                    break;
                default:
            }
            return permalinkString;
        },

        /**
         * Check if the route prefix is present in the window.location.hash
         * @param {String} route The route expression.
         * @return {Boolean} Is the route allready set.
         */
        isRouteSet: function(route) {
            var exp = new RegExp(route.split('/')[0] + '/', 'gi');
            return exp.test(window.location.hash);
        }
    }

});
