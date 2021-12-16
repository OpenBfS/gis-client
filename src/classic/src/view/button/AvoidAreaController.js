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
 * @class Koala.view.button.AvoidAreaController
 */
Ext.define('Koala.view.button.AvoidAreaController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-button-avoidarea',

    requires: [
        'BasiGX.view.component.Map'
    ],

    /**
     * Activate singleclick event.
     * On map click the first possible polygon
     * is used as avoid area.
     */
    selectAvoidAreaFromLayer: function() {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var map = BasiGX.view.component.Map.guess().getMap();
        if (!map) {
            return;
        }

        map.once('singleclick',function(evt) {

            var aLayerHasBeenFound = map.forEachLayerAtPixel(
                evt.pixel,
                function(layer) {
                    // returns true if an appropriate layer has been found
                    // a true value breaks the forEach loop
                    return me.checkIfLayerContainsAvoidArea(layer, evt.coordinate);
                }.bind(me),
                // pre-filter the layers to check
                {
                    layerFilter: me.checkIfLayerIsValid
                }
            );
            if (!aLayerHasBeenFound) {
                Ext.toast(vm.get('i18n.errorNoLayerFound'));
            }
        });
    },

    /**
     * Check if a layer is suitable for checking if
     * it contains candidates for avoid area features.
     *
     * @param {ol.layer.Layer} layer The layer to check.
     * @returns {boolean} If layer fulfills conditions.
     */
    checkIfLayerIsValid: function(layer) {
        var source = layer.getSource();

        // the BKG Topplus basemap causes a CORS error that prevents
        // the forEachLayerAtPixel function from execution
        if (source instanceof ol.source.WMTS && layer.get('name') === 'Hintergrundkarte - TopPlus') {
            return false;
        }
        return layer instanceof ol.layer.Tile || layer instanceof ol.layer.Vector;
    },

    /**
     * Check if input layer contains a valid avoid area.
     *
     * @param {ol.layer.Layer} layer The layer to check.
     * @param {ol.Coordinate} coordinate The coordinate where the user clicked.
     *
     * @returns {boolean} If the layer contains usable features for the avoid area.
     */
    checkIfLayerContainsAvoidArea: function(layer, coordinate) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var map = BasiGX.view.component.Map.guess().getMap();
        if (!map) {
            return;
        }

        var mapView = map.getView();

        var source = layer.getSource();
        if (layer instanceof ol.layer.Tile) {

            var resolution = mapView.getResolution();
            var mapProjection = mapView.getProjection().getCode();

            if (source instanceof ol.source.TileWMS | source instanceof ol.source.ImageWMS) {
                var url = source.getFeatureInfoUrl(coordinate, resolution, mapProjection,
                    {
                        INFO_FORMAT: 'application/json'
                    });
                if (url) {
                    Ext.Ajax.request({
                        url: url,
                        success: function(response) {
                            var geoJson = Ext.decode(response.responseText);
                            var format = new ol.format.GeoJSON();
                            var features = format.readFeatures(geoJson);
                            me.handleNewAvoidFeatureCandidates(features);
                        },
                        failure: function(err) {
                            var str = 'An error occured: ' + err;
                            Ext.Logger.log(str);
                            Ext.toast(vm.get('i18n.errorGetFeatureInfo'));
                        }
                    }
                    );
                }
            }
            return true;
        }
        if (layer instanceof ol.layer.Vector) {

            var vectorFeatures = source.getFeaturesAtCoordinate(coordinate);
            me.handleNewAvoidFeatureCandidates(vectorFeatures);
            return true;
        }
    },

    /**
     * Process the retrieved feature candidates from other layers.
     * Finally use one feature as avoid area.
     *
     * @param {Array.<ol.Feature>} features The feature candidates of the other layer.
     */
    handleNewAvoidFeatureCandidates: function(features) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var map = BasiGX.view.component.Map.guess().getMap();
        if (!map) {
            return;
        }

        var avoidAreaLayer = me.getAvoidAreaLayer();
        if (!avoidAreaLayer) {
            return;
        }

        var mapView = map.getView();

        if (features.length === 0) {
            return;
        }

        var feature = features[0];
        var geom = feature.getGeometry();

        var geomCorrect = geom instanceof ol.geom.MultiPolygon || geom instanceof ol.geom.Polygon;

        if (!geomCorrect) {
            Ext.toast(vm.get('i18n.errorNoPolygonChosen'));
            return;
        }

        var source = me.clearAvoidAreaSource();
        source.addFeature(feature);
        mapView.fit(feature.getGeometry().getExtent());
    },

    /**
     * Initiate the file handling listener.
     *
     * @param {Ext.form.field.File} field The file field.
     */
    uploadButtonAfterRender: function(field) {
        var me = this;
        field.fileInputEl.on('change', me.handleUploadedFile.bind(me) );
    },

    /**
     * Process the uploaded GeoJSON file.
     *
     * @param {event} event The change event of the file selector.
     */
    handleUploadedFile: function(event) {
        var me = this;
        var view = me.getView();
        var vm = view.lookupViewModel();

        var file = event.target.files[0];

        if (file) {
            // check file extension
            var fileName = file.name.toLowerCase();
            var correctFileExtension = (fileName.endsWith('.json') || fileName.endsWith('.geojson'));

            if (!correctFileExtension) {
                Ext.toast(vm.get('i18n.errorUploadedFileExtension'));
                return;
            }

            file.text().then(function(text) {
                var map = BasiGX.view.component.Map.guess().getMap();
                if (!map) {
                    return;
                }

                // GeoJSON must be in EPSG:4326
                var sourceProjection = map.getView().getProjection().getCode();
                var avoidFeatures = new ol.format.GeoJSON().readFeatures(text,
                    {
                        featureProjection: sourceProjection
                    }
                );

                if (avoidFeatures.length === 0) {
                    Ext.toast(vm.get('i18n.errorZeroFeatures'));
                    return;
                }

                if (avoidFeatures.length > 1) {
                    Ext.toast(vm.get('i18n.errorTooManyFeatures'));
                    return;
                }

                var feat = avoidFeatures[0];
                if (!(feat.getGeometry() instanceof ol.geom.Polygon ||
                    feat.getGeometry() instanceof ol.geom.MultiPolygon)) {
                    Ext.toast(vm.get('i18n.errorUploadedGeometryType'));
                    return;
                }

                var source = me.clearAvoidAreaSource();
                source.addFeatures(avoidFeatures);

                // the value must be reset after chosing a file
                var fileField = view.down('filebutton');
                fileField.fileInputEl.dom.value = '';

            }).catch(function(err) {
                Ext.toast(vm.get('i18n.errorFileUpload'));
                var str = 'An error occured: ' + err;
                Ext.Logger.log(str);
            });

        }
    },

    /**
     * Activate drawing of avoid area. Set listener
     * to stop drawing once the first feature is finished.
     */
    drawAvoidArea: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }

        var vm = view.lookupViewModel();

        var avoidAreaLayer = me.getAvoidAreaLayer();
        var source;
        if (avoidAreaLayer) {
            source = avoidAreaLayer.getSource();
        }
        var map = BasiGX.view.component.Map.guess().getMap();

        if (source && this.addFeatureCallback) {
            source.un('addfeature', this.addFeatureCallback);
            this.addFeatureCallback = null;
            map.removeInteraction(this.avoidAreaDrawInteraction);
            this.avoidAreaDrawInteraction = null;
            vm.set('isDrawing', false);
            return;
        }
        vm.set('isDrawing', true);
        source = me.clearAvoidAreaSource();

        // create interaction
        this.avoidAreaDrawInteraction = new ol.interaction.Draw({
            source: source,
            type: 'Polygon',
            stopClick: true
        });
        map.addInteraction(this.avoidAreaDrawInteraction);
        this.multiPolygon = null;
        source.on('addfeature', this.addFeatureCallback = function(evt) {
            vm.set('deleteAvoidAreaButtonVisible', true);
            if (me.multiPolygon) {
                me.multiPolygon.appendPolygon(evt.feature.getGeometry());
            } else {
                me.multiPolygon = new ol.geom.MultiPolygon([evt.feature.getGeometry()]);
            }
            evt.feature.setGeometry(me.multiPolygon);
            view.fireEvent('avoidAreaDrawEnd', evt.feature);
        });
        this.avoidAreaDrawInteraction.setActive(true);
    },

    clearAvoidAreaSource: function() {
        var me = this;
        var view = me.getView();
        if (!view) {
            return;
        }
        if (this.multiPolygon) {
            this.multiPolygon = null;
        }
        var vm = view.lookupViewModel();
        vm.set('deleteAvoidAreaButtonVisible', false);
        var avoidAreaLayer = me.getAvoidAreaLayer();
        if (avoidAreaLayer) {
            var source = avoidAreaLayer.getSource();
            source.clear();
            return source;
        }
    },

    /**
     * Get the avoid area Layer.
     */
    getAvoidAreaLayer: function() {
        var me = this;
        var view = me.getView();

        if (!view.avoidAreaLayerName) {
            return;
        }
        return BasiGX.util.Layer.getLayerByName(view.avoidAreaLayerName);
    }
});
