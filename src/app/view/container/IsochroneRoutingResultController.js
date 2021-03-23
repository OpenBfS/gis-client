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
    onRoutingResultChanged: function(newResult) {
        var me = this;

        me.clearIsochronesStore();
        me.clearIsochronesLayer();

        if (newResult) {
            var isochrones = me.createIsochrones(newResult);
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
    getIsochroneLayer: function() {
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
    createIsochrones: function(orsIsochrones) {
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
        var isochrones = Ext.Array.map(features, function(feature) {
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
    clearIsochronesStore: function() {
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
     * Add the given isochrones to the isochrones store.
     *
     * @param {Koala.model.Isochrone[]} isochrones The array of isochrones instances.
     */
    addIsochrones: function(isochrones) {
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

        isochronesStore.add(isochrones);
    },

    /**
     * Add the isochrone features to the map.
     *
     * @param {Object} geojson The response object from the ors isochrones api.
     */
    addIsochronesToMap: function(geojson) {
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
    clearIsochronesLayer: function() {
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

            var hexAlpha = vm.get('isochroneAlpha');
            var color = colorPalette[colorIdx];
            var style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: color + hexAlpha
                }),
                // Set the order in which the features
                // should be rendered. Small polygons
                // on top.
                zIndex: count - idx
            });

            feat.set('visible', true);
            feat.setStyle(style);
        });
    },

    /**
     * Set the alpha value of a single feature.
     *
     * @param {ol.Feature} feature The feature to set the alpha for.
     * @param {String} alpha The new alpha value.
     */
    setFeatureAlpha: function(feature, alpha) {
        var featureStyle = feature.getStyle();
        var fillColor = featureStyle.getFill().getColor();
        // only take the first 7 digits of the hexcode, aka all color values
        // and trim the alpha value, as we want to change this value here.
        var baseColor = fillColor.slice(0, 7);

        var newColor = baseColor + alpha;

        featureStyle.getFill().setColor(newColor);
        feature.setStyle(featureStyle);
    },

    /**
     * Highlight a single feature.
     *
     * @param {ol.Feature} feature The feature to highlight.
     */
    highlightFeature: function(feature) {
        var style = feature.getStyle();
        style.setStroke(new ol.style.Stroke({
            // white with 50% alpha
            color: '#FFFFFF80',
            width: 2
        }));

        feature.setStyle(style);
    },

    /**
     * Unhighlight a single feature.
     *
     * @param {ol.Feature} feature The feature to unhighlight.
     */
    unhighlightFeature: function(feature) {
        var style = feature.getStyle();
        style.setStroke(undefined);

        feature.setStyle(style);
    },

    /**
     * Handle the mouseenter event of the grid.
     *
     * @param {Ext.Component} view The component view.
     * @param {Ext.data.Model} rec The isochrone record.
     */
    onItemMouseEnter: function(view, rec) {
        var me = this;
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var layer = me.getIsochroneLayer();
        if (!layer) {
            return;
        }

        var recId = rec.getId();

        var feature = Ext.Array.findBy(layer.getSource().getFeatures(), function(feat) {
            return feat.get('recId') === recId;
        });

        if (!feature || !feature.get('visible')) {
            return;
        }

        me.highlightFeature(feature);
    },

    /**
     * Handle the mouseleave event of the grid.
     *
     * @param {Ext.Component} view The component view.
     * @param {Ext.data.Model} rec The isochrone record.
     */
    onItemMouseLeave: function(view, rec) {
        var me = this;
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var layer = me.getIsochroneLayer();
        if (!layer) {
            return;
        }

        var recId = rec.getId();

        var feature = Ext.Array.findBy(layer.getSource().getFeatures(), function(feat) {
            return feat.get('recId') === recId;
        });

        if (!feature) {
            return;
        }

        me.unhighlightFeature(feature);
    },

    /**
     * Handle the isochrone checkbox change event.
     *
     * @param {Object} widget The Ext Widget.
     * @param {Boolean} checked The checkbox state.
     */
    onCheckboxChange: function(widget, checked) {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }

        var rec = widget.getWidgetRecord();
        var recId = rec.getId();

        var layer = me.getIsochroneLayer();
        if (!layer) {
            return;
        }

        var feature = Ext.Array.findBy(layer.getSource().getFeatures(), function(feat) {
            return feat.get('recId') === recId;
        });

        if (!feature) {
            return;
        }

        feature.set('visible', checked);

        var alpha;
        if (checked) {
            alpha = vm.get('isochroneAlpha');
        } else {
            alpha = '00';
        }

        me.setFeatureAlpha(feature, alpha);
    }

});
