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
 * @class Koala.view.panel.MobileLegend
 */
Ext.define('Koala.view.panel.MobileLegend',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobilelegend',

    requires: [
        'GeoExt.data.store.LayersTree',

        'Koala.view.panel.MobileLegendController',
        'Koala.view.panel.MobileLegendModel',

        'Koala.util.Layer'
    ],

    controller: 'k-panel-mobilelegend',
    viewModel: {
        type: 'k-panel-mobilelegend'
    },

    cls: 'k-panel-mobilelegend',

    bind: {
        title: '{title}'
    },

    config: {
        /**
         * The maximal number of (non-vector) layers visible in the application
         * at one time.
         */
        maxVisibleLayers: 5,

        /**
         * The route (template) to apply for this component.
         */
        route: 'legend/{0}'
    },

    scrollable: 'vertical',

    listeners: {
        initialize: 'onInitialize',
        show: 'onShow',
        hide: 'onHide'
    }
});
