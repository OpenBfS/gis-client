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
 * RedliningToolsPanelController
 *
 * The controller for the redlining tools. Contains all OL interactions for the
 * each redlining action on the map (e.g. draw/modify/move/delete point,
 * linestring, polygon). Additionally the simple styler is included.
 *
 * @class Koala.view.panel.RedliningToolsPanelController
 */
Ext.define('Koala.view.panel.RedliningToolsPanelController', {

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
            me.drawPointInteraction.setActive(true);
        } else {
            me.drawPointInteraction.setActive(false);
        }
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
    onDrawEnd: function() {
        var me = this;
        var view = me.getView();
        view.measureTooltipElement.className = 'tooltip tooltip-static';
        view.measureTooltip.setOffset([0, -7]);
        view.sketch.getGeometry().un('change', me.onGeometryChange, me);

        // unset sketch
        view.sketch = null;
        // unset tooltip so that a new one can be created
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
    },

    /**
     * Fires if "modify feature" button was toggled.
     * Creates a #modifyInteraction and #modifySelectInteraction
     * if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onModifyBtnToggle: function(btn, pressed) {
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
            me.modifyInteraction.on('modifyend',
                    view.fireRedliningChanged, view);
        } else {
            me.modifyInteraction.setActive(false);
            me.modifySelectInteraction.setActive(false);
            me.modifyInteraction.un('modifyend',
                    view.fireRedliningChanged, view);
        }
    },

    /**
     * Fires if "delete feature" button was toggled.
     * Creates a #deleteSelectInteraction and #deleteSnapInteraction
     * if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onDeleteBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();
        if (!me.deleteSelectInteraction) {
            var removeFeatures = function(selFeatures) {
                // find the matching feature in redlining layer
                selFeatures.forEach(function(sf) {
                    var feature = me.getRedlineFeatFromClone(sf);
                    if (feature) {
                        view.redlineFeatures.remove(feature);
                    }
                    me.deleteSelectInteraction.getFeatures().
                        remove(sf);
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
    * A helper that returns a redline feature using WKT parser
    * @param {ol.Feature} clone cloned feature to be parsed
    * @return {ol.Feature} redlineFeat
    */
    getRedlineFeatFromClone: function(clone) {
        var me = this,
            view = me.getView();

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
     * format length output
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
     * format length output
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
            output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
        }

        return output;
    }

});
