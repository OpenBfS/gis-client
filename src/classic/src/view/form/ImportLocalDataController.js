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
* @class Koala.view.form.ImportLocalDataController
*/
Ext.define('Koala.view.form.ImportLocalDataController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-form-importlocaldata',

    requires: [
        'Koala.util.Layer',
        'Koala.util.Object',
        'Koala.util.String',

        'Koala.view.form.field.VectorTemplateCombo'
    ],

    /**
     *
     */
    KEY_FLIP_COORDS_PROJECTION: 'EPSG:4326-enu',

    /**
     *
     */
    flipCoords: function(coords) {
        var me = this;
        var flipped = [];
        if (coords && !Ext.isArray(coords[0])) {
            flipped[0] = coords[1];
            flipped[1] = coords[0];
            flipped[2] = coords[2];
        } else {
            Ext.each(coords, function(coord) {
                flipped.push(me.flipCoords(coord));
            });
        }
        return flipped;
    },

    /**
     *
     */
    onBoxReady: function() {
        var viewModel = this.getViewModel();
        var fileName = viewModel.get('file.name');
        viewModel.set('layerName', fileName);
    },

    /**
     *
     */
    retransformFlipAndTransform: function(features, projection, targetProjection) {
        var me = this;
        Ext.each(features, function(feature) {
            var geometry = feature.getGeometry().clone();
            geometry.transform(targetProjection, projection);
            var coordinates = geometry.getCoordinates();
            geometry.setCoordinates(me.flipCoords(coordinates));
            geometry.transform(projection, targetProjection);
            feature.setGeometry(geometry);
        });
    },

    /**
     *
     */
    beforeProjectionComboRendered: function(combo) {
        var appContext = Ext.ComponentQuery.query('k-component-map')[0].appContext;
        combo.getStore().setData(appContext.data.merge.vectorProjections);
    },

    /**
     *
     */
    fileFieldChanged: function(filefield) {
        var file = filefield.getEl().down('input[type=file]').dom.files[0];
        var viewModel = this.getViewModel();
        viewModel.set('file', file);
        var fileName = viewModel.get('file.name');
        viewModel.set('layerName', fileName);
    },

    /**
     *
     */
    readFile: function() {
        var me = this;
        var file = this.getViewModel().get('file');
        var reader = new FileReader();
        reader.addEventListener('load', me.parseFeatures.bind(this));
        reader.readAsText(file);
    },

    /**
    * Copy of https://github.com/openlayers/ol3/blob/v3.18.2/src/ol/interaction/draganddrop.js#L97
    */
    parseFeatures: function(event) {
        var me = this;
        var map = Ext.ComponentQuery.query('k-component-map')[0].getMap();
        var viewModel = me.getViewModel();
        var result = event.target.result;
        var formatConstructors = [
            ol.format.GeoJSON,
            ol.format.KML,
            ol.format.GML3
        ];

        var targetProjection = viewModel.get('targetProjection');
        if (!targetProjection) {
            var mapProjection = map.getView().getProjection();
            viewModel.set('targetProjection', mapProjection);
        }
        var features = [];
        var i, ii;

        for (i = 0, ii = formatConstructors.length; i < ii; ++i) {
            var formatConstructor = formatConstructors[i];
            var format = new formatConstructor();

            var dataProjection = viewModel.get('projection');
            var featureProjection = viewModel.get('targetProjection');

            features = me.tryReadFeatures(format, result, {
                dataProjection: dataProjection,
                featureProjection: featureProjection
            });
            if (features && features.length > 0) {
                if (viewModel.get('projection') === me.KEY_FLIP_COORDS_PROJECTION) {
                    me.retransformFlipAndTransform(
                        features,
                        dataProjection,
                        featureProjection
                    );
                }
                break;
            }
        }

        viewModel.set('features', features);
        this.createLayer();
    },

    /**
    * Copy of https://github.com/openlayers/ol3/blob/v3.18.2/src/ol/interaction/draganddrop.js#L170
    */
    tryReadFeatures: function(format, text, options) {
        try {
            return format.readFeatures(text, options);
        } catch (e) {
            return null;
        }
    },

    /**
     *
     */
    importClicked: function() {
        this.readFile();
    },

    /**
     *
     */
    createLayer: function() {
        var viewModel = this.getViewModel();
        var layerUtil = Koala.util.Layer;
        var templateCombo = this.getView().down('k-form-field-vectortemplatecombo');
        var uuid = templateCombo.getViewModel().get('templateUuid');
        var layerName = viewModel.get('layerName');
        var features = viewModel.get('features');
        var me = this;
        var map = Ext.ComponentQuery.query('k-component-map')[0].getMap();

        var gotMetadataCallback = function(metadata) {

            // Make some specific settings for local data:
            var cfg = me.getInternalLayerConfig(metadata);

            cfg.name = layerName;
            cfg.metadata = metadata;
            cfg.routeId = 'localData_' + layerName;

            // Create a source for the features from the uploaded / dragged file
            cfg.source = new ol.source.Vector({
                features: features
            });

            var layer = new ol.layer.Vector(cfg);
            layer.metadata = metadata;

            layerUtil.getVectorLayerStyle(layer, true, viewModel.get('selectedTemplateStyle'));

            // Finally add the layer to the map.
            layerUtil.addOlLayerToMap(layer);
        };

        layerUtil.getMetadataFromUuid(uuid)
            .then(gotMetadataCallback)
            .catch(function() {
                gotMetadataCallback(null);
            });

        map.getLayers().once('add', function(evt) {
            // TODO this has to be replaced once we have multiple maps
            var layer = evt.element;
            var extent = layer.getSource().getExtent();
            map.getView().fit(extent, map.getSize(), {
                maxZoom: 16
            });
            me.getView().up('window').close();
        });
    },

    /**
    * Close the parent window if existing.
    */
    cancelClicked: function() {
        var win = this.getView().up('window');
        if (win) {
            win.close();
        }
    },

    /**
    * Copy of "Koala.util.Layer.getInternalLayerConfig" but different defaults.
    *
    * TODO reuse somehow to reduce copy and pasted code.
    */
    getInternalLayerConfig: function(metadata) {
        var getPathStrOr = Koala.util.Object.getPathStrOr;
        var getBool = Koala.util.String.getBool;

        var olProps = getPathStrOr(metadata, 'layerConfig/olProperties', {});
        olProps = Koala.util.Object.coerceAll(olProps);

        var shallHover = false;
        if (!Ext.isEmpty(olProps.hoverTpl) && olProps.allowHover !== false) {
            shallHover = true;
        }
        var downloadUrl = getPathStrOr(metadata, 'layerConfig/download/url', undefined);
        var timeSeriesChartProperties = getPathStrOr(metadata, 'layerConfig/timeSeriesChartProperties', undefined);
        var barChartProperties = getPathStrOr(metadata, 'layerConfig/barChartProperties', undefined);

        return {
            legendUrl: olProps.legendUrl || '',
            legendHeight: olProps.legendHeight,
            legendWidth: olProps.legendWidth,
            allowHover: shallHover,
            allowFeatureInfo: getBool(olProps.allowFeatureInfo, true),
            allowDownload: getBool(olProps.allowDownload, false),
            allowRemoval: getBool(olProps.allowRemoval, true),
            //allowClone: getBool(olProps.allowClone, false), //ToDo clone vector layers
            allowEdit: getBool(olProps.allowEdit, false),
            allowShortInfo: getBool(olProps.allowShortInfo, false),
            allowPrint: getBool(olProps.allowPrint, true),
            allowOpacityChange: getBool(olProps.allowOpacityChange, true),
            hoverable: shallHover,
            hoverTpl: olProps.hoverTpl,
            hoverStyle: olProps.hoverStyle,
            selectStyle: olProps.selectStyle || olProps.hoverStyle,
            hasLegend: getBool(olProps.hasLegend, false),
            downloadUrl: downloadUrl,
            timeSeriesChartProperties: timeSeriesChartProperties,
            barChartProperties: barChartProperties
        };
    },

    loadStyles: function(uuid) {
        var viewModel = this.getViewModel();
        Koala.util.Layer.getMetadataFromUuid(uuid).then(function(metadata) {
            var styles = Koala.util.Object.getPathStrOr(metadata,
                'layerConfig/olProperties/styleReference');
            if (styles) {
                styles = styles.split(',')
                    .map(function(style) {
                        return style.trim();
                    });
                viewModel.set('stylesAvailable', true);
                viewModel.set('templateStyles', styles);
                viewModel.set('selectedTemplateStyle', styles[0]);
            } else {
                viewModel.set('stylesAvailable', false);
                viewModel.set('templateStyles', []);
                viewModel.set('selectedTemplateStyle', undefined);
            }
        });
    },

    onVectorTemplateChange: function(field, value) {
        this.loadStyles(value);
    }

});
