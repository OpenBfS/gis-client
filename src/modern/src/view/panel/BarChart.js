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
 * @class Koala.view.panel.BarChart
 */
Ext.define('Koala.view.panel.BarChart', {
    extend: 'Ext.Panel',
    xtype: 'k-panel-barchart',

    requires: [
        'Koala.view.panel.BarChartController',
        'Koala.view.panel.BarChartModel',
        'Koala.view.form.BarChartFilterControl'
    ],

    controller: 'k-panel-barchart',
    viewModel: {
        type: 'k-panel-barchart'
    },

    bind: {
        title: '{panelTitleText}'
    },

    closeToolAlign: 'left',

    tools: [{
        type: 'gear',
        handler: 'onSearchToolClick'
    }, {
        type: 'collapse',
        handler: 'onCollapseLegendToolClick'
    }, {
        type: 'close',
        handler: function(panel) {
            panel.up('panel[name=cartopanel]').hide();
        }
    }],

    items: [{
        xtype: 'k-form-barchartfiltercontrol',
        padding: 5,
        hidden: true
    }]
});
