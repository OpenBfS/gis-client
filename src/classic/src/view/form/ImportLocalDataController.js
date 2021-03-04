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

        'Koala.view.form.field.VectorTemplateCombo',
        'Koala.view.form.ChartDataForm',
        'Koala.view.window.StyleSelectWindow'
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
        if (fileName) {
            viewModel.set('layerName', fileName);
        }
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
    readFile: function(justParseCallback) {
        var me = this;
        var file = this.getViewModel().get('file');
        if (file instanceof File) {
            var reader = new FileReader();
            reader.addEventListener('load', me.parseFeatures.bind(this, justParseCallback));
            reader.readAsText(file);
        } else {
            this.parseFeatures(justParseCallback, this.getViewModel().get('features'));
        }
    },

    /**
    * Copy of https://github.com/openlayers/ol3/blob/v3.18.2/src/ol/interaction/draganddrop.js#L97
    */
    parseFeatures: function(justParseCallback, eventOrData) {
        var me = this;
        var map = Ext.ComponentQuery.query('k-component-map')[0].getMap();
        var viewModel = me.getViewModel();
        var result = eventOrData.target ? eventOrData.target.result : eventOrData;
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
        if (!justParseCallback) {
            this.createLayer();
        } else {
            justParseCallback(features);
        }
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

    createLayerWithMetadata: function(metadata) {
        metadata = Koala.util.Metadata.prepareClonedMetadata(metadata);
        var layerUtil = Koala.util.Layer;
        var viewModel = this.getViewModel();
        var layerName = viewModel.get('layerName');
        var features = viewModel.get('features');
        // Make some specific settings for local data:
        var cfg = this.getInternalLayerConfig(metadata);

        cfg.name = layerName;
        cfg.metadata = metadata;
        cfg.userCreated = true;
        cfg.routeId = 'localData_' + layerName;

        // Create a source for the features from the uploaded / dragged file
        cfg.source = new ol.source.Vector({
            features: features
        });
        cfg.style = Koala.util.Clone.defaultOlStyle;

        var layer = new ol.layer.Vector(cfg);
        layer.metadata = metadata;
        var layerStyle = this.style || Koala.util.Clone.defaultStyle;
        if (layerStyle) {
            Koala.util.Layer.setSLDStyle(layer, layerStyle);
            Koala.util.Layer.updateVectorStyle(layer, layerStyle);
            layer.set('hasLegend', true);
        }
        if (this.selectedTemplateStyle) {
            layerUtil.getVectorLayerStyle(layer, true, viewModel.get('selectedTemplateStyle'));
        }
        layerUtil.setOriginalMetadata(layer, metadata);

        // Finally add the layer to the map.
        layerUtil.addOlLayerToMap(layer);

    },

    /**
     *
     */
    createLayer: function() {
        var layerUtil = Koala.util.Layer;
        var templateCombo = this.getView().down('k-form-field-vectortemplatecombo');
        var uuid = templateCombo.getViewModel().get('templateUuid');
        var me = this;
        var map = Ext.ComponentQuery.query('k-component-map')[0].getMap();
        var features = this.getViewModel().get('features');

        var gotMetadataCallback = function(metadata) {
            if (!metadata.layerConfig) {
                metadata.layerConfig = {};
            }
            var bar = metadata.layerConfig.barChartProperties;
            var time = metadata.layerConfig.timeSeriesChartProperties;
            var ol = metadata.layerConfig.olProperties;
            if ((ol.showCartoWindow && ol.showCartoWindow === 'true') && (bar && Object.keys(bar).length > 0 ||
                time && Object.keys(time).length > 0 ||
                ol && Object.keys(ol).length > 0)) {
                Ext.create('Ext.window.Window', {
                    title: me.getViewModel().get('settingsText'),
                    items: [{
                        xtype: 'k-form-chartdata',
                        metadata: metadata,
                        done: function(md) {
                            me.createLayerWithMetadata(md);
                            this.up('window').hide();
                        },
                        cancel: function() {
                            this.up('window').hide();
                        },
                        features: features
                    }]
                }).show();
            } else {
                me.createLayerWithMetadata(metadata);
            }
        };

        layerUtil.getMetadataFromUuid(uuid)
            .then(gotMetadataCallback)
            .catch(function() {
                gotMetadataCallback({});
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
            allowDownload: getBool(olProps.allowDownload, false),
            allowRemoval: getBool(olProps.allowRemoval, true),
            allowClone: getBool(olProps.allowClone, false),
            showCartoWindow: getBool(olProps.showCartoWindow, false),
            allowEdit: getBool(olProps.allowEdit, false),
            allowShortInfo: getBool(olProps.allowShortInfo, false),
            allowPrint: getBool(olProps.allowPrint, true),
            allowOpacityChange: getBool(olProps.allowOpacityChange, true),
            featureIdentifyField: olProps.featureIdentifyField || 'id',
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

    /**
     * Shows the style selection window.
     */
    selectStyle: function() {
        var me = this;
        var view = this.getView();
        this.readFile(function(features) {
            var win = Ext.create('Koala.view.window.StyleSelectWindow', {
                features: features,
                setStyleCallback: function(sld) {
                    me.style = sld;
                },
                setSelectedTemplateStyle: function(templateStyle) {
                    me.selectedTemplateStyle = templateStyle;
                }
            });
            var viewModel = win.down('k-form-field-vectortemplatecombo').getViewModel();
            viewModel.set('selectedTemplate', view.down('k-form-field-vectortemplatecombo').getValue());
        });
    }

});
