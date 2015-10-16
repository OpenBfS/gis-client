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
    extend: "Basepackage.view.component.Map",
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

        var hoverPlugin =  this.getPlugin('hover');
        if(hoverPlugin){
            hoverPlugin.selectStyleFunction = function(){
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
            };

            hoverPlugin.getToolTipHtml = this.getController().getToolTipHtml;
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
