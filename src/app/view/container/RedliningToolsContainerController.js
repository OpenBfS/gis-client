/* Copyright (c) 2016-present terrestris
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
 * RedliningToolsContainerController
 *
 * The controller for the redlining tools. Contains all OL interactions for
 * each redlining action on the map (e.g. draw/modify/move/delete point,
 * linestring, polygon). Additionally the simple styler is included.
 *
 * @class Koala.view.container.RedliningToolsContainerController
 */
Ext.define('Koala.view.container.RedliningToolsContainerController', {

    extend: 'Ext.app.ViewController',

    requires: [
        'Koala.util.AppContext',
        'Koala.util.Export'
    ],

    alias: 'controller.k-container-redliningtoolscontainer',

    constructor: function() {
        // store bound version of method
        // see https://github.com/terrestris/BasiGX/wiki/Update-application-to-ol-6.5.0,-geoext-4.0.0,-BasiGX-3.0.0#removal-of-opt_this-parameters
        this.fireRedliningChanged = this.fireRedliningChanged.bind(this);
        this.onDrawStart = this.onDrawStart.bind(this);
        this.onDrawEnd = this.onDrawEnd.bind(this);
        this.onGeometryChange = this.onGeometryChange.bind(this);
        this.updateLabel = this.updateLabel.bind(this);

        this.callParent(arguments);
    },


    redlineLayerStyle: function(feature) {
        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            }),
            text: new ol.style.Text({
                text: feature.get('text'),
                offsetY: -7,
                fill: new ol.style.Fill({
                    color: 'black'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 10
                })
            })
        });
    },

    drawInteractionStyle: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 5,
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.7)'
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            })
        })
    }),

    redliningVectorLayer: null,

    redlineFeatures: null,

    /**
     * Currently drawn feature.
     * @type {ol.Feature}
     */
    sketch: null,

    /**
     * The snapInteraction which has to be recreated after every newly added
     * interaction. See http://openlayers.org/en/latest/examples/snap.html.
     * @type {ol.interaction.Snap}
     */
    snapInteraction: null,

    /**
     * Instance of the `ol.interaction.Draw` with type `Point`
     */
    drawPointInteraction: null,

    /**
     * Instance of the `ol.interaction.Draw` with type `LineString`
     */
    drawLineInteraction: null,

    /**
     * Instance of the `ol.interaction.Draw` with type `Polygon`
     */
    drawPolygonInteraction: null,

    /**
     * Instance of the `ol.interaction.Modify` to be used to modify the drawn
     * objects. Works together with the #modifySelectInteraction interaction.
     */
    modifyInteraction: null,

    /**
     * Instance of the `ol.interaction.Select` to be used to modify the drawn
     * objects. Works together with the #modifyInteraction interaction.
     */
    modifySelectInteraction: null,

    /**
     * Instance of the `ol.interaction.Select` to be used to delete the drawn
     * objects. Works together with the #deleteSnapInteraction interaction.
     */
    deleteSelectInteraction: null,

    /**
     * Instance of the `ol.interaction.Snap` to be used to delete the drawn
     * objects. Works together with the #deleteSelectInteraction interaction.
     */
    deleteSnapInteraction: null,

    /**
     * Listener called on the components initialization. It creates the
     * redLineLayer and adds it to the map.
     */
    onInit: function() {
        var me = this;

        if (!me.redliningVectorLayer) {
            me.createAndAddRedliningLayerIfRemoved();
        }
    },

    /**
     * Reference to 'view.pointerMoveHandler' function
     * with the 'view' as scope.
     * Necessary for properly removing the listener
     * again.
     */
    boundPointerMoveHandler: null,

    onAdded: function() {
        var view = this.getView();

        // storing function is necessary for properly removing it later on
        this.boundPointerMoveHandler = view.pointerMoveHandler.bind(view);
        view.map.on('pointermove', this.boundPointerMoveHandler);
    },

    onRemoved: function() {
        var view = this.getView();
        view.map.un('pointermove', this.boundPointerMoveHandler);
        if (view.measureTooltipElement) {
            view.measureTooltipElement.remove();
            view.measureTooltipElement = null;
            view.createMeasureTooltip();
        }
        if (view.helpTooltipElement) {
            view.helpTooltipElement.remove();
            view.helpTooltipElement = null;
        }
        if (this.snapInteraction) {
            this.snapInteraction.setActive(false);
        }
        if (this.drawPointInteraction) {
            this.drawPointInteraction.setActive(false);
        }
        if (this.drawLineInteraction) {
            this.drawLineInteraction.setActive(false);
        }
        if (this.drawPolygonInteraction) {
            this.drawPolygonInteraction.setActive(false);
        }
        if (this.modifyInteraction) {
            this.modifyInteraction.setActive(false);
        }
        if (this.modifySelectInteraction) {
            this.modifySelectInteraction.setActive(false);
        }
        if (this.deleteSelectInteraction) {
            this.deleteSelectInteraction.setActive(false);
        }
        if (this.deleteSnapInteraction) {
            this.deleteSnapInteraction.setActive(false);
        }
    },

    createAndAddRedliningLayerIfRemoved: function() {
        var me = this;
        var view = me.getView();
        var map = view.map;
        var redLineLayerName = view.getViewModel().get('layerLegendName');
        var redLineLayer = BasiGX.util.Layer.getLayerByName(redLineLayerName);
        if (redLineLayer) {
            me.redliningVectorLayer = redLineLayer;
            me.redlineFeatures = me.redliningVectorLayer.getSource().getFeaturesCollection();
            return;
        }
        me.redliningVectorLayer = new ol.layer.Vector({
            name: redLineLayerName,
            source: new ol.source.Vector({
                features: me.redlineFeatures = new ol.Collection()
            }),
            style: me.redlineLayerStyle,
            printSpecial: true,
            // TODO We do a check manually check on the RoutingLegendTree to
            // disbale styling for this layer.
            disableStyling: true,
            allowRemoval: true
        });
        me.redlineFeatures.on(
            'add',
            me.fireRedliningChanged
        );

        map.addLayer(me.redliningVectorLayer);
    },

    /**
     * Fires if "draw point" button was toggled. Creates a #drawPointInteraction
     * if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onDrawPointsBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();

        if (!me.drawPointInteraction) {
            me.drawPointInteraction = new ol.interaction.Draw({
                style: me.drawInteractionStyle,
                features: me.redlineFeatures,
                type: 'Point'
            });
            view.map.addInteraction(me.drawPointInteraction);
        }

        if (pressed) {
            view.helpTooltipElement.classList.remove('x-hidden');
            me.drawPointInteraction.on('drawend', me.onDrawEnd);
            me.drawPointInteraction.setActive(true);
        } else {
            view.helpTooltipElement.classList.add('x-hidden');
            me.drawPointInteraction.un('drawend', me.onDrawEnd);
            me.drawPointInteraction.setActive(false);
        }
        me.resetSnapInteraction();
    },

    /**
     * Fires if "draw line" button was toggled. Creates a #drawLineInteraction
     * if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onDrawLinesBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();
        if (!me.drawLineInteraction) {
            me.drawLineInteraction = new ol.interaction.Draw({
                layer: me.redliningVectorLayer,
                style: me.drawInteractionStyle,
                features: me.redlineFeatures,
                type: 'LineString'
            });
            view.map.addInteraction(me.drawLineInteraction);

        }
        if (pressed) {
            view.helpTooltipElement.classList.remove('x-hidden');
            me.drawLineInteraction.on('drawstart', me.onDrawStart);
            me.drawLineInteraction.on('drawend', me.onDrawEnd);
            me.drawLineInteraction.setActive(true);
        } else {
            if (view.measureTooltipElement) {
                view.measureTooltipElement.remove();
                view.measureTooltipElement = null;
                view.createMeasureTooltip();
            }
            view.helpTooltipElement.classList.add('x-hidden');
            me.drawLineInteraction.un('drawstart', me.onDrawStart);
            me.drawLineInteraction.un('drawend', me.onDrawEnd);
            me.drawLineInteraction.setActive(false);
        }
        me.resetSnapInteraction();
    },

    /**
     * Fires if "draw polygon" button was toggled. Creates a
     * #drawPolygonInteraction if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onDrawPolygonsBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();
        if (!me.drawPolygonInteraction) {
            me.drawPolygonInteraction = new ol.interaction.Draw({
                style: me.drawInteractionStyle,
                features: me.redlineFeatures,
                type: 'Polygon'
            });
            view.map.addInteraction(me.drawPolygonInteraction);
        }

        if (pressed) {
            view.helpTooltipElement.classList.remove('x-hidden');
            me.drawPolygonInteraction.on('drawstart', me.onDrawStart);
            me.drawPolygonInteraction.on('drawend', me.onDrawEnd);
            me.drawPolygonInteraction.setActive(true);
        } else {
            if (view.measureTooltipElement) {
                view.measureTooltipElement.remove();
                view.measureTooltipElement = null;
                view.createMeasureTooltip();
            }
            view.helpTooltipElement.classList.add('x-hidden');
            me.drawPolygonInteraction.un('drawstart', me.onDrawStart);
            me.drawPolygonInteraction.un('drawend', me.onDrawEnd);
            me.drawPolygonInteraction.setActive(false);
        }
        me.resetSnapInteraction();
    },

    /**
     * [description]
     * @return {Object} the event
     */
    onDrawStart: function(evt) {
        var me = this;
        me.sketch = evt.feature;
        me.sketch.getGeometry().on('change', me.onGeometryChange);
    },

    /**
     * [description]
     * @return {Object} the event
     */
    onDrawEnd: function(evt) {
        var me = this;
        me.createAndAddRedliningLayerIfRemoved();
        var view = me.getView();
        var viewModel = me.getViewModel();
        var geom = evt.feature.getGeometry();
        var tooltipPosition = viewModel.get('measurementLabelCoord') ||
                view.measureTooltip.getPosition();
        var labelText = viewModel.get('measurementLabelText') ||
                view.measureTooltipElement.innerHTML;

        if (geom.getType() === 'Point') {
            tooltipPosition = geom.getCoordinates();
            labelText = me.formatCoordinates(geom);
        }

        var labelFeature = new ol.Feature({
            geometry: new ol.geom.Point(tooltipPosition),
            text: labelText,
            parentFeature: evt.feature,
            isLabel: true
        });

        me.redliningVectorLayer.getSource().addFeature(labelFeature);
        geom.un('change', me.onGeometryChange);

        view.measureTooltipElement.remove();
        view.measureTooltipElement = null;
        view.createMeasureTooltip();
    },

    /**
     * [description]
     * @return {Object} the event
     */
    onGeometryChange: function(evt) {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var geom = evt.target;
        var output;
        var tooltipCoord = evt.coordinate;

        if (geom instanceof ol.geom.Polygon) {
            output = me.formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof ol.geom.LineString) {
            output = me.formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
        }

        viewModel.set('measurementLabelText', output);
        viewModel.set('measurementLabelCoord', tooltipCoord);

        view.measureTooltipElement.innerHTML = output;
        view.measureTooltip.setPosition(tooltipCoord);
    },

    /**
     * Fires if "modify feature" button was toggled.
     * Creates a #modifyInteraction and #modifySelectInteraction
     * if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onModifyObjectBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();
        if (!me.modifyInteraction) {
            me.modifySelectInteraction = new ol.interaction.Select();
            me.modifySelectInteraction.on('select', function(evt) {
                if (evt.selected && evt.selected[0]) {
                    var feature = evt.selected[0];
                    if (feature.get('isPostit')) {
                        me.modifyPostit(feature);
                    }
                }
                me.modifySelectInteraction.getFeatures().clear();
            });
            view.map.addInteraction(me.modifySelectInteraction);
            me.modifyInteraction = new ol.interaction.Modify({
                features: me.redlineFeatures,
                pixelTolerance: 20,
                deleteCondition: function(event) {
                    return ol.events.condition
                        .singleClick(event);
                }
            });
            view.map.addInteraction(me.modifyInteraction);
        }
        if (pressed) {
            me.modifyInteraction.setActive(true);
            me.modifySelectInteraction.setActive(true);
            me.modifyInteraction.on('modifyend', me.updateLabel);
        } else {
            me.modifyInteraction.setActive(false);
            me.modifySelectInteraction.setActive(false);
            me.modifyInteraction.un('modifyend', me.updateLabel);
        }
    },

    /**
     * Updates the labelFeature of a feature. It updates the textcontent (and
     * the position for polygons).
     *
     * @param {ol.interaction.Modify.Event} evt
     */
    updateLabel: function(evt) {
        var me = this;
        var modifiedFeatures = evt.features;
        var allFeatures = me.redliningVectorLayer.getSource().getFeatures();

        modifiedFeatures.forEach(function(feature) {
            allFeatures.forEach(function(label) {
                if (label.get('isLabel') && label.get('parentFeature') === feature ) {
                    var text;
                    var featureGeom = feature.getGeometry();
                    switch (featureGeom.getType()) {
                        case 'Point':
                            text = me.formatCoordinates(featureGeom);
                            break;
                        case 'LineString':
                            text = me.formatLength(featureGeom);
                            break;
                        case 'Polygon':
                            var interiorPoint = featureGeom.getInteriorPoint();
                            label.setGeometry(interiorPoint);
                            text = me.formatArea(featureGeom);
                            break;
                        default:
                            text = label.get('text');
                            break;
                    }
                    label.set('text', text);
                }
            });
        }.bind(me));
    },

    /**
     * Fires if "delete feature" button was toggled.
     * Creates a #deleteSelectInteraction and #deleteSnapInteraction
     * if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onDeleteObjectBtnToggle: function(btn, pressed) {
        var me = this;
        var view = me.getView();
        if (!me.deleteSelectInteraction) {
            var removeFeatures = function(selFeatures) {
                // find the matching feature in redlining layer
                selFeatures.forEach(function(sf) {
                    var feature = me.getRedlineFeatFromClone(sf);
                    if (feature) {
                        me.redlineFeatures.remove(feature);
                    }
                    me.deleteSelectInteraction.getFeatures().remove(sf);

                    // remove a corresponding label or feature if label was clicked
                    me.redlineFeatures.forEach(function(af) {
                        if (sf && sf.get('isLabel') && sf.get('parentFeature') === af ) {
                            me.redlineFeatures.remove(af);
                            me.deleteSelectInteraction.getFeatures().remove(af);
                            if (me.redlineFeatures.getLength() === 0) {
                                view.map.removeLayer(me.redliningVectorLayer);
                            }
                        }

                        if (af && af.get('isLabel') && af.get('parentFeature') === sf ) {
                            me.redlineFeatures.remove(af);
                            me.deleteSelectInteraction.getFeatures().remove(af);
                            if (me.redlineFeatures.getLength() === 0) {
                                view.map.removeLayer(me.redliningVectorLayer);
                            }
                        }
                    });

                    view.map.renderSync();
                });
            };
            me.deleteSelectInteraction = new ol.interaction.Select({
                condition: function(evt) {
                    return ol.events.condition.pointerMove(evt) ||
                         ol.events.condition.click(evt);
                },
                addCondition: function(evt) {
                    if (evt.type === 'click') {
                        var selFeatures =
                            me.deleteSelectInteraction.getFeatures();
                        removeFeatures(selFeatures);
                    }
                },
                // do not change style on hover or snap
                style: null
            });
            view.map.addInteraction(me.deleteSelectInteraction);

            me.deleteSnapInteraction = new ol.interaction.Snap({
                features: me.redlineFeatures
            });
            view.map.addInteraction(me.deleteSnapInteraction);
        }
        if (pressed) {
            me.deleteSelectInteraction.setActive(true);
            me.deleteSnapInteraction.setActive(true);
        } else {
            me.deleteSelectInteraction.setActive(false);
            me.deleteSnapInteraction.setActive(false);
        }
    },

    /**
     * Click-Listener for the clera objects btn. It removes all drawn features
     * from the map.
     */
    onClearObjectsBtn: function() {
        var me = this;
        var view = me.getView();
        view.helpTooltipElement.classList.add('x-hidden');
        me.redliningVectorLayer.getSource().clear();
    },

    /**
    * A helper that returns a redline feature using WKT parser
    * @param {ol.Feature} clone cloned feature to be parsed
    * @return {ol.Feature} redlineFeat
    */
    getRedlineFeatFromClone: function(clone) {
        var me = this;
        var redlineFeat;
        var wktParser = new ol.format.WKT();
        var cloneWktString = wktParser.writeFeature(clone);

        Ext.each(me.redlineFeatures.getArray(), function(feature) {
            var redlineFeatWktString = wktParser.writeFeature(feature);
            if (cloneWktString === redlineFeatWktString) {
                redlineFeat = feature;
                return false;
            }
        });
        return redlineFeat;
    },

    /**
     * Creates or recreates the snapInteraction. It has to be added after all
     * other interactions so we have to recreate it everytime we add a new
     * interaction.
     */
    resetSnapInteraction: function() {
        var me = this;
        var map = me.getView().map;
        if (me.snapInteraction) {
            map.removeInteraction(me.snapInteraction);
        }
        var snap = new ol.interaction.Snap({
            source: me.redliningVectorLayer.getSource()
        });
        me.snapInteraction = snap;
        map.addInteraction(snap);
    },

    /**
     * Returns a string representation of the coordinates of the point.
     * @param {ol.geom.Point} point
     * @return {string}
     */
    formatCoordinates: function(point) {
        var me = this;
        var view = me.getView();
        var sourceProjection = view.map.getView().getProjection();
        var targetProjection = ol.proj.get('EPSG:4326');
        var geomClone = point.clone().transform(sourceProjection,
            targetProjection);
        return ol.coordinate.toStringXY(geomClone.getCoordinates(), 5);
    },

    /**
     * Returns a string representation of the length of the line.
     * @param {ol.geom.LineString} line
     * @return {string}
     */
    formatLength: function(line) {
        var me = this;
        var view = me.getView();
        var output;
        var sourceProj = view.map.getView().getProjection();

        var length = me.computeLength(line, sourceProj);

        if (length > 100) {
            output = me.roundLengthToKm(length) + ' km';
        } else {
            output = me.roundLengthToM(length) + ' m';
        }
        return output;
    },

    roundLengthToM: function(length) {
        return length.toFixed(5);
    },

    roundLengthToKm: function(length) {
        return (length / 1000).toFixed(5);
    },

    /**
     * Computes the length of a line.
     * @param {ol.geom.LineString} line
     * @param {ol.proj.Projection} sourceProj
     * @returns
     */
    computeLength: function(line, sourceProj) {
        var coordinates = line.getCoordinates();

        var length = 0;
        for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
            var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
            var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
            length += ol.sphere.getDistance(c1, c2);
        }
        return length;
    },

    /**
     * Returns a string representation of the area of the polygon.
     * @param {ol.geom.Polygon} polygon
     * @return {string}
     */
    formatArea: function(polygon) {
        var me = this;
        var view = me.getView();
        var sourceProj = view.map.getView().getProjection();
        var area = me.computeArea(polygon, sourceProj);
        var output;

        if (area > 10000) {
            output = me.roundAreaToSqm(area) + ' ' + 'km²';
        } else {
            output = me.roundAreaToSqkm(area) + ' ' + 'm²';
        }

        return output;
    },

    computeArea: function(polygon, sourceProj) {
        return Math.abs(ol.sphere.getArea(polygon, sourceProj));
    },

    roundAreaToSqm: function(area) {
        return (area / 1000000).toFixed(5);
    },

    roundAreaToSqkm: function(area) {
        return area.toFixed(5);
    },

    /**
     *
     */
    fireRedliningChanged: function(evt) {
        var me = this;
        var feat = evt.element;
        me.adjustFeatureStyle(feat);
    },

    /**
     * Sets currently defined style to the new added features.
     * @param {ol.Feature} feature drawn feature
     */
    adjustFeatureStyle: function(feature) {
        var me = this;

        if (feature) {
            feature.setStyle(me.redlineLayerStyle);
        }
    },

    /**
     * Export all drawn features to geoJSON.
     */
    onExportObjectsClick: function() {
        var me = this;
        var view = me.getView();
        var sourceProj = view.map.getView().getProjection();
        var drawnFeatures = Ext.Array.filter(me.redlineFeatures.getArray(), function(feature) {
            return !feature.get('text');
        });
        var exportFeatures = Ext.Array.map(drawnFeatures, function(feature) {
            var feat = feature.clone();
            var geometry = feat.getGeometry();
            switch (geometry.getType()) {
                case 'LineString':
                    var length = me.computeLength(geometry, sourceProj);
                    length = me.roundLengthToKm(length);
                    feat.setProperties({
                        length: length,
                        unit: 'km'
                    });
                    break;
                case 'Polygon':
                    var area = me.computeArea(geometry, sourceProj);
                    area = me.roundAreaToSqkm(area);
                    feat.setProperties({
                        area: area,
                        unit: 'km²'
                    });
                    break;
                case 'Point':
                default:
                    break;
            }
            return feat;
        });
        var format = new ol.format.GeoJSON({
            featureProjection: sourceProj
        });
        var geojson = format.writeFeatures(exportFeatures);
        Koala.util.Export.exportFile(geojson, 'measurements.geojson', 'application/vnd.geo+json');
    }

});
