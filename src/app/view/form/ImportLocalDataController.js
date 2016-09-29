/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
        'Koala.util.Layer'
    ],

    statics: {
        /**
         *
         */
        KEY_FLIP_COORDS_PROJECTION: 'EPSG:4326-enu',

        /**
         *
         */
        retransformFlipAndTransform: function(features, projection, targetProjection) {
            var staticMe = Koala.view.form.ImportLocalDataController;
            Ext.each(features, function(feature) {
                var geometry = feature.getGeometry().clone();
                geometry.transform(targetProjection, projection);
                var coordinates = geometry.getCoordinates();
                geometry.setCoordinates(staticMe.flipCoords(coordinates));
                geometry.transform(projection, targetProjection);
                feature.setGeometry(geometry);
            });
        },

        /**
         *
         */
        flipCoords: function(coords) {
            var staticMe = Koala.view.form.ImportLocalDataController;
            var flipped = [];
            if (coords && !Ext.isArray(coords[0])) {
                flipped[0] = coords[1];
                flipped[1] = coords[0];
                flipped[2] = coords[2];
            } else {
                Ext.each(coords, function(coord) {
                    flipped.push(staticMe.flipCoords(coord));
                });
            }
            return flipped;
        }
    },

    /**
     *
     */
    onBoxReady: function(){
        var viewModel = this.getViewModel();
        var fileName = viewModel.get('file.name');
        viewModel.set('layerName', fileName);
    },

    /**
     *
     */
    beforeProjectionComboRendered: function(combo){
        var appContext = Ext.ComponentQuery.query('k-component-map')[0].appContext;
        combo.getStore().setData(appContext.data.merge.vectorProjections);
    },

    /**
     *
     */
    beforeVectorTemplateComboRendered: function(combo){
        var appContext = Ext.ComponentQuery.query('k-component-map')[0].appContext;
        combo.getStore().setData(appContext.data.merge.vectorTemplates);
    },

    /**
     *
     */
    fileFieldChanged: function(filefield){
        var file = filefield.getEl().down('input[type=file]').dom.files[0];
        var viewModel = this.getViewModel();
        viewModel.set('file', file);
        var fileName = viewModel.get('file.name');
        viewModel.set('layerName', fileName);
        var couldBeGml = fileName.endsWith('gml') || fileName.endsWith('xml');

        if(!couldBeGml){
            viewModel.set('projection', 'EPSG:4326');
        }
    },

    /**
     *
     */
    readFile: function(){
        var me = this;
        var file = this.getViewModel().get('file');
        var reader = new FileReader();
        reader.addEventListener("load", me.parseFeatures.bind(this));
        reader.readAsText(file);
    },

    /**
    * Copy of https://github.com/openlayers/ol3/blob/v3.18.2/src/ol/interaction/draganddrop.js#L97
    */
    parseFeatures: function(event){
        var me = this;
        var staticMe = Koala.view.form.ImportLocalDataController;
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
                if (viewModel.get('projection') === staticMe.KEY_FLIP_COORDS_PROJECTION) {
                    staticMe.retransformFlipAndTransform(
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
    tryReadFeatures: function(format, text, options){
        try {
            return format.readFeatures(text, options);
        } catch (e) {
            return null;
        }
    },

    /**
     *
     */
    importClicked: function(){
        this.readFile();
    },

    /**
     *
     */
    createLayer: function(){
        var viewModel = this.getViewModel();
        var layerUtil = Koala.util.Layer;
        var uuid = viewModel.get('templateUuid');
        var layerName = viewModel.get('layerName');
        var features = viewModel.get('features');
        var me = this;
        var map = Ext.ComponentQuery.query('k-component-map')[0].getMap();

        layerUtil.getMetadataFromUuidAndThen(uuid, function(metadata){
            // Make some specific settings for local data:
            var cfg = me.getInternalLayerConfig(metadata);
            cfg.name = layerName;
            cfg.metadata = metadata;
            cfg.routeId = "localData_" + layerName;
            cfg.source = new ol.source.Vector({
                features: features
            });

            var layer = new ol.layer.Vector(cfg);
            layerUtil.addOlLayerToMap(layer);
        });

        map.getLayers().once('add', function(evt){
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
    cancelClicked: function(){
        var win = this.getView().up('window');
        if(win){
            win.close();
        }
    },

    /**
    * Copy of "Koala.util.Layer.getInternalLayerConfig" but diffrent defaults.
    */
    getInternalLayerConfig: function(metadata) {
        var olProps = metadata.layerConfig.olProperties;
        olProps = Koala.util.Object.coerceAll(olProps);
        var getBool = Koala.util.String.getBool;

        var shallHover = false;
        if (!Ext.isEmpty(olProps.hoverTpl) && olProps.allowHover !== false) {
            shallHover = true;
        }

        return {
            legendUrl: olProps.legendUrl || '',
            legendHeight: olProps.legendHeight,
            legendWidth: olProps.legendWidth,
            allowFeatureInfo: getBool(olProps.allowFeatureInfo, true),
            allowDownload: getBool(olProps.allowDownload, false),
            allowRemoval: getBool(olProps.allowRemoval, true),
            allowShortInfo: getBool(olProps.allowShortInfo, false),
            allowPrint: getBool(olProps.allowPrint, true),
            allowOpacityChange: getBool(olProps.allowOpacityChange, true),
            hoverable: shallHover,
            hoverTpl: olProps.hoverTpl,
            hoverStyle: olProps.hoverStyle,
            selectStyle: olProps.selectStyle || olProps.hoverStyle,
            hasLegend: getBool(olProps.hasLegend, false),
            downloadUrl: metadata.layerConfig.download ? metadata.layerConfig.download.url : undefined,
            timeSeriesChartProperties: metadata.layerConfig.timeSeriesChartProperties,
            barChartProperties: metadata.layerConfig.barChartProperties
        };
    }

});
