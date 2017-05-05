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
 * ShowRedliningToolsContainerController
 *
 * This controller will be used to manage the redlining tools in the GIS
 * application. Actually the following actions/tools are supported:
 *  * Draw point
 *  * Draw line
 *  * Draw polygon
 *  * Draw post-it
 *  * Move object
 *  * Copy object
 *  * Modify object
 *  * Delete object
 *  * Style object (simple styling of points, lines and polygons. No images as
 *    point icon are supported at the moment).
 * The controller is based on the logic of BasiGX.view.container.Redlining
 * class, which was adapted to match the MVVC structure better.
 *
 * @class Koala.view.button.ShowRedliningToolsContainerController
 */
Ext.define('Koala.view.button.ShowRedliningToolsContainerController', {
    extend: 'Koala.view.button.ShowToolsContainerCommonController',

    requires: [
        'Koala.view.container.RedliningToolsContainer'
    ],

    alias: 'controller.k-button-showredliningtoolscontainer',

    /**
     * Placeholder for the redlining tools Container
     */
    btnContainer: null,

    /**
     *
     */
    onToggle: function(btn, pressed) {
        var me = this;
        if (pressed) {
            me.showToolsContainer('Koala.view.container.RedliningToolsContainer');
        } else {
            me.hideToolsContainer();
            me.deactivateTools();
        }
    },

    /**
     * Override.
     *
     */
    computePosition: function() {
        var mapPanel = Ext.ComponentQuery.query('gx_map')[0];
        var top = '6px';
        var right = ((mapPanel.getWidth()/2) - 150) + 'px';

        return {
            top: top,
            right: right
        };
    }
});
