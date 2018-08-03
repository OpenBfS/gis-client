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
 * @class Koala.store.StationSearch
 */
Ext.define('Koala.store.StationSearch', {
    extend: 'Ext.data.Store',

    alias: 'store.k-stationsearch',

    requires: [
        'Koala.model.StationRecord',
        'Koala.util.Layer'
    ],

    storeID: 'stationsearch',

    model: 'Koala.model.StationRecord',

    layer: null,

    map: null,

    /**
     * Stores the last request to be able to abort it manually.
     * @private
     */
    _lastRequest: null,

    constructor: function(config) {
        //TODO: this won't work if more than one map
        if (!this.map) {
            this.map = BasiGX.view.component.Map.guess().getMap();
        }
        if (!this.layer) {
            this.layer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 10,
                        fill: new ol.style.Fill({
                            color: '#ff9900',
                            opacity: 0.6
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#ffcc00',
                            opacity: 0.4
                        })
                    })
                })
            });
            var displayInLayerSwitcherKey = BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
            this.layer.set(displayInLayerSwitcherKey, false);
            this.layer.setZIndex(999);
            this.map.addLayer(this.layer);
        }

        this.callParent([config]);

        var appContext = BasiGX.view.component.Map.guess().appContext;
        var urls = appContext.data.merge.urls;
        var stationsearchtypename = appContext.data.merge['stationSearchTypeName'];
        this.proxy.url = urls['station-search'];
        this.proxy.extraParams.typeName = stationsearchtypename;

        var fields = Koala.model.StationRecord.getFields();
        Ext.each(fields, function(field) {
            field.initConfig({
                searchColumns: appContext.data.merge.stationSearchFields
            });
        });
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
            typeName: 'opendata:odl_sondenstandorte' // set in the constructor but left as default for compatibility reasons
        },
        limitParam: 'maxFeatures',
        reader: {
            type: 'json',
            rootProperty: 'features'
        }
    }
});
