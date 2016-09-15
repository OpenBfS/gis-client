/*global document*/
/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
Ext.define("Koala.view.component.Map", {
    extend: "BasiGX.view.component.Map",
    xtype: "k-component-map",

    requires: [
        "Koala.view.component.MapController"
    ],

    config: {
        hoverFeatureClickBufferMS: 250
    },

    /**
     *
     */
    controller: "k-component-map",

    initComponent: function(){
        var me = this;
        var staticMe = Koala.view.component.Map;
        me.callParent();

        // this event originates from an ol3 collection event and may be called
        // too often… so we call it buffered after the specified amount of MS.
        me.on('hoverfeaturesclick', me.onHoverFeatureClick, me, {
            buffer: me.getHoverFeatureClickBufferMS()
        });

        var hoverPlugin = me.getPlugin('hover');
        if(hoverPlugin){
            var selStyleFunction = staticMe.styleFromGnos("selectStyle");
            var highlightStyleFunction = staticMe.styleFromGnos("hoverStyle");
            hoverPlugin.selectStyleFunction = selStyleFunction;
            hoverPlugin.highlightStyleFunction = highlightStyleFunction;
            hoverPlugin.getToolTipHtml = me.getController().getToolTipHtml;
        }

        me.setupDragDropFunctionality();
    },

    setupDragDropFunctionality: function() {
        var me = this;
        var controller = me.getController();
        var dragAndDropInteraction = new ol.interaction.DragAndDrop({
            formatConstructors: [
                ol.format.GeoJSON,
                ol.format.KML,
                ol.format.GML3,
                ol.format.GML2
            ]
        });
        dragAndDropInteraction.on(
            'addfeatures', controller.onDroppedExternalVectorData, controller
        );
        me.map.addInteraction(dragAndDropInteraction);
    },

    statics:{
        /**
         *
         */
        styleFromGnos: function(styleKey){
            var fn = function(feature){
                var styleCfg = feature.get('layer').get(styleKey);
                if (styleCfg) {
                    var sArray = styleCfg.split(",");
                    var color = sArray[0];
                    var shape = sArray[1];

                    if(shape === "rect"){
                        var width = sArray[2];
                        var height = sArray[3];

                        var c = document.createElement('canvas');
                        c.setAttribute('width', width);
                        c.setAttribute('height', height);
                        var ctx = c.getContext("2d");
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
                    } else if (shape === "circle") {
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
                    }
                } else {
                    return [new ol.style.Style({
                         image: new ol.style.Circle({
                             radius: 6,
                             fill: new ol.style.Fill({
                                 color: "rgba(0, 0, 255, 0.6)"
                             }),
                             stroke: new ol.style.Stroke({
                                 color: 'gray'
                             })
                         })
                     })];
                 }
            };
            return fn;
        }
    },

    /**
     * Removes the previousy selected features from the select interaction.
     */
    removeAllHoverFeatures: function(){
        var p = this.getPlugin('hover');
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
        Ext.each(olFeatures, function(olFeature) {
            controller.onHoverFeatureClick(olFeature);
        });
    }

});
