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
            var LayerUtil = Koala.util.Layer;
            var expectedLayers = 0;
            var gotLayers = 0;
            var routeCreatedLayers = {};
            var permaObj = JSON.parse(layers);

            Ext.iterate(permaObj, function(uuid, config) {
                if (Koala.util.String.isUuid(uuid)) {
                    expectedLayers++;
                    LayerUtil.getMetadataFromUuidAndThen(uuid, function(md){
                        gotLayers++;
                        var metadataClone = Ext.clone(md);
                        me.applyPermalinkFiltersToMetadata(uuid, md.filters, config.filters);

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
         * @private
         */
        applyPermalinkFiltersToMetadata: function(uuid, metadataFilters, configFilters) {
            Ext.each(metadataFilters, function(mdFilter) {
                var permalinkFilter = Ext.Array.findBy(configFilters, function(filter) {
                    var isPointInTime = filter.type === 'pointintime';
                    var isTimeRange = filter.type === 'timerange';
                    var sameType = mdFilter.type === filter.type;
                    var sameAlias = mdFilter.alias === filter.alias;

                    if(sameType) {
                        if(isPointInTime || isTimeRange || sameAlias){
                            return true;
                        }
                        return false;
                    }
                    return false;

                });

                var minDate;
                var maxDate;
                if(permalinkFilter){
                    if (mdFilter.type === "pointintime") {
                        maxDate = Ext.Date.parse(mdFilter.maxdatetimeinstant, mdFilter.maxdatetimeformat);
                        minDate = Ext.Date.parse(mdFilter.mindatetimeinstant, mdFilter.mindatetimeformat);
                        if(minDate <= permalinkFilter.effectivedatetime && maxDate >= permalinkFilter.effectivedatetime){
                            permalinkFilter.effectivedatetime = new Date(permalinkFilter.effectivedatetime);
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
                            permalinkFilter.effectivemindatetime = new Date(permalinkFilter.effectivemindatetime);
                            permalinkFilter.effectivemaxdatetime = new Date(permalinkFilter.effectivemaxdatetime);
                            Ext.apply(mdFilter, permalinkFilter);
                        } else {
                            Ext.toast('Permalink contains illegal timerange filter');
                        }
                    }
                    if (mdFilter.type === "value") {
                        var allowedStore = Koala.util.Filter.getStoreFromAllowedValues(mdFilter.allowedValues);
                        var containsIllegal = false;

                        Ext.each(permalinkFilter.effectivevalue, function(value){
                            var matchingRecord = allowedStore.findRecord('val', value);
                            if (!matchingRecord) {
                                containsIllegal = true;
                            }
                        });

                        if (!containsIllegal) {
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
         * @param {String} layersString The has part that triggered the route and
         *     that looks like 'uuid:state,otheruuid:otherstate'
         * @private
         */
        onLayerTreeRoute: function(layersString){
            var me = Koala.util.Routing;
            var permaObj = JSON.parse(layersString);

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
                var permaObj = {};

                Ext.each(filteredLayers, function(layer){
                    var metadata = layer.metadata;
                    var uuid = metadata.id;
                    var isVisible = layer.get('visible') ? 1 : 0;
                    var filters = [];

                    permaObj[uuid] = {};
                    permaObj[uuid].isVisible = isVisible;

                    Ext.each(metadata.filters, function(filter) {
                        if(filter){
                            filters.push(me.filterToPermaObj(filter));
                        }
                    });

                    permaObj[uuid].filters = filters;
                });

                layersString += JSON.stringify(permaObj);
            }

            var hash = Ext.String.format('map/{0}/{1}/{2}|layers/{3}',
                Math.round(lon),
                Math.round(lat),
                zoom,
                layersString);

            return hash;
        },

        /**
         * Transforms the real layerfilters to smaller permalinkObjects.
         * @param {Object} filter The filterobject from the layer metadata.
         * @return {Object} The returned object contains just the needed values.
         */
        filterToPermaObj: function(filter){
            var permaObj = {
                    type: filter.type
                };

            switch (filter.type) {
                case "pointintime":
                    permaObj.effectivedatetime = filter.effectivedatetime.getTime();
                    break;
                case "timerange":
                    permaObj.effectivemindatetime = filter.effectivemindatetime.getTime();
                    permaObj.effectivemaxdatetime = filter.effectivemaxdatetime.getTime();
                    break;
                case "value":
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
