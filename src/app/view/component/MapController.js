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
 * @class Koala.view.component.MapController
 */
Ext.define('Koala.view.component.MapController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-component-map',

    requires: [
        "BasiGX.util.Controller",

        "Koala.util.Layer",
        "Koala.view.window.TimeSeriesWindow",
        "Koala.view.window.BarChart"
    ],

    pendingRequest: null,

    /**
     *
     */
    onHoverFeatureClick: function(olFeats) {
        var me = this;
        var timeSeriesWin;
        var barChartWin;
        if (Ext.isEmpty(olFeats)){
            return;
        }

        Ext.each(olFeats, function(olFeat, index) {
            var layer = olFeat.get('layer');

            // TimeSeries
            if (Koala.util.Layer.isTimeseriesChartLayer(layer)) {
                if(!timeSeriesWin){
                    // if no timeseries window, create one
                    timeSeriesWin = me.openTimeseriesWindow(olFeat);
                } else {
                    // just add any further series to the existing window
                    timeSeriesWin.getController().updateTimeSeriesChart(layer, olFeat);
                }
            // Open new BarchartWindow for each feature. Move if overlapping.
            } if (Koala.util.Layer.isBarChartLayer(layer)) {
                if(barChartWin){
                    var faktor = olFeats.length - index;
                    var x = barChartWin.getX() - 30 * faktor;
                    var y = barChartWin.getY() - 40 * faktor;
                    barChartWin.setPosition(x, y, true);
                }
                barChartWin = me.openBarChartWindow(olFeat);
            } else {
                me.openGetFeatureInfoWindow(olFeat);
            }
        });

    },

    /**
     * This is finally a complete OVERRIDE of the getToolTipHtml function from
     * the base class BasiGX.view.component.Map!
     */
    getToolTipHtml: function(layers, features) {
        var innerHtml = "";
        var lineBreak = "<br />";
        var layersLen = layers && layers.length;
        var featuresLen = features && features.length;
        var replaceTemplateStrings = Koala.util.String.replaceTemplateStrings;
        Ext.each(layers, function(layer, layerIdx) {
            var hoverTpl = layer.get("hoverTpl");
            Ext.each(features, function(feature, featureIdx) {
                // we check for existing feature first as there maybe strange
                // situations (e.g. when zooming while hovering)
                // where feat is undefined and feat.get would throw an error
                if(feature && feature.get("layer") === layer) {
                    var tooltipFeature = hoverTpl;
                    tooltipFeature = replaceTemplateStrings(
                        tooltipFeature, layer, false);
                    tooltipFeature = replaceTemplateStrings(
                        tooltipFeature, layer, false, "layer.");
                    tooltipFeature = replaceTemplateStrings(
                        tooltipFeature, feature, false);
                    tooltipFeature = replaceTemplateStrings(
                        tooltipFeature, feature, false, "feature.");
                    innerHtml += tooltipFeature;
                    if (featureIdx + 1 !== featuresLen) {
                        // not the last feature, append linebreak
                        innerHtml += lineBreak;
                    }
                }
            });

            if(layerIdx + 1 !== layersLen){
                // not the last layer, append linebreak
                innerHtml += lineBreak;
            }
        });

        return innerHtml;
    },

    onDroppedExternalVectorData: function(event) {
        Ext.create("Ext.window.Window", {
            // TODO i18n
            title: 'Upload local data',
            autoShow: true,
            items: [{
                xtype: 'k-form-importLocalData',
                viewModel: {
                    data: {
                        file: event.file,
                        targetProjection: event.projection
                    }
                }
            }]
        });
    },

    /**
    *
    */
    openBarChartWindow: function(olFeat) {
       var olLayer = olFeat.get('layer');
       var uniqueId = this.getUniqueIdByFeature(olFeat);
       var win = Ext.create("Koala.view.window.BarChart");
       win.getController().createOrUpdateChart(olLayer, olFeat, uniqueId);
       return win;
   },

    /**
     *
     */
    openTimeseriesWindow: function(olFeat) {
        var me = this;
        var win = Ext.ComponentQuery.query('window[name=timeserieswin]')[0];
        var olLayer = olFeat.get('layer');

        // create the window if it doesn't exist already
        if (!win) {
            win = me.createTimeSeriesChartWindow(olLayer);
        }
        win.getController().createOrUpdateChart(olLayer, olFeat);

        // show the window itself
        win.show();

        return win;
    },

    /**
    *
    */
   openGetFeatureInfoWindow: function() {
       var win = Ext.ComponentQuery.query('window[name=getfeatureinfowin]')[0];

       // create the window if it doesn't exist already
       if (!win) {
//           win = Ext.create("Koala.view.window.GetFeatureInfoWindow");
       }
//       win.show();
        return win;
   },

    /**
     *
     */
    createTimeSeriesChartWindow: function(olLayer) {
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var addFilterForm = !Ext.isEmpty(chartConfig.allowFilterForm) ?
            Koala.util.String.getBool(chartConfig.allowFilterForm) : true;

        var win = Ext.create("Koala.view.window.TimeSeriesWindow", {
            addFilterForm: addFilterForm,
            initOlLayer: olLayer
        });
        return win;
    },

    /**
     *
     */
    getUniqueIdByFeature: function(olFeat) {
        var geom = olFeat.getGeometry();
        if (geom && geom.getExtent) {
            var extent = geom.getExtent();
            return extent.join("-");
        } else {
            return olFeat.getId();
        }
    }
}, function(cls) {
    // create forwarding methods on the controller which call their pendant
    // on the associated view.
    var viewMethodNames = [
        'cleanupHoverArtifacts',
        'addHoverVectorLayerInteraction',
        'onFeatureClicked',
        'addHoverVectorLayerSource',
        'addHoverVectorLayer',
        'clearPendingRequests',
        'requestAsynchronously',
        'onPointerRest',
        'showHoverFeature',
        'showHoverToolTip'
    ];
    BasiGX.util.Controller.borrowViewMethods(viewMethodNames, cls);
});
