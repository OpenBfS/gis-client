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
 * @class Koala.store.SpatialSearch
 */
Ext.define('Koala.store.SpatialSearch', {
    extend: 'Ext.data.Store',

    alias: 'store.k-spatialsearch',

    requires: [
        'Koala.model.SpatialRecord',
        'BasiGX.util.Layer'
    ],

    storeID: 'spatialsearch',

    model: 'Koala.model.SpatialRecord',

    layer: null,

    map: null,

    /**
     * Stores the last request to be able to abort it manually.
     * @private
     */
    _lastRequest: null,

    listeners: {
        beforeload: function() {
            var lang = 'de';
            if (Ext.isModern) {
                lang = Ext.ComponentQuery.query('k-field-languageselect')[0].getValue();
            } else {
                lang = Ext.ComponentQuery.query('k-form-field-languagecombo')[0].getValue();
            }
            this.proxy.extraParams.lang = lang;

            //TODO: this won't work if more than one map
            if (!this.map) {
                this.map = BasiGX.view.component.Map.guess().getMap();
            }

            var appContext = BasiGX.view.component.Map.guess().appContext;
            var urls = appContext.data.merge.urls;
            this.proxy.url = urls['spatial-search'];

            var center = this.map.getView().getCenter();
            var projection = this.map.getView().getProjection();
            center = proj4(projection.getCode(), proj4.WGS84, center);
            this.proxy.extraParams.lon = center[0];
            this.proxy.extraParams.lat = center[1];

            if (!this.layer) {
                this.layer = new ol.layer.Vector({
                    source: new ol.source.Vector()
                });
                var displayInLayerSwitcherKey = BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
                this.layer.set(displayInLayerSwitcherKey, false);
                this.layer.setZIndex(999);
                this.map.addLayer(this.layer);
            }
        }
    },

    proxy: {
        url: '',
        method: 'GET',
        type: 'ajax',
        extraParams: {
            q: '',
            lon: '',
            lat: '',
            limit: '10',
            lang: 'de'
        },
        limitParam: 'limit',
        pageParam: '',
        startParam: '',
        noCache: false,
        reader: {
            type: 'json',
            rootProperty: 'features'
        }
    }
});
