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
 * This class is the controller for the main view for the application. It is
 * specified as the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your
 *        application.
 *
 * @class Koala.view.main.MainController
 */
Ext.define('Koala.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    resizeLegendTreeToMaxHeight: function(legendTree){
        var me = this;
        var mapContainer = legendTree.up('basigx-panel-mapcontainer');
        var toolBar = mapContainer.down('toolbar[cls="basigx-map-tools"]');
        var mapContainerHeight = mapContainer.getHeight() || 0;
        var toolbarHeight = toolBar.getHeight() || 0;
        var gap = 20;
        var h = mapContainerHeight - toolbarHeight - gap;
        h = Ext.Number.constrain(h, 200, 1200); // minimum 300px, maximum 1200px
        legendTree.setHeight(h);
        // bind a listener here for resizing, but only once per instance
        if (!legendTree.__hasMaximizeListenerBound) {
            Ext.getBody().on('resize', me.resizeLegendTreeToMaxHeight, me, {
                buffer: 100,
                args: [legendTree]
            });
            legendTree.__hasMaximizeListenerBound = true;
        }
    }
});
