/*global document*/
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
Ext.define("Koala.view.component.Map", {
    extend: "BasiGX.view.component.Map",
    xtype: "k-component-map",

    requires: [
        "Koala.view.component.MapController"
    ],

    /**
     *
     */
    controller: "k-component-map",

    initComponent: function(){
        this.callParent(arguments);
        this.on('hoverfeaturesclick', this.onHoverFeatureClick, this);

        var hoverPlugin = this.getPlugin('hover');
        if(hoverPlugin){
            hoverPlugin.selectStyleFunction = Koala.view.component.Map
                .styleFromGnos("selectStyle");
            hoverPlugin.highlightStyleFunction = Koala.view.component.Map
                .styleFromGnos("hoverStyle");
            hoverPlugin.getToolTipHtml = this.getController().getToolTipHtml;
        }
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
     * We overwrite this method from the superclass.
     * We simply call the controller which contains the logic.
     */
    onHoverFeatureClick: function(olFeatures) {
        var me = this;
        var controller = me.getController();

        controller.onHoverFeatureClick(olFeatures[0]);
    }

});
