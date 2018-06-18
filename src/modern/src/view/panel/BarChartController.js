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
 * @class Koala.view.panel.BarChartController
 */
Ext.define('Koala.view.panel.BarChartController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-barchart',

    requires: [
        'Koala.view.component.D3BarChart'
    ],

    /**
     * Toogles the visibility of the filter form panel.
     */
    onSearchToolClick: function() {
        var me = this;
        var view = me.getView();
        var filterForm = view.down('k-form-barchartfiltercontrol');

        filterForm.setHidden(!filterForm.isHidden());
    },

    /**
     * Toggles the legend's visibility.
     */
    onCollapseLegendToolClick: function() {
        var me = this;
        var view = me.getView();
        var chart = view.down('d3-barchart');
        var chartCtrl = chart.getController();

        chartCtrl.toggleLegendVisibility();
    },

    updateFor: function(olLayer, olFeat) {
        var me = this;
        var view = me.getView();
        var config = {
            width: '100%',
            height: '100%'
        };
        var oldChart = view.down('d3-barchart');
        if (oldChart) {
            view.remove(oldChart, true);
        }
        var chart = Koala.view.component.D3BarChart.create(olLayer, olFeat, config);
        view.add(chart);
    }
});
