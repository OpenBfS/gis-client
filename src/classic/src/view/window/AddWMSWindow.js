/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
 * @class Koala.view.window.AddWMSWindow
 */
Ext.define('Koala.view.window.AddWMSWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-addwms',
    cls: 'k-window-addwms',

    requires: [
        'Koala.util.Help',
        'BasiGX.view.form.AddWms',
        'BasiGX.util.Application'
    ],

    title: 'WMS hinzufügen',
    width: 500,
    height: 450,
    layout: 'fit',

    tools: [{
        type: 'help',
        bind: {
            tooltip: '{helpTooltip}'
        },
        callback: function() {
            Koala.util.Help.showHelpWindow('toolsWms', 'tools');
        }
    }],

    items: [{
        xtype: 'basigx-form-addwms',
        hasCheckAllBtn: true,
        hasUncheckAllBtn: true,
        includeSubLayer: true,
        versionsWmsAutomatically: true,
        listeners: {
            beforerender: function() {
                var wmsBaseUrls = BasiGX.util.Application.getAppContext().wmsUrls;
                var defaultUrl = wmsBaseUrls[0];
                this.wmsBaseUrls = wmsBaseUrls;
                this.defaultUrl = defaultUrl;
            },
            beforewmsadd: function(olLayer) {
                olLayer.set('nameWithSuffix', olLayer.get('name'));
                olLayer.set('allowRemoval', true);
                if (olLayer.get('queryable') !== false) {
                    olLayer.set('queryable', true);
                    olLayer.set('allowHover', true);
                    olLayer.set('hoverable', true);
                    olLayer.set('showCartoWindow', true);
                    olLayer.metadata = {
                        layerConfig: {
                            olProperties: {
                                allowHover: 'true',
                                showCartoWindow: 'true'
                            }
                        },
                        filters: {}
                    };
                }
                olLayer.set('external', true);
                olLayer.set('hoverActive', false);
                olLayer.set('hoverTpl', 'Info');
                olLayer.getSource().crossOrigin = 'anonymous';
            }
        }
    }]

});
