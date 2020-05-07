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
 * @class Koala.view.menu.LayerSettingsMenuController
 */
Ext.define('Koala.view.menu.LayerSettingsMenuController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.k-menu-layersettings',

    cartoWindowsMinimized: false,

    /**
     * Open the clone window for possible cloning action.
     */
    cloneLayer: function() {
        Ext.create({
            xtype: 'k-window-clone',
            sourceLayer: this.getView().getLayer()
        });
    },

    /**
     * Edit the hover template.
     */
    editTemplates: function() {
        var layer = this.getView().getLayer();
        var olProps = layer.metadata.layerConfig.olProperties;
        Ext.create('Ext.window.Window', {
            autoShow: true,
            title: this.getView().getViewModel().get('templateEditor'),
            items: [{
                xtype: 'k-form-field-templateeditor',
                templates: ['Hover-Template'],
                metadata: olProps,
                properties: ['hoverTpl'],
                layer: layer,
                callback: function(editor) {
                    var md = editor.getMetadata();
                    olProps.hoverTpl = md.hoverTpl;
                    layer.set('hoverTpl', Koala.util.String.coerce(md.hoverTpl));
                }
            }],
            listeners: {
                close: function() {
                    var editor = this.down('k-form-field-templateeditor');
                    var md = editor.getMetadata();
                    olProps.hoverTpl = md.hoverTpl;
                    layer.set('hoverTpl', Koala.util.String.coerce(md.hoverTpl));
                }
            }
        });
    },

    /**
     * Toggle minimizing carto windows.
     */
    toggleMinimize: function() {
        var me = this;
        this.cartoWindowsMinimized = !this.cartoWindowsMinimized;
        var cartoWindows = Ext.ComponentQuery.query('k-component-cartowindow');
        Ext.each(cartoWindows, function(cartoWindow) {
            var el = cartoWindow.el.dom;
            var legend = el.querySelector('.k-d3-shape-group-legend');
            var chart = cartoWindow.getController().timeserieschart;
            var isBarchart = false;
            if (!chart) {
                chart = cartoWindow.getController().barChart;
                isBarchart = true;
            }
            if (me.cartoWindowsMinimized) {
                if (legend) {
                    var width = parseInt(chart.el.dom.style.width, 10);
                    chart.fullWidth = width;
                    width -= legend.getBoundingClientRect().width;
                    chart.el.dom.style.width = width + 'px';
                    chart.getController().toggleLegendVisibility();
                    chart.legendToggled = true;
                } else {
                    chart.legendToggled = false;
                }
                var svg = el.querySelector('svg');
                el.style.visibility = 'hidden';
                svg.style.visibility = 'visible';
                svg.style.boxShadow = '5px 10px 15px 0 rgba(0, 0, 0, 0.6)';
                if (isBarchart) {
                    var yOff = -30;
                    var top = parseInt(chart.getChartMargin().top, 10);
                    yOff -= top;
                    el.querySelector('.k-barchart-container').style.transform = 'translate(-20px, ' + yOff + 'px)';
                } else {
                    yOff = -30;
                    top = parseInt(chart.getChartMargin().top, 10);
                    yOff -= top;
                    // If these values are ever changed, make sure you also change the values in
                    // Koala.view.form.Print!
                    svg.style.transform = 'translate(-5px, ' + yOff + 'px)';
                }
            } else {
                if (chart.legendToggled) {
                    chart.el.dom.style.width = chart.fullWidth + 'px';
                    chart.getController().toggleLegendVisibility();
                }
                if (isBarchart) {
                    el.querySelector('.k-barchart-container').style.transform = null;
                }
                svg = el.querySelector('svg');
                el.style.visibility = 'visible';
                svg.style.transform = null;
                svg.style.boxShadow = null;
            }
            cartoWindow.getController().updateLineFeature();
        });
    },

    /**
     * Toggle the hoverActive flag of the layer.
     */
    toggleHoverInfo: function() {
        var layer = this.getView().getLayer();
        layer.set('hoverActive', !layer.get('hoverActive'));
    }

});
