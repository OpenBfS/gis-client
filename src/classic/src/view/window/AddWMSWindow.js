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
                if (olLayer.get('queryable')) {
                    olLayer.set('allowHover', true);
                    olLayer.set('hoverTpl', 'Info');
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
                    var is111 = olLayer.getSource().getParams().VERSION === '1.1.1';
                    var x = is111 ? 'x' : 'i';
                    var y = is111 ? 'y' : 'j';
                    var layer = olLayer.getSource().getParams().LAYERS;
                    var url = olLayer.getSource().getUrls()[0] + 'version=' + (is111 ? '1.1.1' : '1.3.0') +
                        '&request=GetFeatureInfo&bbox=' + olLayer.get('layerExtent') + '&format=image/png&' +
                        'info_format=application/json&' + x + '=5&' + y + '=5&width=10&height=10&layers=' + layer +
                        '&query_layers=' + layer;
                    Ext.Ajax.request({
                        url: url,
                        success: function(xhr) {
                            var collection = JSON.parse(xhr.responseText);
                            if (collection.numberReturned) {
                                var attributes = Object.keys(collection.features[0].properties);
                                var template = '';
                                for (var i = 0; i < attributes.length; ++i) {
                                    template += attributes[i] + ': [[' + attributes[i] + ']]<br>';
                                }
                                olLayer.set('hoverTpl', template);
                            }
                        }
                    });
                }
                olLayer.getSource().crossOrigin = 'anonymous';
            }
        }
    }]

});
