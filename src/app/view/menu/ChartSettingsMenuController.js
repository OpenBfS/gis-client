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
 *
 * @class Koala.view.menu.ChartSettingsMenuController
 */
Ext.define('Koala.view.menu.ChartSettingsMenuController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.k-menu-chartsettings',
    showingIdentificationThreshold: false,

    /**
     * Toggle the scale of the y axis (or show a menu to choose the axis in case of attached series).
     */
    toggleScale: function() {
        var chart = this.getView().chart;
        var attachedSeries = chart.shapes[0].attachedSeries;
        if (attachedSeries) {
            Koala.util.ChartAxes.showToggleScaleMenu(
                attachedSeries,
                chart,
                this.getView().el,
                this.getViewModel().get('axisText')
            );
        } else {
            chart.getController().toggleScale();
        }
    },

    /**
     * Toggle the showing of data below the identification threshold.
     */
    showIdentificationThreshold: function() {
        this.showingIdentificationThreshold = !this.showingIdentificationThreshold;
        var chart = this.getView().chart;
        chart.setShowIdentificationThresholdData(this.showingIdentificationThreshold);
        var ctrl = chart.getController();
        ctrl.getChartData();
    },

    /**
     * Toggle the legend.
     */
    toggleLegend: function() {
        var chart = this.getView().chart;
        chart.getController().toggleLegendVisibility();
    }

});
