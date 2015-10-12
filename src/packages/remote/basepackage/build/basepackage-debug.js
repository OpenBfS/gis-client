Ext.define('Basepackage.plugin.Hover', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.hover',
    pluginId: 'hover',
    inheritableStatics: {
        HOVER_OVERLAY_IDENTIFIER_KEY: 'name',
        HOVER_OVERLAY_IDENTIFIER_VALUE: 'featureinfooverlay'
    },
    config: {
        pointerRest: true,
        pointerRestInterval: 300,
        pointerRestPixelTolerance: 5,
        featureInfoEpsg: 'EPSG:3857',
        hoverVectorLayerSource: null,
        hoverVectorLayer: null,
        hoverVectorLayerInteraction: null
    },
    currentHoverTarget: null,
    pendingRequest: null,
    init: function(cmp) {
        var me = this;
        me.addHoverVectorLayerSource();
        me.addHoverVectorLayer();
        me.addHoverVectorLayerInteraction();
        me.setupMapEventListeners();
        this.setCmp(cmp);
        cmp.setPointerRest(this.getPointerRest());
        cmp.setPointerRestInterval(this.getPointerRestInterval());
        cmp.setPointerRestPixelTolerance(this.getPointerRestPixelTolerance());
        cmp.on('pointerrest', me.onPointerRest, me);
        cmp.on('pointerrestout', me.cleanupHoverArtifacts, me);
    },
    /**
     * Adds any relevant listeners on the ol.Map. For now we only ensure that
     * when the top-level layerGroup changes (e.g. by adding or removing a
     * layer), we cleanup any visual artifacts from hovering.
     *
     * @private
     */
    setupMapEventListeners: function() {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        // whenever the layergroup changes, we need to cleanup hover artifacts
        map.on('change:layerGroup', me.cleanupHoverArtifacts, me);
    },
    /**
    *
    */
    addHoverVectorLayerInteraction: function() {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        if (!me.getHoverVectorLayerInteraction()) {
            var interaction = new ol.interaction.Select({
                    multi: true,
                    style: me.clusterSelectStyleFunction,
                    layers: [
                        me.getHoverVectorLayer()
                    ]
                });
            var featureCollecion = interaction.getFeatures();
            featureCollecion.on('add', this.onFeatureClicked, this);
            map.addInteraction(interaction);
            me.setHoverVectorLayerInteraction(interaction);
        }
    },
    /**
    *
    */
    onFeatureClicked: function(olEvt) {
        var me = this;
        var mapComponent = me.getCmp();
        var olFeatures = olEvt.target.getArray();
        mapComponent.fireEvent('hoverfeaturesclick', olFeatures);
    },
    /**
    *
    */
    addHoverVectorLayerSource: function() {
        var me = this;
        if (!me.getHoverVectorLayerSource()) {
            me.setHoverVectorLayerSource(new ol.source.Vector());
        }
    },
    /**
    *
    */
    addHoverVectorLayer: function() {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        var hoverVectorLayer = me.getHoverVectorLayer();
        if (!hoverVectorLayer) {
            hoverVectorLayer = new ol.layer.Vector({
                name: 'hoverVectorLayer',
                source: me.getHoverVectorLayerSource(),
                visible: true
            });
            map.addLayer(hoverVectorLayer);
            me.setHoverVectorLayer(hoverVectorLayer);
        }
        // Set our internal flag to filter this layer out of the tree / legend
        var displayInLayerSwitcherKey = Basepackage.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
        hoverVectorLayer.set(displayInLayerSwitcherKey, false);
    },
    /**
    *
    */
    clearPendingRequests: function() {
        var me = this;
        if (me.pendingRequest) {
            Ext.Ajax.abort(me.pendingRequest);
        }
    },
    /**
    *
    */
    requestAsynchronously: function(url, cb) {
        var me = this;
        me.pendingRequest = Ext.Ajax.request({
            url: url,
            callback: function() {
                me.pendingRequest = null;
            },
            success: cb,
            failure: function(resp) {
                Ext.log.error('Couldn\'t get FeatureInfo', resp);
            }
        });
    },
    cleanupHoverArtifacts: function() {
        var me = this;
        var overlayIdentifierKey = me.self.HOVER_OVERLAY_IDENTIFIER_KEY;
        var overlayIdentifierVal = me.self.HOVER_OVERLAY_IDENTIFIER_VALUE;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        me.clearPendingRequests();
        me.getHoverVectorLayerSource().clear();
        map.getOverlays().forEach(function(o) {
            if (o.get(overlayIdentifierKey) === overlayIdentifierVal) {
                map.removeOverlay(o);
            }
        });
    },
    /**
    */
    onPointerRest: function(evt) {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        var mapView = map.getView();
        var pixel = evt.pixel;
        var hoverLayers = [];
        var hoverFeatures = [];
        me.cleanupHoverArtifacts();
        map.forEachLayerAtPixel(pixel, function(layer) {
            var source = layer.getSource();
            var resolution = mapView.getResolution();
            var projCode = mapView.getProjection().getCode();
            var hoverable = layer.get('hoverable');
            // a layer will NOT be requested for hovering if there is a
            // "hoverable" property set to false. If this property is not set
            // or has any other value than "false", the layer will be
            // requested
            if (hoverable !== false) {
                if (source instanceof ol.source.TileWMS) {
                    //                   me.cleanupHoverArtifacts();
                    var url = source.getGetFeatureInfoUrl(evt.coordinate, resolution, projCode, {
                            'INFO_FORMAT': 'application/json'
                        });
                    me.requestAsynchronously(url, function(resp) {
                        // TODO: replace evt/coords with real response geometry
                        var respFeatures = (new ol.format.GeoJSON()).readFeatures(resp.responseText);
                        me.showHoverFeature(layer, respFeatures);
                        respFeatures[0].set('layer', layer);
                        hoverLayers.push(layer);
                        hoverFeatures.push(respFeatures[0]);
                        me.showHoverToolTip(evt, hoverLayers, hoverFeatures);
                    });
                } else if (source instanceof ol.source.Vector) {
                    // VECTOR!
                    map.forEachFeatureAtPixel(pixel, function(feat) {
                        if (layer.get('type') === "WFS" || layer.get('type') === "WFSCluster") {
                            var hvl = me.getHoverVectorLayer();
                            // TODO This should be dynamically generated
                            // from the clusterStyle
                            hvl.setStyle(me.clusterHighlightStyleFunction);
                        }
                        var featureClone = feat.clone();
                        featureClone.set('layer', layer);
                        hoverLayers.push(layer);
                        hoverFeatures.push(featureClone);
                        me.showHoverFeature(layer, hoverFeatures);
                        me.currentHoverTarget = feat;
                    }, me, function(vectorCand) {
                        return vectorCand === layer;
                    });
                }
            }
        }, this, function(candidate) {
            if (candidate.get('hoverable') || candidate.get('type') === 'WFSCluster') {
                return true;
            } else {
                return false;
            }
        });
        me.showHoverToolTip(evt, hoverLayers, hoverFeatures);
    },
    /**
    *
    */
    showHoverFeature: function(layer, features) {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        Ext.each(features, function(feat) {
            var g = feat.getGeometry();
            if (g) {
                g.transform(me.getFeatureInfoEpsg(), map.getView().getProjection());
            }
            if (!Ext.Array.contains(me.getHoverVectorLayerSource().getFeatures(), feat)) {
                me.getHoverVectorLayerSource().addFeature(feat);
            }
        });
    },
    /**
    *
    */
    showHoverToolTip: function(evt, layers, features) {
        var me = this;
        var overlayIdentifierKey = me.self.HOVER_OVERLAY_IDENTIFIER_KEY;
        var overlayIdentifierVal = me.self.HOVER_OVERLAY_IDENTIFIER_VALUE;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        var coords = evt.coordinate;
        if (layers.length > 0 && features.length > 0) {
            map.getOverlays().forEach(function(o) {
                map.removeOverlay(o);
            });
            var div = Ext.dom.Helper.createDom('<div>');
            div.className = 'feature-hover-popup';
            div.innerHTML = this.getToolTipHtml(layers, features);
            var overlay = new ol.Overlay({
                    position: coords,
                    offset: [
                        10,
                        -30
                    ],
                    element: div
                });
            overlay.set(overlayIdentifierKey, overlayIdentifierVal);
            map.addOverlay(overlay);
        }
    },
    /**
    *
    */
    getToolTipHtml: function(layers, features) {
        var innerHtml = '';
        Ext.each(features, function(feat) {
            var layer = feat.get('layer');
            var hoverfield = layer.get('hoverfield');
            // fallback if hoverfield is not configured
            if (!hoverfield) {
                // try to use "id" as fallback.
                // if "id" is not available, the value will be "undefined"
                hoverfield = 'id';
            }
            innerHtml += '<b>' + layer.get('name') + '</b>';
            // we check for existing feature here as there maybe strange
            // situations (e.g. when zooming in unfavorable situations)
            // where feat is undefined
            if (feat) {
                if (layer.get('type') === 'WFSCluster') {
                    var count = feat.get('count');
                    innerHtml += '<br />' + count + '<br />';
                } else {
                    var hoverfieldValue = feat.get(hoverfield);
                    innerHtml += '<br />' + hoverfieldValue + '<br />';
                }
            }
        });
        return innerHtml;
    },
    clusterHighlightStyleFunction: function(feature) {
        var count = feature.get('count'),
            radius = 14,
            fontSize = 10;
        if (count && count > 10) {
            radius = 25;
            fontSize = 14;
        } else if (count && count < 4) {
            fontSize = 7;
            radius = 8;
        } else if (count) {
            radius = count * 2;
            fontSize = count * 1.3;
        }
        return [
            new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(255, 0, 0, 0.6)"
                }),
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: "rgba(255, 0, 0, 0.6)"
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'gray'
                    })
                }),
                text: new ol.style.Text({
                    text: count > 1 ? count.toString() : '',
                    font: 'bold ' + fontSize * 2 + 'px Arial',
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 1
                    }),
                    fill: new ol.style.Fill({
                        color: 'white'
                    })
                })
            })
        ];
    },
    clusterSelectStyleFunction: function(feature) {
        var count = feature.get('count'),
            radius = 14,
            fontSize = 10;
        if (count && count > 10) {
            radius = 25;
            fontSize = 14;
        } else if (count && count < 4) {
            fontSize = 7;
            radius = 8;
        } else if (count) {
            radius = count * 2;
            fontSize = count * 1.3;
        }
        return [
            new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(0, 0, 255, 0.6)"
                }),
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: "rgba(0, 0, 255, 0.6)"
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'gray'
                    })
                }),
                text: new ol.style.Text({
                    text: count > 1 ? count.toString() : '',
                    font: 'bold ' + fontSize * 2 + 'px Arial',
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 1
                    }),
                    fill: new ol.style.Fill({
                        color: 'white'
                    })
                })
            })
        ];
    },
    hoverClusterFeatures: function(pixel) {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        var wmsHoverPlugin = mapComponent.getPlugin('wmshover');
        var feature = map.forEachFeatureAtPixel(pixel, function(feat) {
                return feat;
            });
        if (feature === me.highlightFeature || !feature) {
            wmsHoverPlugin.cleanupHoverArtifacts();
            return;
        } else {
            var hvl = wmsHoverPlugin.getHoverVectorLayer();
            hvl.setStyle(me.clusterHighlightStyleFunction);
            var hvlSource = wmsHoverPlugin.getHoverVectorLayerSource();
            wmsHoverPlugin.cleanupHoverArtifacts();
            hvlSource.addFeature(feature);
            me.highLightedFeature = feature;
        }
    }
});

/**
 * Plugin used for serversided (GeoServer SQL-View) Clustering. And clientsided
 * (OL3) styling.
 */
