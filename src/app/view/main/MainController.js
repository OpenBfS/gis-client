/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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

    /**
     * Called after the first rendering of the legend tree and when the browser
     * window changes size, this will change the panel height to the maximum
     * available space and also ensure the legend tree is anhcored at the bottom
     * right corner.
     *
     * @param {Koala.view.panel.RoutingLegendTree} legendTree The tree whose
     *     height we have to set.
     */
    resizeAndRepositionLegendTree: function(legendTree) {
        var me = this;
        var mapContainer = legendTree.up('basigx-panel-mapcontainer');
        var toolBar = mapContainer.down('toolbar[cls="basigx-map-tools"]');
        var mapContainerHeight = mapContainer.getHeight() || 0;
        var toolbarHeight = toolBar.getHeight() || 0;
        var gap = 200;
        // resize the tree within sane bounds to the maximum height available
        var h = mapContainerHeight - toolbarHeight - gap;
        var maxH = mapContainerHeight - toolbarHeight - 20;
        h = Ext.Number.constrain(h, 200, maxH); // minimum 200px, maximum maxH
        legendTree.setHeight(h);
        //ensure that toolbar is always visible
        legendTree.setMaxHeight(maxH);
        // …also check whether the tree is still anchored at the bottom-right
        // corner
        var legendTreePos = legendTree.getPosition();
        if (legendTreePos) {
            var currentX = legendTreePos[0];
            var expectedX = mapContainer.getWidth() - legendTree.getWidth();
            if (currentX !== expectedX) {
                legendTree.setPosition(expectedX);
            }
        }
        // bind a listener here for resizing, but only once per instance
        if (!legendTree.__hasMaximizeListenerBound) {
            Ext.getBody().on('resize', me.resizeAndRepositionLegendTree, me, {
                buffer: 100,
                args: [legendTree]
            });
            legendTree.__hasMaximizeListenerBound = true;
        }
    },

    /**
     * Called when the legendTree was resized. We then need to adjust the
     * absolute positioning of the attribution div.
     *
     * @param {Koala.view.panel.RoutingLegendTree} legendTree The tree which was
     *     resized.
     * @param {number} newWidth The new width in pixels.
     */
    repositionAttribution: function(legendTree, newWidth) {
        var selector = '.ol-attribution.ol-uncollapsible';
        var node = Ext.DomQuery.selectNode(selector);
        var attributionContainer = Ext.get(node);
        if (attributionContainer) {
            attributionContainer.setStyle('right', newWidth + 'px');
        }
    },

    initElanScenarios: function() {
        var appContext = Koala.util.AppContext.getAppContext(),
            tools = appContext.data.merge.tools,
            url = Koala.util.Object.getPathStrOr(appContext, 'data/merge/urls/dokpool-scenarios'),
            username = appContext.data.merge.application_user.username;
        if (tools.indexOf('ScenarioAlertBtn') !== -1) {
            Koala.util.LocalStorage.setCurrentUser(username);
            var dokpool = Koala.util.DokpoolRequest;
            dokpool.elanScenarioUrl = url;
            dokpool.storageModule = Koala.util.LocalStorage;
            dokpool.updateActiveElanScenarios();
            window.setInterval(function() {
                window.console.log('scenario update');
                dokpool.updateActiveElanScenarios();
            }, 60000);
        }
    }

});
