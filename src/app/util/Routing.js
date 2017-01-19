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
        'Koala.util.Layer'
    ],

    statics: {
        getRoute: function(){
            var me = this;
            var mapComponent = BasiGX.util.Map.getMapComponent('gx_map');
            var map = mapComponent.getMap();
            var zoom = map.getView().getZoom();
            var lon = map.getView().getCenter()[0];
            var lat = map.getView().getCenter()[1];
            var allLayers = BasiGX.util.Layer.getAllLayers(map);

            var filteredLayers = Ext.Array.filter(allLayers, function(layer){
                return !Ext.isEmpty(layer.metadata);
            });

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

            var hash = Ext.String.format('map/{0}/{1}/{2}|layers/{3}',
                Math.round(lon),
                Math.round(lat),
                zoom,
                layersString);

            return hash;
        },

        filterToPermalinkString: function(filter) {
            var permalinkString;
            switch (filter.type) {
                case "pointintime":
                    var t = filter.timeinstant.getTime();
                    permalinkString = 'pt{t' + t + '}';
                    break;
                case "timerange":
                    var s = filter.mindatetimeinstant.getTime();
                    var e = filter.maxdatetimeinstant.getTime();
                    permalinkString = 'tr{s' + s + 'e' + e + '}';
                    break;
                case "value":
                    var value = filter.value;
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
        }
    }

});