Ext.define('Basepackage.plugin.WfsCluster', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.wfscluster',
    pluginId: 'wfscluster',
    init: function(cmp) {
        var me = this;
        this.setCmp(cmp);
        me.setUpClusterLayers(this.getCmp());
    },
    setUpClusterLayers: function(mapComponent) {
        var me = this;
        var map = mapComponent.getMap();
        var allLayers = Basepackage.util.Layer.getAllLayers(map);
        var clusterLayers = [];
        Ext.each(allLayers, function(layer) {
            if (layer.get('type') === "WFSCluster") {
                // register visibility listener to load the features when
                // layer is toggled in tree, which is not detected by the
                // maps moveend listener
                // TODO: check why this gets fired 2 times -> geoext?!!
                if (!layer.visibilityListener) {
                    layer.on("change:visible", function(evt) {
                        if (evt.target.getVisible()) {
                            me.loadClusterFeatures(layer);
                        }
                    });
                }
                clusterLayers.push(layer);
                if (layer.get('olStyle')) {
                    layer.setStyle(layer.get('olStyle'));
                } else {
                    layer.setStyle(me.clusterStyleFuntion);
                }
            }
        });
        if (clusterLayers.length > 0) {
            // on every map move
            map.on('moveend', function() {
                me.loadClusterFeatures(clusterLayers);
            }, me);
        }
    },
    clusterStyleFuntion: function(feature) {
        var layerName;
        if (feature.getId()) {
            layerName = feature.getId().split(".")[0];
        } else {
            layerName = feature.get('layerName');
        }
        var layer = Basepackage.util.Layer.getLayerByName(layerName);
        var count = feature.get('count'),
            radius, fontSize;
        if (count > 10) {
            radius = 25;
            fontSize = 14;
        } else if (count < 4) {
            fontSize = 7;
            radius = 8;
        } else {
            radius = count * 2;
            fontSize = count * 1.3;
        }
        return [
            new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    // opacity: 0.6,
                    fill: new ol.style.Fill({
                        color: layer.get('clusterColorString')
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'gray'
                    })
                }),
                text: new ol.style.Text({
                    text: count > 1 ? count.toString() : '',
                    font: 'bold ' + fontSize * 2 + 'px Arial',
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 1
                    }),
                    fill: new ol.style.Fill({
                        color: 'white'
                    })
                })
            })
        ];
    },
    /**
     * The wfscluster layerType expects a geoserver view similar
     * as descibed on https://wiki.intranet.terrestris.de/doku.php?id=clustering
     *
     * TODO: Move this somewhere more reusable, e.g. to basepackage
     */
    loadClusterFeatures: function(clusterLayers) {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        if (map && map.getView() && map.getView().getResolution() && map.getSize()) {
            var res = map.getView().getResolution();
            var extent = map.getView().calculateExtent(map.getSize());
            // the factor which describes the distance used
            // to decide when to cluster. Unit is very
            // roughly ~meters.
            var factor = Math.round(res * 70);
            // when reaching the lower limit of 250, reduce /
            // disable clustering to see the real features
            if (factor < 250) {
                factor = 1;
            }
            Ext.each(clusterLayers, function(layer) {
                if (layer.getVisible()) {
                    var featureType = layer.get('featureType');
                    Ext.Ajax.request({
                        url: "../../geoserver.action?service=WFS&version=1.0.0&request=GetFeature&" + "typeName=" + featureType + "&" + "outputFormat=application/json&" + "bbox=" + extent.join(",") + "&" + "viewParams=resolutioninm:" + factor + ";" + "bboxllx:" + extent[0] + ";" + "bboxlly:" + extent[1] + ";" + "bboxurx:" + extent[2] + ";" + "bboxury:" + extent[3],
                        success: function(response) {
                            var feats = response.responseText;
                            var f = new ol.format.GeoJSON().readFeatures(feats);
                            layer.getSource().clear();
                            layer.getSource().addFeatures(f);
                        },
                        failure: function() {
                            Ext.log.error("Failure on load of cluster features");
                        }
                    });
                }
            });
        }
    }
});

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
Ext.define('Basepackage.util.Animate', {
    statics: {
        shake: function(component, duration, amplitude) {
            duration = duration || 200;
            amplitude = amplitude || 5;
            var startX = component.getX();
            component.animate({
                duration: duration,
                keyframes: {
                    0: {
                        x: startX + amplitude
                    },
                    25: {
                        x: startX - amplitude
                    },
                    50: {
                        x: startX + amplitude
                    },
                    75: {
                        x: startX - amplitude
                    },
                    100: {
                        x: startX
                    }
                }
            });
        },
        flashFeature: function(feature, duration) {
            var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
            var start = new Date().getTime();
            var listenerKey;
            function animate(event) {
                var vectorContext = event.vectorContext;
                var frameState = event.frameState;
                var flashGeom = feature.getGeometry().clone();
                var elapsed = frameState.time - start;
                var elapsedRatio = elapsed / duration;
                // radius will be 5 at start and 30 at end.
                var radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
                var opacity = ol.easing.easeOut(1 - elapsedRatio);
                var flashStyle = new ol.style.Circle({
                        radius: radius,
                        snapToPixel: false,
                        stroke: new ol.style.Stroke({
                            color: 'rgba(255, 0, 0, ' + opacity + ')',
                            width: 4,
                            opacity: opacity
                        })
                    });
                vectorContext.setImageStyle(flashStyle);
                vectorContext.drawPointGeometry(flashGeom, null);
                if (elapsed > duration) {
                    ol.Observable.unByKey(listenerKey);
                    return;
                }
                // tell OL3 to continue postcompose animation
                frameState.animate = true;
            }
            listenerKey = map.on('postcompose', animate);
            return listenerKey;
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Layer Util
 *
 * Some methods to work with ol-layers
 *
 */
Ext.define('Basepackage.util.Layer', {
    statics: {
        KEY_DISPLAY_IN_LAYERSWITCHER: 'bp_displayInLayerSwitcher',
        /**
         * Method gets an ol layer by the given name
         *
         * @param {String} layername - the layers name
         * @param {ol.Collection} collection - optional collection to search in
         * @returns {ol.Layer} matchingLayer - the ol3-layer
         */
        getLayerByName: function(layername, collection) {
            var me = this,
                matchingLayer, layers;
            if (!Ext.isEmpty(collection)) {
                layers = collection.getArray ? collection.getArray() : collection;
            } else {
                var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
                layers = map.getLayers().getArray();
            }
            Ext.each(layers, function(layer) {
                if (matchingLayer) {
                    return false;
                }
                if (layer.get('name') === layername && layer instanceof ol.layer.Base) {
                    matchingLayer = layer;
                    return false;
                } else if (layer instanceof ol.layer.Group) {
                    matchingLayer = me.getLayerByName(layername, layer.getLayers());
                }
            });
            return matchingLayer;
        },
        /**
         * Method gets an ol layer by the given featureType
         *
         * @param {String} featureType - the layers featureType
         * @param {ol.Collection} collection - optional collection to search in
         * @returns {ol.Layer} matchingLayer - the ol3-layer
         */
        getLayerByFeatureType: function(featureType, collection) {
            var me = this,
                matchingLayer, layers;
            if (!Ext.isEmpty(collection)) {
                layers = collection.getArray ? collection.getArray() : collection;
            } else {
                var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
                layers = map.getLayers().getArray();
            }
            Ext.each(layers, function(layer) {
                if (matchingLayer) {
                    return false;
                }
                if (layer.get('featureType') && layer.get('featureType') === featureType) {
                    matchingLayer = layer;
                    return false;
                } else if (layer.getSource && layer.getSource().getParams && layer.getSource().getParams().LAYERS === featureType && layer instanceof ol.layer.Base) {
                    matchingLayer = layer;
                    return false;
                } else if (layer instanceof ol.layer.Group) {
                    matchingLayer = me.getLayerByFeatureType(featureType, layer.getLayers());
                }
            });
            return matchingLayer;
        },
        /**
         * Returns all layers of an map. Even the hidden ones.
         *
         *  @param {ol.Map} map
         *  @returns {Array} allLayers - An array of all Layers.
         */
        getAllLayers: function(map) {
            var layers = map.getLayers();
            var me = this;
            var allLayers = [];
            layers.forEach(function(layer) {
                if (layer instanceof ol.layer.Group) {
                    Ext.each(me.getAllLayers(layer), function(layeri) {
                        allLayers.push(layeri);
                    });
                }
                allLayers.push(layer);
            });
            return allLayers;
        },
        /**
         * Returns all visible layers of an map.
         *
         *  @param {ol.layerCollection/ol.Map} collection
         *  @returns {Array} visibleLayers - An array of the visible Layers.
         */
        getVisibleLayers: function(collection) {
            var me = this;
            var layers = me.getAllLayers(collection);
            var visibleLayers = [];
            Ext.each(layers, function(layer) {
                if (layer.get('visible') && layer.get('routingId') && !layer.get('isSliderLayer')) {
                    visibleLayers.push(layer);
                }
            });
            return visibleLayers;
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Application Util
 *
 * Some methods to work with application
 *
 */
Ext.define('Basepackage.util.Application', {
    requires: [
        'Basepackage.util.Layer'
    ],
    statics: {
        getAppContext: function() {
            var mapComponent = Ext.ComponentQuery.query('base-component-map')[0];
            if (mapComponent && mapComponent.appContext) {
                return mapComponent.appContext.data.merge;
            } else {
                return null;
            }
        },
        getRoute: function() {
            var mapComponent = Ext.ComponentQuery.query('base-component-map')[0];
            var map = mapComponent.getMap();
            var zoom = map.getView().getZoom();
            var center = map.getView().getCenter().toString();
            var visibleLayers = Basepackage.util.Layer.getVisibleLayers(map);
            var visibleLayerRoutingIds = [];
            Ext.each(visibleLayers, function(layer) {
                visibleLayerRoutingIds.push(layer.get('routingId'));
            });
            var hash = 'center/' + center + '|zoom/' + zoom + '|layers/' + visibleLayerRoutingIds.toString();
            return hash;
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * ConfigParser Util
 *
 * parses an application context in JSON Format
 * in order to generate ol3 based layers and map with the given configuration.
 * Currently, only the SHOGun 1 syntax a.k.a. OpenLayers 2 is supported
 *
 * Example appContext response from SHOGun 1:

        {
            "data": {
                "merge": {
                    "id": 3841,
                    "created_at": "04.05.2015 12:05:29",
                    "updated_at": "04.05.2015 12:05:29",
                    "app_user": "default",
                    "name": "test",
                    "language": "DE",
                    "open": false,
                    "active": true,
                    "css": "ext-all.css",
                    "description": null,
                    "shortdescription": null,
                    "url": "client/gisclient/index-dev.html",
                    "startCenter": "385067,5535472",
                    "startZoom": "0",
                    "startResolution": "560",
                    "startBbox": "-106720,4973280,1040160,6406880",
                    "specialinstance": false,
                    "zoomslider": true,
                    "applicationheader": true,
                    "initiallegendvisibility": true,
                    "editableForCurrentUser": false,
                    "initiallyactivetoolpertab": "t_pan_button",
                    "initialwestpanelstate": 300,
                    "initialstatusbarstate": "full",
                    "mapLayers": [
                        {
                            "id": 230,
                            "created_at": "16.03.2015 11:55:48",
                            "updated_at": "16.03.2015 11:55:48",
                            "app_user": "auto-create-on-init",
                            "name": "(mainz) Klimatische Wasserbilanz",
                            "type": "WMS",
                            "isBaseLayer": false,
                            "alwaysInRange": null,
                            "visibility": true,
                            "displayInLayerSwitcher": true,
                            "attribution": null,
                            "gutter": null,
                            "projection": null,
                            "units": null,
                            "scales": null,
                            "resolutions": null,
                            "maxExtent": null,
                            "minExtent": null,
                            "maxResolution": null,
                            "minResolution": null,
                            "maxScale": null,
                            "minScale": null,
                            "numZoomLevels": null,
                            "displayOutsideMaxExtent": false,
                            "transitionEffect": null,
                            "metadata": [],
                            "groups": [
                                20,
                                19,
                                23
                            ],
                            "owner": null,
                            "additionalOwners": [],
                            "url": "/GDAWasser/geoserver.action",
                            "layers": "GDA_Wasser:WRRL_WASSERBILANZ_EINSTUFUNG",
                            "transparent": true,
                            "singleTile": false,
                            "ratio": null,
                            "format": "image/png8",
                            "language": "de",
                            "description": null,
                            "exportable": true,
                            "queryableInfoFormat": null,
                            "editableForCurrentUser": false,
                            "sysLayer": true,
                            "digiLayer": false,
                            "specialLayer": false,
                            "specialLayerUrlTemplate": null,
                            "specialLayerWinWidth": null,
                            "specialLayerWinHeight": null,
                            "hoverField": "{{GEMEINDE_BEZ}}",
                            "dataLayerWindowTitle": null,
                            "layerStyleConfigurable": null,
                            "temporaryLayer": false,
                            "rasterLayer": false,
                            "rasterLayerFeatureInfo": null,
                            "dataLayer": false,
                            "waterCourseLevel": 0,
                            "geometryType": null,
                            "layerGroupName": null,
                            "tiled": true
                        }
                    ],
                    "grantedOverviewMapLayers": null,
                    "overviewMapLayers": [],
                    "grantedMapLayers": null,
                    "mapConfig": {
                        "id": 13,
                        "created_at": "16.03.2015 11:55:49",
                        "updated_at": "16.03.2015 11:55:49",
                        "app_user": "auto-create-on-init",
                        "name": "default-mapconfig",
                        "mapId": "stdmap",
                        "title": "Map",
                        "projection": "EPSG:25832",
                        "units": "m",
                        "maxResolution": 560,
                        "maxExtent": "-106720,4973280,1040160,6406880",
                        "center": "385067,5535472",
                        "resolutions": "560, 280, 140, 70, 28, 14, 7, 2.8, 1.4",
                        "scales": null,
                        "zoom": 0
                    },
                    "grantedMapConfig": null,
                    "modules": [
                        {
                            "id": 1,
                            "created_at": "16.03.2015 11:55:49",
                            "updated_at": "16.03.2015 11:55:49",
                            "app_user": "auto-create-on-init",
                            "module_name": "layertreepanel",
                            "module_fullname": "Standard Layer Tree",
                            "region": "west",
                            "isDefault": true,
                            "type": "internet"
                        },
                        {
                            "id": 3,
                            "created_at": "16.03.2015 11:55:49",
                            "updated_at": "16.03.2015 11:55:49",
                            "app_user": "auto-create-on-init",
                            "module_name": "overviewmappanel",
                            "module_fullname": "Standard Overview Map",
                            "region": "west",
                            "isDefault": true,
                            "type": "internet"
                        },
                        {
                            "id": 2,
                            "created_at": "16.03.2015 11:55:49",
                            "updated_at": "16.03.2015 11:55:49",
                            "app_user": "auto-create-on-init",
                            "module_name": "layerlistpanel",
                            "module_fullname": "Standard Layer List",
                            "region": "west",
                            "isDefault": true,
                            "type": "internet"
                        }
                    ],
                    "grantedModules": null,
                    "groups": [],
                    "grantedGroups": null,
                    "orderedMapTools": [
                        {
                            "id": 3847,
                            "created_at": "04.05.2015 12:05:29",
                            "updated_at": "04.05.2015 12:05:29",
                            "app_user": "default",
                            "module": {
                                "id": 4,
                                "created_at": "16.03.2015 11:55:49",
                                "updated_at": "16.03.2015 11:55:49",
                                "app_user": "auto-create-on-init",
                                "module_name": "navigation_select",
                                "module_fullname": "Werkzeuge zum Navigieren",
                                "region": "maptoolbar",
                                "isDefault": false,
                                "type": "intranet"
                            },
                            "tbIndex": 0
                        },
                        {
                            "id": 3848,
                            "created_at": "04.05.2015 12:05:29",
                            "updated_at": "04.05.2015 12:05:29",
                            "app_user": "default",
                            "module": {
                                "id": 5,
                                "created_at": "16.03.2015 11:55:50",
                                "updated_at": "16.03.2015 11:55:50",
                                "app_user": "auto-create-on-init",
                                "module_name": "query_evaluate",
                                "module_fullname": "Werkzeuge zum Abfragen",
                                "region": "maptoolbar",
                                "isDefault": false,
                                "type": "intranet"
                            },
                            "tbIndex": 1
                        },
                        {
                            "id": 3849,
                            "created_at": "04.05.2015 12:05:29",
                            "updated_at": "04.05.2015 12:05:29",
                            "app_user": "default",
                            "module": {
                                "id": 6,
                                "created_at": "16.03.2015 11:55:50",
                                "updated_at": "16.03.2015 11:55:50",
                                "app_user": "auto-create-on-init",
                                "module_name": "print_load_save",
                                "module_fullname": "Werkzeuge zum Drucken",
                                "region": "maptoolbar",
                                "isDefault": false,
                                "type": "intranet"
                            },
                            "tbIndex": 2
                        },
                        {
                            "id": 3850,
                            "created_at": "04.05.2015 12:05:29",
                            "updated_at": "04.05.2015 12:05:29",
                            "app_user": "default",
                            "module": {
                                "id": 7,
                                "created_at": "16.03.2015 11:55:50",
                                "updated_at": "16.03.2015 11:55:50",
                                "app_user": "auto-create-on-init",
                                "module_name": "annotate",
                                "module_fullname": "Werkzeuge zum Zeichnen",
                                "region": "maptoolbar",
                                "isDefault": false,
                                "type": "intranet"
                            },
                            "tbIndex": 3
                        },
                        {
                            "id": 3851,
                            "created_at": "04.05.2015 12:05:29",
                            "updated_at": "04.05.2015 12:05:29",
                            "app_user": "default",
                            "module": {
                                "id": 9,
                                "created_at": "16.03.2015 11:55:50",
                                "updated_at": "16.03.2015 11:55:50",
                                "app_user": "auto-create-on-init",
                                "module_name": "special_tools",
                                "module_fullname": "verschiedene Werkzeuge",
                                "region": "maptoolbar",
                                "isDefault": false,
                                "type": "intranet"
                            },
                            "tbIndex": 4
                        }
                    ],
                    "publicSearchLayer": null,
                    "publicResponsiveSearchLayer": 3,
                    "layerTreeConfig": "{\"id\":2537,\"name\":\"Root\",\"...",
                    "annotationGeometries": null,
                    "owner": 1254,
                    "ownerName": "Till Adams",
                    "additionalOwners": [],
                    "additionalOwnerIds": null,
                    "wpsActions": [],
                    "targetGroup": "gisclient",
                    "maxResolution": 560,
                    "minResolution": 0.14
                },
                "loggedInDspfUserId": "6815",
                "loggedInUser": "Herr Till Adams",
                "preferences": {}
            },
            "total": 1,
            "success": true
        }

     * Example of a simple broken down appcontext:

         {
            data: {
                merge: {
                    startCenter: [983487, 6998170],
                    startZoom: 13,
                    mapLayers: [
                        {
                            name: "Hintergrundkarten",
                            type: "Folder",
                            layers: [
                                {
                                    name: "OSM WMS Grau",
                                    type: "TileWMS",
                                    treeColor: "rgba(41, 213, 4, 0.26)",
                                    url: "http://ows.terrestris.de/osm-gray/service?",
                                    layers: "OSM-WMS",
                                    legendUrl: "http://ows.terrestris.de/osm-gray/service?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=OSM-WMS&TILED=true&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&STYLES=&BBOX=978393.9620502554%2C7000408.798469583%2C983285.9318605067%2C7005300.768279834",
                                    topic: false
                                },
                                {
                                    name: "OSM WMS Farbig",
                                    type: "TileWMS",
                                    treeColor: "rgba(41, 213, 4, 0.26)",
                                    url: "http://ows.terrestris.de/osm/service?",
                                    layers: "OSM-WMS",
                                    legendUrl: "http://ows.terrestris.de/osm/service?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=OSM-WMS&TILED=true&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&STYLES=&BBOX=978393.9620502554%2C7000408.798469583%2C983285.9318605067%2C7005300.768279834",
                                    topic: false,
                                    visibility: false
                                },
                                {
                                    name: 'Subfolder',
                                    type: "Folder",
                                    layers: [
                                        {
                                            name: "OSM WMS Farbig",
                                            type: "TileWMS",
                                            treeColor: "rgba(41, 213, 4, 0.26)",
                                            url: "http://ows.terrestris.de/osm/service?",
                                            layers: "OSM-WMS",
                                            legendUrl: "http://ows.terrestris.de/osm/service?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=OSM-WMS&TILED=true&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&STYLES=&BBOX=978393.9620502554%2C7000408.798469583%2C983285.9318605067%2C7005300.768279834",
                                            topic: false,
                                            visibility: false
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'OSM POIs',
                            type: "Folder",
                            layers: [
                                {
                                    name: "Tankstellen",
                                    type: "WMS",
                                    treeColor: "rgba(161, 177, 228, 0.53)",
                                    url: "http://ows.terrestris.de/geoserver/osm/wms?",
                                    legendHeight: 40,
                                    legendUrl: "http://ows.terrestris.de/geoserver/osm/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&TRANSPARENT=true&LAYER=osm%3Aosm-fuel&HEIGHT=40&WIDTH=40",
                                    layers: "osm:osm-fuel",
                                    topic: true,
                                    transparent: true,
                                    crossOrigin: "Anonymous"
                                },
                                {
                                    name: "Bushaltestellen",
                                    type: "WMS",
                                    treeColor: "rgba(161, 177, 228, 0.53)",
                                    url: "http://ows.terrestris.de/osm-haltestellen?",
                                    legendHeight: 30,
                                    legendUrl: "http://ows.terrestris.de/osm-haltestellen?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&TRANSPARENT=true&LAYER=OSM-Bushaltestellen&HEIGHT=40&WIDTH=40",
                                    layers: "OSM-Bushaltestellen",
                                    topic: true,
                                    transparent: true,
                                    crossOrigin: "Anonymous"
                                }
                            ]
                        }
                    ],
                    mapConfig: {
                        projection: "EPSG:3857",
                        resolutions: [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135],
                        zoom: 0
                    }
                }
            }
        }

 */
Ext.define('Basepackage.util.ConfigParser', {
    autocreateLegends: false,
    activeRouting: false,
    statics: {
        /**
         * the layer array which will hold the the maps layers and grouplayers
         */
        layerArray: [],
        /**
         * Method creates an ol3 map and its layers based on the given context
         *
         * @param {Object} context - the context object
         * @return {ol.Map} map - An ol3-map or null if an invalid context was
         *     given
         */
        setupMap: function(context) {
            var me = this,
                config;
            if (!context || !context.data || !context.data.merge || !context.data.merge.mapConfig) {
                Ext.log.warn('Invalid context given to configParser!');
                return null;
            }
            config = context.data.merge;
            // TODO Refactor
            if (window.location.hash.indexOf('center') > 0) {
                var centerString = location.hash.split('center/')[1].split('|')[0];
                config.startCenter = centerString;
            }
            me.map = new ol.Map({
                controls: [
                    new ol.control.ScaleLine()
                ],
                // TODO add attribution
                view: new ol.View({
                    center: this.convertStringToNumericArray('int', config.startCenter),
                    zoom: config.startZoom || 2,
                    maxResolution: config.maxResolution,
                    minResolution: config.minResolution,
                    extent: me.convertStringToNumericArray('float', config.startBbox),
                    projection: config.mapConfig.projection || 'EPSG:3857',
                    units: 'm',
                    resolutions: me.convertStringToNumericArray('float', config.mapConfig.resolutions)
                }),
                logo: false
            });
            // create the layers
            me.getLayersArray(context);
            // add the layers
            var layerGroup = new ol.layer.Group({
                    layers: me.layerArray.reverse()
                });
            me.map.setLayerGroup(layerGroup);
            return me.map;
        },
        /**
         * Creates an ol3 layer based on a config object
         *
         * @param {Object} layer - the layer object
         * @returns {ol.Layer} - An ol3 layer object
         */
        createLayer: function(layer) {
            var me = this;
            var layerType = "Image";
            var sourceType = "ImageWMS";
            if (layer.type === "TileWMS" || layer.type === "WMS") {
                layerType = "Tile";
                sourceType = "TileWMS";
            } else if (layer.type === "XYZ") {
                layerType = "Tile";
                sourceType = "XYZ";
            } else if (layer.type === "WFSCluster" || layer.type === "WFS") {
                layerType = "Vector";
                sourceType = "Vector";
            } else if (layer.type === "WMTS") {
                layerType = "WMTS";
                sourceType = "WMTS";
            }
            var source = me.getSourceForType(layer, sourceType);
            return me.getLayerForType(layer, layerType, source);
        },
        /**
         *
         */
        getSourceForType: function(config, sourceType) {
            var me = this;
            var map = me.map;
            var projection = map.getView().getProjection();
            var projCode = map.getView().getProjection().getCode();
            var cfg;
            var attributions = config.attribution ? [
                    new ol.Attribution({
                        html: config.attribution
                    })
                ] : undefined;
            if (sourceType === "Vector") {
                // the wfscluster type expects a geoserver view similar
                // as descibed on https://wiki.intranet.terrestris.de/doku.php?id=clustering
                // There is currently now way in ol3 to request features on every
                // extent change, so we need to handle it ourselves with map listeners,
                // which happens in the cluster plugin
                if (config.type === "WFSCluster") {
                    cfg = {
                        attributions: attributions
                    };
                } else {
                    cfg = {
                        attributions: attributions,
                        loader: function(extent) /*, resolution, projection */
                        {
                            var vectorSource = this;
                            var extraParams = {};
                            var finalParams = Ext.apply({
                                    service: 'WFS',
                                    version: '1.1.0',
                                    request: 'GetFeature',
                                    outputFormat: 'application/json',
                                    typeName: config.layers,
                                    srsname: projCode,
                                    bbox: extent.join(',') + ',' + projCode
                                }, extraParams || {});
                            Ext.Ajax.request({
                                url: config.url,
                                method: 'GET',
                                params: finalParams,
                                success: function(response) {
                                    var format = new ol.format.GeoJSON();
                                    var features = format.readFeatures(response.responseText);
                                    vectorSource.addFeatures(features);
                                },
                                failure: function(response) {
                                    Ext.log.info('server-side failure with status code ' + response.status);
                                }
                            });
                        },
                        strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                            maxZoom: 28
                        }))
                    };
                }
            } else if (sourceType === "TileWMS" || sourceType === "WMS" || sourceType === "ImageWMS" || sourceType === "XYZ") {
                cfg = {
                    url: config.url,
                    //                    crossOrigin: 'Anonymous',
                    attributions: attributions,
                    params: {
                        LAYERS: config.layers,
                        TRANSPARENT: config.transparent || false,
                        VERSION: config.version || '1.1.1'
                    }
                };
                if ((config.type === "TileWMS" || config.type === "WMS" || config.type === "XYZ") && config.tiled) {
                    cfg.params.TILED = true;
                }
            } else if (sourceType === "WMTS") {
                var tileGrid;
                // we simply assume it is a worldwide layer
                var origin = ol.extent.getTopLeft(projection.getExtent());
                var projectionExtent = projection.getExtent();
                var size = ol.extent.getWidth(projectionExtent) / 256;
                var resolutions = new Array(14);
                var matrixIds = new Array(14);
                for (var z = 0; z < 14; ++z) {
                    // generate resolutions and matrixIds arrays for this
                    // WMTS
                    resolutions[z] = size / Math.pow(2, z);
                    matrixIds[z] = z;
                }
                tileGrid = new ol.tilegrid.WMTS({
                    origin: origin,
                    resolutions: resolutions,
                    matrixIds: matrixIds
                });
                cfg = {
                    url: config.url,
                    layer: config.layers,
                    attributions: attributions,
                    matrixSet: config.tilematrixset,
                    format: config.format,
                    projection: projection,
                    tileGrid: tileGrid,
                    style: config.style
                };
            }
            return new ol.source[sourceType](cfg);
        },
        /**
         *
         */
        getLayerForType: function(layer, layerType, source) {
            var olLayerConfig = {
                    name: layer.name || 'No Name given',
                    legendUrl: layer.legendUrl || (this.autocreateLegends ? this.generateLegendUrl(layer) : null),
                    legendHeight: layer.legendHeight || null,
                    minResolution: layer.minResolution || undefined,
                    maxResolution: layer.maxResolution || undefined,
                    opacity: layer.opacity || 1,
                    visible: (layer.visibility === false) ? false : true,
                    treeColor: layer.treeColor,
                    routingId: layer.id || null,
                    olStyle: layer.olStyle || null,
                    hoverable: layer.hoverable || !!layer.hoverField,
                    hoverField: layer.hoverField,
                    topic: layer.topic || layer.hoverField || null,
                    source: source,
                    type: layer.type,
                    featureType: layer.layers
                };
            // TODO Refactor ... Do we need an icon or a color...
            if (layer.type === "WFSCluster") {
                if (!layer.clusterColorString) {
                    var r = Math.round(Math.random() * 255, 10).toString();
                    var g = Math.round(Math.random() * 255, 10).toString();
                    var b = Math.round(Math.random() * 255, 10).toString();
                    olLayerConfig.clusterColorString = 'rgba(' + r + ',' + g + ',' + b + ',0.5)';
                } else {
                    olLayerConfig.clusterColorString = layer.clusterColorString;
                }
                olLayerConfig.icon = layer.icon;
            }
            // apply custom params of layer from appContext
            if (layer.customParams) {
                Ext.applyIf(olLayerConfig, layer.customParams);
            }
            return new ol.layer[layerType](olLayerConfig);
        },
        /**
         * Creates an ol3 layer group
         *
         * @param {Object} node - the node which has been identified as group
         * @returns {ol.layer.Group} - An ol3-layer group
         */
        createFolder: function(node) {
            return new ol.layer.Group({
                name: node.name,
                visible: node.checked ? node.checked : false
            });
        },
        /**
         * This method gets called internally by the setupMap method, so there
         * should be no need to call this directly
         *
         * @param {Object} context - The context holding the layers config
         */
        getLayersArray: function(context) {
            var me = this,
                layerConfig, layerTreeConfig;
            if (!context || !context.data || !context.data.merge || !context.data.merge.mapLayers) {
                Ext.log.warn('Invalid context given to configParser!');
                return;
            }
            layerConfig = context.data.merge.mapLayers;
            layerTreeConfig = Ext.decode(context.data.merge.layerTreeConfig);
            if (!Ext.isEmpty(layerTreeConfig)) {
                // we have a SHOGun context and need to iterate through
                // the treeconfig to get access to folders and special
                // layer information
                me.createLayersArrayFromShogunContext(layerTreeConfig, layerConfig);
            } else {
                me.createLayersArray(layerConfig);
            }
        },
        /**
         * Method sets up an layer and grouplayer collection for an ol3 map
         *
         * @param {Object} layerConfig - the layerconfig object
         * @param {ol.layer.Group} parent - the parent to which we may append
         */
        createLayersArray: function(layerConfig, parent) {
            var me = this;
            Ext.each(layerConfig, function(node) {
                if (node.type === "Folder") {
                    var folder = me.createFolder(node);
                    if (parent) {
                        parent.getLayers().push(folder);
                    } else {
                        me.layerArray.push(folder);
                    }
                    // create child nodes if necessary
                    if (node.layers && node.layers.length > 0) {
                        me.createLayersArray(node.layers, folder);
                    }
                } else {
                    if (parent) {
                        parent.getLayers().push(me.createLayer(node));
                    } else {
                        me.layerArray.push(me.createLayer(node));
                    }
                }
            }, me);
        },
        /**
         * Method sets up an layer and grouplayer collection for an ol3 map
         * based on an SHOGun application Context
         *
         * @param {Object} layerTreeConfig - the layerTreeConfig object
         * @param {Object} layerConfig - the layerconfig object
         * @param {ol.layer.Group} parent - the parent to which we may append
         */
        createLayersArrayFromShogunContext: function(layerTreeConfig, layerConfig, parent) {
            var me = this;
            Ext.each(layerTreeConfig, function(node) {
                //handling the rootnode first
                if (node.parentId === null && node.children) {
                    me.createLayersArrayFromShogunContext(node.children, layerConfig);
                } else if (node.leaf === false) {
                    // handling folders
                    var folder = me.createFolder(node);
                    if (parent) {
                        parent.getLayers().push(folder);
                    } else {
                        me.layerArray.push(folder);
                    }
                    // create child nodes if necessary
                    if (node.children && node.children.length > 0) {
                        me.createLayersArrayFromShogunContext(node.children.reverse(), layerConfig, folder);
                    }
                } else {
                    // handling layers
                    // get node from config by its id
                    var mergedNode = me.getNodeFromConfigById(node.mapLayerId, layerConfig);
                    // adding properties from treeConfig to node from layerconfig
                    mergedNode.visibility = node.checked;
                    mergedNode.expanded = node.expanded;
                    if (parent) {
                        parent.getLayers().push(me.createLayer(mergedNode));
                    } else {
                        me.layerArray.push(me.createLayer(mergedNode));
                    }
                }
            }, me);
        },
        /**
         * Method retrieves a layerconfig object by the given id
         *
         * @param {Integer} mapLayerId - the mapLayerId
         * @returns {Object} match - the layer object that has been found
         */
        getNodeFromConfigById: function(mapLayerId, layerConfig) {
            var match;
            Ext.each(layerConfig, function(layer) {
                if (layer.id === mapLayerId) {
                    match = layer;
                    return false;
                }
            });
            return match;
        },
        /**
         * Method turns a comma separated string into an array
         * containing integers or floats
         *
         * @param {String} type - the type to convert to
         * @param {String} string - the string to convert
         * @returns {Array} arr - the parsed array
         */
        convertStringToNumericArray: function(type, string) {
            if (Ext.isEmpty(string) || Ext.isEmpty(type) || Ext.isArray(string)) {
                return string;
            }
            var arr = [];
            Ext.each(string.split(','), function(part) {
                if (type === 'int') {
                    arr.push(parseInt(part, 10));
                } else if (type === 'float') {
                    arr.push(parseFloat(part, 10));
                }
            });
            return arr;
        },
        /**
         * Method creates a hopefully valid getlegendgraphic request for the
         * given layer
         */
        generateLegendUrl: function(layer) {
            var url = layer.url;
            url += "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&";
            url += "FORMAT=image%2Fpng&TRANSPARENT=TRUE&";
            //HEIGHT=128&WIDTH=40&";
            url += "LAYER=" + layer.layers;
            return url;
        }
    }
});

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
Ext.define('Basepackage.util.Controller', {
    statics: {
        /**
         * This method creates methdos on the passed controller, which call
         * their pendant on the associated view when they are invoked. This was
         * needed for the component.Map (basepackage). See a controller
         * that works on this class for more details (the bfs-koala project
         * has such an example)
         *
         * @param {String[]} methodNames Array of function names to borrow from
         *     the view.
         * @param {Ext.Class} controllerCls The controller class which we'll
         *     change and extend.
         */
        borrowViewMethods: function(methodNames, controllerCls) {
            var controllerProto = controllerCls.prototype;
            Ext.each(methodNames, function(methodName) {
                if (!Ext.isDefined(controllerProto[methodName])) {
                    controllerProto[methodName] = function() {
                        var view = this.getView();
                        var viewMethod = view[methodName];
                        if (viewMethod) {
                            viewMethod.apply(view, arguments);
                        }
                    };
                }
            });
        }
    }
});

/*eslint-env node*/
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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Simple NodeJS Proxy
 *
 * A simple proxy used to enable CORS on requests.
 * Use it if you want to use e.g. a Feature Info.
 *
 * Listens on port 3000 per default.
 *
 */
var http = require('http');
function onRequest(clientReq, clientRes) {
    var split = clientReq.url.split('/?url=')[1];
    var url = decodeURIComponent(split);
    http.get(url, function(res) {
        clientRes.setHeader('Access-Control-Allow-Origin', '*');
        clientRes.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.pipe(clientRes, {
            end: true
        });
    }).on('error', function(e) {
        /*eslint-disable */
        console.log("Got error: " + e.message);
    });
}
/*eslint-enable */
http.createServer(onRequest).listen(3000);

/*global Ext, window*/
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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Layer Util
 *
 * Some methods to work with ol-layers
 *
 */
Ext.define('Basepackage.util.Url', {
    statics: {
        /**
         * Returns an URL params value from the current location or the given
         * optional url.
         *
         * @param {String} key The key to search for
         * @param {String} [url=location.href] The url to search in.
         */
        getParamValue: function(key, url) {
            var re = new RegExp('[\\?&]' + (key + "") + '=([^&#]*)'),
                regexResult = re.exec(url || window.location.href),
                value;
            if (regexResult) {
                value = decodeURIComponent(regexResult[1]);
            }
            return value;
        },
        /**
         * Returns the URL of the used application like this
         *
         *   http://localhost:8080/Tribulus/client/gizmo/index-dev.html?
         */
        getCurrentAppUrl: function() {
            return window.location.protocol + "//" + window.location.host + window.location.pathname + "?";
        },
        /**
         * Return the name of the web project like this
         *
         *   Tribulus
         */
        getWebProjectBaseUrl: function() {
            var url = window.location.protocol + "//" + window.location.host,
                webProjectName = window.location.pathname.match(/\/[A-Za-z\-]*\//)[0];
            return url + webProjectName;
        },
        /**
         * Return the name of the basepath of the project like this
         *
         * http://somehost:someport/
         */
        getProjectBaseUrl: function() {
            var baseUrl = window.location.protocol + "//" + window.location.host + "/";
            return baseUrl;
        }
    }
});

/*global Ext, window, document*/
/* Copyright (C) 2011-2013 terrestris GmbH & Co. KG, info@terrestris.de
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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.-
 *
 * @author terrestris GmbH & Co. KG
 * @author M. Jansen <jansen@terrestris.de>
 */
/**
 * Provides a bunch of (static) methods to open a help window whose URL has an
 * anchor if the provided xy-location was found to have special documentation.
 *
 * Usually you create an instance of the class and then call #setContextHelp to
 * overlay the complete application with a layer that listens for clicks to get
 * contextual help. The #helpUrl will be opened in a popup after every click and
 * an anchor is appended to the URL, if the clicked component either has a
 * `xtype` or `helpKey` set to something that also exists in the list
 * #existingHelpKeys. Only instances of Ext.window.Window or more generally
 * instances of subclasses of Ext.container.Container qualifiy as candidates for
 * help.
 *
 * Based on code from Animal and timo.nuros at
 * http://www.sencha.com/forum/showthread.php?63272-Implementing-a-context-sensitive-help
 */
Ext.define('Basepackage.ux.ContextSensitiveHelp', {
    statics: {
        /**
         * The base URL of the help HTML which contains named anchors as defined
         * in #existingHelpKeys.
         */
        helpUrl: "../help/index.html",
        /**
         * A list of all named links/anchors in the HTML file #helpUrl. Remember
         * to add all existing keys to this list.
         */
        existingHelpKeys: [
            'base-button-help',
            'base-button-zoomin',
            'base-button-zoomout',
            'base-button-zoomtoextent',
            'base-button-togglelegend',
            'base-overview-map-button',
            'base-button-addwms',
            'base-button-measure',
            'base-button-coordinatetransform',
            'base-button-permalink',
            'base-combo-scale',
            'base-button-hsi',
            'base-overview-map-button',
            'base-panel-layersetchooser',
            'base-form-print',
            'base-container-overpasssearch'
        ],
        /* begin i18n */
        /**
         * Title for the warning when a popup blocker is active.
         */
        warnPopupBlockerTitle: 'Warnung',
        /**
         * Content of the warning when a popup blocker is active.
         */
        warnPopupBlockerContent: 'Bitte deaktivieren Sie etwaige ' + 'Popup-Blocker,um die Hilfe anzuzeigen.',
        /* end i18n */
        getCmpFromEl: function(el) {
            var cmp = Ext.getCmp(el.id);
            if (!cmp) {
                return this.getCmpFromEl(el.parentNode);
            } else {
                return cmp;
            }
        },
        /**
         * Returns the lowest level Component at the specified point.
         *
         * @param {Ext.util.Point/Number} p The Point at which to find the
         *     associated Component, or the X coordinate of the point.
         * @return {Ext.Component} The Component at the specified point.
         */
        getComponentFromPoint: function(point) {
            var el = document.elementFromPoint(point.x, point.y);
            var cmp = this.getCmpFromEl(el);
            return cmp;
        },
        /**
         *
         */
        bubbleToExistingHelp: function(component) {
            var helpClass = Basepackage.ux.ContextSensitiveHelp,
                existingHelpKeys = helpClass.existingHelpKeys,
                foundHelp, parent,
                xtypeHasHelp = Ext.Array.contains(existingHelpKeys, component.getXType()),
                compHasHelpKey = Ext.Array.contains(existingHelpKeys, component.helpKey);
            if (xtypeHasHelp || compHasHelpKey) {
                foundHelp = compHasHelpKey ? component.helpKey : component.getXType();
            } else {
                parent = component.up();
                if (parent) {
                    foundHelp = helpClass.bubbleToExistingHelp(parent);
                }
            }
            return foundHelp;
        },
        /**
         *
         */
        displayHelpForCoordinates: function(point) {
            var helpClass = Basepackage.ux.ContextSensitiveHelp,
                component = helpClass.getComponentFromPoint(point),
                helpKey = helpClass.bubbleToExistingHelp(component),
                helpUrl = helpClass.helpUrl,
                win;
            if (helpKey) {
                helpUrl += "#" + helpKey;
            }
            win = window.open(helpUrl, "ContextSensitiveHelp", "width=800,height=550,scrollbars=yes,left=200,top=150," + "resizable=yes,location=yes,menubar=no,status=no," + "dependent=yes");
            if (win) {
                win.focus();
            } else {
                Ext.Msg.alert(helpClass.warnPopupBlockerTitle, helpClass.warnPopupBlockerContent);
            }
            return true;
        }
    },
    /**
     * The Main method of an instance of this class.
     */
    setContextHelp: function(additionalHelpKeys) {
        var me = this,
            size = Ext.getBody().getSize();
        var helpDom = document.createElement('div');
        var helpLayer = Ext.get(helpDom);
        if (additionalHelpKeys) {
            Ext.Array.push(Basepackage.ux.ContextSensitiveHelp.existingHelpKeys, additionalHelpKeys);
        }
        document.body.insertBefore(helpDom, document.body.firstChild);
        helpLayer.setSize(size);
        helpLayer.setStyle({
            "cursor": "help",
            "position": "absolute"
        });
        helpLayer.setZIndex(20000);
        helpLayer.on("click", function(clickEvent) {
            var point = Ext.util.Point.fromEvent(clickEvent);
            me.helpLayer.destroy();
            Basepackage.ux.ContextSensitiveHelp.displayHelpForCoordinates(point);
            me.destroy();
        });
        helpLayer.show();
        me.helpLayer = helpLayer;
    }
});

/*eslint no-eval:1*/
// turn eval usage into a warning when linting
/**
 *
 * This an ux create for ExtJS 4.2.2 by David French under MIT License.
 *
 * Modified by terrestris to fit the needs of ExtJS 6.
 * https://github.com/davidffrench/Ext.ux.RowExpanderWithComponents
 *
 */
/**
 * RowExpanderWithComponents plugin
 */
Ext.define('Basepackage.ux.RowExpanderWithComponents', {
    extend: 'Ext.grid.plugin.RowExpander',
    alias: 'plugin.rowexpanderwithcomponents',
    /**
     * @cfg {XTemplate} rowBodyTpl
     * This needs to default to the below for ExtJS components to render to the correct row
     * (defaults to <tt><div id="display-row-{id}"> </div></tt>).
     */
    rowBodyTpl: new Ext.XTemplate('<div id="display-row-{id}"> </div>'),
    /**
     * @cfg {Object} rowBodyCompTemplate
     * This template will be used for every record. It can contain general
     * Ext JS Components. Text in "{{ }}" will be executed as JavaScript.
     * Sample below
     * rowBodyCompTemplate: {
            xtype: 'container',
            items: [{
                xtype: 'image',
                src: '{{record.getOlLayer().get("legendUrl")}}',
                height: '{{record.getOlLayer().get("legendHeight")}}',
                alt: '{{record.getOlLayer().get("legendUrl")}}'
            }]
        }
     * (defaults to <tt>null</tt>).
     */
    rowBodyCompTemplate: null,
    /**
     * @cfg {Boolean} expandOnClick
     * <tt>true</tt> to toggle a row between expanded/collapsed when single clicked
     * (defaults to <tt>true</tt>).
     */
    expandOnClick: false,
    /**
     * @cfg {Boolean} hideExpandColumn
     * <tt>true</tt> to hide the column that contains the expand/collapse icons
     * (defaults to <tt>true</tt>).
     */
    hideExpandColumn: false,
    /**
     * @cfg {Boolean} enableTextSelection
     * <tt>true</tt> to enable text selection within the grid
     * (defaults to <tt>true</tt>).
     */
    enableTextSelection: true,
    preventRecursionArray: [],
    init: function(grid) {
        var me = this,
            view;
        me.callParent(arguments);
        //get the grids view
        view = me.view = grid.getView();
        //this css does not highlight the row expander body
        grid.addCls('rowexpanderwithcomponents');
        //set the rowexpander column to hidden if hideExpandColumn config is true
        if (me.hideExpandColumn) {
            grid.headerCt.query('gridcolumn')[0].hidden = true;
        }
        //enable text selection if the config is true
        if (me.enableTextSelection) {
            view.enableTextSelection = true;
        }
        view.on('expandbody', function(rowNode, record) {
            var recId = record.getId();
            if (!recId) {
                Ext.Error.raise('Error: Records must have an id to use the' + 'rowExpanderWithComponents plugin. ' + 'Use http://docs.sencha.com/extjs/4.2.2/#!/api/Ext.data.' + 'Model-cfg-idProperty or http://docs.sencha.com/extjs/' + '4.2.2/#!/api/Ext.data.Model-cfg-idgen');
            }
            var row = 'display-row-' + recId,
                clonedRowTemplate = Ext.clone(me.rowBodyCompTemplate);
            // TODO The rowbody behaviour seems to be not that smooth. We
            // should have a look at this
            // if the row got children dont add it again
            if (Ext.get(row).dom.children.length === 0) {
                var parentCont = Ext.create(Ext.container.Container, {
                        height: '100%',
                        width: '100%',
                        itemId: grid.getId() + '-parentRowExpCont-' + recId,
                        items: [
                            me.replaceObjValues(clonedRowTemplate, record)
                        ]
                    });
                //render the ExtJS component to the div
                parentCont.render(row);
                //Stop all events in the row body from bubbling up
                var rowEl = parentCont.getEl().parent('.x-grid-rowbody');
                rowEl.swallowEvent([
                    'mouseenter',
                    'click',
                    'mouseover',
                    'mousedown',
                    'dblclick',
                    'cellclick',
                    'itemmouseenter',
                    'itemmouseleave',
                    'onRowFocus',
                    'mouseleave'
                ]);
                // adding the dynamic css to component
                var rowToStyle = parentCont.getEl().parent('.x-grid-rowbody-tr');
                rowToStyle.addCls(grid.getCssForRow(record));
            }
        });
        //assign the helper functions to the gridview and grid
        view.getRowComponent = me.getRowComponent;
        grid.getRowComponent = me.getRowComponent;
        grid.addToRowComponent = me.addToRowComponent;
        grid.addToRowComponent = me.addToRowComponent;
    },
    /**
     * Gets the parent ExtJS container in the rowexpander body from the rows record id
     * @param {integer} recId The row record id
     * @return {Ext.container.Container} the parent ExtJS container in the rowexpander body
     */
    getRowComponent: function(recId) {
        return Ext.ComponentQuery.query('#' + this.up('treepanel').getId() + '-parentRowExpCont-' + recId)[0];
    },
    /**
     * Removes all ExtJS items from the parent row component
     * @param {integer} recId The row record id
     */
    removeAllFromRowComponent: function(recId) {
        var rowCont = this.getRowComponent(recId);
        rowCont.removeAll();
    },
    /**
     * Adds items to the parent ExtJS container in the rowexpander body
     * @param {integer} recId The row record id
     * @param {Array} items ExtJS components
     */
    addToRowComponent: function(recId, items) {
        var rowCont = this.getRowComponent(recId);
        rowCont.add(items);
    },
    /**
     * @private
     * allow single click to expand grid
     */
    bindView: function(view) {
        if (this.expandOnClick) {
            view.on('itemclick', this.onItemClick, this);
        }
        this.callParent(arguments);
    },
    /**
     * @private
     * allow single click to expand grid
     */
    onItemClick: function(view, record, row, rowIdx) {
        this.toggleRow(rowIdx, record);
    },
    /**
     * @private
     * Converts all string values with {{}} to code
     * Example: '{{record.get('test'}}' converts to record.get('test')
     */
    replaceObjValues: function(obj, record) {
        for (var all in obj) {
            if (typeof obj[all] === "string" && obj[all].match(/{{(.*)}}/)) {
                obj[all] = eval(obj[all].match(/{{(.*)}}/)[1]);
            }
            if (typeof obj[all] === "object" && obj[all] !== null) {
                if (Ext.Array.contains(this.preventRecursionArray, obj[all])) {
                    return obj;
                } else {
                    this.preventRecursionArray.push(obj[all]);
                    this.replaceObjValues(obj[all], record);
                }
            }
            if (obj.xtype) {
                obj.layerRec = record;
                // if we do not have a cluster layer, we remove the "double
                // symbology / legend"
                if (record.getOlLayer() && record.getOlLayer().get('type') && record.getOlLayer().get('type') !== "WFSCluster" && Ext.isArray(obj.items) && obj.items.length > 1) {
                    obj.items.pop();
                }
            }
        }
        return obj;
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * AddWms FormPanel
 *
 * Used to add an WMS to the map
 *
 */
Ext.define("Basepackage.view.form.AddWms", {
    extend: "Ext.form.Panel",
    xtype: 'base-form-addwms',
    requires: [
        'Ext.button.Button'
    ],
    viewModel: {
        data: {
            errorIncompatibleWMS: 'Der angefragte WMS ist nicht kompatibel zur Anwendung',
            errorRequestFailedS: 'Die angegebene URL konte nicht abgefragt werden',
            errorCouldntParseResponse: 'Die erhaltene Antwort konnte nicht erfolgreich geparst werden',
            addCheckedLayers: 'Ausgewählte Layer hinzufügen'
        }
    },
    padding: 5,
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },
    scrollable: true,
    items: [
        {
            xtype: 'fieldset',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            title: 'Anfrageparameter',
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'WMS-URL',
                    name: 'url',
                    allowBlank: false,
                    value: 'http://ows.terrestris.de/osm/service'
                },
                {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Version',
                    defaultType: 'radiofield',
                    defaults: {
                        flex: 1
                    },
                    layout: 'hbox',
                    items: [
                        {
                            boxLabel: 'v1.1.1',
                            name: 'version',
                            inputValue: '1.1.1',
                            id: 'v111-radio'
                        },
                        {
                            boxLabel: 'v1.3.0',
                            name: 'version',
                            inputValue: '1.3.0',
                            id: 'v130-radio',
                            checked: true
                        }
                    ]
                },
                {
                    xtype: 'hiddenfield',
                    name: 'request',
                    value: 'GetCapabilities'
                },
                {
                    xtype: 'hiddenfield',
                    name: 'service',
                    value: 'WMS'
                }
            ]
        },
        {
            xtype: 'fieldset',
            name: 'fs-available-layers',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            title: 'Verfügbare Layer'
        }
    ],
    // Reset and Submit buttons
    buttons: [
        {
            text: 'Zurücksetzen',
            handler: function(btn) {
                var view = btn.up('base-form-addwms');
                view.getForm().reset();
                view.emptyAvailableLayersFieldset();
            }
        },
        '->',
        {
            text: 'Verfügbare Layer abfragen',
            formBind: true,
            //only enabled once the form is valid
            disabled: true,
            handler: function(btn) {
                var view = btn.up('base-form-addwms');
                var viewModel = view.getViewModel();
                var form = view.getForm();
                if (form.isValid()) {
                    view.emptyAvailableLayersFieldset();
                    var values = form.getValues();
                    var url = values.url;
                    delete values.url;
                    Ext.Ajax.request({
                        url: url,
                        method: 'GET',
                        params: values,
                        success: function(response) {
                            var parser = new ol.format.WMSCapabilities();
                            var result;
                            try {
                                result = parser.read(response.responseText);
                            } catch (ex) {
                                view.showWarning(viewModel.get('errorCouldntParseResponse'));
                                return;
                            }
                            var compatibleLayers = view.isCompatibleCapabilityResponse(result);
                            if (!compatibleLayers) {
                                view.showWarning(viewModel.get('errorIncompatibleWMS'));
                                return;
                            }
                            view.fillAvailableLayersFieldset(compatibleLayers);
                        },
                        failure: function() {
                            view.showWarning(viewModel.get('errorRequestFailedS'));
                        }
                    });
                }
            }
        }
    ],
    emptyAvailableLayersFieldset: function() {
        var fs = this.down('[name="fs-available-layers"]');
        fs.removeAll();
    },
    showWarning: function(msg) {
        Ext.Msg.show({
            title: 'Warnung',
            message: 'Ein Fehler trat auf: ' + msg,
            width: 300,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.WARNING
        });
    },
    isCompatibleCapabilityResponse: function(capabilities) {
        if (!capabilities) {
            return false;
        }
        var version = capabilities.version;
        if (version !== '1.1.1' && version !== '1.3.0') {
            return false;
        }
        var compatible = [];
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var mapProj = map.getView().getProjection().getCode();
        var layers = capabilities.Capability.Layer.Layer;
        //same in both versions
        var url = capabilities.Capability.Request.GetMap.DCPType[0].HTTP.Get.OnlineResource;
        Ext.each(layers, function(layer) {
            if (version === '1.3.0' && !Ext.Array.contains(layer.CRS, mapProj)) {
                // only available for 1.3.0
                return;
            }
            var olSource = new ol.source.TileWMS({
                    url: url,
                    params: {
                        LAYERS: layer.Name,
                        STYLES: layer.Style[0].Name,
                        VERSION: version
                    }
                });
            var olLayer = new ol.layer.Tile({
                    topic: true,
                    name: layer.Title,
                    source: olSource,
                    legendUrl: layer.Style[0].LegendURL[0].OnlineResource
                });
            compatible.push(olLayer);
        });
        return compatible.length > 0 ? compatible : false;
    },
    fillAvailableLayersFieldset: function(layers) {
        this.emptyAvailableLayersFieldset();
        var view = this;
        var fs = view.down('[name="fs-available-layers"]');
        var viewModel = this.getViewModel();
        Ext.each(layers, function(layer) {
            fs.add({
                xtype: 'checkbox',
                boxLabel: layer.get('name'),
                checked: true,
                olLayer: layer
            });
        });
        fs.add({
            xtype: 'button',
            text: viewModel.get('addCheckedLayers'),
            margin: 10,
            handler: this.addCheckedLayers,
            scope: this
        });
    },
    addCheckedLayers: function() {
        var fs = this.down('[name="fs-available-layers"]');
        var checkboxes = fs.query('checkbox[checked=true][disabled=false]');
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        Ext.each(checkboxes, function(checkbox) {
            map.addLayer(checkbox.olLayer);
            checkbox.setDisabled(true);
        });
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * AddWms Button
 *
 * Button used to instanciate the base-form-addwms in order to add a
 * WMS to the map
 *
 */
Ext.define("Basepackage.view.button.AddWms", {
    extend: "Ext.button.Button",
    xtype: 'base-button-addwms',
    requires: [
        'Ext.window.Window',
        'Basepackage.view.form.AddWms',
        'Basepackage.util.Animate'
    ],
    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },
    /**
    *
    */
    handler: function() {
        var win = Ext.ComponentQuery.query('[name=add-wms-window]')[0];
        if (!win) {
            Ext.create('Ext.window.Window', {
                name: 'add-wms-window',
                title: 'WMS hinzufügen',
                width: 500,
                height: 400,
                layout: 'fit',
                items: [
                    {
                        xtype: 'base-form-addwms'
                    }
                ]
            }).show();
        } else {
            Basepackage.util.Animate.shake(win);
        }
    },
    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'WMS hinzufügen\u2026',
            text: 'WMS <span style="font-size: 1.7em; ' + 'font-weight: normal;">⊕</span>'
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * CoordinateTransform FormPanel
 *
 * Used to show and transform coordinates
 *
 */
Ext.define("Basepackage.view.form.CoordinateTransform", {
    extend: "Ext.form.Panel",
    xtype: 'base-form-coordinatetransform',
    requires: [
        'Ext.button.Button'
    ],
    viewModel: {
        data: {}
    },
    padding: 5,
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },
    scrollable: true,
    config: {
        /**
         * Array of Objects containing code in EPSG notation and Name to display
         * that should be used:
         * {code: 'EPSG:4326', name: 'WGS84'}
         */
        coordinateSystemsToUse: [],
        /**
         *
         */
        transformCenterOnRender: true
    },
    /**
     *
     */
    initComponent: function() {
        var me = this,
            crsFieldsets = [],
            map = Ext.ComponentQuery.query('base-component-map')[0].getMap();
        if (Ext.isEmpty(me.getCoordinateSystemsToUse())) {
            Ext.log.warn('No coordinatesystems given to Component');
            return;
        }
        Ext.each(me.getCoordinateSystemsToUse(), function(crs) {
            var targetCrs = ol.proj.get(crs.code);
            // first we check if the crs can be used at all
            if (!Ext.isDefined(targetCrs)) {
                Ext.log.warn('The CRS ' + crs.code + ' is not defined, did you ' + 'require it?');
                return;
            }
            var fs = {
                    xtype: 'fieldset',
                    title: crs.name,
                    crs: crs.code,
                    margin: 5,
                    items: [
                        {
                            xtype: 'numberfield',
                            name: 'xcoord',
                            decimalSeparator: ',',
                            decimalPrecision: 7,
                            fieldLabel: 'X-Koordinate',
                            value: '',
                            // Remove spinner buttons, and arrow key and mouse wheel listeners
                            hideTrigger: true,
                            keyNavEnabled: false,
                            mouseWheelEnabled: false,
                            listeners: {
                                'focus': me.toggleBtnVisibility
                            }
                        },
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            margin: '0 0 5 0',
                            items: [
                                {
                                    xtype: 'numberfield',
                                    name: 'ycoord',
                                    decimalSeparator: ',',
                                    decimalPrecision: 7,
                                    fieldLabel: 'Y-Koordinate',
                                    value: '',
                                    // Remove spinner buttons, and arrow key and mouse wheel listeners
                                    hideTrigger: true,
                                    keyNavEnabled: false,
                                    mouseWheelEnabled: false,
                                    listeners: {
                                        'focus': me.toggleBtnVisibility
                                    }
                                },
                                {
                                    xtype: 'button',
                                    name: 'transform',
                                    margin: '0 0 0 30',
                                    width: 110,
                                    text: 'Transformieren',
                                    hidden: true,
                                    handler: me.transform
                                }
                            ]
                        }
                    ]
                };
            crsFieldsets.push(fs);
        });
        me.items = [
            {
                xtype: 'fieldset',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                },
                title: 'Koordinaten',
                items: crsFieldsets
            }
        ];
        me.callParent();
        // set the initial values
        me.on('afterrender', function() {
            var transformvectorlayer = Basepackage.util.Layer.getLayerByName('transformvectorlayer');
            if (transformvectorlayer) {
                transformvectorlayer.setVisible(true);
            }
            if (me.getTransformCenterOnRender()) {
                var coordToTransform = map.getView().getCenter();
                me.transform(coordToTransform);
            }
        });
        map.on('click', me.transform);
        me.on('beforedestroy', function() {
            var transformvectorlayer = Basepackage.util.Layer.getLayerByName('transformvectorlayer');
            transformvectorlayer.getSource().clear();
            map.un('click', me.transform);
        });
    },
    // Reset and Submit buttons
    buttons: [
        {
            text: 'Zurücksetzen',
            handler: function(btn) {
                var view = btn.up('base-form-coordinatetransform');
                view.reset();
                var transformvectorlayer = Basepackage.util.Layer.getLayerByName('transformvectorlayer');
                transformvectorlayer.getSource().clear();
            }
        }
    ],
    /**
     *
     */
    toggleBtnVisibility: function(field) {
        var allBtns = Ext.ComponentQuery.query('base-form-coordinatetransform button[name=transform]'),
            currentBtn = field.up('fieldset').down('button[name=transform]');
        Ext.each(allBtns, function(btn) {
            btn.setVisible(false);
        });
        currentBtn.setVisible(true);
    },
    /**
     *
     */
    transformCoords: function(coordToTransform, mapProjection, targetCrs) {
        var transformedCoords = ol.proj.transform(coordToTransform, mapProjection, targetCrs);
        if (targetCrs.getUnits() === "m") {
            // round metric crs coords to decimeters
            transformedCoords[0] = Math.round(transformedCoords[0] * 100) / 100;
            transformedCoords[1] = Math.round(transformedCoords[1] * 100) / 100;
        } else {
            // round geographic crs coords to decimeters
            transformedCoords[0] = Math.round(transformedCoords[0] * 10000000) / 10000000;
            transformedCoords[1] = Math.round(transformedCoords[1] * 10000000) / 10000000;
        }
        return transformedCoords;
    },
    /**
     *
     */
    transform: function(evtOrBtnOrArray) {
        var me = Ext.ComponentQuery.query('base-form-coordinatetransform')[0],
            map = Ext.ComponentQuery.query('base-component-map')[0].getMap(),
            mapProjection = map.getView().getProjection(),
            fieldSets = me.query('fieldset'),
            transformvectorlayer = Basepackage.util.Layer.getLayerByName('transformvectorlayer'),
            isOlEvt = evtOrBtnOrArray instanceof ol.MapBrowserPointerEvent,
            isCoordArray = Ext.isArray(evtOrBtnOrArray) && evtOrBtnOrArray.length === 2,
            coords = [],
            coordsSrs = mapProjection,
            transformedCoords;
        if (isOlEvt) {
            coords = evtOrBtnOrArray.coordinate;
        } else if (isCoordArray) {
            coords = evtOrBtnOrArray;
        } else {
            var fieldset = evtOrBtnOrArray.up('fieldset');
            coords[0] = fieldset.down('numberfield[name=xcoord]').getValue();
            coords[1] = fieldset.down('numberfield[name=ycoord]').getValue();
            coordsSrs = ol.proj.get(fieldset.crs);
        }
        Ext.each(fieldSets, function(fs) {
            if (!Ext.isEmpty(fs.crs)) {
                if (coordsSrs) {
                    transformedCoords = me.transformCoords(coords, coordsSrs, ol.proj.get(fs.crs));
                } else {
                    transformedCoords = me.transformCoords(coords, mapProjection, ol.proj.get(fs.crs));
                }
                fs.down('numberfield[name=xcoord]').setValue(transformedCoords[0]);
                fs.down('numberfield[name=ycoord]').setValue(transformedCoords[1]);
            }
        });
        // now show coord on map
        if (!Ext.isDefined(transformvectorlayer)) {
            transformvectorlayer = new ol.layer.Vector({
                name: 'transformvectorlayer',
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 0, 0, 0.7)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: 'rgba(255, 0, 0, 0.7)'
                        })
                    })
                })
            });
            map.addLayer(transformvectorlayer);
        }
        var transformedMapCoords = ol.proj.transform(coords, coordsSrs, mapProjection);
        var feature = new ol.Feature({
                geometry: new ol.geom.Point(transformedMapCoords)
            });
        transformvectorlayer.getSource().clear();
        transformvectorlayer.getSource().addFeatures([
            feature
        ]);
        // recenter if we were not triggered by click in map
        if (!isOlEvt) {
            map.getView().setCenter(transformedMapCoords);
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * CoordinateTransform Button
 *
 * Button used to instanciate the base-form-CoordinateTransform in order
 * to show and transform coordinates
 *
 */
Ext.define("Basepackage.view.button.CoordinateTransform", {
    extend: "Ext.button.Button",
    xtype: 'base-button-coordinatetransform',
    requires: [
        'Ext.window.Window',
        'Basepackage.view.form.CoordinateTransform',
        'Basepackage.util.Animate'
    ],
    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },
    /**
     * Array of CRS in EPSG notation that should be used
     */
    coordinateSystemsToUse: [],
    /**
     *
     */
    transformCenterOnRender: true,
    /**
    *
    */
    handler: function() {
        var win = Ext.ComponentQuery.query('[name=coordinate-transform-window]')[0];
        if (!win) {
            Ext.create('Ext.window.Window', {
                name: 'coordinate-transform-window',
                title: 'Koordinaten transformieren',
                width: 500,
                height: 400,
                layout: 'fit',
                items: [
                    {
                        xtype: 'base-form-coordinatetransform',
                        coordinateSystemsToUse: this.coordinateSystemsToUse,
                        transformCenterOnRender: this.transformCenterOnRender
                    }
                ]
            }).showAt(0);
        } else {
            Basepackage.util.Animate.shake(win);
        }
    },
    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Koordinaten transformieren und anzeigen',
            text: 'Koordinaten transformieren'
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * ZoomIn Button
 *
 * Button used to zoom in
 *
 */
Ext.define("Basepackage.view.button.Help", {
    extend: "Ext.button.Button",
    xtype: 'base-button-help',
    requires: [
        'Basepackage.ux.ContextSensitiveHelp'
    ],
    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Hilfe',
            text: null
        }
    },
    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },
    glyph: 'xf059@FontAwesome',
    config: {
        additonalHelpKeys: null
    },
    /**
    *
    */
    handler: function(button) {
        var help = Ext.create('Basepackage.ux.ContextSensitiveHelp');
        help.setContextHelp(button.getAdditonalHelpKeys());
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * ZoomIn Button
 *
 * Button used to zoom in
 *
 */
Ext.define("Basepackage.view.button.Hsi", {
    extend: "Ext.button.Button",
    xtype: 'base-button-hsi',
    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Informationsabfrage',
            text: null
        }
    },
    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },
    glyph: 'xf05a@FontAwesome',
    enableToggle: true,
    pressed: true,
    initComponent: function() {
        this.callParent([
            arguments
        ]);
        this.setControlStatus(this.pressed);
    },
    toggleHandler: function(button) {
        this.setControlStatus(button.pressed);
    },
    setControlStatus: function(status) {
        var mapComponent = Ext.ComponentQuery.query('base-component-map')[0];
        mapComponent.setPointerRest(status);
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Measure Tool Button
 *
 * Mainly ripped from ol3 examples
 *
 */
Ext.define("Basepackage.view.button.Measure", {
    extend: "Ext.button.Button",
    xtype: 'base-button-measure',
    requires: [
        "Basepackage.util.Layer"
    ],
    /**
    *
    */
    viewModel: {
        data: {
            textline: 'Strecke messen',
            textpoly: 'Fläche messen'
        }
    },
    /**
     *
     */
    measureVectorLayer: null,
    /**
     *
     */
    drawAction: null,
    /**
     *
     */
    geodesic: true,
    /**
     *
     */
    measureType: 'line',
    /**
     * Currently drawn feature.
     * @type {ol.Feature}
     */
    sketch: null,
    /**
     * The help tooltip element.
     * @type {Element}
     */
    helpTooltipElement: null,
    /**
     * Overlay to show the help messages.
     * @type {ol.Overlay}
     */
    helpTooltip: null,
    /**
     * The measure tooltip element.
     * @type {Element}
     */
    measureTooltipElement: null,
    /**
     * Overlay to show the measurement.
     * @type {ol.Overlay}
     */
    measureTooltip: null,
    /**
     * Message to show when the user is drawing a polygon.
     * @type {string}
     */
    continuePolygonMsg: 'Klicken zum Zeichnen der Fläche',
    /**
     * Message to show when the user is drawing a line.
     * @type {string}
     */
    continueLineMsg: 'Klicken zum Zeichnen der Strecke',
    /**
     *
     */
    clickToDrawText: 'Klicken zum Messen',
    /**
     * used to allow / disallow multiple drawings at a time on the map
     */
    allowOnlyOneDrawing: true,
    /**
     *
     */
    strokeColor: 'rgba(255, 0, 0, 0.8)',
    /**
     *
     */
    fillColor: 'rgba(255, 0, 0, 0.5)',
    /**
     * how many decimal places will be allowed for the measure tooltips
     */
    decimalPlacesInToolTips: 2,
    /**
     * determine if a area / line greater than 10000
     * should be switched to km instead of m in popups
     */
    switchToKmOnLargeValues: true,
    /**
     * determines if a marker with current measurement should be shown every
     * time the user clicks while drawing
     */
    showMeasureInfoOnClickedPoints: false,
    /**
     *
     */
    initComponent: function() {
        var me = this,
            source = new ol.source.Vector({
                features: new ol.Collection()
            }),
            measureLayer;
        me.map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        //        var btnText = (me.measureType === 'line' ? '{textline}' : '{textpoly}');
        //        me.setBind({
        //            text: btnText
        //        });
        measureLayer = Basepackage.util.Layer.getLayerByName('measurelayer');
        if (Ext.isEmpty(measureLayer)) {
            me.measureVectorLayer = new ol.layer.Vector({
                name: 'measurelayer',
                source: source,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: me.fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: me.strokeColor,
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: me.fillColor
                        })
                    })
                })
            });
            me.map.addLayer(me.measureVectorLayer);
        } else {
            me.measureVectorLayer = measureLayer;
        }
        // Set our internal flag to filter this layer out of the tree / legend
        var noLayerSwitcherKey = Basepackage.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
        me.measureVectorLayer.set(noLayerSwitcherKey, false);
        var type = (me.measureType === 'line' ? 'MultiLineString' : 'MultiPolygon');
        me.drawAction = new ol.interaction.Draw({
            name: 'drawaction',
            source: source,
            type: type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: me.fillColor
                }),
                stroke: new ol.style.Stroke({
                    color: me.strokeColor,
                    lineDash: [
                        10,
                        10
                    ],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: me.strokeColor
                    }),
                    fill: new ol.style.Fill({
                        color: me.fillColor
                    })
                })
            })
        });
        me.drawAction.setActive(false);
        me.map.addInteraction(me.drawAction);
    },
    /**
    *
    */
    handler: function() {
        var me = this;
        me.on('toggle', function(btn, pressed) {
            if (pressed) {
                me.drawAction.setActive(true);
                me.createMeasureTooltip();
                me.createHelpTooltip();
                me.drawAction.on('drawstart', me.drawStart, me);
                me.drawAction.on('drawend', me.drawEnd, me);
                me.map.on('pointermove', me.pointerMoveHandler, me);
            } else {
                // we need to cleanup and return
                me.cleanUp(me);
            }
        });
        me.toggle();
    },
    /**
     *
     */
    cleanUp: function(me) {
        me.drawAction.setActive(false);
        me.drawAction.un('drawstart', me.drawStart, me);
        me.drawAction.un('drawend', me.drawEnd, me);
        me.map.un('pointermove', me.pointerMoveHandler, me);
        me.map.un('click', me.addMeasureStopToolTip, me);
        me.cleanUpToolTips();
        me.measureVectorLayer.getSource().clear();
    },
    /**
     *
     */
    cleanUpToolTips: function() {
        var me = this;
        me.helpTooltipElement = null;
        me.measureTooltipElement = null;
        Ext.each(Ext.DomQuery.select('.tooltip-static'), function(el) {
            el.parentNode.removeChild(el);
        });
        Ext.each(me.map.getOverlays().getArray(), function(overlay) {
            if (overlay === me.measureTooltip || overlay === me.helpTooltip) {
                me.map.removeOverlay(overlay);
            }
        });
    },
    addMeasureStopToolTip: function(evt) {
        var me = this;
        if (!Ext.isEmpty(me.sketch)) {
            var geom = me.sketch.getGeometry(),
                value = me.measureType === 'line' ? me.formatLength(geom) : me.formatArea(geom);
            if (parseInt(value, 10) > 0) {
                var div = Ext.dom.Helper.createDom('<div>');
                div.className = 'tooltip tooltip-static';
                div.innerHTML = value;
                var tooltip = new ol.Overlay({
                        element: div,
                        offset: [
                            0,
                            -15
                        ],
                        positioning: 'bottom-center'
                    });
                me.map.addOverlay(tooltip);
                tooltip.setPosition(evt.coordinate);
            }
        }
    },
    /**
     *
     */
    drawStart: function(evt) {
        var me = this;
        var source = me.measureVectorLayer.getSource();
        me.sketch = evt.feature;
        if (me.showMeasureInfoOnClickedPoints && me.measureType === 'line') {
            me.map.on('click', me.addMeasureStopToolTip, me);
        }
        if (me.allowOnlyOneDrawing && source.getFeatures().length > 0) {
            me.cleanUpToolTips();
            me.createMeasureTooltip();
            me.createHelpTooltip();
            me.measureVectorLayer.getSource().clear();
        }
    },
    /**
     *
     */
    drawEnd: function(evt) {
        var me = this;
        me.map.un('click', me.addMeasureStopToolTip, me);
        // seems we need to add the feature manually in polygon measure mode
        // maybe an ol3 bug?
        if (me.measureType === 'polygon') {
            me.measureVectorLayer.getSource().addFeatures([
                evt.feature
            ]);
        }
        if (me.showMeasureInfoOnClickedPoints && me.measureType === 'line') {
            me.measureTooltip = null;
            if (me.measureTooltipElement) {
                me.measureTooltipElement.parentNode.removeChild(me.measureTooltipElement);
            }
        } else {
            me.measureTooltipElement.className = 'tooltip tooltip-static';
            me.measureTooltip.setOffset([
                0,
                -7
            ]);
        }
        // unset sketch
        me.sketch = null;
        // unset tooltip so that a new one can be created
        me.measureTooltipElement = null;
        me.createMeasureTooltip();
    },
    /**
    * Handle pointer move.
    * @param {ol.MapBrowserEvent} evt
    */
    pointerMoveHandler: function(evt) {
        var me = this;
        if (evt.dragging) {
            return;
        }
        var helpMsg = me.clickToDrawText;
        var helpTooltipCoord = evt.coordinate;
        var measureTooltipCoord = evt.coordinate;
        if (me.sketch) {
            var output;
            var geom = (me.sketch.getGeometry());
            if (geom instanceof ol.geom.Polygon) {
                output = me.formatArea(geom);
                helpMsg = me.continuePolygonMsg;
                helpTooltipCoord = geom.getLastCoordinate();
                measureTooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = me.formatLength(geom);
                helpMsg = me.continueLineMsg;
                helpTooltipCoord = geom.getLastCoordinate();
                measureTooltipCoord = geom.getLastCoordinate();
            }
            me.measureTooltipElement.innerHTML = output;
            me.measureTooltip.setPosition(measureTooltipCoord);
        }
        me.helpTooltipElement.innerHTML = helpMsg;
        me.helpTooltip.setPosition(helpTooltipCoord);
    },
    /**
    * Creates a new help tooltip
    */
    createHelpTooltip: function() {
        var me = this;
        if (me.helpTooltipElement) {
            me.helpTooltipElement.parentNode.removeChild(me.helpTooltipElement);
        }
        me.helpTooltipElement = Ext.dom.Helper.createDom('<div>');
        me.helpTooltipElement.className = 'tooltip';
        me.helpTooltip = new ol.Overlay({
            element: me.helpTooltipElement,
            offset: [
                15,
                0
            ],
            positioning: 'center-left'
        });
        me.map.addOverlay(me.helpTooltip);
    },
    /**
    * Creates a new measure tooltip
    */
    createMeasureTooltip: function() {
        var me = this;
        if (me.measureTooltipElement) {
            me.measureTooltipElement.parentNode.removeChild(me.measureTooltipElement);
        }
        me.measureTooltipElement = Ext.dom.Helper.createDom('<div>');
        me.measureTooltipElement.className = 'tooltip tooltip-measure';
        me.measureTooltip = new ol.Overlay({
            element: me.measureTooltipElement,
            offset: [
                0,
                -15
            ],
            positioning: 'bottom-center'
        });
        me.map.addOverlay(me.measureTooltip);
    },
    /**
    * format length output
    * @param {ol.geom.LineString} line
    * @return {string}
    */
    formatLength: function(line) {
        var me = this,
            decimalHelper = Math.pow(10, me.decimalPlacesInToolTips),
            length;
        if (me.geodesic) {
            var wgs84Sphere = new ol.Sphere(6378137);
            var coordinates = line.getCoordinates();
            length = 0;
            var sourceProj = me.map.getView().getProjection();
            for (var i = 0,
                ii = coordinates.length - 1; i < ii; ++i) {
                var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
                var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
                length += wgs84Sphere.haversineDistance(c1, c2);
            }
        } else {
            length = Math.round(line.getLength() * 100) / 100;
        }
        var output;
        if (me.switchToKmOnLargeValues && length > 1000) {
            output = (Math.round(length / 1000 * decimalHelper) / decimalHelper) + ' ' + 'km';
        } else {
            output = (Math.round(length * decimalHelper) / decimalHelper) + ' m';
        }
        return output;
    },
    /**
    * format length output
    * @param {ol.geom.Polygon} polygon
    * @return {string}
    */
    formatArea: function(polygon) {
        var me = this,
            decimalHelper = Math.pow(10, me.decimalPlacesInToolTips),
            area;
        if (me.geodesic) {
            var wgs84Sphere = new ol.Sphere(6378137);
            var sourceProj = me.map.getView().getProjection();
            var geom = (polygon.clone().transform(sourceProj, 'EPSG:4326'));
            var coordinates = geom.getLinearRing(0).getCoordinates();
            area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
        } else {
            area = polygon.getArea();
        }
        var output;
        if (me.switchToKmOnLargeValues && area > 10000) {
            output = (Math.round(area / 1000000 * decimalHelper) / decimalHelper) + ' km<sup>2</sup>';
        } else {
            output = (Math.round(area * decimalHelper) / decimalHelper) + ' ' + 'm<sup>2</sup>';
        }
        return output;
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Permalink FormPanel
 *
 * Used to show a permalink of the mapstate (center, zoom, visible layers)
 *
 */
Ext.define("Basepackage.view.form.Permalink", {
    extend: "Ext.form.Panel",
    xtype: 'base-form-permalink',
    requires: [
        'Ext.button.Button'
    ],
    viewModel: {
        data: {
            permalink: 'Permalink'
        }
    },
    padding: 5,
    layout: 'fit',
    minWidth: 320,
    defaults: {
        anchor: '100%'
    },
    items: [
        {
            xtype: 'textfield',
            name: 'textfield-permalink',
            editable: false,
            listeners: {
                afterrender: function(textfield) {
                    var permalink = textfield.up('form').getPermalink();
                    textfield.setValue(permalink);
                },
                change: function(textfield) {
                    var width = Ext.util.TextMetrics.measure(textfield.getEl(), textfield.getValue()).width;
                    textfield.setWidth(width + 20);
                }
            }
        }
    ],
    buttons: [
        {
            text: 'Erneuern',
            handler: function(btn) {
                var permalink = btn.up('form').getPermalink();
                var textfield = btn.up('form').down('textfield');
                textfield.setValue(permalink);
            }
        }
    ],
    getPermalink: function() {
        var route = Basepackage.util.Application.getRoute();
        var hrefWithoutHash = window.location.origin + window.location.pathname + window.location.search;
        var permalink = hrefWithoutHash + '#' + route;
        return permalink;
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * AddWms Button
 *
 * Button used to instanciate the base-form-addwms in order to add a
 * WMS to the map
 *
 */
Ext.define("Basepackage.view.button.Permalink", {
    extend: "Ext.button.Button",
    xtype: 'base-button-permalink',
    requires: [
        'Ext.window.Window',
        'Basepackage.view.form.Permalink',
        'Basepackage.util.Animate',
        'Basepackage.util.Application'
    ],
    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },
    /**
    *
    */
    handler: function() {
        var win = Ext.ComponentQuery.query('[name=permalink-window]')[0];
        if (!win) {
            Ext.create('Ext.window.Window', {
                name: 'permalink-window',
                title: 'Permalink',
                layout: 'fit',
                items: [
                    {
                        xtype: 'base-form-permalink'
                    }
                ]
            }).show();
        } else {
            Basepackage.util.Animate.shake(win);
        }
    },
    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Permalink',
            text: 'Permalink'
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * ZoomIn Button
 *
 * Button used to zoom in
 *
 */
Ext.define("Basepackage.view.button.ToggleLegend", {
    extend: "Ext.button.Button",
    xtype: 'base-button-togglelegend',
    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Layerauswahl',
            text: null
        }
    },
    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },
    glyph: 'xf022@FontAwesome',
    /**
    *
    */
    handler: function(button) {
        // TODO refactor so this works even outside of the mapcontainer
        var legendPanel = button.up("base-panel-mapcontainer").down('base-panel-legendtree');
        if (legendPanel.getCollapsed()) {
            legendPanel.expand();
        } else {
            legendPanel.collapse();
        }
        button.blur();
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * ZoomIn Button
 *
 * Button used to zoom in
 *
 */
Ext.define("Basepackage.view.button.ZoomIn", {
    extend: "Ext.button.Button",
    xtype: 'base-button-zoomin',
    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Hineinzoomen',
            text: null
        }
    },
    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },
    glyph: 'xf00e@FontAwesome',
    /**
    *
    */
    handler: function(button) {
        var olMap = button.up("base-panel-mapcontainer").down('gx_map').getMap();
        var olView = button.up("base-panel-mapcontainer").down('gx_map').getView();
        var zoom = ol.animation.zoom({
                resolution: olView.getResolution(),
                duration: 500
            });
        olMap.beforeRender(zoom);
        olView.setResolution(olView.getResolution() / 2);
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * ZoomIn Button
 *
 * Button used to zoom in
 *
 */
Ext.define("Basepackage.view.button.ZoomOut", {
    extend: "Ext.button.Button",
    xtype: 'base-button-zoomout',
    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Herauszoomen',
            text: null
        }
    },
    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },
    glyph: 'xf010@FontAwesome',
    /**
    *
    */
    handler: function(button) {
        // TODO refactor so this works even outside of the mapcontainer
        var olMap = button.up("base-panel-mapcontainer").down('gx_map').getMap();
        var olView = button.up("base-panel-mapcontainer").down('gx_map').getView();
        var zoom = ol.animation.zoom({
                resolution: olView.getResolution(),
                duration: 500
            });
        olMap.beforeRender(zoom);
        olView.setResolution(olView.getResolution() * 2);
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * ZoomIn Button
 *
 * Button used to zoom in
 *
 */
Ext.define("Basepackage.view.button.ZoomToExtent", {
    extend: "Ext.button.Button",
    xtype: 'base-button-zoomtoextent',
    requires: [
        'Basepackage.util.Application'
    ],
    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Auf Gesamtansicht zoomen',
            text: null
        }
    },
    /**
     * Center is required on instantiation.
     * Either zoom or Resolution is required on instantiation.
     */
    config: {
        center: null,
        zoom: null,
        resolution: null
    },
    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },
    glyph: 'xf0b2@FontAwesome',
    initComponent: function() {
        this.callParent(arguments);
        if (this.getZoom() && this.getResolution()) {
            Ext.raise('Zoom and resolution set for Extent Button!' + 'Please choose one.');
        }
        this.setConfigValues();
    },
    /**
     *
     */
    setConfigValues: function() {
        var appContext = Basepackage.util.Application.getAppContext();
        if (appContext) {
            if (!this.getCenter()) {
                this.setCenter(appContext.startCenter);
            }
            if (!this.getZoom() && !this.getResolution()) {
                this.setZoom(appContext.startZoom);
            }
        }
    },
    /**
    *
    */
    handler: function(button) {
        this.setConfigValues();
        // TODO refactor so this works even outside of the mapcontainer
        var olMap = button.up("base-panel-mapcontainer").down('gx_map').getMap();
        var olView = button.up("base-panel-mapcontainer").down('gx_map').getView();
        var targetCenter = this.getCenter();
        var targetResolution = this.getResolution();
        var targetZoom = this.getZoom();
        var pan = ol.animation.pan({
                source: olView.getCenter()
            });
        var zoom = ol.animation.zoom({
                resolution: olView.getResolution()
            });
        olMap.beforeRender(pan);
        olMap.beforeRender(zoom);
        olView.setCenter(targetCenter);
        if (targetZoom) {
            olView.setZoom(targetZoom);
        } else {
            olView.setResolution(targetResolution);
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * ScaleCombo
 *
 * Lets the user control the maps scale with a combobox
 *
 */
Ext.define("Basepackage.view.combo.ScaleCombo", {
    xtype: "base-combo-scale",
    extend: 'Ext.form.field.ComboBox',
    requires: [],
    /**
     *
     */
    queryMode: 'local',
    /**
     *
     */
    forceSelection: false,
    /**
     *
     */
    allowBlank: false,
    /**
     *
     */
    width: 120,
    /**
     *
     */
    editable: false,
    /**
     *
     */
    displayField: 'scale',
    /**
     *
     */
    valueField: 'resolution',
    /**
     *
     */
    fields: [
        'scale',
        'resolution'
    ],
    /**
     *
     */
    fieldLabel: '',
    /**
     *
     */
    map: null,
    config: {
        /**
         *
         */
        scales: [
            {
                "scale": "1:2.000.000",
                "resolution": 560
            },
            {
                "scale": "1:1.000.000",
                "resolution": 280
            },
            {
                "scale": "1:500.000",
                "resolution": 140
            },
            {
                "scale": "1:250.000",
                "resolution": 70
            },
            {
                "scale": "1:100.000",
                "resolution": 28
            },
            {
                "scale": "1:50.000",
                "resolution": 14
            },
            {
                "scale": "1:25.000",
                "resolution": 7
            },
            {
                "scale": "1:10.000",
                "resolution": 2.8
            },
            {
                "scale": "1:5.000",
                "resolution": 1.4
            },
            {
                "scale": "1:2.500",
                "resolution": 0.7
            },
            {
                "scale": "1:1.000",
                "resolution": 0.28
            },
            {
                "scale": "1:500",
                "resolution": 0.14
            }
        ]
    },
    /**
     *
     */
    initComponent: function() {
        var me = this;
        if (!me.map) {
            me.map = Ext.ComponentQuery.query("gx_map")[0].getMap();
        }
        // using hard scales here as there is no way currently known to
        // retrieve all resolutions from the map
        var scaleStore = Ext.create('Ext.data.Store', {
                sorters: [
                    {
                        property: 'resolution',
                        direction: 'DESC'
                    }
                ],
                data: me.getScales()
            });
        me.store = scaleStore;
        me.callParent([
            arguments
        ]);
        // set the correct default value
        me.setValue(me.map.getView().getResolution());
        // register listeners to update combo and map
        me.on('select', function(combo, rec) {
            me.map.getView().setResolution(rec.get('resolution'));
        });
        me.map.getView().on('change:resolution', me.updateComboOnMapChange, me);
    },
    /**
     * Method updates the combo with the current maps scale
     * If the current scale is not available in the scaleStore, it will
     * be created and added. This way we support maps with different scales than
     * the hard ones in our scaleStore
     */
    updateComboOnMapChange: function(evt) {
        var resolution = evt.target.get(evt.key),
            store = this.getStore(),
            matchInStore = false;
        matchInStore = (store.findExact("resolution", resolution) >= 0) ? true : false;
        if (matchInStore) {
            this.setValue(resolution);
        } else {
            var rec = {
                    scale: '1:' + Math.round(this.getCurrentScale(resolution)).toLocaleString(),
                    resolution: resolution
                };
            store.add(rec);
            this.setValue(resolution);
        }
    },
    /**
     * a little getScale helper
     */
    getCurrentScale: function(resolution) {
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap(),
            units = map.getView().getProjection().getUnits(),
            dpi = 25.4 / 0.28,
            mpu = ol.proj.METERS_PER_UNIT[units],
            scale = resolution * mpu * 39.37 * dpi;
        return scale;
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Map Component
 *
 * Setting up a ol3-map by calling the config parser with the given appContext.
 * If no appContext is found, a default one will be loaded.
 * Class usually instanciated in map container.
 *
 */
Ext.define("Basepackage.view.component.Map", {
    extend: "GeoExt.component.Map",
    xtype: "base-component-map",
    requires: [
        "Basepackage.util.ConfigParser",
        "Basepackage.util.Layer"
    ],
    inheritableStatics: {
        guess: function() {
            return Ext.ComponentQuery.query('base-component-map')[0];
        }
    },
    /**
     * The app context
     */
    appContext: null,
    /**
     * The URL to the app Context resource.
     * Gets requested via AJAX, can be a local file or an webinterface
     */
    appContextPath: 'resources/appContext.json',
    /**
     * The appContext to use when no real context could be retrieved
     */
    fallbackAppContext: {
        "data": {
            "merge": {
                "startCenter": [
                    1163261,
                    6648489
                ],
                "startZoom": 5,
                "mapLayers": [
                    {
                        "name": "OSM WMS",
                        "type": "TileWMS",
                        "url": "http://ows.terrestris.de/osm/service?",
                        "layers": "OSM-WMS",
                        "topic": false
                    }
                ],
                "mapConfig": {
                    "projection": "EPSG:3857",
                    "resolutions": [
                        156543.03390625,
                        78271.516953125,
                        39135.7584765625,
                        19567.87923828125,
                        9783.939619140625,
                        4891.9698095703125,
                        2445.9849047851562,
                        1222.9924523925781,
                        611.4962261962891,
                        305.74811309814453,
                        152.87405654907226,
                        76.43702827453613,
                        38.218514137268066,
                        19.109257068634033,
                        9.554628534317017,
                        4.777314267158508,
                        2.388657133579254,
                        1.194328566789627,
                        0.5971642833948135
                    ],
                    "zoom": 0
                }
            }
        }
    },
    /**
     * If this class is extended by an application that uses controllers,
     * this property should be set to false and the corresponding methods
     * have to be implemented in the controller.
     */
    defaultListenerScope: true,
    /**
     * flag determines if the layers created by configparser should contain
     * automatically generated legendurls
     */
    autocreateLegends: false,
    /**
     * flag determines if the the window.location.hash should be manipulated
     * during runtime
     */
    activeRouting: false,
    constructor: function(config) {
        var me = this;
        if (!me.getMap()) {
            // need to handle config first as its not applied yet
            var url = config && config.appContextPath ? config.appContextPath : me.appContextPath;
            Ext.Ajax.request({
                url: url,
                async: false,
                success: function(response) {
                    if (Ext.isString(response.responseText)) {
                        me.appContext = Ext.decode(response.responseText);
                    } else if (Ext.isObject(response.responseText)) {
                        me.appContext = response.responseText;
                    } else {
                        Ext.log.error("Error! Could not parse appContext!");
                    }
                },
                failure: function(response) {
                    Ext.log.error("Error! No application " + "context found, example loaded", response);
                    me.appContext = me.fallbackAppContext;
                }
            });
            Basepackage.util.ConfigParser.autocreateLegends = config.autocreateLegends;
            Basepackage.util.ConfigParser.activeRouting = config.activeRouting;
            var olMap = Basepackage.util.ConfigParser.setupMap(me.appContext);
            me.setMap(olMap);
        }
        me.addControls();
        me.callParent([
            config
        ]);
    },
    addControls: function() {
        var map = this.getMap();
        var attribution = new ol.control.Attribution({
                collapsible: false,
                logo: false
            });
        map.addControl(attribution);
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Layer Slider
 *
 * Used to change opacity on multiple layers by fading them in and out
 * one by one. Can be useful e.g. to slide 'through the time'
 *
 * Example usage:
 *
 * {
 *      xtype: 'base-slider-layer',
 *      layerNames: [
 *           'Luftbilder 1936',
 *           'Luftbilder 1971',
 *           'Luftbilder 1999'
 *      ],
 *      sliderTitles: [
 *           '1936',
 *           '1971',
 *           '1999'
 *      ],
 *      topTitle: 'Luftbilder',
 *      addOffState: false
 * }
 *
 * TODOs:
 *   * Handle problems that occur when layers are visible in tree and get
 *     checked / unchecked
 *   * Make the slider / label positioning more flexible / dynamic
 *
 */
Ext.define("Basepackage.view.container.LayerSlider", {
    extend: "Ext.container.Container",
    xtype: "base-slider-layer",
    requires: [
        "Ext.slider.Single"
    ],
    sliderConfig: {
        flex: 6,
        value: 0,
        minValue: 0,
        maxValue: 100,
        useTips: false
    },
    /**
     *
     */
    width: 250,
    /**
     * Array gets filled with ol-layers by the given layernames
     */
    layers: [],
    /**
     * The titles for the layerslider items
     */
    sliderTitles: [],
    /**
     * the title appearing on top the slider
     */
    topTitle: null,
    /**
     * flag used to indicate that the slider should have an "off" state at the
     * beginning. When set to true, no slider-layer is initially visible
     */
    addOffState: true,
    /**
     * The index of the layer that should be active on init.
     * Slider will get set to the desired value
     */
    initialActiveLayerIdx: 0,
    /**
     * the cls
     */
    cls: 'layerSlider',
    /**
     *
     */
    initComponent: function() {
        var me = this,
            map = Ext.ComponentQuery.query('gx_map')[0].getMap(),
            layoutColumns = me.addOffState ? me.layerNames.length + 1 : me.layerNames.length,
            labelItems = me.getLabelItems(),
            items = [];
        me.layers = [];
        if (Ext.isEmpty(me.layerNames) || me.layerNames.length < 2) {
            Ext.log.error('Not enough layers given to slider!');
        } else {
            Ext.each(me.layerNames, function(ln) {
                me.addLayerByName(map.getLayers().getArray(), ln);
            });
        }
        if (me.layerNames.length !== me.layers.length) {
            Ext.log.error('Could not detect all layers by name!');
        }
        // set the colspan for slider
        me.config.colspan = layoutColumns;
        var slider = Ext.create('Ext.slider.Single', me.sliderConfig);
        if (!Ext.isEmpty(me.topTitle)) {
            var titleContainer = {
                    xtype: 'container',
                    cls: 'sliderTopTitle',
                    html: me.topTitle
                };
            items.push(titleContainer);
        }
        var labelContainer = {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: labelItems
            };
        items.push(labelContainer);
        var sliderContainer = {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [
                    {
                        xtype: 'container',
                        flex: 1
                    },
                    slider,
                    {
                        xtype: 'container',
                        flex: 1
                    }
                ]
            };
        items.push(sliderContainer);
        me.items = items;
        me.callParent();
        slider.on("change", me.changeHandler);
        if (me.initialActiveLayerIdx > 0) {
            var sliderVal = slider.maxValue / (me.addOffState ? me.layers.length : me.layers.length - 1) * me.initialActiveLayerIdx;
            slider.setValue(sliderVal);
            slider.fireEvent('change', slider, sliderVal);
        }
    },
    /**
     * Returns the label items
     */
    getLabelItems: function() {
        var me = this,
            labelItems = [];
        if (me.addOffState) {
            // add the starter
            labelItems.push({
                xtype: 'container',
                html: 'Aus',
                flex: 1,
                cls: 'sliderLabel'
            });
        }
        Ext.each(me.sliderTitles, function(title) {
            labelItems.push({
                xtype: 'container',
                html: title,
                flex: 1,
                cls: 'sliderLabel'
            });
        });
        return labelItems;
    },
    /**
     * Adds Layers to a member variable by the given layernames
     */
    addLayerByName: function(collection, ln) {
        var me = this;
        Ext.each(collection, function(layer, idx) {
            if (layer.get('name') === ln) {
                if (!me.addOffState && idx === 0) {
                    // we have to set the first layer initially full visible
                    layer.set('opacity', 1);
                    layer.setVisible(true);
                } else {
                    // with addOffState, first layer must be opaque
                    layer.set('opacity', 0);
                    layer.setVisible(false);
                }
                layer.set('isSliderLayer', true);
                me.layers.push(layer);
                return false;
            }
            if (layer instanceof ol.layer.Group) {
                me.addLayerByName(layer.getLayers().getArray(), ln);
            }
        });
    },
    /**
     * Handling the opacity change on the configured layers
     */
    changeHandler: function(slider, value) {
        var me = this.up('base-slider-layer'),
            swapRange = slider.maxValue / (me.addOffState ? me.layers.length : me.layers.length - 1);
        if (value === slider.maxValue) {
            // maxValue breaks mathematics so we use maxValue -1;
            value = slider.maxValue - 1;
        }
        var idx = parseInt(value / swapRange, 10);
        // disable all layers in order to avoid unnecessary requests and
        // gain performance. enable required ones later...
        Ext.each(me.layers, function(layer) {
            layer.setVisible(false);
        });
        if (value >= swapRange || !me.addOffState) {
            // need to break down the value to the corresponding range.
            // with e.g. 4 layers this will always be between 0 and 25
            value = value - swapRange * idx;
            if (!me.addOffState) {
                me.layers[idx].set('opacity', Math.abs(1 - (value * me.layers.length / 100)));
                me.layers[idx + 1].set('opacity', value * me.layers.length / 100);
                me.layers[idx].setVisible(true);
                me.layers[idx + 1].setVisible(true);
            } else {
                me.layers[idx - 1].set('opacity', Math.abs(1 - (value * me.layers.length / 100)));
                me.layers[idx].set('opacity', value * me.layers.length / 100);
                me.layers[idx - 1].setVisible(true);
                me.layers[idx].setVisible(true);
            }
        } else {
            // we are on the first slide part and have an offState,
            // just fade in the first layer
            me.layers[idx].set('opacity', value * me.layers.length / 100);
            me.layers[idx].setVisible(true);
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Nominatim Search
 *
 * Used to search in the glorious dataset of OSM
 *
 * Example of usage:
      {
          xtype: 'base-search-nominatim',
          clusterResults: true,
          viewboxlbrt: '6.9186,52.4677,11.2308,53.9642'
      }
 *
 */
Ext.define("Basepackage.view.container.NominatimSearch", {
    extend: "Ext.container.Container",
    xtype: "base-search-nominatim",
    requires: [
        'GeoExt.data.store.Features',
        'GeoExt.grid.column.Symbolizer',
        'Basepackage.util.Animate'
    ],
    config: {
        /**
         * The URL to the nominatim service
         */
        nominatimUrl: 'http://nominatim.openstreetmap.org',
        /**
         *
         */
        format: 'json',
        /**
         * limit the search results count
         */
        limit: 100,
        /**
         * The lat-lon viewbox to limit the searchquery to
         */
        viewboxlbrt: '-180,90,180,-90',
        /**
         * minimum chars to trigger the search
         */
        minSearchTextChars: 3,
        /**
         * delay before query gets triggered to avoid triggers while typing
         */
        typeDelay: 500,
        /**
         * the template to change the groups titles
         */
        groupHeaderTpl: '{type}',
        /**
         *
         */
        searchResultFeatureStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#8B0000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            fill: new ol.style.Fill({
                color: '#8B0000'
            }),
            stroke: new ol.style.Stroke({
                color: '#8B0000',
                width: 4
            })
        }),
        /**
         *
         */
        searchResultHighlightFeatureStyleFn: function(radius, text) {
            return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: '#EE0000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'gray',
                        width: 3
                    })
                }),
                text: text ? new ol.style.Text({
                    text: text.toString(),
                    fill: new ol.style.Fill({
                        color: '#fff'
                    })
                }) : undefined
            });
        },
        /**
         *
         */
        searchResultSelectFeatureStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({
                    color: '#0099CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            fill: new ol.style.Fill({
                color: '#0099CC'
            }),
            stroke: new ol.style.Stroke({
                color: '#0099CC',
                width: 6
            })
        }),
        /**
        *
        */
        clusterStyleFn: function(amount, radius) {
            // set maxradius
            var maxRadius = this.clusterLayer.getSource().distance_ / 2;
            if (radius > maxRadius) {
                radius = maxRadius;
            }
            return [
                new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,
                        stroke: new ol.style.Stroke({
                            color: '#fff'
                        }),
                        fill: new ol.style.Fill({
                            color: '#3399CC'
                        })
                    }),
                    text: new ol.style.Text({
                        text: amount.toString(),
                        fill: new ol.style.Fill({
                            color: '#fff'
                        })
                    })
                })
            ];
        },
        /**
         *
         */
        highLightFeatureOnHoverInGrid: true
    },
    /**
     *
     */
    layout: 'fit',
    /**
     *
     */
    typeDelayTask: null,
    /**
     *
     */
    searchTerm: null,
    /**
     *
     */
    searchResultVectorLayer: null,
    /**
     *
     */
    clusterLayer: null,
    /**
     *
     */
    clusterResults: false,
    /**
     *
     */
    styleCache: [],
    /**
     *
     */
    initComponent: function() {
        var me = this,
            map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        if (!me.searchResultVectorLayer) {
            me.searchResultVectorLayer = new ol.layer.Vector({
                name: 'nominatimsearchresult',
                source: new ol.source.Vector(),
                style: me.getSearchResultFeatureStyle(),
                visible: !me.clusterResults
            });
            map.addLayer(me.searchResultVectorLayer);
        }
        if (me.clusterResults && !me.clusterLayer) {
            var clusterSource = new ol.source.Cluster({
                    distance: 40,
                    source: me.searchResultVectorLayer.getSource()
                });
            //new ol.source.Vector()
            me.clusterLayer = new ol.layer.Vector({
                name: 'nominatimclusterlayer',
                source: clusterSource,
                style: function(feature) {
                    var amount = feature.get('features').length;
                    var style = me.styleCache[amount];
                    if (!style) {
                        style = me.clusterStyleFn(amount, amount + 10);
                        me.styleCache[amount] = style;
                    }
                    return style;
                }
            });
            map.addLayer(me.clusterLayer);
            // correct the vectorlayerstyle for the grid symbolizer
            me.searchResultVectorLayer.setStyle(me.clusterStyleFn('', 8));
        }
        var searchResultStore = Ext.create('GeoExt.data.store.Features', {
                map: map,
                layer: me.searchResultVectorLayer,
                groupField: 'type'
            });
        me.items = [
            {
                xtype: 'textfield',
                name: 'nominatimSearchTerm',
                fieldLabel: 'Suchbegriff',
                enableKeyEvents: true,
                listeners: {
                    change: me.handleKeyDown
                }
            },
            {
                xtype: 'grid',
                name: 'nominatimsearchresultgrid',
                hidden: true,
                hideHeaders: true,
                title: 'Suchergebnisse',
                store: searchResultStore,
                columns: [
                    {
                        xtype: 'gx_symbolizercolumn',
                        flex: 1
                    },
                    {
                        dataIndex: 'displayfield',
                        flex: 7,
                        renderer: function(value) {
                            return '<span data-qtip="' + value + '">' + value + '</span>';
                        }
                    }
                ],
                features: [
                    {
                        ftype: 'grouping',
                        groupHeaderTpl: me.getGroupHeaderTpl()
                    }
                ],
                width: 200,
                height: 300
            },
            {
                xtype: 'button',
                text: 'Zurücksetzen',
                margin: '10 0 0 0',
                handler: me.resetSearchGridAndText,
                scope: me
            }
        ];
        me.callParent(arguments);
        me.on('nominatimResponse', me.showSearchResults);
        me.on('show', me.down('textfield').focus);
        var grid = me.down('grid[name=nominatimsearchresultgrid]');
        if (me.getHighLightFeatureOnHoverInGrid()) {
            grid.on('itemmouseenter', me.highlightFeature, me);
            grid.on('itemmouseleave', me.unhighlightFeature, me);
        }
        grid.on('itemclick', me.highlightSelectedFeature, me);
    },
    /**
     *
     */
    handleKeyDown: function(textfield) {
        var me = textfield.up('base-search-nominatim'),
            val = textfield.getValue();
        if (val.length < me.getMinSearchTextChars()) {
            return;
        }
        // set the searchterm on component
        me.searchTerm = val;
        // reset grid from aold values
        me.resetGrid();
        // prepare the describeFeatureType for all given layers
        if (me.typeDelayTask) {
            me.typeDelayTask.cancel();
        }
        me.typeDelayTask = new Ext.util.DelayedTask(function() {
            me.triggerSearch();
        });
        me.typeDelayTask.delay(me.getTypeDelay());
    },
    resetSearchGridAndText: function() {
        var me = this;
        me.down('textfield[name=nominatimSearchTerm]').setValue('');
        me.resetGrid();
    },
    /**
     *
     */
    resetGrid: function() {
        var me = this;
        me.searchResultVectorLayer.getSource().clear();
        me.down('grid[name=nominatimsearchresultgrid]').hide();
    },
    /**
     *
     */
    triggerSearch: function() {
        var me = this,
            results;
        var requestParams = {
                q: me.searchTerm,
                format: me.getFormat(),
                limit: me.getLimit(),
                viewboxlbrt: me.getViewboxlbrt(),
                bounded: 1
            };
        var url = me.getNominatimUrl() + "?";
        Ext.iterate(requestParams, function(k, v) {
            url += k + "=" + v + "&";
        });
        me.setLoading(true);
        Ext.Ajax.request({
            url: url,
            success: function(response) {
                me.setLoading(false);
                if (Ext.isString(response.responseText)) {
                    results = Ext.decode(response.responseText);
                } else if (Ext.isObject(response.responseText)) {
                    results = response.responseText;
                } else {
                    Ext.log.error("Error! Could not parse " + "nominatim response!");
                }
                me.fireEvent('nominatimResponse', results);
            },
            failure: function(response) {
                me.setLoading(false);
                Ext.log.error("Error on nominatim request:", response);
            }
        });
    },
    /**
     * Response example:
     *  {
            "place_id": "14823013",
            "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
            "osm_type": "node",
            "osm_id": "1364459810",
            "boundingbox": [
                "53.4265254",
                "53.4266254",
                "8.5341417",
                "8.5342417"
            ],
            "lat": "53.4265754",
            "lon": "8.5341917",
            "display_name": "Bäckerei, Bütteler Straße, Loxstedt, Landkreis Cuxhaven, Niedersachsen, 27612, Deutschland",
            "class": "highway",
            "type": "bus_stop",
            "importance": 0.101,
            "icon": "http://nominatim.openstreetmap.org/images/mapicons/transport_bus_stop2.p.20.png",
            "address": {
                "bus_stop": "Bäckerei",
                "road": "Bütteler Straße",
                "village": "Loxstedt",
                "county": "Landkreis Cuxhaven",
                "state": "Niedersachsen",
                "postcode": "27612",
                "country": "Deutschland",
                "country_code": "de"
            }
     *  }
     */
    showSearchResults: function(features) {
        var me = this,
            grid = me.down('grid[name=nominatimsearchresultgrid]');
        if (features.length > 0) {
            grid.show();
        }
        Ext.each(features, function(feature) {
            var displayfield;
            // find the matching value in order to display it
            Ext.iterate(feature, function(k, v) {
                if (v && v.toString().toLowerCase().indexOf(me.searchTerm) > -1) {
                    displayfield = v;
                    return false;
                }
            });
            var olFeat = new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.transform([
                        parseFloat(feature.lon),
                        parseFloat(feature.lat)
                    ], 'EPSG:4326', 'EPSG:3857')),
                    properties: feature
                });
            if (!displayfield) {
                olFeat.set('displayfield', feature.display_name);
            } else {
                olFeat.set('displayfield', displayfield);
            }
            me.searchResultVectorLayer.getSource().addFeature(olFeat);
        });
        var featureExtent = me.searchResultVectorLayer.getSource().getExtent();
        if (!Ext.Array.contains(featureExtent, Infinity)) {
            me.zoomToExtent(featureExtent);
        }
    },
    /**
     * Works with extent or geom.
     */
    zoomToExtent: function(extent) {
        var olMap = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var olView = olMap.getView();
        var pan = ol.animation.pan({
                source: olView.getCenter()
            });
        var zoom = ol.animation.zoom({
                resolution: olView.getResolution()
            });
        olMap.beforeRender(pan, zoom);
        olView.fit(extent, olMap.getSize());
    },
    /**
     * update the symbolizer in the grid
     */
    updateRenderer: function(item, style) {
        var renderer = Ext.getCmp(Ext.query('div[id^=gx_renderer', true, item)[0].id);
        var src = renderer.map.getLayers().getArray()[0].getSource();
        src.getFeatures()[0].setStyle(style);
    },
    /**
     *
     */
    highlightFeature: function(tableView, record, item) {
        if (this.enterEventRec === record) {
            return;
        }
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var feature;
        var radius;
        var text;
        this.enterEventRec = record;
        ol.Observable.unByKey(this.flashListenerKey);
        if (this.clusterResults) {
            feature = this.getClusterFeatureFromFeature(record.olObject);
            var featureStyle = this.clusterLayer.getStyle()(feature, map.getView().getResolution())[0];
            radius = featureStyle.getImage().getRadius();
            text = featureStyle.getText().getText();
        } else {
            feature = record.olObject;
            radius = 5;
        }
        // default value
        if (tableView.getSelection()[0] !== record) {
            feature.setStyle(this.getSearchResultHighlightFeatureStyleFn()(radius, text));
            this.updateRenderer(item, this.getSearchResultHighlightFeatureStyleFn()(8, text));
        }
        if (feature) {
            this.flashListenerKey = Basepackage.util.Animate.flashFeature(feature, 1000, radius);
        }
    },
    /**
     *
     */
    unhighlightFeature: function(tableView, record, item) {
        if (this.leaveEventRec === record) {
            return;
        }
        this.leaveEventRec = record;
        if (tableView.getSelection()[0] !== record) {
            record.olObject.setStyle(this.getSearchResultFeatureStyle());
            if (this.clusterResults) {
                this.updateRenderer(item, this.clusterStyleFn('', 8));
            } else {
                this.updateRenderer(item, this.getSearchResultFeatureStyle());
            }
        }
    },
    /**
     *
     */
    highlightSelectedFeature: function(tableView, record, item) {
        var store = tableView.getStore();
        store.each(function(rec) {
            rec.olObject.setStyle(this.getSearchResultFeatureStyle());
            var row = tableView.getRowByRecord(rec);
            if (this.clusterResults) {
                this.updateRenderer(row, this.clusterStyleFn('', 8));
            } else {
                this.updateRenderer(row, this.getSearchResultFeatureStyle());
            }
        }, this);
        record.olObject.setStyle(this.getSearchResultSelectFeatureStyle());
        this.updateRenderer(item, this.getSearchResultSelectFeatureStyle());
        this.zoomToExtent(record.olObject.getGeometry());
    },
    /**
     *
     */
    getClusterFeatureFromFeature: function(feature) {
        var me = this;
        var clusterFeature;
        var clusterFeatures = me.clusterLayer.getSource().getFeatures();
        Ext.each(clusterFeatures, function(feat) {
            if (!Ext.isEmpty(feat.get('features'))) {
                Ext.each(feat.get('features'), function(f) {
                    if (f.getProperties().properties.osm_id && feature.getProperties().properties.osm_id && f.getProperties().properties.osm_id === feature.getProperties().properties.osm_id) {
                        clusterFeature = feat;
                        return false;
                    }
                });
            }
            if (!Ext.isEmpty(clusterFeature)) {
                return false;
            }
        });
        return clusterFeature;
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Overpass Search
 *
 * Used to search in the glorious dataset of OSM
 *
 * Example of usage:
      {
          xtype: 'base-search-overpass',
          clusterResults: true,
          viewboxlbrt: '52.4677,6.9186,53.9642,11.2308'
      }
 *
 */
Ext.define("Basepackage.view.container.OverpassSearch", {
    extend: "Ext.container.Container",
    xtype: "base-container-overpasssearch",
    requires: [
        'GeoExt.data.store.Features',
        'GeoExt.grid.column.Symbolizer',
        'Basepackage.util.Animate'
    ],
    config: {
        /**
         * The URL to the overpass service
         */
        overpassUrl: 'http://overpass-api.de/api/interpreter',
        /**
         *
         */
        format: 'json',
        /**
         * limit the search results count
         */
        limit: 100,
        /**
         * The lat-lon viewbox to limit the searchquery to
         */
        viewboxlbrt: '90,-180,-90,180',
        /**
         * minimum chars to trigger the search
         */
        minSearchTextChars: 3,
        /**
         * delay before query gets triggered to avoid triggers while typing
         */
        typeDelay: 500,
        /**
         * the template to change the groups titles
         */
        groupHeaderTpl: '{type}',
        /**
         *
         */
        searchResultFeatureStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#8B0000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            fill: new ol.style.Fill({
                color: '#8B0000'
            }),
            stroke: new ol.style.Stroke({
                color: '#8B0000',
                width: 4
            })
        }),
        /**
         *
         */
        searchResultHighlightFeatureStyleFn: function(radius, text) {
            return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: '#EE0000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'gray',
                        width: 3
                    })
                }),
                text: text ? new ol.style.Text({
                    text: text.toString(),
                    fill: new ol.style.Fill({
                        color: '#fff'
                    })
                }) : undefined
            });
        },
        /**
         *
         */
        searchResultSelectFeatureStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({
                    color: '#0099CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            fill: new ol.style.Fill({
                color: '#0099CC'
            }),
            stroke: new ol.style.Stroke({
                color: '#0099CC',
                width: 6
            })
        }),
        /**
        *
        */
        clusterStyleFn: function(amount, radius) {
            // set maxradius
            var maxRadius = this.clusterLayer.getSource().distance_ / 2;
            if (radius > maxRadius) {
                radius = maxRadius;
            }
            return [
                new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,
                        stroke: new ol.style.Stroke({
                            color: '#fff'
                        }),
                        fill: new ol.style.Fill({
                            color: '#3399CC'
                        })
                    }),
                    text: new ol.style.Text({
                        text: amount.toString(),
                        fill: new ol.style.Fill({
                            color: '#fff'
                        })
                    })
                })
            ];
        },
        /**
         *
         */
        highLightFeatureOnHoverInGrid: true
    },
    /**
     *
     */
    layout: 'fit',
    /**
     *
     */
    typeDelayTask: null,
    /**
     *
     */
    searchTerm: null,
    /**
     *
     */
    searchResultVectorLayer: null,
    /**
     *
     */
    clusterLayer: null,
    /**
     *
     */
    clusterResults: false,
    /**
     *
     */
    styleCache: [],
    /**
     *
     */
    initComponent: function() {
        var me = this,
            map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        if (!me.searchResultVectorLayer) {
            me.searchResultVectorLayer = new ol.layer.Vector({
                name: 'overpasssearchresult',
                source: new ol.source.Vector(),
                style: me.getSearchResultFeatureStyle(),
                visible: !me.clusterResults
            });
            map.addLayer(me.searchResultVectorLayer);
        }
        if (me.clusterResults && !me.clusterLayer) {
            var clusterSource = new ol.source.Cluster({
                    distance: 40,
                    source: me.searchResultVectorLayer.getSource()
                });
            //new ol.source.Vector()
            me.clusterLayer = new ol.layer.Vector({
                name: 'overpassclusterlayer',
                source: clusterSource,
                style: function(feature) {
                    var amount = feature.get('features').length;
                    var style = me.styleCache[amount];
                    if (!style) {
                        style = me.clusterStyleFn(amount, amount + 10);
                        me.styleCache[amount] = style;
                    }
                    return style;
                }
            });
            map.addLayer(me.clusterLayer);
            // correct the vectorlayerstyle for the grid symbolizer
            me.searchResultVectorLayer.setStyle(me.clusterStyleFn('', 8));
        }
        var searchResultStore = Ext.create('GeoExt.data.store.Features', {
                map: map,
                layer: me.searchResultVectorLayer,
                groupField: 'type'
            });
        me.items = [
            {
                xtype: 'textfield',
                name: 'overpassSearchTerm',
                fieldLabel: 'Suchbegriff',
                enableKeyEvents: true,
                listeners: {
                    change: me.handleKeyDown
                }
            },
            {
                xtype: 'grid',
                name: 'overpasssearchresultgrid',
                hidden: true,
                hideHeaders: true,
                title: 'Suchergebnisse',
                store: searchResultStore,
                columns: [
                    {
                        xtype: 'gx_symbolizercolumn',
                        flex: 1
                    },
                    {
                        dataIndex: 'displayfield',
                        flex: 7,
                        renderer: function(value) {
                            return '<span data-qtip="' + value + '">' + value + '</span>';
                        }
                    }
                ],
                features: [
                    {
                        ftype: 'grouping',
                        groupHeaderTpl: me.getGroupHeaderTpl()
                    }
                ],
                width: 200,
                height: 300
            },
            {
                xtype: 'button',
                text: 'Zurücksetzen',
                margin: '10 0 0 0',
                handler: me.resetSearchGridAndText,
                scope: me
            }
        ];
        me.callParent(arguments);
        me.on('overpassResponse', me.showSearchResults);
        me.on('show', me.down('textfield').focus);
        var grid = me.down('grid[name=overpasssearchresultgrid]');
        if (me.getHighLightFeatureOnHoverInGrid()) {
            grid.on('itemmouseenter', me.highlightFeature, me);
            grid.on('itemmouseleave', me.unhighlightFeature, me);
        }
        grid.on('itemclick', me.highlightSelectedFeature, me);
    },
    /**
     *
     */
    handleKeyDown: function(textfield) {
        var me = textfield.up('base-container-overpasssearch'),
            val = textfield.getValue();
        if (val.length < me.getMinSearchTextChars()) {
            return;
        }
        // set the searchterm on component
        me.searchTerm = val;
        // reset grid from aold values
        me.resetGrid();
        // prepare the describeFeatureType for all given layers
        if (me.typeDelayTask) {
            me.typeDelayTask.cancel();
        }
        me.typeDelayTask = new Ext.util.DelayedTask(function() {
            me.triggerSearch();
        });
        me.typeDelayTask.delay(me.getTypeDelay());
    },
    resetSearchGridAndText: function() {
        var me = this;
        me.down('textfield[name=overpassSearchTerm]').setValue('');
        me.resetGrid();
    },
    /**
     *
     */
    resetGrid: function() {
        var me = this;
        me.searchResultVectorLayer.getSource().clear();
        me.down('grid[name=overpasssearchresultgrid]').hide();
    },
    /**
     *
     */
    triggerSearch: function() {
        var me = this,
            results;
        // details for query params:
        // http://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide
        var requestParams = {
                data: '[out:' + me.getFormat() + '];' + 'node["name"~"' + me.searchTerm + '"]' + '(' + me.getViewboxlbrt() + ');out ' + me.getLimit() + ' qt;'
            };
        var url = me.getOverpassUrl() + "?";
        Ext.iterate(requestParams, function(k, v) {
            url += k + "=" + encodeURIComponent(v) + "&";
        });
        me.setLoading(true);
        Ext.Ajax.request({
            url: url,
            success: function(response) {
                me.setLoading(false);
                if (Ext.isString(response.responseText)) {
                    results = Ext.decode(response.responseText);
                } else if (Ext.isObject(response.responseText)) {
                    results = response.responseText;
                } else {
                    Ext.log.error("Error! Could not parse " + "overpass response!");
                }
                me.fireEvent('overpassResponse', results);
            },
            failure: function(response) {
                me.setLoading(false);
                Ext.log.error("Error on overpass request:", response);
            }
        });
    },
    /**
     * Response example:
     *  {
          "version": 0.6,
          "generator": "Overpass API",
          "osm3s": {
            "timestamp_osm_base": "2015-09-25T06:54:02Z",
            "copyright": "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL."
          },
          "elements": [
            {
              "type": "node",
              "id": 429033932,
              "lat": 52.8368526,
              "lon": 7.1013506,
              "tags": {
                "amenity": "pharmacy",
                "dispensing": "yes",
                "name": "Maximilianapotheke"
              }
            }
          ]
        }
     */
    showSearchResults: function(response) {
        var me = this,
            grid = me.down('grid[name=overpasssearchresultgrid]'),
            features = response.elements;
        if (features.length > 0) {
            grid.show();
        }
        Ext.each(features, function(feature) {
            var olFeat = new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.transform([
                        parseFloat(feature.lon),
                        parseFloat(feature.lat)
                    ], 'EPSG:4326', 'EPSG:3857')),
                    properties: feature
                });
            olFeat.set('displayfield', feature.tags.name);
            me.searchResultVectorLayer.getSource().addFeature(olFeat);
        });
        var featureExtent = me.searchResultVectorLayer.getSource().getExtent();
        if (!Ext.Array.contains(featureExtent, Infinity)) {
            me.zoomToExtent(featureExtent);
        }
    },
    /**
     * Works with extent or geom.
     */
    zoomToExtent: function(extent) {
        var olMap = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var olView = olMap.getView();
        var pan = ol.animation.pan({
                source: olView.getCenter()
            });
        var zoom = ol.animation.zoom({
                resolution: olView.getResolution()
            });
        olMap.beforeRender(pan, zoom);
        olView.fit(extent, olMap.getSize());
    },
    /**
     * update the symbolizer in the grid
     */
    updateRenderer: function(item, style) {
        var renderer = Ext.getCmp(Ext.query('div[id^=gx_renderer', true, item)[0].id);
        var src = renderer.map.getLayers().getArray()[0].getSource();
        src.getFeatures()[0].setStyle(style);
    },
    /**
     *
     */
    highlightFeature: function(tableView, record, item) {
        if (this.enterEventRec === record) {
            return;
        }
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var feature;
        var radius;
        var text;
        this.enterEventRec = record;
        ol.Observable.unByKey(this.flashListenerKey);
        if (this.clusterResults) {
            feature = this.getClusterFeatureFromFeature(record.olObject);
            var featureStyle = this.clusterLayer.getStyle()(feature, map.getView().getResolution())[0];
            radius = featureStyle.getImage().getRadius();
            text = featureStyle.getText().getText();
        } else {
            feature = record.olObject;
            radius = 5;
        }
        // default value
        if (tableView.getSelection()[0] !== record) {
            feature.setStyle(this.getSearchResultHighlightFeatureStyleFn()(radius, text));
            this.updateRenderer(item, this.getSearchResultHighlightFeatureStyleFn()(8, text));
        }
        if (feature) {
            this.flashListenerKey = Basepackage.util.Animate.flashFeature(feature, 1000, radius);
        }
    },
    /**
     *
     */
    unhighlightFeature: function(tableView, record, item) {
        if (this.leaveEventRec === record) {
            return;
        }
        this.leaveEventRec = record;
        if (tableView.getSelection()[0] !== record) {
            record.olObject.setStyle(this.getSearchResultFeatureStyle());
            if (this.clusterResults) {
                this.updateRenderer(item, this.clusterStyleFn('', 8));
            } else {
                this.updateRenderer(item, this.getSearchResultFeatureStyle());
            }
        }
    },
    /**
     *
     */
    highlightSelectedFeature: function(tableView, record, item) {
        var store = tableView.getStore();
        store.each(function(rec) {
            rec.olObject.setStyle(this.getSearchResultFeatureStyle());
            var row = tableView.getRowByRecord(rec);
            if (this.clusterResults) {
                this.updateRenderer(row, this.clusterStyleFn('', 8));
            } else {
                this.updateRenderer(row, this.getSearchResultFeatureStyle());
            }
        }, this);
        record.olObject.setStyle(this.getSearchResultSelectFeatureStyle());
        this.updateRenderer(item, this.getSearchResultSelectFeatureStyle());
        this.zoomToExtent(record.olObject.getGeometry());
    },
    /**
     *
     */
    getClusterFeatureFromFeature: function(feature) {
        var me = this;
        var clusterFeature;
        var clusterFeatures = me.clusterLayer.getSource().getFeatures();
        Ext.each(clusterFeatures, function(feat) {
            if (!Ext.isEmpty(feat.get('features'))) {
                Ext.each(feat.get('features'), function(f) {
                    if (f.getProperties().properties.id && feature.getProperties().properties.id && f.getProperties().properties.id === feature.getProperties().properties.id) {
                        clusterFeature = feat;
                        return false;
                    }
                });
            }
            if (!Ext.isEmpty(clusterFeature)) {
                return false;
            }
        });
        return clusterFeature ? clusterFeature : feature;
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * WFS Search
 *
 * Used to search in multiple featuretypes
 *
 * Example usage:
 *
 * {
 *      xtype: 'base-search-wfs'
 * }
 *
 */
Ext.define("Basepackage.view.container.WfsSearch", {
    extend: "Ext.container.Container",
    xtype: "base-search-wfs",
    requires: [
        'GeoExt.data.store.Features',
        'GeoExt.grid.column.Symbolizer',
        'Basepackage.util.Animate'
    ],
    config: {
        /**
         * Array of ol-layers to search in
         */
        layers: [],
        /**
         * The WFS server URL
         */
        wfsServerUrl: null,
        /**
         * minimum chars to trigger the search
         */
        minSearchTextChars: 3,
        /**
         * delay before query gets triggered to avoid triggers while typing
         */
        typeDelay: 300,
        /**
         * the allowed data-types to match against in the describefeaturetype
         * response
         */
        allowedFeatureTypeDataTypes: [
            'xsd:string'
        ],
        /**
         * the template to change the groups titles
         */
        groupHeaderTpl: '{name}',
        /**
         *
         */
        searchResultFeatureStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#8B0000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            fill: new ol.style.Fill({
                color: '#8B0000'
            }),
            stroke: new ol.style.Stroke({
                color: '#8B0000',
                width: 4
            })
        }),
        /**
         *
         */
        searchResultHighlightFeatureStyleFn: function(radius, text) {
            return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: '#EE0000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'gray',
                        width: 3
                    })
                }),
                text: text ? new ol.style.Text({
                    text: text.toString(),
                    fill: new ol.style.Fill({
                        color: '#fff'
                    })
                }) : undefined
            });
        },
        /**
         *
         */
        searchResultSelectFeatureStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({
                    color: '#0099CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            fill: new ol.style.Fill({
                color: '#0099CC'
            }),
            stroke: new ol.style.Stroke({
                color: '#0099CC',
                width: 6
            })
        }),
        /**
        *
        */
        clusterStyleFn: function(amount, radius) {
            // set maxradius
            var maxRadius = this.clusterLayer.getSource().distance_ / 2;
            if (radius > maxRadius) {
                radius = maxRadius;
            }
            return [
                new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,
                        stroke: new ol.style.Stroke({
                            color: '#fff'
                        }),
                        fill: new ol.style.Fill({
                            color: '#3399CC'
                        })
                    }),
                    text: new ol.style.Text({
                        text: amount.toString(),
                        fill: new ol.style.Fill({
                            color: '#fff'
                        })
                    })
                })
            ];
        },
        /**
         *
         */
        highLightFeatureOnHoverInGrid: true
    },
    /**
     *
     */
    layout: 'fit',
    /**
     *
     */
    typeDelayTask: null,
    /**
     *
     */
    searchTerm: null,
    /**
     *
     */
    searchResultVectorLayer: null,
    /**
     *
     */
    clusterLayer: null,
    /**
     *
     */
    clusterResults: false,
    /**
     *
     */
    styleCache: [],
    /**
     *
     */
    initComponent: function() {
        var me = this,
            map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        if (Ext.isEmpty(me.getLayers())) {
            Ext.log.error('No layers given to search component!');
        }
        if (!me.searchResultVectorLayer) {
            me.searchResultVectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: me.getSearchResultFeatureStyle(),
                visible: !me.clusterResults
            });
            map.addLayer(me.searchResultVectorLayer);
        }
        if (me.clusterResults && !me.clusterLayer) {
            var clusterSource = new ol.source.Cluster({
                    distance: 40,
                    source: me.searchResultVectorLayer.getSource()
                });
            //new ol.source.Vector()
            me.clusterLayer = new ol.layer.Vector({
                source: clusterSource,
                style: function(feature) {
                    var amount = feature.get('features').length;
                    var style = me.styleCache[amount];
                    if (!style) {
                        style = me.clusterStyleFn(amount, amount + 10);
                        me.styleCache[amount] = style;
                    }
                    return style;
                }
            });
            map.addLayer(me.clusterLayer);
            // correct the vectorlayerstyle for the grid symbolizer
            me.searchResultVectorLayer.setStyle(me.clusterStyleFn('', 8));
        }
        var searchResultStore = Ext.create('GeoExt.data.store.Features', {
                map: map,
                layer: me.searchResultVectorLayer,
                groupField: 'featuretype'
            });
        me.items = [
            {
                xtype: 'textfield',
                name: 'searchTerm',
                fieldLabel: 'Suchbegriff',
                enableKeyEvents: true,
                listeners: {
                    change: me.handleKeyDown
                }
            },
            {
                xtype: 'grid',
                name: 'searchresultgrid',
                hidden: true,
                hideHeaders: true,
                title: 'Suchergebnisse',
                store: searchResultStore,
                columns: [
                    {
                        xtype: 'gx_symbolizercolumn',
                        flex: 1
                    },
                    {
                        dataIndex: 'displayfield',
                        flex: 7,
                        renderer: function(value) {
                            return '<span data-qtip="' + value + '">' + value + '</span>';
                        }
                    }
                ],
                features: [
                    {
                        ftype: 'grouping',
                        groupHeaderTpl: me.getGroupHeaderTpl()
                    }
                ],
                width: 200,
                height: 300
            },
            {
                xtype: 'button',
                text: 'Zurücksetzen',
                margin: '10 0 0 0',
                handler: me.resetSearchGridAndText,
                scope: me
            }
        ];
        me.callParent(arguments);
        me.on('describeFeatureTypeResponse', me.getFeatures);
        me.on('getFeatureResponse', me.showSearchResults);
        me.on('show', me.down('textfield').focus);
        var grid = me.down('grid[name=searchresultgrid]');
        if (me.getHighLightFeatureOnHoverInGrid()) {
            grid.on('itemmouseenter', me.highlightFeature, me);
            grid.on('itemmouseleave', me.unhighlightFeature, me);
        }
        grid.on('itemclick', me.highlightSelectedFeature, me);
    },
    /**
     *
     */
    handleKeyDown: function(textfield) {
        var me = textfield.up('base-search-wfs'),
            val = textfield.getValue();
        if (val.length < me.getMinSearchTextChars()) {
            return;
        }
        // set the searchterm on component
        me.searchTerm = val;
        // reset grid from aold values
        me.resetGrid();
        // prepare the describeFeatureType for all given layers
        if (me.typeDelayTask) {
            me.typeDelayTask.cancel();
        }
        me.typeDelayTask = new Ext.util.DelayedTask(function() {
            me.describeFeatureTypes();
        });
        me.typeDelayTask.delay(me.getTypeDelay());
    },
    resetSearchGridAndText: function() {
        var me = this;
        me.down('textfield[name=searchTerm]').setValue('');
        me.resetGrid();
    },
    /**
     *
     */
    resetGrid: function() {
        var me = this;
        me.searchResultVectorLayer.getSource().clear();
        me.down('grid[name=searchresultgrid]').hide();
    },
    /**
     *
     */
    describeFeatureTypes: function() {
        var me = this,
            typeNames = [],
            featureTypes;
        Ext.each(me.getLayers(), function(l) {
            if (l.getSource().getParams) {
                typeNames.push(l.getSource().getParams().LAYERS);
            }
        });
        var describeFeatureTypeParams = {
                REQUEST: "DescribeFeatureType",
                SERVICE: "WFS",
                VERSION: "1.1.0",
                OUTPUTFORMAT: "application/json",
                TYPENAME: typeNames.toString()
            };
        var url = me.getWfsServerUrl() + "?";
        Ext.iterate(describeFeatureTypeParams, function(k, v) {
            url += k + "=" + v + "&";
        });
        me.setLoading(true);
        Ext.Ajax.request({
            url: url,
            success: function(response) {
                me.setLoading(false);
                if (Ext.isString(response.responseText)) {
                    featureTypes = Ext.decode(response.responseText);
                } else if (Ext.isObject(response.responseText)) {
                    featureTypes = response.responseText;
                } else {
                    Ext.log.error("Error! Could not parse " + "describe featuretype response!");
                }
                me.fireEvent('describeFeatureTypeResponse', featureTypes);
            },
            failure: function(response) {
                me.setLoading(false);
                Ext.log.error("Error on describe featuretype request:", response);
            }
        });
    },
    /**
     *
     */
    getFeatures: function(resp) {
        var me = this;
        var featureTypes = resp.featureTypes;
        var cleanedFeatureType = me.cleanUpFeatureDataTypes(featureTypes);
        var url = me.getWfsServerUrl();
        var xml = me.setupXmlPostBody(cleanedFeatureType);
        var features;
        me.setLoading(true);
        Ext.Ajax.request({
            url: url,
            method: 'POST',
            xmlData: xml,
            success: function(response) {
                me.setLoading(false);
                if (Ext.isString(response.responseText)) {
                    features = Ext.decode(response.responseText).features;
                } else if (Ext.isObject(response.responseText)) {
                    features = response.responseText.features;
                } else {
                    Ext.log.error("Error! Could not parse " + "GetFeature response!");
                }
                me.fireEvent('getFeatureResponse', features);
            },
            failure: function(response) {
                me.setLoading(false);
                Ext.log.error("Error on GetFeature request:", response);
            }
        });
    },
    /**
     * Method removes unwanted dataTypes
     */
    cleanUpFeatureDataTypes: function(featureTypes) {
        var me = this,
            cleanedFeatureType = [];
        Ext.each(featureTypes, function(ft, index) {
            cleanedFeatureType.push({
                typeName: ft.typeName,
                properties: []
            });
            Ext.each(ft.properties, function(prop) {
                if (Ext.Array.contains(me.getAllowedFeatureTypeDataTypes(), prop.type) && prop.name.indexOf(" ") < 0) {
                    cleanedFeatureType[index].properties.push(prop);
                }
            });
        });
        return cleanedFeatureType;
    },
    /**
     *
     */
    setupXmlPostBody: function(featureTypes) {
        var me = this;
        var xml = '<wfs:GetFeature service="WFS" version="1.1.0" ' + 'outputFormat="application/json" ' + 'xmlns:wfs="http://www.opengis.net/wfs" ' + 'xmlns:ogc="http://www.opengis.net/ogc" ' + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' + 'xsi:schemaLocation="http://www.opengis.net/wfs ' + 'http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">';
        Ext.each(featureTypes, function(ft) {
            Ext.each(ft.properties, function(prop) {
                xml += '<wfs:Query typeName="' + ft.typeName + '">' + '<ogc:Filter>' + '<ogc:PropertyIsLike wildCard="*" singleChar="." escape="\\" matchCase="false">' + '<ogc:PropertyName>' + prop.name + '</ogc:PropertyName>' + '<ogc:Literal>*' + me.searchTerm + '*</ogc:Literal>' + '</ogc:PropertyIsLike>' + '</ogc:Filter>' + '</wfs:Query>';
            });
        });
        xml += '</wfs:GetFeature>';
        return xml;
    },
    /**
     *
     */
    showSearchResults: function(features) {
        var me = this,
            grid = me.down('grid[name=searchresultgrid]'),
            parser = new ol.format.GeoJSON();
        if (features.length > 0) {
            grid.show();
        }
        Ext.each(features, function(feature) {
            var featuretype = feature.id.split(".")[0];
            var displayfield;
            // find the matching value in order to display it
            Ext.iterate(feature.properties, function(k, v) {
                if (v && v.toString().toLowerCase().indexOf(me.searchTerm) > -1) {
                    displayfield = v;
                    return false;
                }
            });
            feature.properties.displayfield = displayfield;
            feature.properties.featuretype = featuretype;
            var olFeat = parser.readFeatures(feature, {
                    dataProjection: 'EPSG:31467',
                    featureProjection: 'EPSG:31467'
                })[0];
            me.searchResultVectorLayer.getSource().addFeature(olFeat);
        });
        var featureExtent = me.searchResultVectorLayer.getSource().getExtent();
        if (!Ext.Array.contains(featureExtent, Infinity)) {
            me.zoomToExtent(featureExtent);
        }
    },
    /**
     * Works with extent or geom.
     */
    zoomToExtent: function(extent) {
        var olMap = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var olView = olMap.getView();
        var pan = ol.animation.pan({
                source: olView.getCenter()
            });
        var zoom = ol.animation.zoom({
                resolution: olView.getResolution()
            });
        olMap.beforeRender(pan, zoom);
        olView.fit(extent, olMap.getSize());
    },
    /**
     * update the symbolizer in the grid
     */
    updateRenderer: function(item, style) {
        var renderer = Ext.getCmp(Ext.query('div[id^=gx_renderer', true, item)[0].id);
        var src = renderer.map.getLayers().getArray()[0].getSource();
        src.getFeatures()[0].setStyle(style);
    },
    /**
     *
     */
    highlightFeature: function(tableView, record, item) {
        if (this.enterEventRec === record) {
            return;
        }
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var feature;
        var radius;
        var text;
        this.enterEventRec = record;
        ol.Observable.unByKey(this.flashListenerKey);
        if (this.clusterResults) {
            feature = this.getClusterFeatureFromFeature(record.olObject);
            var featureStyle = this.clusterLayer.getStyle()(feature, map.getView().getResolution())[0];
            radius = featureStyle.getImage().getRadius();
            text = featureStyle.getText().getText();
        } else {
            feature = record.olObject;
            radius = 5;
        }
        // default value
        if (tableView.getSelection()[0] !== record) {
            feature.setStyle(this.getSearchResultHighlightFeatureStyleFn()(radius, text));
            this.updateRenderer(item, this.getSearchResultHighlightFeatureStyleFn()(8, text));
        }
        if (feature) {
            this.flashListenerKey = Basepackage.util.Animate.flashFeature(feature, 1000, radius);
        }
    },
    /**
     *
     */
    unhighlightFeature: function(tableView, record, item) {
        if (this.leaveEventRec === record) {
            return;
        }
        this.leaveEventRec = record;
        if (tableView.getSelection()[0] !== record) {
            record.olObject.setStyle(this.getSearchResultFeatureStyle());
            if (this.clusterResults) {
                this.updateRenderer(item, this.clusterStyleFn('', 8));
            } else {
                this.updateRenderer(item, this.getSearchResultFeatureStyle());
            }
        }
    },
    /**
     *
     */
    highlightSelectedFeature: function(tableView, record, item) {
        var store = tableView.getStore();
        store.each(function(rec) {
            rec.olObject.setStyle(this.getSearchResultFeatureStyle());
            var row = tableView.getRowByRecord(rec);
            if (this.clusterResults) {
                this.updateRenderer(row, this.clusterStyleFn('', 8));
            } else {
                this.updateRenderer(row, this.getSearchResultFeatureStyle());
            }
        }, this);
        record.olObject.setStyle(this.getSearchResultSelectFeatureStyle());
        this.updateRenderer(item, this.getSearchResultSelectFeatureStyle());
        this.zoomToExtent(record.olObject.getGeometry());
    },
    /**
     *
     */
    getClusterFeatureFromFeature: function(feature) {
        var me = this;
        var clusterFeature;
        var clusterFeatures = me.clusterLayer.getSource().getFeatures();
        Ext.each(clusterFeatures, function(feat) {
            if (!Ext.isEmpty(feat.get('features'))) {
                Ext.each(feat.get('features'), function(f) {
                    if (f.getId() === feature.getId()) {
                        clusterFeature = feat;
                        return false;
                    }
                });
            }
            if (!Ext.isEmpty(clusterFeature)) {
                return false;
            }
        });
        return clusterFeature;
    }
});

