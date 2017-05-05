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
 * ShowToolsContainerCommonController
 *
 * Common controller class that combines all properties and methods that
 * will be used by almost all main koala client tools controllers.
 *
 * @class ShowToolsContainerCommonController
 */
Ext.define('Koala.view.button.ShowToolsContainerCommonController', {
    extend: 'Ext.app.ViewController',

    requires: [
    ],

    alias: 'controller.k-button-showtoolscontainercommoncontroller',

    /**
     * Placeholder for the corresponding tools Container
     */
    btnContainer: null,

    /**
     * Creates a wrapper Container containing all buttons that belongs to the
     * corresponding container/Container.
     * The position of the Container will be computed dynamically (s. method
     * #computePosition below).
     * If an additional config is provided it will be applied as well.
     * @param {String} className className of the container/Container element to be created
     * @param {Object} config additional config object that could be specific
     *      for different classes
     */
    createToolsContainer: function(className, config) {

        var me = this;
        var parentBtn = me.getView().getEl();
        var position = me.computePosition(parentBtn);

        var btnContainer = Ext.create(className, {
            style: {
                'top': position.top,
                'right': position.right
            }
        });

        // will be used e.g. by redlining tools for customized style config
        if (config) {
            btnContainer.setConfig(config);
        }

        return btnContainer;
    },

    /**
     * Shows a tools Container on call button toggle.
     * @param {String} className className of the container/Container element to be created
     * @param {Object} config additional config object that could be specific
     *      for different classes
     */
    showToolsContainer: function(className, config) {
        var me = this;
        if (!me.btnContainer) {
            me.btnContainer = me.createToolsContainer(className, config);
            // map container
            var cont = Ext.ComponentQuery
                .query('basigx-panel-mapcontainer')[0];

            cont.add(me.btnContainer);
        } else {
            me.btnContainer.show();
        }
    },

    /**
     * Computes position of the tools Container depending on the
     * dimensions and position of the parent button and the height of the
     * application header if given.
     */
    computePosition: function(btn) {
        var header = Ext.ComponentQuery.query('basigx-panel-header')[0],
            hHeight = 0;

        if (header) {
            hHeight = header.getHeight();
        }

        var top = btn.getClientRegion().top - hHeight - 3 + 'px';
        var right = btn.getWidth() + 10 + 'px';

        return {
            top: top,
            right: right
        };
    },

    /**
     * Hides a tools Container on call button toggle.
     */
    hideToolsContainer: function() {
        var me = this;
        if (me.btnContainer) {
            me.btnContainer.hide();
        }
    },

    /**
     * Deactivates possibly activated tools if parent button was
     * untoggled and wrapper tools Container was hidden.
     */
    deactivateTools: function() {
        var me = this;
        if (me.btnContainer) {
            var measureBtns = me.btnContainer.query('button');
            Ext.each(measureBtns, function(btn) {
                if (btn.pressed) {
                    btn.toggle();
                }
            });
        }
    }
});
