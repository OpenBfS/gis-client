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

    onBoxReady: function(){
        var viewModel = this.getViewModel();
        var fileName = viewModel.get('file.name');
        viewModel.set('layerName', fileName);
    },

    importClicked: function(){
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
            map.getView().fit(extent, map.getSize());
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