/*global FileReader*/
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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * HTML 5 - CSV Importer
 *
 * This form is used to import csv files to an Ext-JS Grid. As it uses the HTML5
 * File-Api InternetExplorer < 10 is not supported.
 *
 * Current CSV Requirements:
 *      First Row contains headers.
 *      Seperator is comma.
 *      Strings are in doublequotes.
 *
 */
Ext.define("Basepackage.view.form.CsvImport", {
    extend: "Ext.form.Panel",
    xtype: "form-csvimport",
    config: {
        grid: null,
        dataArray: null
    },
    initComponent: function(conf) {
        var me = this;
        me.callParent(conf);
        if (!me.getGrid()) {
            Ext.Error.raise('No grid defined for csv-importer.');
        }
    },
    /**
     * You can put default associations here. These will fill the comboboxes.
     *
     * The key represents the csv-column.
     * The value represents the Grid column text.
     *
     * associatonObject: {
     *     Name: "Nachname",
     *     Vorname: "Vorname",
     *     Straße: null,
     *     Hausnummer: null,
           Postleitzahl: null,
     *     Stadt: null,
     *     "E-Mail_1": "E-Mail",
     *     "E-Mail_2": null
     *},
     */
    associatonObject: {},
    bodyPadding: 10,
    items: [
        {
            xtype: 'filefield',
            name: 'csv_file',
            fieldLabel: 'CSV-Datei',
            labelWidth: 70,
            width: 400,
            msgTarget: 'side',
            allowBlank: false,
            buttonText: 'Datei auswähen \u2026',
            validator: function(val) {
                var fileName = /^.*\.(csv)$/i;
                var errMsg = 'Der Datenimport ist nur mit CSV-Dateien möglich.';
                return fileName.test(val) || errMsg;
            }
        }
    ],
    buttons: [
        {
            xtype: "button",
            name: "importBtn",
            text: "Importieren",
            handler: function(btn) {
                var me = this.up('form');
                me.startImport(btn);
            },
            disabled: true
        },
        {
            text: 'Datei einlesen',
            handler: function() {
                if (window.FileReader) {
                    var me = this.up('form');
                    var fileField = me.down('filefield');
                    var file = fileField.extractFileInput().files[0];
                    var reader = new FileReader();
                    reader.readAsText(file);
                    reader.onload = me.onLoad;
                    reader.onerror = me.onError;
                } else {
                    Ext.Toast('FileReader are not supported in this browser.');
                }
            }
        }
    ],
    onLoad: function(event) {
        var me = Ext.ComponentQuery.query('form-csvimport')[0];
        var csv = event.target.result;
        var dataArray = Ext.util.CSV.decode(csv);
        me.setDataArray(dataArray);
        me.setupAssociations(dataArray[0], me);
    },
    onError: function(evt) {
        if (evt.target.error.name === "NotReadableError") {
            Ext.toast("Canno't read file !");
        }
    },
    setupAssociations: function(titleRow, me) {
        var dataModelColumns = me.getGrid().query('gridcolumn[hidden=false]');
        var columnTitles = [];
        var assoFieldset = Ext.create("Ext.form.FieldSet", {
                title: "Felder asozieren",
                name: "assoFieldset",
                layout: "form",
                scrollable: "y",
                maxHeight: 300,
                collapsible: true,
                margin: "0 0 30 0"
            });
        Ext.each(dataModelColumns, function(column) {
            columnTitles.push(column.text);
        }, me);
        Ext.each(titleRow, function(columnName) {
            assoFieldset.add({
                xtype: "combobox",
                name: columnName,
                fieldLabel: columnName,
                store: columnTitles,
                value: me.associatonObject[columnName],
                msgTarget: "side"
            });
        }, me);
        me.down('button[name=importBtn]').enable();
        me.add(assoFieldset);
    },
    addToGrid: function(dataArray) {
        var me = this;
        var store = me.getGrid().getStore();
        me.setLoading(true);
        Ext.each(dataArray, function(dataRow, index) {
            if (index > 0) {
                //skip first row of csv. it contains the header
                var instance = this.parseDataFromRow(dataRow);
                store.add(instance);
            }
        }, me);
        me.setLoading(false);
    },
    parseDataFromRow: function(dataRow) {
        var me = this;
        var data = {};
        Ext.each(dataRow, function(csvColumn, rowIdx) {
            var gridColumText = me.associatonObject[me.getDataArray()[0][rowIdx]];
            if (!Ext.isEmpty(csvColumn) && !Ext.isEmpty(gridColumText)) {
                var gridColumn = me.getGrid().down('gridcolumn[text=' + gridColumText + ']');
                if (gridColumn) {
                    var dataIndex = gridColumn.dataIndex;
                    data[dataIndex] = csvColumn;
                } else {
                    Ext.Error.raise(gridColumText, ' does not exist. Please check you associationObject.');
                }
            }
        });
        return Ext.create(this.getGrid().getStore().getModel(), data);
    },
    startImport: function(btn) {
        var me = this;
        var combos = btn.up('form').down('fieldset[name=assoFieldset]').query('combo');
        var comboValues = [];
        var formValid = true;
        Ext.each(combos, function(combo) {
            var comboVal = combo.getValue();
            if (Ext.Array.contains(comboValues, comboVal) && !Ext.isEmpty(comboVal)) {
                combo.markInvalid("Diese Feld wurde bereits mit einer anderen" + "Spalte asoziert");
                formValid = false;
            } else {
                this.associatonObject[combo.getFieldLabel()] = comboVal;
            }
            comboValues.push(comboVal);
        }, me);
        if (formValid && me.getDataArray()) {
            me.addToGrid(me.getDataArray());
        }
        me.fireEvent('importcomplete', me);
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Print FormPanel
 *
 * Used to show an Mapfish Print v3 compatible print panel
 *
 */
Ext.define("Basepackage.view.form.Print", {
    extend: "Ext.form.Panel",
    xtype: "base-form-print",
    requires: [
        "Ext.window.Toast",
        "Ext.form.action.StandardSubmit",
        "Basepackage.util.Layer",
        "GeoExt.data.MapfishPrintProvider"
    ],
    statics: {
        LAYER_IDENTIFIER_KEY: '_basepackage_printextent_layer_'
    },
    defaultListenerScope: true,
    viewModel: {
        data: {
            title: 'Drucken',
            labelDpi: 'DPI',
            printButtonSuffix: 'anfordern',
            printFormat: 'pdf',
            genericFieldSetTitle: 'Einstellungen'
        }
    },
    bind: {
        title: '{title}'
    },
    maxHeight: 250,
    autoScroll: true,
    config: {
        url: null,
        store: null
    },
    borderColors: [
        '#FF5050',
        '#00CCFF',
        '#FFFF99',
        '#CCFF66'
    ],
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },
    bodyPadding: '0 5px 0 0',
    extentLayer: null,
    provider: null,
    defaultType: 'textfield',
    initComponent: function() {
        var url = this.getUrl();
        if (!url) {
            this.html = 'No Url provided!';
            this.callParent();
            return;
        }
        this.callParent();
        var appsStore = Ext.create('Ext.data.Store', {
                autoLoad: true,
                proxy: {
                    type: 'jsonp',
                    url: url + 'apps.json',
                    callbackKey: 'jsonp'
                },
                listeners: {
                    load: function(store, records) {
                        var rawValues = [];
                        Ext.each(records, function(rec) {
                            rawValues.push(rec.data);
                        });
                        this.down('combo[name=appCombo]').setStore(rawValues);
                    },
                    scope: this
                }
            });
        var formContainer = this.add({
                xtype: 'fieldcontainer',
                name: 'formContainer',
                layout: 'hbox'
            });
        var fieldcontainer = formContainer.add({
                xtype: 'fieldcontainer',
                name: 'defaultFieldContainer',
                layout: 'auto',
                flex: 1
            });
        fieldcontainer.add({
            xtype: 'combo',
            name: 'appCombo',
            allowBlank: false,
            forceSelection: true,
            store: appsStore,
            listeners: {
                select: 'onAppSelected',
                scope: this
            }
        });
        this.on('afterrender', this.addExtentLayer, this);
        this.on('afterrender', this.addParentCollapseExpandListeners, this);
        this.on('beforeDestroy', this.cleanupPrintExtent, this);
    },
    bbar: [
        {
            xtype: 'button',
            name: 'createPrint',
            bind: {
                text: '{printFormat:uppercase} {printButtonSuffix}'
            },
            formBind: true,
            handler: function() {
                this.up('form').createPrint();
            },
            disabled: true
        }
    ],
    createPrint: function() {
        var view = this;
        var spec = {};
        var mapComponent = view.getMapComponent();
        var mapView = mapComponent.getMap().getView();
        var layout = view.down('combo[name="layout"]').getValue();
        var format = view.down('combo[name="format"]').getValue();
        var attributes = {};
        var projection = mapView.getProjection().getCode();
        var rotation = mapView.getRotation();
        var gxPrintProvider = GeoExt.data.MapfishPrintProvider;
        var serializedLayers = gxPrintProvider.getSerializedLayers(mapComponent, this.layerFilter, this);
        var fieldsets = view.query('fieldset[name=attributes] fieldset');
        Ext.each(fieldsets, function(fs) {
            var name = fs.name;
            // TODO double check when rotated
            var featureBbox = fs.extentFeature.getGeometry().getExtent();
            var dpi = fs.down('[name="dpi"]').getValue();
            attributes[name] = {
                bbox: featureBbox,
                dpi: dpi,
                // TODO Order of Layers in print seems to be reversed.
                layers: serializedLayers.reverse(),
                projection: projection,
                rotation: rotation
            };
        }, this);
        // Get all Fields except the DPI Field
        // TODO This query should be optimized or changed into some
        // different kind of logic
        var additionalFields = view.query('fieldset[name=attributes]>field[name!=dpi]');
        Ext.each(additionalFields, function(field) {
            if (field.getName() === 'legend') {
                attributes.legend = view.getLegendObject();
            } else if (field.getName() === 'scalebar') {
                attributes.scalebar = view.getScaleBarObject();
            } else if (field.getName() === 'northArrow') {
                attributes.scalebar = view.getNorthArrowObject();
            } else {
                attributes[field.getName()] = field.getValue();
            }
        }, this);
        var url = view.getUrl();
        var app = view.down('combo[name=appCombo]').getValue();
        spec.attributes = attributes;
        spec.layout = layout;
        var submitForm = Ext.create('Ext.form.Panel', {
                standardSubmit: true,
                url: url + app + '/buildreport.' + format,
                method: 'POST',
                items: [
                    {
                        xtype: 'textfield',
                        name: 'spec',
                        value: Ext.encode(spec)
                    }
                ]
            });
        submitForm.submit();
    },
    listeners: {
        collapse: 'cleanupPrintExtent',
        resize: 'renderAllClientInfos'
    },
    addParentCollapseExpandListeners: function() {
        var parent = this.up();
        parent.on({
            collapse: 'cleanupPrintExtent',
            expand: 'renderAllClientInfos',
            scope: this
        });
    },
    /**
     *
     */
    addExtentLayer: function() {
        var targetMap = Ext.ComponentQuery.query('gx_map')[0];
        // TODO MJ: the lines below are possible better suited at the
        //          cleanupPrintExtent method, but tzhat may currently
        //          be called to often.
        var existingLayer = null;
        var isPrintExtentLayerKey = this.self.LAYER_IDENTIFIER_KEY;
        targetMap.getLayers().forEach(function(maplayer) {
            if (maplayer.get(isPrintExtentLayerKey) === true) {
                existingLayer = maplayer;
            }
        });
        if (existingLayer) {
            targetMap.removeLayer(existingLayer);
        }
        // TODO MJ: he lines above are possible better suited ...
        var layer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
        // Set our flag to identify this layer as printextentlayer
        layer.set(isPrintExtentLayerKey, true);
        // Set our internal flag to filter this layer out of the tree / legend
        var displayInLayerSwitcherKey = Basepackage.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
        layer.set(displayInLayerSwitcherKey, false);
        targetMap.addLayer(layer);
        this.extentLayer = layer;
    },
    /**
     * Filters the layer by properties or params. Used in createPrint.
     * This method can/should be overriden in the application.
     *
     * @param ol.layer
     */
    layerFilter: function(layer) {
        var isChecked = !!layer.checked;
        var hasName = isChecked && !!layer.get('name');
        var nonOpaque = hasName && (layer.get('opacity') > 0);
        var inTree = nonOpaque && (layer.get(Basepackage.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER) !== false);
        // may be undefined for certain layers
        if (isChecked && hasName && nonOpaque && inTree) {
            if (layer instanceof ol.layer.Vector && layer.getSource().getFeatures().length < 1) {
                return false;
            }
            return true;
        } else {
            return false;
        }
    },
    /**
     * Filters the layer by properties or params. Used in getLegendObject.
     * This method can/should be overriden in the application.
     *
     * @param ol.layer
     */
    legendLayerFilter: function(layer) {
        if (layer.checked && layer.get('name') && layer.get('name') !== "Hintergrundkarte" && layer.get('opacity') > 0) {
            return true;
        } else {
            return false;
        }
    },
    getMapComponent: function() {
        return Ext.ComponentQuery.query('gx_component_map')[0];
    },
    onPrintProviderReady: function(provider) {
        this.addGenericFieldset(provider);
    },
    onAppSelected: function(appCombo) {
        this.provider = Ext.create('GeoExt.data.MapfishPrintProvider', {
            url: this.getUrl() + appCombo.getValue() + '/capabilities.json',
            listeners: {
                ready: 'onPrintProviderReady',
                scope: this
            }
        });
    },
    removeGenericFieldset: function() {
        var view = this;
        var fs = view.down('[name="generic-fieldset"]');
        if (fs) {
            view.remove(fs);
        }
    },
    addGenericFieldset: function(provider) {
        var view = this;
        var fs = view.down('[name="generic-fieldset"]');
        var defaultFieldContainer = view.down('fieldcontainer[name=defaultFieldContainer]');
        if (fs) {
            fs.removeAll();
        } else {
            defaultFieldContainer.add({
                xtype: 'fieldset',
                bind: {
                    title: '{genericFieldSetTitle}'
                },
                name: 'generic-fieldset',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                }
            });
        }
        this.addLayoutCombo(provider);
        this.addFormatCombo(provider);
        this.fireEvent('genericfieldsetadded');
    },
    addFormatCombo: function(provider) {
        var fs = this.down('fieldset[name=generic-fieldset]');
        var formatStore = provider.capabilityRec.get('formats');
        var formatCombo = {
                xtype: 'combo',
                name: 'format',
                displayField: 'name',
                editable: false,
                forceSelection: true,
                queryMode: 'local',
                valueField: 'name',
                store: formatStore,
                bind: {
                    value: '{printFormat}'
                }
            };
        fs.add(formatCombo);
    },
    addLayoutCombo: function(provider) {
        var fs = this.down('fieldset[name=generic-fieldset]');
        var layoutStore = provider.capabilityRec.layouts();
        var layoutCombo = {
                xtype: 'combo',
                name: 'layout',
                displayField: 'name',
                editable: false,
                forceSelection: true,
                queryMode: 'local',
                valueField: 'name',
                store: layoutStore,
                listeners: {
                    change: this.onLayoutSelect,
                    scope: this
                }
            };
        layoutCombo = fs.add(layoutCombo);
        layoutCombo.select(layoutStore.getAt(0));
    },
    // TODO REMOVE EXTENT
    onLayoutSelect: function(combo, layoutname) {
        var view = this,
            attributesFieldset = view.down('fieldset[name=attributes]'),
            layoutRec = combo.findRecordByValue(layoutname),
            attributeFieldset,
            defaultFieldContainer = view.down('fieldcontainer[name=defaultFieldContainer]');
        view.remove(attributesFieldset);
        // add the layout attributes fieldset:
        if (defaultFieldContainer && attributesFieldset) {
            defaultFieldContainer.remove(attributesFieldset);
        }
        attributeFieldset = defaultFieldContainer.add({
            xtype: 'fieldset',
            title: 'Eigenschaften',
            name: 'attributes',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            }
        });
        layoutRec.attributes().each(function(attribute) {
            this.addAttributeFields(attribute, attributeFieldset);
        }, this);
        this.renderAllClientInfos();
        view.down('button[name="createPrint"]').enable();
    },
    getMapAttributeFields: function(attributeRec) {
        var clientInfo = attributeRec.get('clientInfo');
        var mapTitle = attributeRec.get('name') + ' (' + clientInfo.width + ' × ' + clientInfo.height + ')';
        var fs = {
                xtype: 'fieldset',
                clientInfo: Ext.clone(clientInfo),
                title: mapTitle,
                name: attributeRec.get('name'),
                items: {
                    xtype: 'combo',
                    name: 'dpi',
                    editable: false,
                    forceSelection: true,
                    bind: {
                        fieldLabel: '{labelDpi}'
                    },
                    queryMode: 'local',
                    labelWidth: 40,
                    width: 150,
                    value: clientInfo.dpiSuggestions[0],
                    store: clientInfo.dpiSuggestions
                }
            };
        return fs;
    },
    getCheckBoxAttributeFields: function(attributeRec) {
        return {
            xtype: 'checkbox',
            name: attributeRec.get('name'),
            checked: true,
            fieldLabel: attributeRec.get('name'),
            boxLabel: '\u2026verwenden?'
        };
    },
    getNorthArrowAttributeFields: function(attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },
    getLegendAttributeFields: function(attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },
    getScalebarAttributeFields: function(attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },
    getStringField: function(attributeRec) {
        return {
            xtype: 'textfield',
            name: attributeRec.get('name'),
            fieldLabel: attributeRec.get('name'),
            allowBlank: false
        };
    },
    addAttributeFields: function(attributeRec, fieldset) {
        var olView = this.getMapComponent().getMap().getView();
        var attributeFields;
        switch (attributeRec.get('type')) {
            case "MapAttributeValues":
                attributeFields = this.getMapAttributeFields(attributeRec);
                olView.on('propertychange', this.renderAllClientInfos, this);
                break;
            case "NorthArrowAttributeValues":
                attributeFields = this.getNorthArrowAttributeFields(attributeRec);
                break;
            case "ScalebarAttributeValues":
                attributeFields = this.getScalebarAttributeFields(attributeRec);
                break;
            case "LegendAttributeValue":
                attributeFields = this.getLegendAttributeFields(attributeRec);
                break;
            case "String":
                attributeFields = this.getStringField(attributeRec);
                break;
            case "DataSourceAttributeValue":
                Ext.toast('Data Source not ye supported');
                attributeFields = this.getStringField(attributeRec);
                break;
            default:
                break;
        }
        if (attributeFields) {
            fieldset.add(attributeFields);
        }
    },
    /**
     * TODO: NB: Enhance performance! This method seems to be called too often!
     */
    renderAllClientInfos: function() {
        var view = this;
        if (view._renderingClientExtents || view.getCollapsed() !== false) {
            return;
        }
        view._renderingClientExtents = true;
        view.extentLayer.getSource().clear();
        var fieldsets = view.query('fieldset[name=attributes] fieldset');
        Ext.each(fieldsets, function(fieldset) {
            var feat = GeoExt.data.MapfishPrintProvider.renderPrintExtent(this.getMapComponent(), view.extentLayer, fieldset.clientInfo);
            fieldset.extentFeature = feat;
        }, this);
        delete view._renderingClientExtents;
    },
    cleanupPrintExtent: function() {
        var view = this;
        view.extentLayer.getSource().clear();
    },
    getLegendObject: function() {
        var classes = [];
        var url;
        var iconString;
        var printLayers = GeoExt.data.MapfishPrintProvider.getLayerArray(this.getMapComponent().getLayers().getArray());
        var filteredLayers = Ext.Array.filter(printLayers, this.legendLayerFilter);
        Ext.each(filteredLayers, function(layer) {
            if (layer.get("legendUrl")) {
                classes.push({
                    icons: [
                        layer.get("legendUrl")
                    ],
                    name: layer.get('name')
                });
            } else {
                if (layer.getSource() instanceof ol.source.TileWMS) {
                    url = layer.getSource().getUrls()[0];
                    iconString = url + "?" + "TRANSPARENT=TRUE&" + "VERSION=1.1.1&" + "SERVICE=WMS&" + "REQUEST=GetLegendGraphic&" + "EXCEPTIONS=application%2Fvnd.ogc.se_xml&" + "FORMAT=image%2Fgif&" + "SCALE=6933504.262556662&" + "LAYER=";
                    iconString += layer.getSource().getParams().LAYERS;
                    classes.push({
                        icons: [
                            iconString
                        ],
                        name: layer.get('name')
                    });
                } else if (layer.getSource() instanceof ol.source.ImageWMS) {
                    url = layer.getSource().getUrl();
                    iconString = url + "?" + "TRANSPARENT=TRUE&" + "VERSION=1.1.1&" + "SERVICE=WMS&" + "REQUEST=GetLegendGraphic&" + "EXCEPTIONS=application%2Fvnd.ogc.se_xml&" + "FORMAT=image%2Fgif&" + "SCALE=6933504.262556662&" + "LAYER=";
                    iconString += layer.getSource().getParams().LAYERS;
                    classes.push({
                        icons: [
                            iconString
                        ],
                        name: layer.get('name')
                    });
                }
            }
        });
        var legendObj = {
                classes: classes,
                name: ""
            };
        return legendObj;
    },
    getNorthArrowObject: function() {
        // TODO
        var northArrowObject = {};
        return northArrowObject;
    },
    getScaleBarObject: function() {
        // TODO
        var scaleBarObj = {};
        return scaleBarObj;
    },
    getLayoutRec: function() {
        var combo = this.down('combo[name="layout"]');
        var value = combo.getValue();
        var rec = combo.findRecordByValue(value);
        return rec;
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * FeaturePropertyGrid
 *
 * A PropertyGrid showing feature values.
 *
 */
Ext.define("Basepackage.view.grid.FeaturePropertyGrid", {
    xtype: "base-grid-featurepropertygrid",
    extend: 'Ext.grid.property.Grid',
    requires: [],
    width: 300,
    config: {
        olFeature: null,
        propertyWhiteList: null
    },
    /**
     *
     */
    initComponent: function() {
        var me = this;
        if (!me.getOlFeature()) {
            Ext.Error.raise('No Feature set for FeaturePropertyGrid.');
        }
        me.callParent([
            arguments
        ]);
        me.on('afterrender', me.setUpFeatureValues, me);
        // Equal to editabel: false. Which does not exist.
        me.on('beforeedit', function() {
            return false;
        });
    },
    setUpFeatureValues: function() {
        var me = this;
        var displayValues = {};
        // Enable tooltip
        var valueColumn = me.getColumns()[1];
        valueColumn.renderer = function(value, metadata) {
            metadata.tdAttr = 'data-qtip="' + value + '"';
            return value;
        };
        Ext.each(me.getPropertyWhiteList(), function(property) {
            displayValues[property] = me.getOlFeature().get(property);
        });
        if (displayValues) {
            me.setSource(displayValues);
        } else {
            Ext.Error.raise('Feature in FeaturePropertyGrid has no values.');
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Header Panel
 *
 * Used to show a headerpanel in the viewport.
 * Class usually instanciated in the map container.
 *
 */
Ext.define("Basepackage.view.panel.Header", {
    extend: "Ext.panel.Panel",
    xtype: "base-panel-header",
    requires: [
        "Ext.Img"
    ],
    config: {
        addLogo: true,
        logoUrl: 'resources/images/logo.png',
        link: null,
        logoAltText: 'Logo',
        logoHeight: 80,
        logoWidth: 200,
        logoMargin: '0 50px',
        additionalItems: []
    },
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    padding: 5,
    cls: 'basepackage-header',
    items: [],
    /**
    *
    */
    initComponent: function() {
        var me = this;
        // add logo
        if (me.getAddLogo() === true) {
            me.addLogoItem();
        }
        var additionalItems = me.getAdditionalItems();
        // add additional items
        if (!Ext.isEmpty(additionalItems) && Ext.isArray(additionalItems)) {
            Ext.each(additionalItems, function(item) {
                me.items.push(item);
            });
        }
        me.callParent();
    },
    /**
     *
     */
    addLogoItem: function() {
        var me = this;
        var logo = {
                xtype: 'image',
                margin: me.getLogoMargin(),
                alt: me.getLogoAltText(),
                src: me.getLogoUrl(),
                height: me.getLogoHeight(),
                width: me.getLogoWidth(),
                autoEl: {
                    tag: 'a',
                    href: me.getLink()
                }
            };
        me.items.push(logo);
    },
    /**
    *
    */
    setBackgroundColor: function(color) {
        this.setStyle({
            'background-color': color,
            //fallback for ie9 and lower
            background: "linear-gradient(to right, white, " + color + ")"
        });
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * LayerSet View
 *
 * Used in the LayerSetChooser Panel
 *
 */
Ext.define("Basepackage.view.view.LayerSet", {
    extend: "Ext.view.View",
    xtype: "base-view-layerset",
    requires: [
        "Ext.data.Store"
    ],
    /**
     * the url to request the layerset json-file.
     * If this is null, a demo set will be shown
     */
    layerSetUrl: null,
    /**
     * the default path to request the images from
     */
    defaultImagePath: 'classic/resources/img/themes/',
    /**
     * the demo image to use
     */
    demoThumb: 'https://www.terrestris.de/wp-content/uploads/2014/03/' + 'logo_terrestris_small3.png',
    /**
     *
     */
    width: 400,
    /**
     *
     */
    height: 300,
    /**
     *
     */
    singleSelect: true,
    /**
     *
     */
    cls: 'img-chooser-view',
    /**
     *
     */
    overItemCls: 'x-view-over',
    /**
     *
     */
    itemSelector: 'div.thumb-wrap',
    /**
     *
     */
    tpl: null,
    /**
     *
     */
    initComponent: function() {
        var me = this,
            store;
        if (Ext.isEmpty(me.layerSetUrl)) {
            // setup demo content
            store = Ext.create('Ext.data.Store', {
                fields: [
                    'name',
                    'thumb',
                    'url',
                    'type'
                ],
                sorters: 'type',
                data: [
                    {
                        "title": "Stadtkarte",
                        "name": "stadtkarte",
                        "thumb": me.demoThumb
                    },
                    {
                        "title": "Verkehr",
                        "name": "verkehr",
                        "thumb": me.demoThumb
                    },
                    {
                        "title": "Umwelt",
                        "name": "umwelt",
                        "thumb": me.demoThumb
                    }
                ]
            });
        } else {
            store = Ext.create('Ext.data.Store', {
                autoLoad: true,
                fields: [
                    'name',
                    'title',
                    'thumb'
                ],
                remoteSort: false,
                sorters: 'type',
                proxy: {
                    type: 'ajax',
                    url: me.layerSetUrl,
                    reader: {
                        type: 'json'
                    }
                }
            });
        }
        // setup default template if none given
        if (Ext.isEmpty(me.tpl)) {
            me.tpl = [
                '<tpl for=".">',
                '<div class="thumb-wrap">',
                '<div class="thumb">',
                // if the thumb is a href to an online resource, we
                // dont need the defaultImagePath
                '<tpl if="thumb.indexOf(\'http\') &gt;= 0">',
                '<img src="{thumb}" />',
                '<tpl else>',
                '<img src="' + me.defaultImagePath,
                '{thumb}" />',
                '</tpl>',
                '</div>',
                '<span>{title}</span>',
                '</div>',
                '</tpl>'
            ];
        }
        // setup store
        me.store = store;
        this.callParent(arguments);
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * LayerSetChooser Panel
 *
 * Used to show different sets of layers to swap the thematic focus of the
 * application, e.g. by changing the visibility of layers.
 * The events fired ('itemclick' and 'itemdblclick') will hand over the
 * selected record
 *
 * Example:
 *      {
            xtype: 'base-panel-layersetchooser',
            layerSetUrl: 'classic/resources/layerset.json',
            listeners: {
                itemclick: this.handleLayerSetClick
            }
        }
 *
 */
Ext.define("Basepackage.view.panel.LayerSetChooser", {
    extend: "Ext.panel.Panel",
    xtype: "base-panel-layersetchooser",
    requires: [
        "Basepackage.view.view.LayerSet"
    ],
    viewModel: {
        data: {
            title: 'Themen Auswahl'
        }
    },
    bind: {
        title: '{title}'
    },
    /**
     *
     */
    region: 'center',
    /**
     *
     */
    layout: 'fit',
    /**
     *
     */
    minWidth: 150,
    /**
     *
     */
    minHeight: 170,
    /**
     *
     */
    cls: 'img-chooser-dlg',
    /**
     *
     */
    layerSetUrl: null,
    /**
     *
     */
    scrollable: 'y',
    /**
     *
     */
    bbar: [
        {
            xtype: 'textfield',
            name: 'filter',
            fieldLabel: 'Filter',
            labelAlign: 'left',
            labelWidth: 45,
            flex: 1
        }
    ],
    /**
     *
     */
    initComponent: function() {
        if (Ext.isEmpty(this.items)) {
            this.items = [
                {
                    xtype: 'base-view-layerset',
                    scrollable: true,
                    layerSetUrl: this.layerSetUrl
                }
            ];
        }
        this.callParent(arguments);
        // add listeners
        this.down('base-view-layerset').on('select', this.onLayerSetSelect);
        this.down('base-view-layerset').on('itemclick', this.onLayerSetClick);
        this.down('base-view-layerset').on('itemdblclick', this.onLayerSetDblClick);
    },
    /**
     * Just firing an event on the panel.
     * Listen to the select event to implement custom handling
     */
    onLayerSetSelect: function(view, rec, index, opts) {
        this.up('base-panel-layersetchooser').fireEvent('select', view, rec, index, opts);
    },
    /**
     * Just firing an event on the panel.
     * Listen to the itemclick event to implement custom handling
     */
    onLayerSetClick: function(view, rec, item, index, evt, opts) {
        view.up('base-panel-layersetchooser').fireEvent('itemclick', view, rec, item, index, evt, opts);
    },
    /**
     * Just firing an event on the panel.
     * Listen to the itemdblclick event to implement custom handling
     */
    onLayerSetDblClick: function(view, rec, item, index, evt, opts) {
        view.up('base-panel-layersetchooser').fireEvent('itemdblclick', view, rec, item, index, evt, opts);
    },
    /**
     *
     */
    filterLayerSetsByText: function(textfield, newVal, oldval, listener) {
        var layerProfileView = listener.scope.down('base-view-layerset'),
            store = layerProfileView.getStore();
        store.getFilters().replaceAll({
            property: 'name',
            anyMatch: true,
            value: newVal
        });
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * LegendTree Panel
 *
 * Used to build a TreePanel with layer legends.
 *
 */
Ext.define("Basepackage.view.panel.LegendTree", {
    extend: "GeoExt.tree.Panel",
    xtype: "base-panel-legendtree",
    requires: [
        'Basepackage.ux.RowExpanderWithComponents'
    ],
    viewModel: {
        data: {}
    },
    /**
     * adding custom method to get access to row styles
     */
    viewConfig: {
        getRowClass: function(record) {
            return this.up().getCssForRow(record);
        }
    },
    layout: 'fit',
    width: 250,
    height: 300,
    collapsible: true,
    collapsed: true,
    hideCollapseTool: true,
    collapseDirection: 'bottom',
    titleCollapse: true,
    titleAlign: 'center',
    rootVisible: false,
    allowDeselect: true,
    selModel: {
        mode: 'MULTI'
    },
    cls: 'base-legend-panel',
    /**
     * @private
     */
    initiallyCollapsed: null,
    /**
     * Take care of the collapsed configuration.
     *
     * For some reason, for the legend panel we cannot have the configuration
     *
     *     {
     *         collapsed: true,
     *         hideCollapseTool: true
     *     }
     * because the the showing on header click does not work. We have this one
     * time listener, that tells us what we originally wanted.
     */
    initComponent: function() {
        var me = this;
        if (me.collapsed && me.hideCollapseTool) {
            me.collapsed = false;
            me.initiallyCollapsed = true;
            Ext.log.info('Ignoring configuration "collapsed" and instead' + ' setup a one-time afterlayout listener that will' + ' collapse the panel (this is possibly due to a bug in' + ' ExtJS 6)');
        }
        me.hideHeaders = true;
        me.lines = false;
        me.plugins = [
            {
                ptype: 'rowexpanderwithcomponents',
                hideExpandColumn: true,
                rowBodyCompTemplate: me.rowBodyCompTemplate
            }
        ];
        // call parent
        me.callParent();
        // See the comment above the constructor why we need this.
        if (me.initiallyCollapsed) {
            me.on('afterlayout', function() {
                this.collapse();
            }, me, {
                single: true,
                delay: 100
            });
            me.initiallyCollapsed = null;
        }
    },
    /**
     * This template will be used for every record. It can contain general
     * Ext JS Components. Text in "{{ }}" will be executed as JavaScript.
     */
    rowBodyCompTemplate: {
        xtype: 'container',
        items: [
            {
                xtype: 'image',
                src: '{{record.getOlLayer().get("legendUrl")}}',
                height: '{{record.getOlLayer().get("legendHeight")}}',
                alt: '{{record.getOlLayer().get("legendUrl")}}'
            }
        ]
    },
    /**
     * Expands All RowBodies
     */
    expandAllBodies: function() {
        var me = this;
        if ((!me.getBodyInitiallyCollapsed()) && me.plugins.length > 0) {
            me.getStore().each(function(record, index) {
                me.plugins[0].toggleRow(index, record);
            });
        }
    },
    /**
     *
     */
    getColorFromRow: function(rec) {
        var me = this;
        var color = rec.getData().get('treeColor');
        // detect if we have a folder and apply color from childNode
        if (!Ext.isDefined(color) && !rec.isLeaf() && rec.childNodes.length > 0) {
            Ext.each(rec.childNodes, function(child) {
                color = me.getColorFromRow(child);
                if (Ext.isDefined(color)) {
                    return false;
                }
            });
        }
        return color;
    },
    /**
     * Method gives access to the rows style.
     * If a layer is configured with property 'treeColor', the color will
     * get applied here. Folders will inherit the color
     */
    getCssForRow: function(rec) {
        var color = this.getColorFromRow(rec);
        // if color is still not defined, return old default
        if (!Ext.isDefined(color)) {
            return "my-body-class";
        }
        var elemenIdAndCssClass;
        if (color === null) {
            elemenIdAndCssClass = 'stylesheet-null';
        } else {
            elemenIdAndCssClass = 'stylesheet-' + color.replace(/[\(\),\. ]+/g, '-');
        }
        var sheet = Ext.DomQuery.selectNode('#' + elemenIdAndCssClass);
        if (sheet) {
            // already create once before
            return elemenIdAndCssClass;
        } else // instead of returning, we could also remove the sheet and add it
        // again: see below
        // sheet.parentNode.removeChild(sheet);
        {
            var css = '' + '.' + elemenIdAndCssClass + ' { ' + ' background-color: ' + color + ';' + ' background:linear-gradient(to right, white, ' + color + ');' + '}';
            Ext.util.CSS.createStyleSheet(css, elemenIdAndCssClass);
            return elemenIdAndCssClass;
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * Menu Panel
 *
 * Used to show a menu containing different panels of your choice, e.g.
 * the print form panel
 *
 */
Ext.define("Basepackage.view.panel.Menu", {
    extend: "Ext.panel.Panel",
    xtype: "base-panel-menu",
    requires: [
        "Ext.layout.container.Accordion"
    ],
    viewModel: {
        data: {
            closedMenuTitle: 'Menu schließen',
            openedMenuTitle: 'Menu anzeigen'
        }
    },
    defaultListenerScope: true,
    headerPosition: 'bottom',
    collapsible: true,
    hideCollapseTool: true,
    titleCollapse: true,
    titleAlign: 'center',
    activeItem: 1,
    defaults: {
        // applied to each contained panel
        hideCollapseTool: true,
        titleCollapse: true
    },
    layout: {
        // layout-specific configs go here
        type: 'accordion',
        titleCollapse: false,
        animate: true
    },
    items: [],
    listeners: {
        collapse: 'setTitleAccordingToCollapsedState',
        expand: 'setTitleAccordingToCollapsedState',
        afterrender: 'setTitleAccordingToCollapsedState'
    },
    setTitleAccordingToCollapsedState: function(menu) {
        if (menu.getCollapsed() === false) {
            menu.setBind({
                title: '{closedMenuTitle}'
            });
        } else {
            menu.setBind({
                title: '{openedMenuTitle}'
            });
        }
    }
});

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
/**
 *      _                             _        _
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/
 *
 *   _                                 _
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'
 *
 * MapContainer Panel
 *
 * Represents a main viewport which holds the map and other map related
 * components. Using this container leads to a map with integrated or
 * overlapping components, instead of arranging them in a border layout.
 *
 */
Ext.define("Basepackage.view.panel.MapContainer", {
    extend: "Ext.panel.Panel",
    xtype: "base-panel-mapcontainer",
    requires: [
        "Ext.dom.Query",
        "GeoExt.data.store.LayersTree",
        "GeoExt.component.OverviewMap",
        "Basepackage.util.Layer",
        "Basepackage.view.component.Map",
        "Basepackage.view.panel.LegendTree",
        "Basepackage.view.panel.Menu",
        "Basepackage.view.button.ZoomIn",
        "Basepackage.view.button.ZoomOut",
        "Basepackage.view.button.ZoomToExtent",
        "Basepackage.view.button.ToggleLegend"
    ],
    /**
     *
     */
    viewModel: {
        data: {
            titleLegendPanel: 'Legende'
        }
    },
    /**
     *
     */
    layout: 'absolute',
    /**
     *
     */
    header: false,
    /**
     * The mapPanel containing the map.
     */
    mapPanel: null,
    /**
     * Config
     */
    config: {
        mapComponentConfig: {
            xtype: 'base-component-map',
            anchor: '100% 100%'
        },
        menuConfig: {
            xtype: 'base-panel-menu',
            width: 300,
            items: []
        },
        toolbarConfig: {
            xtype: 'toolbar',
            vertical: true,
            width: 50,
            cls: 'base-map-tools',
            x: 0,
            y: 0,
            defaults: {
                scale: 'large'
            }
        },
        overviewMapConfig: {
            xtype: 'gx_overviewmap',
            magnification: 10,
            width: 400,
            height: 150,
            padding: 5,
            cls: 'base-overview-map',
            hidden: true,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.MapQuest({
                        layer: 'sat'
                    })
                })
            ]
        },
        overviewMapToggleButtonConfig: {
            xtype: 'button',
            scale: 'large',
            helpKey: 'base-overview-map-button',
            cls: 'base-overview-map-button',
            glyph: 'xf0ac@FontAwesome',
            enableToggle: true
        },
        legendPanelConfig: {
            xtype: 'base-panel-legendtree',
            width: 250,
            height: 300,
            layout: 'fit',
            collapsible: true,
            collapsed: true,
            hideCollapseTool: true,
            collapseDirection: 'bottom',
            titleCollapse: true,
            titleAlign: 'center',
            rootVisible: false,
            bind: {
                title: '{titleLegendPanel}'
            }
        },
        /* use this property for additional items that can not be added
         * to "items" immediately as they depend on the map or
         * other components that are built in the MapContainer and should be
         * instanciated first
         */
        additionalItems: []
    },
    /**
     * Init
     */
    initComponent: function() {
        var me = this;
        // call parent (we can use this.add() after this call)
        me.callParent();
        /* add the map component and set it as member
         * the map should be built first as some other components
         * depend on it
         */
        me.addMapComponent();
        // add the menu. TODO: make optional based on config and pass menuItems
        me.addMenu();
        // add the toolbar. TODO: make optional based on config
        me.addToolbar();
        // add the overview map. TODO make optional based on config
        me.addOverviewMap();
        // add the overview map toggle button. TODO make optional
        me.addOverviewMapToggleButton();
        /* add additional items (that possibly depend on the map or other
         * components that were built in the lines before)
         */
        me.addAdditionalItems();
        // TODO make optional based on config
        me.on('afterrender', me.addLegendPanel, me, {
            single: true
        });
    },
    /**
     *
     */
    addMapComponent: function() {
        var me = this;
        var mapComponent = me.getMapComponentConfig();
        me.add(mapComponent);
        // query the mapPanel we just built to set it as a member
        me.mapPanel = me.down(mapComponent.xtype);
    },
    /**
     *
     */
    addMenu: function() {
        var me = this;
        var menu = me.getMenuConfig();
        me.add(menu);
    },
    /**
     *
     */
    addToolbar: function() {
        var me = this;
        var toolbar = me.getToolbarConfig();
        toolbar.items = me.buildToolbarItems();
        me.add(toolbar);
    },
    /**
     *
     */
    addOverviewMap: function() {
        var me = this;
        var overviewMap = me.getOverviewMapConfig();
        // set the overviewmap parent map
        if (!overviewMap.parentMap && me.mapPanel) {
            overviewMap.parentMap = me.mapPanel.getMap();
        }
        me.add(overviewMap);
    },
    /**
     *
     */
    addOverviewMapToggleButton: function() {
        var me = this;
        var overviewMapToggleButton = me.getOverviewMapToggleButtonConfig();
        // set the toggleHandler if not configured
        if (!overviewMapToggleButton.toggleHander && me.toggleOverviewMap) {
            overviewMapToggleButton.toggleHandler = me.toggleOverviewMap;
        }
        // set the scope (e.g. for handler or toggleHandler)
        if (!overviewMapToggleButton.scope) {
            overviewMapToggleButton.scope = me;
        }
        me.add(overviewMapToggleButton);
    },
    /**
     *
     */
    addAdditionalItems: function() {
        var me = this;
        var additionalItems = me.getAdditionalItems();
        me.add(additionalItems);
    },
    /**
     *
     */
    addLegendPanel: function() {
        var me = this;
        var legendTreeConfig = me.getLegendPanelConfig();
        // set the store if not configured
        if (!legendTreeConfig.store && me.mapPanel) {
            var treeStore = Ext.create('GeoExt.data.store.LayersTree', {
                    layerGroup: me.mapPanel.getMap().getLayerGroup(),
                    showLayerGroupNode: false,
                    filters: [
                        // filter out vector layers
                        function(rec) {
                            var layer = rec.data;
                            var util = Basepackage.util.Layer;
                            var showKey = util.KEY_DISPLAY_IN_LAYERSWITCHER;
                            if (layer.get(showKey) === false) {
                                return false;
                            }
                            return true;
                        }
                    ]
                });
            // set the store
            legendTreeConfig.store = treeStore;
        }
        // add the legend panel
        me.add(legendTreeConfig);
    },
    /**
     *
     */
    buildToolbarItems: function() {
        var toolbarItems = [
                {
                    xtype: 'base-button-zoomin'
                },
                {
                    xtype: 'base-button-zoomout'
                },
                {
                    xtype: 'base-button-zoomtoextent'
                },
                {
                    xtype: 'base-button-togglelegend'
                }
            ];
        return toolbarItems;
    },
    /**
     *
     */
    toggleOverviewMap: function(button, pressed) {
        var ovm = button.up("base-panel-mapcontainer").down('gx_overviewmap');
        if (pressed) {
            ovm.show(button);
        } else {
            ovm.hide(button);
        }
        button.blur();
        this.toggleScalelineAdjustment();
        this.toggleScalecomboAdjustment();
    },
    /**
     *
     */
    toggleScalelineAdjustment: function() {
        var scaleline = Ext.dom.Query.select('.ol-scale-line')[0];
        var scalelineElem;
        if (scaleline) {
            scalelineElem = Ext.get(scaleline);
        }
        if (scalelineElem) {
            scalelineElem.toggleCls('base-scaline-adjusted');
        }
    },
    /**
     *
     */
    toggleScalecomboAdjustment: function() {
        var scaleCombo = Ext.ComponentQuery.query('base-combo-scale')[0];
        var scaleComboEl;
        if (scaleCombo) {
            scaleComboEl = scaleCombo.getEl();
        }
        if (scaleComboEl) {
            scaleComboEl.toggleCls('base-combo-scale-adjusted');
        }
    }
});

