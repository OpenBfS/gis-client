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
        if (chart.xtype === 'd3-chart') {
            chart.setShowIdentificationThresholdData(this.showingIdentificationThreshold);
            var ctrl = chart.getController();
            ctrl.getChartData();
        } else {
            chart.getController().setShowIdentificationThresholdData(this.showingIdentificationThreshold);
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
                fieldLabel: 'Max',
                name: 'maxField',
                value: max
            }, {
                xtype: 'numberfield',
                fieldLabel: 'Min',
                name: 'minField',
                value: min
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
    },

    /**
     * This event handler keeps track of the current time to be able
     * to keep the menu closed when clicking on the menu button while
     * the menu is open.
     */
    onBeforeHide: function() {
        this.getView().lastHidden = new Date().getTime();
    },

    /**
     * Applies the property changes from the template editor.
     *
     * @param {Object} properties the properties to apply
     * @param {Object} metadata the metadata to apply the properties on
     * @param {Object} chart the chart
     * @param {Object} editor the template editor
     */
    applyChanges: function(properties, metadata, chart, editor) {
        var md = editor.getMetadata();
        Ext.each(properties, function(property) {
            metadata[property] = md[property];
        });
        chart.getController().getChartData();
    },

    /*
     * Edit the appropriate chart templates.
     */
    editTemplates: function() {
        var me = this;
        var chart = this.getView().chart;
        var fullMetadata = chart.getTargetLayer().metadata;
        var viewModel = this.getViewModel();
        var templates = [viewModel.get('tooltip'), viewModel.get('xAxisLabel'), viewModel.get('yAxisLabel'), viewModel.get('title')];
        var properties = ['tooltipTpl', 'xAxisLabel', 'yAxisLabel'];
        var metadata;
        if (chart.xtype === 'd3-chart') {
            properties.push('seriesTitleTpl');
            metadata = fullMetadata.layerConfig.timeSeriesChartProperties;
        } else {
            properties.push('titleTpl');
            metadata = fullMetadata.layerConfig.barChartProperties;
        }

        var win = Ext.create('Ext.window.Window', {
            title: viewModel.get('editTemplates'),
            autoShow: true,
            items: [{
                xtype: 'k-form-field-templateeditor',
                templates: templates,
                metadata: metadata,
                properties: properties,
                layer: chart.getTargetLayer(),
                callback: function(editor) {
                    me.applyChanges(properties, metadata, chart, editor);
                }
            }],
            bbar: [{
                xtype: 'button',
                text: viewModel.get('okText'),
                handler: function() {
                    var editor = win.down('k-form-field-templateeditor');
                    me.applyChanges(properties, metadata, chart, editor);
                    win.close();
                }
            }]
        });
    }

});
