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
                        // VECTOR!
                        map.forEachFeatureAtPixel(pixel, function(feat) {
                            if (layer.get('type') === 'WFS' ||
                                    layer.get('type') === 'WFSCluster') {
                                var hvl = me.getHoverVectorLayer();
                                // TODO This should be dynamically generated
                                // from the clusterStyle
                                hvl.setStyle(me.highlightStyleFunction);
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
            }, this, me.hoverLayerFilter, this);

            me.showHoverToolTip(evt, hoverLayers, hoverFeatures);
        } else {
            return;
        }
    }

});
