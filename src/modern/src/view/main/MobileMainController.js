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
 * @class Koala.view.main.MobileMainController
 */
Ext.define('Koala.view.main.MobileMainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mobile-main',

    requires: [
        'Koala.util.Fullscreen'
    ],

    layersAlreadyAdded: [],

    chartingLayer: null,

    /**
     * TODO needed only while developing, will eventually be removed
     */
    addDummyDevLayers: function() {
        var layers = [
            //'08e36567-cf9a-4e22-8774-e83a3452da7b' // odl_brutto_10min
            //'f917f393-fb9b-4345-99cf-8d2fcfab8d3d' // niederschlag_24h
            //'83cb1604-3d8c-490b-b807-5e7cb17f3b22' // odl_brutto_24h
            //'45dd5d65-630a-42d9-9f86-6c718dab0412' // barchart layer
            // ,'25e17589-6694-4d58-8efb-0c400415aec3' // vector layer
        ];
        Ext.each(layers, function(uuid) {
            Koala.util.Layer.addLayerByUuid(uuid);
        });
    },

    onMainPanelPainted: function() {
        var me = this;
        var view = me.getView();
        // me.addDummyDevLayers(); // TODO remove!!!!!!
        me.setupChartingLayerChangeHandler();
        me.setupMapClickHandler();

        //open help initially if user is neither "ruf", "imis" nor "bfs"
        if (!Koala.util.AppContext.intersectsImisRoles(['ruf', 'imis', 'bfs'])) {
            view.down('k-panel-mobilehelp').show();
        }
    },

    setupChartingLayerChangeHandler: function() {
        var me = this;
        var legends = Ext.ComponentQuery.query('k-panel-mobilelegend');
        Ext.each(legends, function(legend) {
            legend.on('chartinglayerchange', me.onChartingLayerChanged, me);
        });
        me.on('destroy', me.teardownChartingLayerChangeHandler, me);
    },

    teardownChartingLayerChangeHandler: function() {
        var me = this;
        var legends = Ext.ComponentQuery.query('k-panel-mobilelegend');
        Ext.each(legends, function(legend) {
            legend.un('chartinglayerchange', me.onChartingLayerChanged, me);
        });
    },

    setupMapClickHandler: function() {
        var me = this;
        var mapComponent = this.getView().down('basigx-component-map');
        var map = mapComponent.getMap();
        map.on('singleclick', me.onMapSingleClick, me);
        me.on('destroy', me.teardownMapClickHandler, me);
    },

    teardownMapClickHandler: function() {
        var me = this;
        var mapComponent = this.getView().down('basigx-component-map');
        var map = mapComponent.getMap();
        map.un('singleclick', me.onMapSingleClick, me);
    },

    /**
     * Handle the case when a singleclick / tap was fired on the map.
     */
    onMapSingleClick: function(evt) {
        var me = this;
        var coordinate = evt.coordinate;
        var mapProj = evt.map.getView().getProjection().getCode();

        //show geographic coords regardless og map projection
        var lonlat_coord = ol.proj.transform(coordinate,mapProj,'EPSG:4326');
        var lon = parseFloat(lonlat_coord[0]).toFixed(2);
        var lat = parseFloat(lonlat_coord[1]).toFixed(2);

        // Coordinate Info
        Ext.toast({
            message: 'Longitude , Latitude' + '<br/>' + lon + ' , ' + lat + ' ',
            timeout: 3000
        });

        if (me.pendingRequest) {
            me.pendingRequest.abort();
        }
        var LayerUtil = Koala.util.Layer;
        if (!me.chartingLayer) {
            // we may be want show tooltips?
            return;
        }
        if (!LayerUtil.isChartableLayer(me.chartingLayer)) {
            // Should never happen™
            Ext.log.warn('Illegal chartable layer defined');
            return;
        }

        if (LayerUtil.isWmsLayer(me.chartingLayer)) {
            var mapView = evt.map.getView();
            var resolution = mapView.getResolution();
            var projCode = mapView.getProjection().getCode();
            // source is either a TileWMS or ImageWMS
            var urlParams = {
                'INFO_FORMAT': 'application/json',
                'FEATURE_COUNT': '1'
            };
            var url = me.chartingLayer.getSource().getGetFeatureInfoUrl(
                coordinate, resolution, projCode, urlParams
            );
            me.pendingRequest = Ext.Ajax.request({
                url: url,
                scope: me,
                callback: function() {
                    me.pendingRequest = null;
                },
                success: me.onWmsGetFeatureSuccess,
                failure: me.onWmsGetFeatureFailure
            });
        } else if (LayerUtil.isVectorLayer(me.chartingLayer)) {
            var source = me.chartingLayer.getSource();
            var closestFeature = source.getClosestFeatureToCoordinate(coordinate);
            var extentFromCoord = me.extentFromCoordinate(coordinate, resolution);
            var featuresInExtent = source.getFeaturesInExtent(extentFromCoord);
            var closestInExtent = false;
            Ext.each(featuresInExtent, function(featureInExtent) {
                if (featureInExtent === closestFeature) {
                    closestInExtent = true;
                    return false; // break early
                }
            });
            if (closestInExtent) {
                me.chartableFeatureFound(closestFeature);
            }
        }
    },

    /**
     * A utility helper to create an extent in coordinate units for checking if
     * the nearest vector feature of a clicked coordinate is actually really
     * near considering the current map views resolution.
     *
     * @param {ol.Coordinate} coord The coordinate to build the extent around.
     * @param {Number} resolution The current map view resolution.
     * @return {ol.Extent} The created extent.
     */
    extentFromCoordinate: function(coord, resolution) {
        var bufferPx = 5;
        var bufferinCoordUnits = bufferPx * resolution;
        var extent = [coord[0], coord[1], coord[0], coord[1]];
        return ol.extent.buffer(extent, bufferinCoordUnits);
    },

    /**
     * Handles success when fetching WMS GetFeatureInfo requests by parsing the
     * result and eventually calling into #chartableFeatureFound to create or
     * update a chart
     *
     * @param {XMLHttpRequest} resp The response object.
     */
    onWmsGetFeatureSuccess: function(resp) {
        var me = this;
        var mapComponent = this.getView().down('basigx-component-map');
        var map = mapComponent.getMap();
        var mapProjection = map.getView().getProjection();
        var geojsonFormat = new ol.format.GeoJSON();
        var respFeatures = geojsonFormat.readFeatures(
            resp.responseText, {
                featureProjection: mapProjection
            }
        );
        if (respFeatures && respFeatures[0]) {
            me.chartableFeatureFound(respFeatures[0]);
        }
    },

    /**
     * Examines the passed chartable feature (from WMS GFI or a vector feature)
     * and opens/updates the correct chart.
     *
     * @param {ol.Feature} feature The chartable feature.
     */
    chartableFeatureFound: function(feature) {
        var me = this;
        var view = me.getView();
        var panel;
        var isTimeSeries = Koala.util.Layer.isTimeseriesChartLayer(me.chartingLayer);
        var isBarChart = Koala.util.Layer.isBarChartLayer(me.chartingLayer);

        var carouselPanel = view.down('panel[name=cartopanel]');
        carouselPanel.show();
        var carousel = view.down('carousel');
        var oldItemCount = carousel.getItems().length;
        var charts = [];
        // handle barchart
        if (isBarChart) {
            panel = Ext.create({
                xtype: 'k-panel-barchart'
            });
            carousel.add(panel);
            panel.getController().updateFor(me.chartingLayer, feature);
            charts.push(panel.down('d3-barchart'));
        }
        // handle timeseries
        if (isTimeSeries) {
            // TODO think about how to properly update timeseries without
            // confusion for the users
            panel = Ext.create({
                xtype: 'k-panel-timeserieschart'
            });
            carousel.add(panel);
            panel.getController().updateFor(me.chartingLayer, feature);
            charts.push(panel.down('d3-chart'));
        }
        Ext.each(charts, function(chart) {
            var grid = me.createGridTab(chart);
            panel = Ext.create({
                xtype: 'panel'
            });
            carousel.add(panel);
            panel.add(grid);
        });

        panel = carousel.down('panel[name=htmlpanel]');
        if (Koala.util.Layer.isHtmlLayer(me.chartingLayer)) {
            panel = Ext.create({
                xtype: 'panel'
            });
            var html = Koala.util.Carto.getHtmlData(me.chartingLayer, feature);
            panel.setHtml(html);
            carousel.add(panel);
        }
        panel = carousel.down('panel[name=hoverpanel]');
        if (me.chartingLayer.get('hoverTpl')) {
            panel = Ext.create({
                xtype: 'panel'
            });
            var template = Koala.util.Object.getPathStrOr(me.chartingLayer,
                'metadata/layerConfig/olProperties/hoverTpl');
            var hover = Koala.util.String.replaceTemplateStrings(template,
                feature);
            panel.setHtml(hover);
            carousel.add(panel);
        }
        // removeAll is not used, as it breaks the carousel
        // This may look odd, but just removes all old panels and leaves in
        // the new ones plus the indicator child
        carousel.setActiveItem(oldItemCount - 1);
        for (var i = 1; i < oldItemCount; ++i) {
            var item = carousel.removeAt(1);
            item.destroy();
        }
    },

    /**
     * Create the tab which contains the table content as grid and adds it to the
     * tabwindow.
     */
    createGridTab: function(chart) {
        var me = this;
        if (!chart) {
            return;
        }

        Ext.create('Ext.data.Store', {
            storeId: 'GridTabStore',
            autoLoad: true,
            data: []
        });

        var gridInTab = {
            xtype: 'grid',
            width: '100%',
            height: '90%',
            header: false,
            store: Ext.data.StoreManager.lookup('GridTabStore'),
            // plugins: 'gridfilters',// not available in modern framework
            chartElement: chart,
            listeners: {
                painted: function() {
                    chart.getController().on('chartdataprepared', function() {
                        var chartController = this.chartElement.getController();
                        var gridFeatures = chartController.gridFeatures;
                        this.updateGrid(gridFeatures);
                    }, this, {single: true});
                },
                itemtouchstart: function() {
                    this.up('carousel').lock();
                },
                itemtouchend: function() {
                    this.up('carousel').unlock();
                }
            },
            updateGrid: function(gridFeatures) {
                me = this;
                var types = {};
                var columns = [];
                var fields = [];
                var data = [];
                var store = me.getStore();

                Ext.each(gridFeatures, function(feat) {
                    Ext.iterate(feat.properties, function(propName, prop) {
                        var type = null;
                        var tempProp;

                        //store recognizes 'id' -> no duplicates allowed
                        if (propName.toLowerCase() === 'id') {
                            tempProp = feat.properties[propName];
                            delete feat.properties[propName];
                            propName = 'elementId';
                            feat.properties[propName] = tempProp;
                        }
                        //define data types
                        if (typeof prop === 'number') {
                            type = 'number';
                        } else if (typeof prop === 'string') {
                            if (parseFloat(prop[0])) {
                                var dateVal = moment(prop, moment.ISO_8601, true);
                                type = (dateVal.isValid()) ? 'date' : 'string';
                            } else {
                                type = 'string';
                            }
                        }
                        if (!types[propName]) {
                            types[propName] = [type];
                        } else {
                            types[propName].push(type);
                        }
                    });
                    data.push(feat.properties);
                });
                //field and column assignment
                Ext.iterate(types, function(propName, prop) {
                    var field = {
                        name: propName,
                        type: ''
                    };
                    var column = {
                        text: propName,
                        dataIndex: propName,
                        itemId: propName,
                        filter: {
                            type: ''
                        }
                    };
                    var uniqueTypes = Ext.Array.unique(prop);
                    if (uniqueTypes.length > 1) {
                        uniqueTypes = Ext.Array.remove(uniqueTypes, null);
                    }
                    uniqueTypes = (uniqueTypes.indexOf('string') > -1) ? ['string'] : uniqueTypes;
                    field.type = column.filter.type = uniqueTypes[0];

                    if (field.type === 'date') {
                        column.renderer = function(val) {
                            var dateVal = moment(val, moment.ISO_8601, true);
                            return Koala.util.Date.getFormattedDate(dateVal);
                        };
                    }

                    fields.push(field);
                    columns.push(column);
                });
                me.setColumns(columns);
                store.setFields(fields);
                store.loadData(data, false);
            }
        };
        return gridInTab;
    },

    /**
     * Handles errors when fetching WMS GetFeatureInfo requests fail and weren't
     * explicitly aborted.
     *
     * @param {XMLHttpRequest} resp The response object.
     */
    onWmsGetFeatureFailure: function(resp) {
        if (!resp.aborted) {
            Ext.log.error('WMS GetFeatureInfo failure', resp);
        }
    },

    /**
     * Stores the new charting layer and ensure that all existing charts are
     * removed from the fiew.
     *
     * @param {ol.layer.Layer} newChartingLayer The new layer for charting.
     */
    onChartingLayerChanged: function(newChartingLayer) {
        var me = this;
        var view = me.getView();
        var charts = view.query('d3-chart');
        // store the new charting layer
        me.chartingLayer = newChartingLayer;
        // remove existing charts
        Ext.each(charts, function(chart) {
            chart.up().remove(chart);
        });
    },

    /**
     * Toggle fullscreen mode.
     */
    toggleFullscreen: function(btn) {
        Koala.util.Fullscreen.toggleFullscreen();

        var btnClass = Koala.util.Fullscreen.isInFullscreen() ?
            'fa-compress' : 'fa-expand';
        btn.setHtml('<i class="fa ' + btnClass + ' fa-2x"></i>');
    }

});
