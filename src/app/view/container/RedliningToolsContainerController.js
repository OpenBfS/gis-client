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
     * Instance of the `ol.interaction.Draw` with type `Circle`
     */
    drawCircleInteraction: null,

    /**
     * Instance of the `ol.interaction.Draw` with type `Linestring` and max
     * points limited to 2.
     */
    drawRectangleInteraction: null,

   /**
    * Instance of the `ol.interaction.Draw` with type `Point` and predefined
    * image source to be used as postit image. The URL to the image has to be
    * set by the view instantiation
    * (s. {@link createRedliningButtonsPanel#createRedliningButtonsPanel}
    */
    drawPostitInteraction: null,

    /**
     * Instance of the `ol.interaction.Draw` with type `Point` to be used to
     * represent labels on the map (the anchor point itself will be hidden)
     */
    drawTextInteraction: null,

    /**
     * Instance of the `ol.interaction.Select` to be used to copy the drawn
     * objects.
     */
    copySelectInteraction: null,

    /**
     * Instance of the `ol.interaction.Translate` to be used to move the drawn
     * objects. Works together with the #translateSelectInteraction interaction.
     */
    translateInteraction: null,

    /**
     * Instance of the `ol.interaction.Select` to be used to move the drawn
     * objects. Works together with the #translateInteraction interaction.
     */
    translateSelectInteraction: null,

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
     * Placeholder for the styler window as instance of
     * {@link Koala.window.RedliningStylerWindow'} class.
     */
    stylerWindow: null,

    /**
     * @private
     */
    stateChangeActive: null,

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
                features: view.redlineFeatures,
                type: 'Point'
            });
            view.map.addInteraction(me.drawPointInteraction);
        }
        if (pressed) {
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
                features: view.redlineFeatures,
                type: 'LineString'
            });
            view.map.addInteraction(me.drawLineInteraction);
        }
        if (pressed) {
            me.drawLineInteraction.setActive(true);
        } else {
            me.drawLineInteraction.setActive(false);
        }
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
                features: view.redlineFeatures,
                type: 'Polygon'
            });
            view.map.addInteraction(me.drawPolygonInteraction);
        }
        if (pressed) {
            me.drawPolygonInteraction.setActive(true);
        } else {
            me.drawPolygonInteraction.setActive(false);
        }
    },

    /**
     * Fires if "draw circle" button was toggled. Creates a
     * #drawCircleInteraction if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onDrawCirclesBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();
        if (!me.drawCircleInteraction) {
            var geomFunc = function(coordinates, geometry) {
                var start = coordinates[0];
                var end = coordinates[1];
                if (!geometry) {
                    geometry = new ol.geom.Circle([start[0], start[1]]);
                }
                var radius = me.computeCircleRadius(start, end);
                geometry.setRadius(radius);
                return geometry;
            };
            me.drawCircleInteraction = new ol.interaction.Draw({
                features: view.redlineFeatures,
                type: 'LineString',
                maxPoints: 2,
                geometryFunction: geomFunc
            });
            view.map.addInteraction(me.drawCircleInteraction);
        }
        if (pressed) {
            me.drawCircleInteraction.setActive(true);
            view.redlineFeatures.on('add', me.translateCircleToPolygon, me);
        } else {
            me.drawCircleInteraction.setActive(false);
            view.redlineFeatures.un('add', me.translateCircleToPolygon, me);
        }
    },

    /**
     * Fires if "draw rectangle" button was toggled. Creates a
     * #drawRectangleInteraction if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onDrawRectanlgesBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();
        if (!me.drawRectangleInteraction) {
            var geomFunc = function(coordinates, geometry) {
                if (!geometry) {
                    geometry = new ol.geom.Polygon(null);
                }
                var start = coordinates[0];
                var end = coordinates[1];
                geometry.setCoordinates([
                  [start, [start[0], end[1]], end, [end[0], start[1]], start]
                ]);
                return geometry;
            };
            me.drawRectangleInteraction = new ol.interaction.Draw({
                features: view.redlineFeatures,
                type: 'LineString',
                maxPoints: 2,
                geometryFunction: geomFunc
            });
            view.map.addInteraction(me.drawRectangleInteraction);
        }
        if (pressed) {
            me.drawRectangleInteraction.setActive(true);
        } else {
            me.drawRectangleInteraction.setActive(false);
        }
    },

    /**
     * Fires if "draw postit" button was toggled.
     * Creates a #drawPostitInteraction if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onTextBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();
        if (!me.drawTextInteraction) {
            me.drawTextInteraction = new ol.interaction.Draw({
                features: view.redlineFeatures,
                type: 'Point'
            });
            view.map.addInteraction(me.drawTextInteraction);
        }
        if (pressed) {
            me.drawTextInteraction.setActive(true);
            view.redlineFeatures.on('add', me.handleTextAdd, me);
        } else {
            me.drawTextInteraction.setActive(false);
            view.redlineFeatures.un('add', me.handleTextAdd, me);
        }
    },

    /**
     * Fires if "draw postit" button was toggled.
     * Creates a #drawPostitInteraction if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onPostitBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();

        if (!me.drawPostitInteraction) {
            var src = view.getPostitPictureUrl();

            me.drawPostitInteraction = new ol.interaction.Draw({
                features: view.redlineFeatures,
                type: 'Point',
                style: new ol.style.Style({
                    image: new ol.style.Icon({
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        opacity: 0.75,
                        src: src
                    })
                })
            });
            view.map.addInteraction(me.drawPostitInteraction);
        }
        if (pressed) {
            me.drawPostitInteraction.setActive(true);
            view.redlineFeatures.on('add', me.handlePostitAdd, me);
        } else {
            me.drawPostitInteraction.setActive(false);
            view.redlineFeatures.un('add', me.handlePostitAdd, me);
        }
    },

    /**
     * Fires if "copy feature" button was toggled.
     * Creates a #copySelectInteraction if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onCopyBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();
        if (!me.copySelectInteraction) {
            me.copySelectInteraction =
                new ol.interaction.Select({
                    condition: function(evt) {
                        return ol.events.condition.pointerMove(
                            evt) || ol.events.condition.
                            click(evt);
                    },
                    addCondition: function(evt) {
                        if (evt.type === 'click') {
                            var features = me.copySelectInteraction
                                .getFeatures().getArray();
                            if (features[0]) {
                                var copyFeature = features[0].clone();
                                var doneFn = function(finalFeature) {
                                    view.redlineFeatures.push(finalFeature);
                                };
                                BasiGX.util.Animate.moveFeature(
                                    copyFeature, 200,
                                    100,
                                    me.getView().getRedlineStyleFunction(),
                                    doneFn);
                                me.copySelectInteraction.getFeatures().clear();
                            }
                        }
                    }
                });
            view.map.addInteraction(me.copySelectInteraction);
        }
        if (pressed) {
            me.copySelectInteraction.setActive(true);
        } else {
            me.copySelectInteraction.setActive(false);
        }
    },

    /**
     * Fires if "move feature" button was toggled.
     * Creates a #translateInteraction and #translateSelectInteraction
     * if not already exist.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onMoveBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();
        if (!me.translateInteraction) {
            me.translateSelectInteraction = new ol.interaction.Select({
                condition: ol.events.condition.pointerMove,
                addCondition: function() {
                    var selFeatures =
                        me.translateSelectInteraction.getFeatures(),
                        firstFeat = selFeatures.getArray()[0];

                    if (firstFeat) {

                        var redlineFeat = me.getRedlineFeatFromClone(firstFeat);

                        if (me.translateFeatCol.getLength() === 0) {
                            me.translateFeatCol.push(redlineFeat);
                        } else if (me.translateFeatCol.getLength() > 0 &&
                                redlineFeat !==
                            me.translateFeatCol.getArray()[0]) {
                            me.translateFeatCol.clear();
                            me.translateFeatCol.push(redlineFeat);
                        }
                    }
                }
            });
            view.map.addInteraction(me.translateSelectInteraction);
            me.translateFeatCol = new ol.Collection();
            me.translateInteraction =
                new ol.interaction.Translate({
                    features: me.translateFeatCol
                }
            );
            view.map.addInteraction(me.translateInteraction);
        }
        if (pressed) {
            me.translateInteraction.setActive(true);
            me.translateSelectInteraction.setActive(true);
            me.translateInteraction.on('translateend',
                    view.fireRedliningChanged, view);
        } else {
            me.translateInteraction.setActive(false);
            me.translateSelectInteraction.setActive(false);
            me.translateInteraction.un('translateend',
                    view.fireRedliningChanged, view);
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
     * Creates an instance of {@link Koala.window.RedliningStylerWindow}
     * class with predefined styles for point, linestring and polygon.
     * @param {Ext.button.Button} btn
     * @param {Boolean} pressed toggle state
     */
    onStylerBtnToggle: function(btn, pressed) {
        var me = this,
            view = me.getView();
        if (!me.stylerWindow) {
            me.stylerWindow =
                Ext.create('Koala.view.window.RedliningStylerWindow', {
                    redliningVectorLayer: view.redliningVectorLayer,
                    redlinePointStyle: view.getRedlinePointStyle(),
                    redlineLineStringStyle: view.getRedlineLineStringStyle(),
                    redlinePolygonStyle: view.getRedlinePolygonStyle()
                }
            );
            me.stylerWindow.on('hide', function() {
                btn.toggle();
                btn.blur();
            });
        }
        if (pressed) {
            me.stylerWindow.show();
        } else {
            me.stylerWindow.hide();
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
     * Prepares a #handlePostitAdd method to handle with simple text
     * label adding
     * @param {Ext.Event} evt click event on adding text label to the map
     */
    handleTextAdd: function(evt) {
        var me = this;
        me.handlePostitAdd(evt, true);
    },

    /**
     * Shows a prompt for the postit text.
     * @param {Ext.Event} evt click event on adding postit to the map
     * @param {Boolean} textOnly additional parameter to determine between
     * simple labels (textOnly = true) and postits.
     */
    handlePostitAdd: function(evt, textOnly) {
        var me = this,
            view = me.getView(),
            feat = evt.element,
            title;

        if (!textOnly) {
            feat.set('isPostit', true);
            title = view.getViewModel().get('postItWindowTitle');
        } else {
            feat.set('textOnly', textOnly);
            title = view.getViewModel().get('textWindowTitle');
        }

        BasiGX.prompt(title, {
            fn: function(decision, text) {
                if (decision === 'cancel') {
                    view.redlineFeatures.remove(feat);
                } else {
                    text = me.stringDivider(text, 16, '\n');
                    if (textOnly) {
                        me.setTextOnFeature(text, feat);
                    } else {
                        me.setPostitStyleAndTextOnFeature(text, feat);
                    }
                }
            },
            multiline: 150
        });
    },

    /**
     * Sets a postit (formatted) text on a feature
     * @param {String} text text for a postit
     * @param {ol.Feature} feat point feature bounded to the postit
     */
    setPostitStyleAndTextOnFeature: function(text, feat) {
        var me = this,
            view = me.getView();
        feat.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: view.getPostitPictureUrl()
            }),
            text: new ol.style.Text({
                text: text,
                scale: 1.5,
                offsetY: 80
            })
        }));
    },

    /**
     * Sets a postit (formatted) text on a feature
     * @param {String} text text for a postit
     * @param {ol.Feature} feat point feature bounded to the postit
     */
    setTextOnFeature: function(text, feat) {
        feat.setStyle(new ol.style.Style({
            text: new ol.style.Text({
                text: text,
                scale: 1.5,
                offsetY: 20
            })
        }));
    },

    /**
     * Wraps text in the postit, which inserts a line break at the nearest
     * whitespace of maxWidth of the text. S.
     * http://stackoverflow.com/questions/14484787/wrap-text-in-javascript for
     * further details
     * @param {String} str given text
     * @param {Number} width max width of one text row
     * @param {String} spaceReplacer additional parameter for encoding
     * @return {String} wrapped text as string
     */
    stringDivider: function(str, width, spaceReplacer) {
        var me = this;
        var startIndex = 0;
        var stopIndex = width;
        if (str.length > width) {
            var p = width;
            var left;
            var right;
            while (p > 0 && (str[p] !== ' ' && str[p] !== '-')) {
                p--;
            }
            if (p > 0) {
                if (str.substring(p, p + 1) === '-') {
                    left = str.substring(0, p + 1);
                } else {
                    left = str.substring(0, p);
                }
                right = str.substring(p + 1);
                return left + spaceReplacer + me.stringDivider(
                    right, width, spaceReplacer);
            } else {
                // no whitespace or - found, splitting hard on the width length
                left = str.substring(startIndex, stopIndex + 1) + '-';
                right = str.substring(stopIndex + 1);
                startIndex = stopIndex;
                stopIndex += width;
                return left + spaceReplacer + me.stringDivider(
                    right, width, spaceReplacer);
            }
        }
        return str;
    },

    /**
     * Modify a postits text
     */
    modifyPostit: function(feature) {
        var me = this;
        BasiGX.prompt(me.getView().getViewModel().get('postItWindowTitle'), {
            fn: function(decision, text) {
                if (decision === 'ok') {
                    text = me.stringDivider(text, 16, '\n');
                    if (feature.get('textOnly')) {
                        me.setTextOnFeature(text, feature);
                    } else {
                        me.setPostitStyleAndTextOnFeature(text, feature);
                    }
                }
            },
            multiline: 150
        });
    },

    /**
     * The circle geometries are not supported by the WKT format, so it can't
     * be used for modify iterations.
     * Since ol3 still don't support it
     * (s. also https://github.com/openlayers/ol3/issues/3777) we need to
     * transform the drawn circle to the approximate regular polygon with
     * given circle geometry.
     */
    translateCircleToPolygon: function() {
        var me = this,
            view = me.getView();

        Ext.each(view.redlineFeatures.getArray(), function(f) {
            if (f.getGeometry().getType() === 'Circle') {
                var geom = f.getGeometry();
                var newGeom = new ol.geom.Polygon.fromCircle(geom);
                var newFeat = new ol.Feature(newGeom);

                view.redlineFeatures.remove(f);
                view.redlineFeatures.insertAt(
                    view.redlineFeatures.getLength(),
                    newFeat
                );
            }
        });
    },

    /**
     * Computes circle feature radius depending on given center and the second
     * coordinate as distance from the circle center to the vertices.
     * @param {Array} start start coordinates as array (lat/lon or x/y)
     * @param {Array} end end coordinates as array (lat/lon or x/y)
     */
    computeCircleRadius: function(start, end) {
        return Math.sqrt(
            (end[0] - start[0]) * (end[0] - start[0]) +
            (end[1] - start[1]) * (end[1] - start[1])
        );
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
    }

});
