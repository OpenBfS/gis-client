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
 * @class Koala.view.component.MapController
 */
Ext.define('Koala.view.component.MapController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-component-map',

    requires: [
        'BasiGX.util.Controller',
        'BasiGX.util.Geometry',

        'Koala.util.Layer',
        'Koala.view.window.TimeSeriesWindow',
        'Koala.view.window.BarChart'
    ],

    pendingRequest: null,

    /**
     *
     */
    onHoverFeatureClick: function(olFeats) {
        var me = this;
        var viewModel = this.getViewModel();
        var timeSeriesPanel;
        var map = me.getView().getMap();
        var barChartWin;

        if (Ext.isEmpty(olFeats)) {
            return;
        }

        me.distinctGeoms = [];
        var groups = {};
        var tooManyFeatures = false;
        Ext.each(olFeats, function(olFeat) {
            if (me.distinctGeoms.length === 0) {
                me.distinctGeoms.push(olFeat);
                groups[olFeat.get('id')] = [olFeat];
            } else {
                Ext.each(me.distinctGeoms, function(feat) {
                    var distinctFeat_wkt_format = new ol.format.WKT();
                    var olFeat_wkt_format = new ol.format.WKT();
                    var WKT_distinctFeat = distinctFeat_wkt_format.writeGeometry(feat.getGeometry());
                    var WKT_olFeat = olFeat_wkt_format.writeGeometry(olFeat.getGeometry());
                    if (WKT_distinctFeat !== WKT_olFeat) {
                        me.distinctGeoms.push(olFeat);
                        groups[olFeat.get('id')] = [olFeat];
                        if (me.distinctGeoms.length > 3) {
                            me.distinctGeoms = [];
                            groups = {};
                            var mapComp = Ext.ComponentQuery.query('k-component-map')[0];
                            mapComp.removeAllHoverFeatures();
                            tooManyFeatures = true;
                            return false;
                        }
                    } else {
                        groups[feat.get('id')].push(olFeat);
                    }
                });
            }
            if (tooManyFeatures) {
                Ext.Msg.alert(viewModel.get('warning'), viewModel.get('tooManyFeatures'));
                return false;
            }
        }, me);

        // if (me.distinctGeoms.length > 3) {
        //     Ext.Msg.alert(viewModel.get('warning'), viewModel.get('tooManyFeatures'));
        //     return;
        // }

        Ext.each(me.distinctGeoms, function(olFeat) {
            var layer = olFeat.get('layer');
            var idField = Koala.util.Object.getPathStrOr(layer,
                'metadata/layerConfig/olProperties/featureIdentifyField', 'id');

            var featureId = olFeat.get(idField);
            var isCarto = Koala.util.Layer.isCartoWindowLayer(layer);
            var isTimeSeries = Koala.util.Layer.isTimeseriesChartLayer(layer);
            var isBarChart = Koala.util.Layer.isBarChartLayer(layer);

            if (isCarto) {
                var cartoWindowId = layer.get('name') + '__' + featureId;
                var cartoWindow = Ext.ComponentQuery.query(
                    'k-component-cartowindow[cartoWindowId='+cartoWindowId+']')[0];
                if (cartoWindow) {
                    BasiGX.util.Animate.shake(cartoWindow);
                } else {
                    Ext.create('Koala.view.component.CartoWindow', {
                        map: map,
                        cartoWindowId: cartoWindowId,
                        layer: layer,
                        feature: olFeat,
                        featureGroup: groups[olFeat.get('id')],
                        renderTo: Ext.getBody()
                    });
                }
            } else if (isTimeSeries || isBarChart) {
                if (isTimeSeries) {
                    if (!timeSeriesPanel) {
                        // if no timeseries window exist, create one
                        timeSeriesPanel = Koala.util.Chart.openTimeseries(olFeat);
                    } else {
                        // just add any further series to the existing window
                        timeSeriesPanel.getController().updateTimeSeriesChart(layer, olFeat);
                    }
                }
                // Open new BarchartWindow for each feature. Move if overlapping.
                if (isBarChart) {
                    barChartWin = me.openBarChartWindow(olFeat);
                    me.offsetBarChartWin(barChartWin);
                    Ext.WindowManager.bringToFront(barChartWin);
                }
            } else {
                Ext.log.warn('No timeseries- or barchart-config found.');
            }
        });

    },
    /**
     * offsets a BarChart-window. Reference is either the BarChart-window
     * closest to the lower right corner, or the window itself (if no BarChart-window is open).
     * That way a BarChart-window is also displaced to a TimeSeries-window, which always opens at
     * the default position.
     *@param Object (Ext.window.Window) winToOffset
     */
    offsetBarChartWin: function(winToOffset) {
        var x, y,
            allWinX = [],
            allWinY = [];
        Ext.WindowManager.each(function(win) {
            if (win instanceof Koala.view.window.BarChart) {
                allWinX.push(win.getPosition()[0]);
                allWinY.push(win.getPosition()[1]);
            }
        });
        if (allWinX.length > 0 || allWinY.length > 0) {
            x = Ext.Array.max(allWinX) + 20;
            y = Ext.Array.max(allWinY) + 30;

            winToOffset.setPosition(x, y);
        }
    },

    onDroppedExternalVectorData: function(event) {
        Ext.create('Ext.window.Window', {
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
        var me = this;
        var olLayer = olFeat.get('layer');
        var win = me.createBarChartWindow(olLayer);
        win.getController().createOrUpdateChart(olLayer, olFeat);
        return win;
    },

    /**
     *
     */
    createBarChartWindow: function(olLayer) {
        var chartConfig = olLayer.get('barChartProperties');
        var addFilterForm = !Ext.isEmpty(chartConfig.allowFilterForm) ?
            Koala.util.String.getBool(chartConfig.allowFilterForm) : true;

        var win = Ext.create('Koala.view.window.BarChart', {
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
            return extent.join('-');
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
