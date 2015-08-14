/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
Ext.define('Koala.view.component.MapController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-component-map',

    requires: [
        "Basepackage.util.Controller",

        "Koala.view.window.TimeSeriesWindow",
        "Koala.view.window.BarChart"
    ],

    pendingRequest: null,

    /**
     *
     */
    onHoverFeatureClick: function(olFeat) {
        var me = this;
        var layer = olFeat.get('layer');

        if (Ext.Object.getSize(layer.get("timeSeriesChartProperties")) > 0) {
            me.openTimeseriesWindow(olFeat);
        } else if (Ext.Object.getSize(layer.get("barChartProperties")) > 0) {
            me.openBarChartWindow(olFeat);
        } else {
            me.openGetFeatureInfoWindow(olFeat);
        }
    },

    /**
     * This is finally a complete OVERRIDE of the getToolTipHtml function from
     * the base class Basepackage.view.component.Map!
     */
    getToolTipHtml: function(layers, features){
        var innerHtml = '';
        var treeSelection = Ext.ComponentQuery
            .query("base-panel-legendtree")[0].getSelection();

        Ext.each(layers, function(layer, index, allItems){
            var hoverfield = layer.get('hoverfield');
            innerHtml += '<b>' + layer.get('name') + '</b>';
            Ext.each(features, function(feat){
                // we check for existing feature first as there maybe strange
                // situations (e.g. when zooming while hovering)
                // where feat is undefined and feat.get would throw an error
                if(feat && feat.get('layer') === layer){
                    innerHtml += '<br />' + feat.get(hoverfield) + '<br />';
                }
            });
            if(treeSelection.length === 0){
                return false;
            }
            if(index + 1 !== allItems.length){
                innerHtml += '<br />';
            }
        });

        return innerHtml;
    },

    /**
    *
    */
    openBarChartWindow: function(olFeat) {
       var olLayer = olFeat.get('layer');
       var win = Ext.create("Koala.view.window.BarChart");
       win.getController().createOrUpdateChart(olLayer, olFeat);

       // show the window itself
       win.show();
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
   },

    /**
     *
     */
    createTimeSeriesChartWindow: function(olLayer) {
        var chartConfig = olLayer.get('timeSeriesChartProperties');
        var addFilterForm = !Ext.isEmpty(chartConfig.allowFilterForm) ?
            Koala.util.String.getBool(chartConfig.allowFilterForm) : true;

        var win = Ext.create("Koala.view.window.TimeSeriesWindow", {
            addFilterForm: addFilterForm
        });
        return win;
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
    Basepackage.util.Controller.borrowViewMethods(viewMethodNames, cls);
});
