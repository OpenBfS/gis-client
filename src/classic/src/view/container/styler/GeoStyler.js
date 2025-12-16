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
        // need to use html here and not bodyCls or similar, this would
        // intervene with the extjs rendering process
        html: '<div class="geostyler-root"></div>',
        padding: 10,
        scrollable: 'y'
    }, {
        bind: {
            title: '{codeEditorTitle}'
        },
        // need to use html here and not bodyCls or similar, this would
        // intervene with the extjs rendering process
        html: '<div class="codeeditor-root"></div>',
        scrollable: 'y'
    }],

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
            name: 'choose-vector-style',
            bind: {
                text: '{chooseFromVectorTemplate}'
            },
            handler: 'chooseFromVectorTemplate'
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
    },

    constructor: function(config) {
        this.callParent(arguments);
        var me = this;
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
        var layer = this.getViewModel().get('layer');
        var styles = Koala.util.Object.getPathStrOr(layer,
            'metadata/layerConfig/olProperties/styleReference');
        this.down('[name=choose-vector-style]').setHidden(!styles);
        me.getStyleFromLayer()
            .then(function(style) {
                me.getViewModel().set('style', style.output || style);
            });
    },

    listeners: {
        afterrender: function() {
            var me = this;
            var viewModel = me.getViewModel();
            me.getDataFromLayer()
                .then(function(data) {
                    me.gsDataObject = data;
                    me.getStyleFromLayer()
                        .then(function(style) {
                            me.renderReactGeoStyler(style.output || style || viewModel.get('style'));
                        });
                });
            var domElement = this.getEl().dom;
            this.gsReactRoot = ReactDOM.createRoot(domElement.querySelector('.geostyler-root'));
            this.editorReactRoot = ReactDOM.createRoot(domElement.querySelector('.codeeditor-root'));
        }
    },

    getStyleFromLayer: function() {
        var me = this;
        var layer = me.viewModel.get('layer');
        if (!layer) {
            return new Ext.Promise(function(resolve, reject) {
                reject('No layer found in GeoStyler viewModel.');
            });
        }
        var style = layer.getStyle();
        var promise = new Ext.Promise(function(resolve, reject) {
            var koalaStyle = layer.get('koalaStyle');
            if (koalaStyle) {
                resolve(koalaStyle);
            } else if (layer.get('SLD')) {
                var sldParser = new GeoStylerSLDParser.SldStyleParser({
                    forceCasting: true
                });
                sldParser
                    .readStyle(layer.get('SLD'))
                    .then(function(parserResult) {
                        if (parserResult.errors && parserResult.errors.length > 0) {
                            var errorMessage = parserResult.errors.join('. ');
                            reject(errorMessage);
                        } else {
                            resolve(parserResult.output);
                        }
                    });
            } else {
                var olParser = new GeoStylerOpenlayersParser.OlStyleParser(ol);
                olParser
                    .readStyle(style)
                    .then(function(parserResult) {
                        if (parserResult.errors && parserResult.errors.length > 0) {
                            var errorMessage = parserResult.errors.join('. ');
                            reject(errorMessage);
                        } else {
                            resolve(parserResult.output);
                        }
                    });
            }
        });

        return promise;
    },

    getDataFromLayer: function() {
        var layer = this.lookupViewModel().get('layer');
        if (!layer || !layer.getSource) {
            return new Ext.Promise(function(resolve, reject) {
                reject('No layer found in GeoStyler viewModel or layer has no source.');
            });
        }
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
        me.renderReactGeoStyler(style, me.gsDataObject);
        me.getViewModel().set('style', style);
    },

    getIconLibrary: function() {
        var context = Koala.util.AppContext.getAppContext().data.merge;
        return {
            name: 'Icons',
            icons: context.vectorIcons
        };
    },

    getColorRamps: function() {
        var context = Koala.util.AppContext.getAppContext().data.merge;
        return context.colorRamps;
    },

    renderReactGeoStyler: function(style) {
        var geostylerStyle = React.createElement(GeoStyler.CardStyle, {
            style: style,
            onStyleChange: this.onStyleChange.bind(this)
        });

        var geoStylerContext = React.createElement(GeoStyler.GeoStylerContext.Provider,
            {
                value: {
                    data: this.gsDataObject,
                    locale: GeoStyler.locale.de_DE,
                    composition: {
                        FillEditor: {
                            fillOpacityField: {
                                default: 1
                            },
                            outlineOpacityField: {
                                default: 1
                            },
                            opacityField: {
                                default: 1,
                                visibility: false
                            }
                        },
                        IconEditor: {
                            opacityField: {
                                default: 1
                            },
                            iconLibraries: [this.getIconLibrary()]
                        },
                        LineEditor: {
                            opacityField: {
                                default: 1
                            }
                        },
                        RuleGenerator: {
                            colorRamps: this.getColorRamps(),
                            colorSpaces: this.getColorRamps() ? [] : undefined
                        },
                        TextEditor: {
                            opacityField: {
                                default: 1
                            },
                            haloColorField: {
                                default: '#000000'
                            }
                        },
                        WellKnownNameEditor: {
                            opacityField: {
                                visibility: false,
                                default: 1
                            },
                            fillOpacityField: {
                                default: 1
                            },
                            strokeOpacityField: {
                                default: 1
                            }
                        }
                    }
                }
            }, geostylerStyle);

        this._GeoStyler = this.gsReactRoot.render(geoStylerContext);
        this.renderCodeEditor(style);
    },

    renderCodeEditor: function(style) {
        var codeEditor = React.createElement(GeoStyler.CodeEditor, {
            style: style,
            parsers: [
                new GeoStylerSLDParser.SldStyleParser({
                    builderOptions: {
                        format: true
                    }
                }),
                new GeoStylerQGISParser.QGISStyleParser(),
                new MapboxStyleParser.MapboxStyleParser({
                    pretty: true
                })
            ],
            onStyleChange: this.onStyleChange.bind(this),
            showSaveButton: false
        });
        var geoStylerContext = React.createElement(GeoStyler.GeoStylerContext.Provider,
            {
                value: {
                    locale: GeoStyler.locale.de_DE
                }
            }, codeEditor);
        this._CodeEditor = this.editorReactRoot.render(geoStylerContext);
    }

});
