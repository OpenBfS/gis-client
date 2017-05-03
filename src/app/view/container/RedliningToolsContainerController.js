/* Copyright (c) 2016 terrestris GmbH & Co. KG
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
    ],

    alias: 'controller.k-container-redliningtoolscontainer',

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
     * @private
     */
    stateChangeActive: null,

    wgs84Sphere: new ol.Sphere(6378137),

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
                style: view.getDrawInteractionStyle(),
                features: view.redlineFeatures,
                type: 'Point'
            });
            view.map.addInteraction(me.drawPointInteraction);
        }

        if (pressed) {
            view.helpTooltipElement.classList.remove('x-hidden');
            me.drawPointInteraction.on('drawend', me.onDrawEnd, me);
            me.drawPointInteraction.setActive(true);
        } else {
            me.drawPointInteraction.un('drawend', me.onDrawEnd, me);
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
                layer: view.redliningVectorLayer,
                style: view.getDrawInteractionStyle(),
                features: view.redlineFeatures,
                type: 'LineString'
            });
            view.map.addInteraction(me.drawLineInteraction);

        }
        if (pressed) {
            view.helpTooltipElement.classList.remove('x-hidden');
            me.drawLineInteraction.on('drawstart', me.onDrawStart, me);
            me.drawLineInteraction.on('drawend', me.onDrawEnd, me);
            me.drawLineInteraction.setActive(true);
        } else {
            me.drawLineInteraction.un('drawstart', me.onDrawStart, me);
            me.drawLineInteraction.un('drawend', me.onDrawEnd, me);
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
                style: view.getDrawInteractionStyle(),
                features: view.redlineFeatures,
                type: 'Polygon'
            });
            view.map.addInteraction(me.drawPolygonInteraction);
        }

        if (pressed) {
            view.helpTooltipElement.classList.remove('x-hidden');
            me.drawPolygonInteraction.on('drawstart', me.onDrawStart, me);
            me.drawPolygonInteraction.on('drawend', me.onDrawEnd, me);
            me.drawPolygonInteraction.setActive(true);
        } else {
            view.helpTooltipElement.classList.add('x-hidden');
            me.drawPolygonInteraction.un('drawstart', me.onDrawStart, me);
            me.drawPolygonInteraction.un('drawend', me.onDrawEnd, me);
            me.drawPolygonInteraction.setActive(false);
        }
        me.resetSnapInteraction();
    },

    /**
     * [description]
     * @param {[type]} evt [description]
     * @return {[type]} [description]
     */
    onDrawStart: function(evt) {
        var me = this;
        var view = me.getView();
        view.sketch = evt.feature;
        view.sketch.getGeometry().on('change', me.onGeometryChange, me);
    },

    /**
     * [description]
     * @return {[type]} [description]
     */
    onDrawEnd: function(evt) {
        var me = this;
        var view = me.getView();
        var geom = evt.feature.getGeometry();
        var tooltipPosition = view.measureTooltip.getPosition();
        var labelText = view.measureTooltipElement.innerHTML;

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

        view.redliningVectorLayer.getSource().addFeature(labelFeature);
        geom.un('change', me.onGeometryChange, me);

        view.measureTooltipElement.remove();
        view.measureTooltipElement = null;
        view.createMeasureTooltip();
    },

    /**
     * [description]
     * @param {[type]} evt [description]
     * @return {[type]} [description]
     */
    onGeometryChange: function(evt) {
        var me = this;
        var view = me.getView();
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
                features: view.redlineFeatures,
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
            me.modifyInteraction.on('modifyend', me.updateLabel, me);
            // me.modifyInteraction.on('modifyend',
            //         view.fireRedliningChanged, view);
        } else {
            me.modifyInteraction.setActive(false);
            me.modifySelectInteraction.setActive(false);
            me.modifyInteraction.un('modifyend', me.updateLabel, me);
            // me.modifyInteraction.un('modifyend',
            //         view.fireRedliningChanged, view);
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
        var view = me.getView();
        var modifiedFeatures = evt.features;
        var allFeatures = view.redliningVectorLayer.getSource().getFeatures();

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
        }, me);
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
                        view.redlineFeatures.remove(feature);
                    }
                    me.deleteSelectInteraction.getFeatures().remove(sf);

                    // remove a corresponding label or feature if label was clicked
                    view.redlineFeatures.forEach(function(af) {
                        if (sf.get('isLabel') && sf.get('parentFeature') === af ) {
                            view.redlineFeatures.remove(af);
                            me.deleteSelectInteraction.getFeatures().remove(af);
                        }

                        if (af.get('isLabel') && af.get('parentFeature') === sf ) {
                            view.redlineFeatures.remove(af);
                            me.deleteSelectInteraction.getFeatures().remove(af);
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
                        removeFeatures(selFeatures,evt);
                    }
                }
            });
            view.map.addInteraction(me.deleteSelectInteraction);

            me.deleteSnapInteraction = new ol.interaction.Snap({
                features: view.redlineFeatures
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
        view.redliningVectorLayer.getSource().clear();
    },

    /**
    * A helper that returns a redline feature using WKT parser
    * @param {ol.Feature} clone cloned feature to be parsed
    * @return {ol.Feature} redlineFeat
    */
    getRedlineFeatFromClone: function(clone) {
        var me = this;
        var view = me.getView();

        var redlineFeat;
        var wktParser = new ol.format.WKT();
        var cloneWktString = wktParser.writeFeature(clone);
        Ext.each(view.redlineFeatures.getArray(), function(feature) {
            var redlineFeatWktString = wktParser.writeFeature(feature);
            if (cloneWktString === redlineFeatWktString) {
                redlineFeat = feature;
                return false;
            }
        });
        return redlineFeat;
    },

    /**
     * Method return the current state of the redlining, containing all features
     * and the configured styles
     */
    getState: function() {
        var me = this;
        var view = me.getView();
        var features = [];

        view.redlineFeatures.forEach(function(feature) {
            features.push(feature.clone());
        });

        var state = {
            features: features,
            pointStyle: view.getRedlinePointStyle(),
            lineStyle: view.getRedlineLineStringStyle(),
            polygonStyle: view.getRedlinePolygonStyle(),
            styleFunction: view.getRedlineStyleFunction()
        };

        return state;
    },

    /**
     * Creates or recreates the snapInteraction. It has to be added after all
     * other interactions so we have to recreate it everytime we add a new
     * interaction.
     */
    resetSnapInteraction: function() {
        var me = this;
        var view = me.getView();
        var map = view.map;
        if (view.snapInteraction) {
            map.removeInteraction(view.snapInteraction);
        }
        var snap = new ol.interaction.Snap({
            source: view.redliningVectorLayer.getSource()
        });
        view.snapInteraction = snap;
        map.addInteraction(snap);
    },

    /**
     * Method sets the state of the redlining, containing drawn features
     * and the configured styles
     */
    setState: function(state) {
        var me = this;
        var view = me.getView();

        me.stateChangeActive = true;

        var styler = Ext.ComponentQuery.query('momo-window-redlining')[0];

        if (state.features) {
            view.redliningVectorLayer.getSource().clear();
            view.redliningVectorLayer.getSource().addFeatures(state.features);
        }

        if (state.pointStyle) {
            view.setRedlinePointStyle(state.pointStyle);
        }

        if (state.lineStyle) {
            view.setRedlineLineStringStyle(state.lineStyle);
        }

        if (state.polygonStyle) {
            view.setRedlinePolygonStyle(state.polygonStyle);
        }

        if (styler) {
            styler.setState(state);
        }

        if (state.styleFunction) {
            view.setRedlineStyleFunction(state.styleFunction);
        }

        // reapply the styleFn on the layer so that ol3 starts redrawing
        // with new styles
        view.redliningVectorLayer.setStyle(view.redliningVectorLayer
                .getStyle());

        me.stateChangeActive = false;
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
        return ol.coordinate.toStringXY(geomClone.getCoordinates(), 2);
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
        var length = 0;
        var coordinates = line.getCoordinates();
        var sourceProj = view.map.getView().getProjection();

        for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
            var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
            var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
            length += me.wgs84Sphere.haversineDistance(c1, c2);
        }
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) + ' ' + 'm';
        }
        return output;
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
        var geom = polygon.clone().transform(sourceProj, 'EPSG:4326');
        var coordinates = geom.getLinearRing(0).getCoordinates();
        var area = Math.abs(me.wgs84Sphere.geodesicArea(coordinates));
        var output;

        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km²';
        } else {
            output = (Math.round(area * 100) / 100) + ' ' + 'm²';
        }

        return output;
    }

});
