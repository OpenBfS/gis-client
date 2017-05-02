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
 * Container containing the redlining tools for the temporary drawing in the
 * client.
 *
 * @class Koala.view.container.RedliningToolsContainer
 */
Ext.define('Koala.view.container.RedliningToolsContainer', {
    extend: 'Ext.container.Container',
    xtype: 'koala-container-redlining',

    requires: [
        'Ext.button.Button',

        'Koala.view.container.RedliningToolsContainerModel'
    ],

    viewModel: 'k-container-redliningtoolscontainer',

    controller: 'k-container-redliningtoolscontainer',

    width: 150,

    config: {
        redlineLayerStyle: function() {
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
                    text: this.get('text'),
                    offsetY: -7,
                    fill: new ol.style.Fill({
                        color: 'black'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 2
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
        })
    },

    map: null,

    redliningVectorLayer: null,

    redlineFeatures: null,

    stateChangeActive: false,

    /**
     * Overlay to show the help messages.
     * @type {ol.Overlay}
     */
    helpTooltip: null,

    /**
     * The help tooltip element.
     * @type {Element}
     */
    helpTooltipElement: null,

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

    defaults: {
        xtype: 'button',
        scale: 'large',
        ui: 'default-toolbar',
        margin: '0 0 10px 10px'
    },

    items: [{
        name: 'drawPointsBtn',
        toggleGroup: 'draw',
        bind: {
            tooltip: '{drawPointBtnTooltip}'
        },
        glyph: 'xf100@Flaticon',
        listeners: {
            toggle: 'onDrawPointsBtnToggle'
        }
    }, {
        name: 'drawLinesBtn',
        toggleGroup: 'draw',
        bind: {
            tooltip: '{drawLinesBtnTooltip}'
        },
        glyph: 'xf104@Flaticon',
        listeners: {
            toggle: 'onDrawLinesBtnToggle'
        }
    }, {
        name: 'drawPolygonsBtn',
        toggleGroup: 'draw',
        bind: {
            tooltip: '{drawPolygonsBtnTooltip}'
        },
        glyph: 'xf107@Flaticon',
        listeners: {
            toggle: 'onDrawPolygonsBtnToggle'
        }
    }, {
        name: 'modifyObjectBtn',
        toggleGroup: 'draw',
        bind: {
            tooltip: '{modifyObjectBtnTooltip}'
        },
        glyph: 'xf044@FontAwesome',
        listeners: {
            toggle: 'onModifyObjectBtnToggle'
        }
    }, {
        name: 'deleteObjectBtn',
        toggleGroup: 'draw',
        bind: {
            tooltip: '{deleteObjectBtnTooltip}'
        },
        glyph: 'xf12d@FontAwesome',
        listeners: {
            toggle: 'onDeleteObjectBtnToggle'
        }
    }, {
        name: 'clearObjectsBtn',
        bind: {
            tooltip: '{clearObjectsBtnTooltip}'
        },
        glyph: 'f014@FontAwesome',
        handler: 'onClearObjectsBtn'
    }],

    /**
     * @event redliningchanged
     * An event that fires everytime a feature is added, deleted, moved or
     * modified.
     * @param {Koala.view.container.RedliningToolsContainer} container
     *     The Redlining container.
     * @param {Object} state The current redlining state.
     */

    /**
     * Initializes this component
     */
    initComponent: function() {
        var me = this;
        var displayInLayerSwitcherKey = BasiGX.util.Layer.
            KEY_DISPLAY_IN_LAYERSWITCHER;

        //set map
        me.map = BasiGX.util.Map.getMapComponent().getMap();

        if (!me.redliningVectorLayer) {
            me.redlineFeatures = new ol.Collection();
            me.redlineFeatures.on(
                'add',
                me.fireRedliningChanged,
                me
            );
            me.redliningVectorLayer = new ol.layer.Vector({
                name: 'redliningVectorLayer',
                source: new ol.source.Vector({features: me.redlineFeatures}),
                style: me.getRedlineLayerStyle(),
                allowPrint: true
            });
            me.redliningVectorLayer.set(displayInLayerSwitcherKey, false);
            me.map.addLayer(me.redliningVectorLayer);
        }

        me.createHelpTooltip();
        me.createMeasureTooltip();

        me.map.on('pointermove', me.pointerMoveHandler, me);

        me.callParent(arguments);
    },

    /**
    * Handle pointer move.
    * @param {ol.MapBrowserEvent} evt
    */
    pointerMoveHandler: function(evt) {
        var me = this;
        var continuePolygonMsg = 'Click to continue drawing the polygon';
        var continueLineMsg = 'Click to continue drawing the line';

        if (evt.dragging) {
            return;
        }
        var helpMsg = 'Click to start drawing';

        if (me.sketch) {
            var geom = me.sketch.getGeometry();
            if (geom instanceof ol.geom.Polygon) {
                helpMsg = continuePolygonMsg;
            } else if (geom instanceof ol.geom.LineString) {
                helpMsg = continueLineMsg;
            }
        }

        me.helpTooltipElement.innerHTML = helpMsg;
        me.helpTooltip.setPosition(evt.coordinate);
    },

    /**
     * Creates a new measure tooltip
     */
    createMeasureTooltip: function() {
        var me = this;
        if (me.measureTooltipElement) {
            me.measureTooltipElement.parentNode.removeChild(me.measureTooltipElement);
        }
        me.measureTooltipElement = document.createElement('div');
        me.measureTooltipElement.className = 'tooltip tooltip-measure';
        me.measureTooltip = new ol.Overlay({
            element: me.measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        me.map.addOverlay(me.measureTooltip);
    },

    /**
    * Creates a new help tooltip
    */
    createHelpTooltip: function() {
        var me = this;
        if (me.helpTooltipElement) {
            me.helpTooltipElement.parentNode.removeChild(me.helpTooltipElement);
        }
        me.helpTooltipElement = document.createElement('div');
        me.helpTooltipElement.className = 'tooltip x-hidden';
        me.helpTooltip = new ol.Overlay({
            element: me.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        me.map.addOverlay(me.helpTooltip);
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
        var controller = me.getController();

        if (controller.stateChangeActive) {
            return;
        }

        if (feature) {
            feature.setStyle(me.getRedlineLayerStyle());
        }
    }
});
