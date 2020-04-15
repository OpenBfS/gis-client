/* Copyright (c) 2017 Bundesamt fuer Strahlenschutz
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
 * @class Koala.plugin.Hover
 */
Ext.define('Koala.plugin.Hover', {
    extend: 'BasiGX.plugin.Hover',

    alias: 'plugin.hoverBfS',
    id: 'hoverBfS',

    /**
     * This is finally a complete OVERRIDE of the getToolTipHtml function.
     * Moved here from Map/MapController.
     */
    getToolTipHtml: function(layers, features) {
        var innerHtml = '';
        var lineBreak = '<br />';
        var layersLen = layers && layers.length;
        var featuresLen = features && features.length;
        var replaceTemplateStrings = Koala.util.String.replaceTemplateStrings;
        Ext.each(layers, function(layer, layerIdx) {
            Ext.each(features, function(feature, featureIdx) {
                // Make sure to extract the hoverTpl for each feature, else
                // in case of a function it will only be evaluated for the
                // first feature!
                var hoverTpl = layer.get('hoverTpl');
                // we check for existing feature first as there maybe strange
                // situations (e.g. when zooming while hovering)
                // where feat is undefined and feat.get would throw an error
                if (feature && feature.get('layer') === layer) {
                    // evaluate possible template functions with the current feature
                    if (Ext.isFunction(hoverTpl)) {
                        hoverTpl = hoverTpl(feature);
                    }
                    var tooltipFeature = hoverTpl;
                    tooltipFeature = replaceTemplateStrings(
                        tooltipFeature, layer, false);
                    tooltipFeature = replaceTemplateStrings(
                        tooltipFeature, layer, false, 'layer.');
                    tooltipFeature = replaceTemplateStrings(
                        tooltipFeature, feature, false);
                    tooltipFeature = replaceTemplateStrings(
                        tooltipFeature, feature, false, 'feature.');
                    innerHtml += tooltipFeature;
                    if (featureIdx + 1 !== featuresLen) {
                        // not the last feature, append linebreak
                        innerHtml += lineBreak;
                    }
                }
            });

            if (layerIdx + 1 !== layersLen) {
                // not the last layer, append linebreak
                innerHtml += lineBreak;
            }
        });

        return innerHtml;
    },

    /**
     * overwrite BasiGX-onPointerRest()
     * if mouse pointer hovers over featureInfo-win, etc.,
     * do not cleanupHoverArtifacts().
     * The handler for the pointerrest event on the mapcomponent.
     *
     * @param {ol.MapBrowserEvent} evt The original and most recent
     *     MapBrowserEvent event.
     */
    onPointerRest: function(evt) {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        var mapView = map.getView();
        var pixel = evt.pixel;
        var hoverableProp = me.self.LAYER_HOVERABLE_PROPERTY_NAME;
        var hoverLayers = [];
        var hoverFeatures = [];
        var overlays = map.getOverlays();
        var breakMe = false;

        // Avoid hoverTooltip when dragging a cartowindow
        overlays.forEach(function(overlay) {
            if (overlay.get('dragging')) {
                breakMe = true;
            }
        });
        if (breakMe) {
            return false;
        }

        if (evt.originalEvent.target.className === 'ol-unselectable') {
            me.cleanupHoverArtifacts();

            map.forEachLayerAtPixel(pixel, function(layer, pixelValues) {
                var source = layer.getSource();
                var resolution = mapView.getResolution();
                var projCode = mapView.getProjection().getCode();
                var hoverable = layer.get(hoverableProp);

                // a layer will NOT be requested for hovering if there is a
                // "hoverable" property set to false. If this property is not set
                // or has any other value than "false", the layer will be requested
                if (hoverable !== false) {
                    if (source instanceof ol.source.TileWMS
                            || source instanceof ol.source.ImageWMS) {
                        // me.cleanupHoverArtifacts();
                        var url = source.getGetFeatureInfoUrl(
                            evt.coordinate,
                            resolution,
                            projCode,
                            {
                                'INFO_FORMAT': 'application/json',
                                'FEATURE_COUNT': 50
                            }
                        );

                        me.requestAsynchronously(url, function(resp) {
                            // TODO: replace evt/coords with real response geometry
                            var respFeatures = (new ol.format.GeoJSON())
                                .readFeatures(resp.responseText);
                            var respProjection = (new ol.format.GeoJSON())
                                .readProjection(resp.responseText);

                            me.showHoverFeature(
                                layer, respFeatures, respProjection
                            );

                            Ext.each(respFeatures, function(feature) {
                                feature.set('layer', layer);
                                var featureStyle = me.highlightStyleFunction(
                                    feature, resolution, pixelValues);
                                feature.setStyle(featureStyle);
                                hoverFeatures.push(feature);
                            });

                            hoverLayers.push(layer);

                            me.showHoverToolTip(evt, hoverLayers, hoverFeatures);
                        });
                    } else if (source instanceof ol.source.Vector) {
                        if (layer.get('name') === 'hoverLayer') {
                            return;
                        }
                        // VECTOR!
                        map.forEachFeatureAtPixel(pixel, function(feat) {
                            if (layer.get('type') === 'WFS' ||
                                    layer.get('type') === 'WFSCluster') {
                                var hvl = me.getHoverVectorLayer();
                                // TODO This should be dynamically generated
                                // from the clusterStyle
                                hvl.setStyle(me.highlightStyleFunction);
                            }
                            if (layer.getSource().getFeatures().indexOf(feat) === -1) {
                                return;
                            }
                            var featureClone = feat.clone();
                            if (featureClone.get('layer')) {
                                return;
                            }
                            featureClone.set('layer', layer);
                            if (!Ext.Array.contains(hoverLayers, layer)) {
                                hoverLayers.push(layer);
                            }
                            hoverFeatures.push(featureClone);
                            me.showHoverFeature(layer, hoverFeatures);
                            me.currentHoverTarget = feat;
                        }, me, function(vectorCand) {
                            return vectorCand === layer;
                        });
                    }
                }
            }, this, me.hoverLayerFilter, this);
            me.highlightFeaturesInGrid(hoverFeatures);
            me.showHoverToolTip(evt, hoverLayers, hoverFeatures);
        } else {
            return;
        }
    },

    /**
     * In case the feature grid is open, highlight hover features in the table.
     * @param  {ol.Feature[]} features the highlighted features
     */
    highlightFeaturesInGrid: function(features) {
        var grid = Ext.ComponentQuery.query('basigx-grid-featuregrid');
        if (grid.length > 0) {
            var gridView = grid[0].down('grid').getView();
            var layer = grid[0].getLayer();
            var layerFeatures = layer.getSource().getFeatures();
            Ext.each(features, function(feature) {
                var idx = -1;
                // suboptimal: find features' index in grid by id
                Ext.each(layerFeatures, function(layerFeature, index) {
                    if (layerFeature.get('id') === feature.get('id')) {
                        idx = index;
                    }
                });

                if (idx >= 0) {
                    var row = Ext.get(gridView.getRow(idx));
                    if (row) {
                        row.highlight();
                    }
                }
            });
        }
    }

});
