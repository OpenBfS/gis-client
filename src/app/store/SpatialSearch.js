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
/**
 * @class Koala.store.SpatialSearch
 */
Ext.define('Koala.store.SpatialSearch', {
    extend: 'Ext.data.Store',

    alias: 'store.k-spatialsearch',

    requires: [
        'BasiGX.util.Layer'
    ],

    storeID: 'spatialsearch',

    layer: null,

    map: null,

    /**
     * Stores the last request to be able to abort it manually.
     * @private
     */
    _lastRequest: null,

    constructor: function(config){
        if(!this.map){
            this.map = BasiGX.view.component.Map.guess().getMap();
        }
        if(!this.layer){
            this.layer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            var displayInLayerSwitcherKey = BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
            this.layer.set(displayInLayerSwitcherKey, false);
            this.map.addLayer(this.layer);
        }


        this.callParent([config]);

        var appContext = BasiGX.view.component.Map.guess().appContext;
        var urls = appContext.data.merge.urls;
        this.proxy.url = urls['spatial-search'];
    },

    proxy: {
        url: null, // set in the constructor
        method: 'GET',
        type: 'ajax',
        extraParams: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            outputFormat: 'application/json',
            typeName: 'BFS:verwaltung_4326_geozg_sort'
        },
        limitParam: 'maxFeatures',
        reader: {
            type: 'json',
            rootProperty: 'features'
        }
    },

    fields: [{
        name: 'name',
        mapping: function(data) {
            return data.properties.MYNAME;
        }
    }, {
        name: 'wkt',
        mapping: function(data) {
            return data.properties.BOX_GEO;
        }
    }, {
        name: 'nnid',
        mapping: function(data) {
            return data.properties.NNID;
        }
    }]
});
