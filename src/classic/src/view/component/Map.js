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
 * @class Koala.view.component.Map
 */
Ext.define('Koala.view.component.Map', {
    extend: 'BasiGX.view.component.Map',
    xtype: 'k-component-map',

    requires: [
        'Koala.view.component.MapController',
        'Koala.view.component.MapModel'
    ],

    config: {
        hoverFeatureClickBufferMS: 250,
        // Hotfix for Ticket #1720
        pointerRestInterval: (Ext.isChrome && Ext.browser.version.major < 58) ? 500 : 20
    },

    /**
     *
     */
    controller: 'k-component-map',

    viewModel: 'k-component-map',

    listeners: {
        afterrender: 'registerDropHandler'
    },

    initComponent: function() {
        var me = this;
        var staticMe = Koala.view.component.Map;
        var container = me.up('basigx-panel-mapcontainer');
        var map = me.getMap();
        me.callParent();

        // this event originates from an ol3 collection event and may be called
        // too often… so we call it buffered after the specified amount of MS.
        me.on('hoverfeaturesclick', me.onHoverFeatureClick, me, {
            buffer: me.getHoverFeatureClickBufferMS()
        });

        var hoverPlugin = me.getPlugin('hoverBfS');
        if (hoverPlugin) {
            var selStyleFunction = staticMe.styleFromGnos('selectStyle');
            var highlightStyleFunction = staticMe.styleFromGnos('hoverStyle');
            var interval = me.getPointerRestInterval();
            hoverPlugin.setPointerRestInterval(interval);
            hoverPlugin.selectStyleFunction = selStyleFunction;
            // overriding the selectstylefunction aint enough,
            // so we register to hoverfeatureclick handler to
            // apply the selectStyleFunction
            me.on('hoverfeaturesclick', function(features) {
                Ext.each(features, function(f) {
                    f.setStyle(selStyleFunction(f));
                });
            });
            hoverPlugin.highlightStyleFunction = highlightStyleFunction;
        }

        // setup all the projections required for the application
        proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
        proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs');
        proj4.defs('EPSG:25832','+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

        ol.proj.proj4.register(proj4);

        // TODO We should move this to another place.
        ol.proj.get('EPSG:25832').setExtent([-1878007.03, 3932282.86, 831544.53, 9437501.55]);

        // MousePosition Control
        var mousePositionControl = new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(2),
            //projection: map.getView().getProjection(),
            projection: ol.proj.get('EPSG:4326'),
            className: 'mouse-position-control'
        });
        map.addControl(mousePositionControl);

        container.on('overviewmapToggle', function(overviewMap) {
            var visible = overviewMap.isVisible();
            var mpDiv = Ext.dom.Query.select('.mouse-position-control')[0];
            mpDiv.className = visible ? 'mouse-position-control adjusted' : 'mouse-position-control';
        });

        me.setupDragDropFunctionality();
        me.registerLocalStorageExtractor();
    },

    /**
     * Shows the import window for pre-loaded features.
     *
     * @param {ol.Feature[]} features the features to import
     */
    addData: function(features, projection) {
        Ext.create('Ext.window.Window', {
            title: 'Upload local data',
            autoShow: true,
            items: [{
                xtype: 'k-form-importLocalData',
                viewModel: {
                    data: {
                        features: features,
                        projection: projection || '',
                        layerName: 'Layer'
                    }
                }
            }]
        });
    },

    /**
     * Look into the local storage periodically to auto-import GeoJSON data.
     */
    registerLocalStorageExtractor: function() {
        var me = this;
        window.setInterval(function() {
            var data = localStorage.getItem('gis-transfer-data');
            if (data) {
                //localStorage data is always geojson format
                //hence its projection is 'EPSG:4326'
                me.addData(data, 'EPSG:4326');
                localStorage.removeItem('gis-transfer-data');
                localStorage.removeItem('gis-transfer-data-transfer-date');
            }
        }, 2000);
    },

    /**
     * Registers another drop handler on the ol.interaction.DragAndDrop's
     * drop zone in order to handle string based drag'n'drop events.
     */
    registerDropHandler: function() {
        var me = this;
        this.map.getViewport().addEventListener('drop', function(event) {
            if (event.dataTransfer.files.length === 0) {
                var items = event.dataTransfer.items;
                for (var i = 0; i < items.length; ++i) {
                    if (items[i].type === 'text/plain' || items[i].type === 'application/json' || items[i].type === 'application/xml') {
                        items[i].getAsString(function(text) {
                            me.addData(text);
                        });
                    }
                }
            }
        });
    },

    setupDragDropFunctionality: function() {
        var me = this;
        var controller = me.getController();
        var dragAndDropInteraction = new ol.interaction.DragAndDrop({
            formatConstructors: [
                ol.format.GeoJSON,
                ol.format.KML,
                ol.format.GML3
            ]
        });
        dragAndDropInteraction.on(
            'addfeatures', controller.onDroppedExternalVectorData, controller
        );
        me.map.addInteraction(dragAndDropInteraction);
    },

    statics: {
        /**
         *
         */
        styleFromGnos: function(styleKey) {
            var fn = function(feature) {
                var styleCfg = feature.get('layer').get(styleKey);
                // evaluate possible template functions with the current feature
                if (Ext.isFunction(styleCfg)) {
                    styleCfg = styleCfg(feature);
                }

                if (styleCfg) {
                    var sArray = styleCfg.split(',');
                    var color = sArray[0];
                    var shape = sArray[1];

                    if (shape === 'rect') {
                        var width = sArray[2];
                        var height = sArray[3];

                        var c = document.createElement('canvas');
                        c.setAttribute('width', width);
                        c.setAttribute('height', height);
                        var ctx = c.getContext('2d');
                        ctx.fillStyle = color;
                        ctx.fillRect(0,0,width,height);
                        var dataUrl = c.toDataURL();
                        c = null;

                        return [
                            new ol.style.Style({
                                image: new ol.style.Icon({
                                    size: [width, height],
                                    opacity: 0.5,
                                    src: dataUrl
                                })
                            })
                        ];
                    } else if (shape === 'circle') {
                        var radius = sArray[2];

                        return [new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: radius,
                                fill: new ol.style.Fill({
                                    color: color
                                }),
                                stroke: new ol.style.Stroke({
                                    color: 'gray'
                                })
                            })
                        })];
                    } else if (shape === 'polygon') {
                        var strokeWidth = sArray[2];

                        return [new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: color
                            }),
                            stroke: new ol.style.Stroke({
                                color: 'gray',
                                width: strokeWidth || 1
                            })
                        })];
                    }
                } else {
                    var fill = new ol.style.Fill({
                        color: 'rgba(0, 0, 255, 0.6)'
                    });
                    var stroke = new ol.style.Stroke({
                        color: 'blue',
                        width: 1.25
                    });
                    return [new ol.style.Style({
                        image: new ol.style.Circle({
                            fill: fill,
                            stroke: stroke,
                            radius: 6
                        }),
                        fill: fill,
                        stroke: stroke
                    })
                    ];
                }
            };
            return fn;
        }
    },

    /**
     * Removes the previousy selected features from the select interaction.
     */
    removeAllHoverFeatures: function() {
        var p = this.getPlugin('hoverBfS');
        var i = p && p.getHoverVectorLayerInteraction();
        var f = i && i.getFeatures();
        if (f) {
            f.clear();
        }
    },

    /**
     * We overwrite this method from the superclass.
     * We simply call the controller which contains the logic.
     */
    onHoverFeatureClick: function(olFeatures) {
        var me = this;
        var controller = me.getController();
        controller.onHoverFeatureClick(olFeatures);
    }

});
