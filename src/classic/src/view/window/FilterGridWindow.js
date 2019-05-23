/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.FilterGridWindow
 */
Ext.define('Koala.view.window.FilterGridWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-filtergrid',

    requires: [
        'Koala.view.grid.FilterGrid',
        'BasiGX.util.Geometry'
    ],

    controller: 'k-window-filtergrid',

    viewModel: {
        type: 'k-window-filtergrid'
    },

    bind: {
        title: '{title}'
    },

    autoShow: true,
    bodyPadding: 5,
    height: 220,
    width: 500,
    closeAction: 'method-hide',
    resizable: false,

    config: {
        /**
         * The layer to filter/sort.
         * @type {ol.layer.Layer}
         */
        layer: null
    },

    items: [{
        xtype: 'button',
        bind: {
            text: '{duplicateButton}'
        },
        handler: 'checkDuplicates'
    }, {
        xtype: 'label',
        text: '',
        name: 'duplicateText'
    }],

    listeners: {
        show: 'onShow'
    },

    /**
     * Adds the filter grid.
     */
    initComponent: function() {
        this.callParent();
        this.add({
            xtype: 'k-grid-filter',
            layer: this.getLayer()
        });
    }

});
