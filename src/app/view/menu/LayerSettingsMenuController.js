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
                    layer.set('hoverTpl', md.hoverTpl);
                }
            }],
            listeners: {
                close: function() {
                    var editor = this.down('k-form-field-templateeditor');
                    var md = editor.getMetadata();
                    olProps.hoverTpl = md.hoverTpl;
                    layer.set('hoverTpl', md.hoverTpl);
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
            if (me.cartoWindowsMinimized) {
                el.style.visibility = 'hidden';
                el.querySelector('svg').style.visibility = 'visible';
            } else {
                el.style.visibility = 'visible';
            }
        });
    }

});
