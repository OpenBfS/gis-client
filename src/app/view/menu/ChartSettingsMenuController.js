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
        var me = this;
        this.showingIdentificationThreshold = !this.showingIdentificationThreshold;
        var chart = this.getView().chart;
        if (chart.xtype === 'd3-chart') {
            chart.setShowIdentificationThresholdData(this.showingIdentificationThreshold);
            var ctrl = chart.getController();
            ctrl.getChartData();
        } else {
            var els = chart.el.dom.querySelectorAll('text.below-threshold');
            els.forEach(function(el) {
                el.style.display = me.showingIdentificationThreshold ? 'none' : 'block';
            });
            els = chart.el.dom.querySelectorAll('rect.below-threshold');
            els.forEach(function(el) {
                el.style.display = me.showingIdentificationThreshold ? 'block' : 'none';
            });
        }
    },

    /**
     * Toggle the legend.
     */
    toggleLegend: function() {
        var chart = this.getView().chart;
        chart.getController().toggleLegendVisibility();
    },

    /**
     * Change min/max settings.
     */
    changeMinMax: function() {
        var view = this.getView();
        var vm = view.getViewModel();
        var ctrl = view.chart.getController();
        var overrides = ctrl.chartOverrides;
        var y = overrides.y || {};
        overrides.y = y;
        var min = overrides.y.min;
        var max = overrides.y.max;
        if (view.isTimeseries) {
            min = min || ctrl.chartConfig.timeseriesComponentConfig.axes.y.min;
            max = max || ctrl.chartConfig.timeseriesComponentConfig.axes.y.max;
        } else {
            min = min || ctrl.chartConfig.barComponentConfig.axes.y.min;
            max = max || ctrl.chartConfig.barComponentConfig.axes.y.max;
        }

        Ext.create('Ext.window.Window', {
            title: vm.get('minMaxWindowTitle'),
            bodyPadding: 5,
            items: [{
                xtype: 'numberfield',
                name: 'minField',
                value: min
            }, {
                xtype: 'numberfield',
                name: 'maxField',
                value: max
            }],
            bbar: [{
                xtype: 'button',
                text: vm.get('okText'),
                handler: this.updateMinMax.bind(this)
            }, {
                xtype: 'button',
                text: vm.get('cancelText'),
                handler: function() {
                    this.up('window').hide();
                }
            }]
        }).show();
    },

    /**
     * Updates the chart controller overrides for min/max.
     * @param {Object} btn the ok button
     */
    updateMinMax: function(btn) {
        var win = btn.up('window');
        var min = win.down('[name=minField]').getValue();
        var max = win.down('[name=maxField]').getValue();
        var ctrl = this.getView().chart.getController();
        var y = ctrl.chartOverrides.y;
        y.min = min;
        y.max = max;
        ctrl.getChartData();
        win.hide();
    },

    /**
     * Toggle visibility of uncertainty bars.
     */
    toggleUncertainty: function() {
        var chartCtrl = this.getView().chart.getController();
        chartCtrl.toggleUncertainty();
    }

});
