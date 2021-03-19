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
        'BasiGX.util.Layer',
        'Koala.model.Isochrone'
    ],

    /**
     * @override
     */
    onRoutingResultChanged: function (newResult) {
        var me = this;

        me.clearIsochronesStore();
        me.clearIsochronesLayer();

        if (newResult) {
            me.clearIsochronesStore();
            var isochrones = me.createIsochrones(newResult);
            me.clearIsochronesLayer();
            me.addIsochronesToMap(newResult);
            // we have to first add the isochrones to the map
            // so the grid can successfully reference the features.
            me.addIsochrones(isochrones);
            me.zoomToIsochrones();
        }
    },

    /**
     * Get the IsochroneLayer.
     * @returns {ol.layer.Vector} The IsochroneLayer.
     */
    getIsochroneLayer: function () {
        var me = this;
        var view = me.getView();

        if (!view.isochroneLayerName) {
            return;
        }

        return BasiGX.util.Layer.getLayerByName(view.isochroneLayerName);
    },

    /**
     * Create the isochrone model instances.
     *
     * These have to be created separately, before adding them to the store,
     * so we can create the layers in between.
     * This is needed for properly updating the isochrones grid as it
     * gets the color from the feature style.
     *
     * @param {Object} orsIsochrones The response object from ors isochrones api.
     * @returns {Koala.model.Isochrone[]} Array of isochrone entities.
     */
    createIsochrones: function (orsIsochrones) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
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
        // we have to create the records one-by-one, so we can
        // add the record id as reference to the features
        var isochrones = Ext.Array.map(features, function (feature, idx) {
            var props = feature.properties || {};

            var isochrone = Ext.create('Koala.model.Isochrone', {
                geometry: Ext.clone(feature.geometry),
                area: props.area,
                center: Ext.clone(props.center),
                group_index: props.group_index,
                reachfactor: props.reachfactor,
                value: props.value,
                range_type: rangeType,
                // TODO currently the API does not provide population
                population: props.total_pop
            });
            feature.properties.recId = isochrone.getId();
            return isochrone;
        });
        return isochrones;
    },

    /**
     * Remove all records from the isochrones store.
     */
    clearIsochronesStore: function () {
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

        isochronesStore.removeAll();
    },

    /**
     * Zoom to the extent of the isochrones.
     */
    zoomToIsochrones: function () {
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
     * Add the given isochrones to the isochrones store.
     *
     * @param {Koala.model.Isochrone[]} isochrones The array of isochrones instances.
     */
    addIsochrones: function (isochrones) {
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

        isochronesStore.add(isochrones)
    },

    /**
     * Add the isochrone features to the map.
     *
     * @param {Object} geojson The response object from the ors isochrones api.
     */
    addIsochronesToMap: function (geojson) {
        var me = this;
        var view = me.getView();

        if (!view) {
            return;
        }

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

        // the closest isochrone is the first item in isochroneFeatures
        me.setFeatureStyles(isochroneFeatures);
        var source = layer.getSource();

        source.addFeatures(isochroneFeatures);
    },

    /**
     * Clear the isochrone layer from its features.
     */
    clearIsochronesLayer: function () {
        var me = this;
        var view = me.getView();

        if (!view) {
            return;
        }

        var layer = me.getIsochroneLayer();
        if (!layer) {
            return;
        }

        var source = layer.getSource();
        if (!source) {
            return;
        }

        source.clear();
    },

    /**
     * Set the feature styles for the given features.
     * @param {ol.Feature[]} feats List of features to style.
     */
    setFeatureStyles: function (feats) {
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

        Ext.Array.each(feats, function (feat, idx) {
            var colorIdx = Math.floor(idx * stepSize);
            if (colorIdx >= colorPalette.length) {
                colorIdx = colorPalette.length - 1;
            }

            var hexAlpha = vm.get('isochroneAlpha');
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
    },

    /**
     * Set the alpha value for all features.
     *
     * @param {Ext.data.Model} rec The feature to apply the highlightAlpha to.
     * @param {String} baseAlpha The alpha value for all unhighlighted features.
     * @param {String} highlightAlpha The alpha value for the highlighted feature.
     */
    setFeaturesAlpha: function (rec, baseAlpha, highlightAlpha) {
        var me = this;
        var layer = me.getIsochroneLayer();
        if (!layer) {
            return;
        }

        var source = layer.getSource();
        if (!source) {
            return;
        }

        Ext.Array.each(source.getFeatures(), function (feature) {
            var props = feature.getProperties();

            var featureStyle = feature.getStyle();
            var fillColor = featureStyle.getFill().getColor();
            var baseColor = fillColor.slice(0, 7);

            var alpha = baseAlpha;
            if (props.recId === rec.getId()) {
                alpha = highlightAlpha;
            }
            var newColor = baseColor + alpha;

            featureStyle.getFill().setColor(newColor);
            feature.setStyle(featureStyle);
        });
    },

    /**
     * Handle the mouseenter event of the grid.
     *
     * @param {Ext.Component} view The component view.
     * @param {Ext.data.Model} rec The isochrone record.
     */
    onItemMouseEnter: function (view, rec) {
        var me = this;
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var alpha = vm.get('isochroneAlpha');

        me.setFeaturesAlpha(rec, '00', alpha);
    },

    /**
     * Handle the mouseleave event of the grid.
     *
     * @param {Ext.Component} view The component view.
     * @param {Ext.data.Model} rec The isochrone record.
     */
    onItemMouseLeave: function (view, rec) {
        var me = this;
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var alpha = vm.get('isochroneAlpha');
        me.setFeaturesAlpha(rec, alpha, alpha);
    }

});
