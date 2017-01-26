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
 * @class Koala.view.panel.TimeseriesChart
 */
Ext.define('Koala.view.panel.TimeseriesChart', {
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-timeserieschart',

    requires: [
        'Koala.view.form.TimeseriesFilterControl',

        'Koala.view.panel.TimeseriesChartController',
        'Koala.view.panel.TimeseriesChartModel'
    ],

    controller: 'k-panel-timeserieschart',
    viewModel: {
        type: 'k-panel-timeserieschart'
    },

    bind: {
        title: '{panelTitleText}'
    },

    closeToolAlign: 'left',

    layout: 'vbox',

    tools: [{
        type: 'gear',
        handler: 'onSearchToolClick'
    }, {
        type: 'collapse',
        handler: 'onCollapseLegendToolClick'
    }],

    items: [{
        xtype: 'k-form-timeseriesfiltercontrol',
        padding: 5,
        hidden: true
    }]
});
