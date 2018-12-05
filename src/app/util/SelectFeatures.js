/*  Copyright (c) 2017-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * A utility class to handle feature selection.
 *
 * @class Koala.util.SelectFeatures
 */
Ext.define('Koala.util.SelectFeatures', {

    requires: [
        'BasiGX.util.WFS',
        'BasiGX.util.SLD',
        'BasiGX.util.Map',
        'Koala.util.Object'
    ],

    statics: {
        /* begin i18n */
        error: '',
        couldNotLoad: '',
        couldNotParse: '',
        /* end i18n */

        /**
         * Adds the given features to the vectorlayer, if they do not exist in its
         * source already. Features that do already exist will get removed.
         * Feature removal will only work if the key `featureIdentifyField` has been
         * set on the layer in GNOS to a unique and existing field, default is 'id'.
         * Please note that this will remove all features in the target layer if the
         * shift key was not pressed when selecting features!
         * @param {ol.layer.Base} sourceLayer The layer holding the source features
         * @param {ol.layer.Base} targetLayer The layer receiving the features
         * @param {array} features The array of features that should be handled
         */
        addOrRemoveSelectedFeatures: function(sourceLayer, targetLayer, features) {
            var exisitingFeatures = targetLayer.getSource().getFeatures();
            var featureIdentifyField = Koala.util.Object.getPathStrOr(
                sourceLayer.metadata, 'layerConfig/olProperties/featureIdentifyField', 'id');
            var layerIdentifier = Koala.util.Object.getPathStrOr(
                sourceLayer.metadata, 'layerConfig/wms/layers');
            if (!layerIdentifier) {
                layerIdentifier = sourceLayer.id;
            }
            var shiftKeyPressed = false;
            var selectBtn = Ext.ComponentQuery.query(
                'k-button-selectfeatures')[0];
            if (selectBtn) {
                shiftKeyPressed = selectBtn.getController().shiftKeyPressed;
            }
            if (!shiftKeyPressed) {
                // always remove all selections when user does not select with
                // the shift key
                targetLayer.getSource().clear();
                exisitingFeatures = [];
            }
            Ext.each(features, function(feature) {
                var alreadyExistingFeature;
                Ext.each(exisitingFeatures, function(exisitingFeature) {
                    if (featureIdentifyField && layerIdentifier) {
                        if (exisitingFeature.__layerIdentifier__ &&
                            exisitingFeature.__layerIdentifier__ === layerIdentifier) {
                            // comparing a feature from the same featuretype, lets check for the id
                            var existingId = exisitingFeature.getProperties()[featureIdentifyField];
                            var newId = feature.getProperties()[featureIdentifyField];
                            if (existingId && newId && existingId === newId) {
                                alreadyExistingFeature = exisitingFeature;
                                return false;
                            }
                        }
                    }
                });
                if (alreadyExistingFeature) {
                    targetLayer.getSource().removeFeature(alreadyExistingFeature);
                } else {
                    // save the layerIdentifier for later comparisons
                    feature.__layerIdentifier__ = layerIdentifier;
                    targetLayer.getSource().addFeatures([feature]);
                }
            });
        },

        /**
         * Clones all features from an existing VectorLayer to a target layer
         * @param {ol.layer.Base} sourceLayer The layer holding the source features
         * @param {ol.layer.Base} targetLayer The layer receiving the features
         */
        getAllFeaturesFromVectorLayer: function(sourceLayer, targetLayer) {
            var features = sourceLayer.getSource().getFeatures();
            var clonedFeatures = [];
            Ext.each(features, function(feature) {
                clonedFeatures.push(Ext.clone(feature));
            });
            Koala.util.SelectFeatures.addOrRemoveSelectedFeatures(
                sourceLayer,
                targetLayer,
                clonedFeatures
            );
        },

        /**
         * Retrieves features from an existing VectorLayer by the given extent
         * @param {ol.layer.Base} sourceLayer The layer holding the source features
         * @param {ol.layer.Base} targetLayer The layer receiving the features
         * @param {array} extent The extent array to retrieve features in
         */
        getFeaturesFromVectorLayerByBbox: function(sourceLayer, targetLayer, extent) {
            var clones = [];
            sourceLayer.getSource().forEachFeatureIntersectingExtent(
                extent, function(feature) {
                    clones.push(Ext.clone(feature));
                }
            );
            Koala.util.SelectFeatures.addOrRemoveSelectedFeatures(
                sourceLayer,
                targetLayer,
                clones
            );
        },

        /**
         * Retrieves all features from an WMSLayer, limited by maxFeatures
         * @param {ol.layer.Base} sourceLayer The layer holding the source features
         * @param {ol.layer.Base} targetLayer The layer receiving the features
         * @param {Integer} maxFeatures The maximum number of features to get
         */
        getAllFeaturesFromWmsLayer: function(sourceLayer, targetLayer, maxFeatures) {
            if (!maxFeatures) {
                maxFeatures = 2000;
            }
            Koala.util.Layer.getGeometryFieldNameForLayer(
                sourceLayer,
                function() {
                    var field = this.toString();
                    targetLayer.set('geometryFieldName', field);
                    Koala.util.SelectFeatures.getDescribeFeatureSuccess(
                        sourceLayer, targetLayer, null, field, maxFeatures);
                },
                Koala.util.SelectFeatures.getDescribeFeatureFail.bind(this)
            );
        },

        /**
         * Retrieves features from an WMSLayer by the given extent
         * @param {ol.layer.Base} sourceLayer The layer holding the source features
         * @param {ol.layer.Base} targetLayer The layer receiving the features
         * @param {array} extent The extent array to retrieve features in
         * @param {Integer} maxFeatures The maximum number of features to get
         */
        getFeaturesFromWmsLayerByBbox: function(sourceLayer, targetLayer,
            extent, maxFeatures) {
            if (!maxFeatures) {
                maxFeatures = 2000;
            }
            Koala.util.Layer.getGeometryFieldNameForLayer(
                sourceLayer,
                function() {
                    var field = this.toString();
                    targetLayer.set('geometryFieldName', field);
                    Koala.util.SelectFeatures.getDescribeFeatureSuccess(
                        sourceLayer, targetLayer, extent, field, maxFeatures);
                },
                Koala.util.SelectFeatures.getDescribeFeatureFail.bind(this)
            );
        },

        /**
         * Callback to issue a GetFeature request with all required filters
         * @param {ol.layer.Base} sourceLayer The layer holding the source features
         * @param {ol.layer.Base} targetLayer The layer receiving the features
         * @param {array} extent The extent array to retrieve features in
         * @param {string} geometryField The name of the field containing the geometry
         * @param {Integer} maxFeatures The maximum number of features to get
         */
        getDescribeFeatureSuccess: function(sourceLayer, targetLayer, extent,
            geometryField, maxFeatures) {
            if (Ext.isEmpty(geometryField)) {
                Ext.log.error('Could not determine geometryfield for layer ',
                    sourceLayer);
                return;
            }
            var wmsUrl = Koala.util.Object.getPathStrOr(sourceLayer.metadata,
                'layerConfig/wms/url');
            var wfsUrl = Koala.util.Object.getPathStrOr(sourceLayer.metadata,
                'layerConfig/wfs/url');
            var name = Koala.util.Object.getPathStrOr(
                sourceLayer.metadata, 'layerConfig/wms/layers');
            var filters = Koala.util.Object.getPathStrOr(
                sourceLayer.metadata, 'filters');
            var cqlFilter = Koala.util.Object.getPathStrOr(
                sourceLayer.metadata, 'layerConfig/olProperties/param_cql_filter');
            var mapComponent = BasiGX.util.Map.getMapComponent();
            var srs = mapComponent.map.getView().getProjection().getCode();
            var sldFilters;
            var dimensionAttribute = 'end_measure';
            if (filters && filters[0]) {
                dimensionAttribute = filters[0].param;
            }

            var successCb = function(response) {
                var sld = response.responseText;
                var sldObject = BasiGX.util.SLD.toSldObject(sld);
                var rules = BasiGX.util.SLD.rulesFromSldObject(sldObject);
                if (!Ext.isEmpty(rules)) {
                    // get all sld filters
                    sldFilters = BasiGX.util.SLD.getFilterEncodingFromSldRules(
                        rules
                    );
                }

                var filter = BasiGX.util.WFS.getTimeAndSldCompliantFilter(
                    sourceLayer,
                    dimensionAttribute,
                    sldFilters,
                    BasiGX.util.Map.getMapComponent().map,
                    geometryField,
                    extent
                );

                if (cqlFilter) {
                    var ogcCqlFilter = BasiGX.util.WFS.getOgcFromCqlFilter(cqlFilter);
                    var parser = new DOMParser();
                    var xml = parser.parseFromString(filter, 'application/xml');
                    if (xml.documentElement.localName === 'Filter') {
                        var serializer = new XMLSerializer();
                        filter = serializer.serializeToString(xml.documentElement.firstChild);
                    }
                    filter = BasiGX.util.WFS.combineFilters([ogcCqlFilter, filter]);
                }
                var parms = sourceLayer.getSource().getParams();
                BasiGX.util.WFS.executeWfsGetFeature(
                    wfsUrl,
                    sourceLayer,
                    srs,
                    [],
                    geometryField,
                    filter,
                    maxFeatures,
                    function(res) {
                        Koala.util.SelectFeatures.getFeatureSuccess(
                            sourceLayer, targetLayer, res);
                    },
                    undefined,
                    undefined,
                    parms.viewparams
                );
            };

            var errorCb = function() {
                Ext.log.error('Could not get the SLD for layer');
                mapComponent.setLoading(false);
            };
            BasiGX.util.SLD.getSldFromGeoserver(wmsUrl, name, successCb, errorCb);
        },

        /**
         * Callback on DescribeFeatureType failure
         */
        getDescribeFeatureFail: function() {
            Ext.log.error('Could not determine geometryfield for layer');
            var mapComponent = BasiGX.util.Map.getMapComponent();
            mapComponent.setLoading(false);
        },

        /**
         * Callback on GetFeatures success
         * @param {ol.layer.Base} sourceLayer The layer holding the source features
         * @param {ol.layer.Base} targetLayer The layer receiving the features
         * @param {object} response The response containing the features
         */
        getFeatureSuccess: function(sourceLayer, targetLayer, response) {
            var format = new ol.format.GeoJSON();
            var mapComponent = BasiGX.util.Map.getMapComponent();
            try {
                var features = format.readFeatures(response.responseText);
            } catch (e) {
                Ext.Msg.alert(Koala.util.SelectFeatures.error,
                    Koala.util.SelectFeatures.couldNotParse);
                mapComponent.setLoading(false);
                return;
            }
            Koala.util.SelectFeatures.addOrRemoveSelectedFeatures(
                sourceLayer,
                targetLayer,
                features
            );
            mapComponent.setLoading(false);
            Ext.fireEvent('selectFeatures:featuresReceived');
        },

        /**
         * The failure callback when features could not be loaded.
         */
        getFeatureFail: function() {
            var mapComponent = BasiGX.util.Map.getMapComponent();
            mapComponent.setLoading(false);
            Ext.Msg.alert(Koala.util.SelectFeatures.error,
                Koala.util.SelectFeatures.couldNotLoad);
        }
    }
});
