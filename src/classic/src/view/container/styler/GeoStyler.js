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
 * View for the BISMap layer style settings. Will be configured
 * as tab view inside of #BISMap.admin.view.tab.CreateOrEditLayer.
 *
 * @class BISMap.admin.view.panel.layer.Style
 */
Ext.define('Koala.view.container.styler.GeoStyler', {
    extend: 'Ext.tab.Panel',

    requires: [
        'BasiGX.view.window.FileUploadWindow'
    ],

    xtype: 'k_container_styler_geostyler',

    routeId: 'geostyler',

    title: 'GeoStyler',

    controller: 'container.styler.geostyler',

    layout: 'fit',

    viewModel: {
        type: 'container.styler.geostyler'
    },

    // else the tab bodies will not be available to render
    // the react content!
    deferredRender: false,

    bind: {
        title: '{title}'
    },

    items: [{
        bind: {
            title: '{graphicalEditorTitle}'
        },
        bodyCls: 'geostyler-root',
        scrollable: true
    }, {
        bind: {
            title: '{codeEditorTitle}'
        },
        bodyCls: 'codeeditor-root'
    }],

    constructor: function(config) {
        this.callParent(arguments);
        if (!ReactDOM) {
            Ext.Logger.warn('Could not find ReactDOM lib.');
        }
        if (!React) {
            Ext.Logger.warn('Could not find React lib.');
        }
        if (!GeoStyler) {
            Ext.Logger.warn('Could not find GeoStyler lib.');
        }
        if (!GeoStylerGeoJsonParser) {
            Ext.Logger.warn('Could not find GeoStylerGeoJsonParser lib.');
        }
        if (!GeoStylerOpenlayersParser) {
            Ext.Logger.warn('Could not find GeoStylerOpenlayersParser lib.');
        }
        if (config.viewModel.data) {
            this.getViewModel().setData(config.viewModel.data);
        }
    },

    listeners: {
        afterrender: function() {
            var me = this;
            var viewModel = me.getViewModel();
            Ext.Promise.all([me.getStyleFromLayer(), me.getDataFromLayer()])
                .then(function(response) {
                    var style = response[0] || viewModel.get('style');
                    var data = response[1];
                    me.renderReactGeoStyler(style, data);
                })
                .catch(function() {
                    Ext.Logger.warn('Could not get Style or Data');
                    var style = viewModel.get('style');
                    me.renderReactGeoStyler(style);
                });
        }
    },

    getStyleFromLayer: function() {
        var me = this;
        var layer = me.viewModel.get('layer');
        var style = layer.getStyle();
        var promise = new Ext.Promise(function(resolve, reject) {
            var koalaStyle = layer.get('koalaStyle');
            if (koalaStyle) {
                resolve(koalaStyle);
            } else {
                var olParser = new GeoStylerOpenlayersParser.OlStyleParser(ol);
                olParser.readStyle(style)
                    .then(function(geostylerStyle) {
                        resolve(geostylerStyle);
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            }
        });

        return promise;
    },

    getDataFromLayer: function() {
        var layer = this.lookupViewModel().get('layer');
        var features = layer.getSource().getFeatures();
        var geojsonParser = new ol.format.GeoJSON();
        var geojsonFeatures = geojsonParser.writeFeaturesObject(features, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326' });
        // Transform feature data to GeoStyler data
        var dataParser = new GeoStylerGeoJsonParser.GeoJsonDataParser();
        var promise = new Ext.Promise(function(resolve) {
            dataParser.readData(geojsonFeatures)
                .then(function(data) {
                    resolve(data);
                });
        });
        return promise;
    },

    onStyleChange: function(style) {
        var me = this;
        me.getDataFromLayer()
            .then(function(data) {
                me.renderReactGeoStyler(style, data);
            });
        me.getViewModel().set('style', style);
    },

    renderReactGeoStyler: function(style, data) {
        var domElement = this.getEl().dom;
        var root = domElement.querySelector('.geostyler-root');
        var geostylerStyle = React.createElement(GeoStyler.Style, {
            style: style,
            data: data,
            previewProps: { showOsmBackground: false },
            onStyleChange: this.onStyleChange.bind(this),
            compact: true
        });
        var localeProvider = React.createElement(GeoStyler.LocaleProvider,
            { locale: GeoStyler.locale.de_DE },
            geostylerStyle
        );
        this._GeoStyler = ReactDOM.render(localeProvider, root);
        this.renderCodeEditor(style);
    },

    renderCodeEditor: function(style) {
        var domElement = this.getEl().dom;
        var root = domElement.querySelector('.codeeditor-root');
        var codeEditor = React.createElement(GeoStyler.CodeEditor, {
            style: style,
            parsers: [GeoStylerSLDParser.SldStyleParser],
            onStyleChange: this.onStyleChange.bind(this),
            showSaveButton: false
        });
        var localeProvider = React.createElement(GeoStyler.LocaleProvider,
            { locale: GeoStyler.locale.de_DE },
            codeEditor
        );
        this._CodeEditor = ReactDOM.render(localeProvider, root);
    },

    scrollable: 'vertical',

    bbar: {
        reference: 'styler-toolbar',
        items: [{
            xtype: 'button',
            bind: {
                text: '{btnTextReloadCurrentStyle}'
            },
            handler: 'reloadCurrentStyle'
        },
        {
            xtype: 'button',
            bind: {
                text: '{btnTextImport}'
            },
            handler: 'importStyle'
        },
        {
            xtype: 'button',
            bind: {
                text: '{btnTextExport}'
            },
            handler: 'exportStyle'
        },
        '->',
        {
            xtype: 'button',
            bind: {
                text: '{btnTextApplyAndSave}'
            },
            handler: 'applyAndSave'
        }]
    }

});
