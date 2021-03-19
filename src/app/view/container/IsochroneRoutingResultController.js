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
 * @class Koala.view.container.IsochroneRoutingResultController
 */
Ext.define('Koala.view.container.IsochroneRoutingResultController', {
    extend: 'Koala.view.container.RoutingResultController',
    alias: 'controller.k-container-isochroneroutingresult',

    requires: [
        'Ext.Array',
        'BasiGX.util.Layer'
    ],

    /**
     * @override
     */
    onRoutingResultChanged: function(newResult) {
        var me = this;

        if (newResult) {
            // TODO add connection between store records and isochrone-layer features
            me.addIsochrones(newResult);
            me.addIsochronesToMap(newResult);
            me.zoomToIsochrones();
        }
    },

    /**
     * Get the IsochroneLayer.
     * @returns {ol.layer.Vector} The IsochroneLayer.
     */
    getIsochroneLayer: function() {
        var me = this;
        var view = me.getView();

        if (!view.isochroneLayerName) {
            return;
        }

        return BasiGX.util.Layer.getLayerByName(view.isochroneLayerName);
    },

    /**
     * Zoom to the extent of the isochrones.
     */
    zoomToIsochrones: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var map = view.map;
        var mapView = map.getView();

        var layer = me.getIsochroneLayer();
        if (!layer) {
            return;
        }

        var source = layer.getSource();
        if (!source) {
            return;
        }

        var extent = source.getExtent();

        mapView.fit(extent, {
            duration: 500,
            padding: '30 30 30 30'
        });
    },

    /**
     * Overwrite the isochronesStore with the given isochrones.
     *
     * @param {Object} orsIsochrones Response object of the ORS Isochrones API.
     * @returns {Ext.data.Model[]} The added isochrone records.
     */
    addIsochrones: function(orsIsochrones) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }
        var isochronesStore = vm.get('isochrones');
        if (!isochronesStore) {
            return;
        }

        var features = orsIsochrones.features || [];
        var rangeType;
        try {
            rangeType = orsIsochrones.metadata.query.range_type;
        } catch (err) {
            // default range_type according to API specification
            rangeType = 'time';
        }
        var isochrones = Ext.Array.map(features, function(feature) {
            var props = feature.properties || {};

            return {
                geometry: Ext.clone(feature.geometry),
                area: props.area,
                center: Ext.clone(props.center),
                group_index: props.group_index,
                reachfactor: props.reachfactor,
                value: props.value,
                range_type: rangeType,
                // TODO currently the API does not provide population
                population: props.total_pop
            };
        });

        return isochronesStore.loadRawData(isochrones);
    },

    addIsochronesToMap: function(geojson) {
        var me = this;
        var view = me.getView();

        var layer = me.getIsochroneLayer();
        if (!layer) {
            return;
        }

        // the GeoJSON contains a FeatureCollection
        // that's why need the "readFeatures" function
        // which returns an array
        // the "readFeature" function does not work here
        var isochroneFeatures = (new ol.format.GeoJSON({
            featureProjection: view.map.getView().getProjection()
        })).readFeatures(geojson);

        // TODO use this for feature/table highlighting
        // // add additional properties to the feature
        // if (featureProperties && Ext.isObject(featureProperties)) {
        //     // all routes are highlighted by default
        //     featureProperties['highlighted'] = true;
        //     isochrone.setProperties(featureProperties);
        // }

        // the closest isochrone is the first item in isochroneFeatures
        me.setFeatureStyles(isochroneFeatures);
        var source = layer.getSource();

        source.clear();
        source.addFeatures(isochroneFeatures);
    },

    setFeatureStyles: function(feats) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var count = feats.length;

        var colorPalette = vm.get('greenToRed');

        var stepSize = colorPalette.length / count;

        Ext.Array.each(feats, function(feat, idx) {
            var colorIdx = Math.floor(idx * stepSize);
            if (colorIdx >= colorPalette.length) {
                colorIdx = colorPalette.length - 1;
            }

            // hexcode value for 30% opacity is 4D
            var hexAlpha = '4D';
            var color = colorPalette[colorIdx];
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: color + hexAlpha
                }),
                // Set the order in which the features
                // should be rendered. Small polygons
                // on top.
                zIndex: count - idx
            });

            feat.setStyle(style);
        });
    }

});
