/* Copyright (c) 2021-present terrestris GmbH & Co. KG
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
 * @class Koala.util.Wps
 */
Ext.define('Koala.util.Wps', {

    requires: [
        'Ext.Array',
        'Koala.util.AppContext'
    ],

    statics: {

        createWpsService: function() {
            var appContextUtil = Koala.util.AppContext;
            var ctx = appContextUtil.getAppContext();
            var processingCtx = appContextUtil.getMergedDataByKey('processing', ctx);
            var version = undefined;
            var url = undefined;
            if (processingCtx) {
                url = processingCtx.url;
                version = processingCtx.version;
            }
            if (url && (!url.endsWith('?') || url.endsWith('&'))) {
                url = url + '?';
            }

            return new WpsService({
                url: url,
                version: version
            });
        },

        getLiteralCombo: function(input, config, label, identifier) {
            var item = {};
            item.xtype = config.xtype || 'wps-combo';
            item.value = config.defaultValue === undefined ? input.defaultValue : config.defaultValue;
            var values = config.allowedValues || input.allowedValues.values;
            item.store = {
                fields: ['value'],
                data: Ext.Array.map(values, function(val) {
                    return { value: val };
                })
            };
            item.allowBlank = config.minOccurs === undefined ? parseInt(input.minOccurs, 10) < 1 : config.minOccurs < 1;
            item.fieldLabel = item.allowBlank ? label : label + '&nbsp;*';
            item.identifier = identifier;
            item.dataType = input.dataType;
            item.unitOfMeasure = input.unitOfMeasure;

            if (config.visible === false) {
                item.hidden = config.visible === false;
                item.allowBlank = true;
            }

            return item;
        },

        getNumericInput: function(input, config, label, identifier) {
            var item = {};
            item.xtype = config.xtype || 'wps-number';
            item.value = config.defaultValue === undefined ? input.defaultValue : config.defaultValue;
            item.allowDecimals = input.dataType.type === 'xs:double';
            item.allowBlank = config.minOccurs === undefined ? parseInt(input.minOccurs, 10) < 1 : config.minOccurs < 1;
            item.fieldLabel = item.allowBlank ? label : label + '&nbsp;*';
            item.identifier = identifier;
            item.dataType = input.dataType;
            item.unitOfMeasure = input.unitOfMeasure;

            if (config.visible === false) {
                item.hidden = config.visible === false;
                item.allowBlank = true;
            }

            return item;
        },

        getTextInput: function(input, config, label, identifier) {
            var item = {};
            item.xtype = config.xtype || 'wps-textfield';
            item.value = config.defaultValue === undefined ? input.defaultValue : config.defaultValue;
            item.allowBlank = config.minOccurs === undefined ? parseInt(input.minOccurs, 10) < 1 : config.minOccurs < 1;
            item.fieldLabel = item.allowBlank ? label : label + '&nbsp;*';
            item.identifier = identifier;
            item.dataType = input.dataType;
            item.unitOfMeasure = input.unitOfMeasure;

            if (config.visible === false) {
                item.hidden = config.visible === false;
                item.allowBlank = true;
            }

            return item;
        },

        getGeometryChooser: function(input, config) {
            var item = {};
            item.xtype = 'wps-geometrychooser';
            item.draw = true;
            item.upload = true;
            item.allowBlank = config.minOccurs === undefined ?
                parseInt(input.minOccurs, 10) === 0 :
                config.minOccurs === 0;
            item.fieldLabel = item.allowBlank ? input.title : input.title + '&nbsp;*';
            item.identifier = input.identifier;
            item.schema = undefined;
            item.encoding = undefined;
            item.asReference = false;

            if (config.visible === false) {
                item.hidden = config.visible === false;
                item.allowBlank = true;
            }

            return item;
        },

        getLayersList: function(whitelist) {
            var routingLegendTree = Ext.ComponentQuery.query('k-panel-routing-legendtree')[0];
            if (!routingLegendTree) {
                return [];
            }
            var store = routingLegendTree.getStore();
            var nestedLayers = store.getData();
            var flatLayers = [];
            Ext.Array.each(nestedLayers.items, function(l) {
                var d = l.getData().metadata;
                if (whitelist) {
                    if (Ext.Array.contains(whitelist, d.id)) {
                        flatLayers.push(d);
                    }
                } else {
                    flatLayers.push(d);
                }
            });
            return flatLayers;
        },

        handleBoundingBoxInput: function(input, config) {
            config = config || {};
            var item = {};
            item.xtype = config.xtype || 'wps-geometrychooser';
            item.bbox = true;
            if (config.supportedCRSs && config.supportedCRSs.length !== 0) {
                item.supportedCRSs = config.supportedCRSs;
            } else if (input.boundingBoxData && input.boundingBoxData.supportedCRSs) {
                item.supportedCRSs = input.boundingBoxData.supportedCRSs;
            }
            item.allowBlank = config.minOccurs === undefined ?
                parseInt(input.minOccurs, 10) === 0 :
                config.minOccurs === 0;
            item.fieldLabel = item.allowBlank ? input.title : input.title + '&nbsp;*';
            item.identifier = input.identifier;

            if (config.visible === false) {
                item.hidden = config.visible === false;
                item.allowBlank = true;
            }

            return item;
        },

        handleComplexInput: function(input, config) {
            config = config || {};
            if (!config.xtype) {
                throw new Error(input.identifier);
            }
            var item = {};
            item.xtype = config.xtype;
            item.store = {
                fields: ['id', 'treeTitle'],
                data: Koala.util.Wps.getLayersList(config.layers)
            };
            item.formats = config.formats || input.complexData.formats || [];
            item.layers = config.layers;
            item.draw = true;
            item.upload = true;
            item.identifier = input.identifier;
            item.allowBlank = config.minOccurs === undefined ?
                parseInt(input.minOccurs, 10) === 0:
                config.minOccurs === 0;
            item.fieldLabel = item.allowBlank ? input.title : input.title + '&nbsp;*';
            item.schema = undefined;

            if (config.visible === false) {
                item.hidden = config.visible === false;
                item.allowBlank = true;
            }

            return item;
        },

        handleLiteralInput: function(input, config) {
            config = config || {};
            var dom = input.literalData.literalDataDomains[0];
            if (dom) {
                if (dom.allowedValues) {
                    return Koala.util.Wps.getLiteralCombo(dom, config, input.title, input.identifier);
                }
                if (dom.anyValue && dom.dataType && dom.dataType.type === 'xs:double' || dom.dataType.type === 'xs:int') {
                    return Koala.util.Wps.getNumericInput(dom, config, input.title, input.identifier);
                }
                return Koala.util.Wps.getTextInput(dom, config, input.title, input.identifier);
            }
        },

        getInputComponentConfig: function(input, config) {
            if (input.complexData) {
                return Koala.util.Wps.handleComplexInput(input, config);
            }
            if (input.literalData) {
                return Koala.util.Wps.handleLiteralInput(input, config);
            }
            if (input.boundingBoxData) {
                return Koala.util.Wps.handleBoundingBoxInput(input, config);
            }
        },

        getOutputIdentifier: function(outputs, config, version) {
            var item = {};
            item.xtype = 'wps-output-combo';
            item.value = config;
            var values = outputs;
            if (config) {
                values = Ext.Array.filter(outputs, function(o) {
                    return o.identifier === config;
                });
            }
            item.store = {
                fields: [
                    'identifier',
                    'label',
                    'complexData',
                    'schema',
                    'encoding',
                    'uom',
                    'asReference',
                    'abstractValue',
                    'title',
                    'transmission'
                ],
                data: Ext.Array.map(values, function(val) {
                    return {
                        identifier: val.identifier,
                        label: val.title,
                        complexData: val.complexData,
                        schema: undefined,
                        encoding: undefined,
                        uom: undefined,
                        asReference: false,
                        abstractValue: undefined,
                        title: undefined,
                        transmission: 'value'
                    };
                })
            };
            item.version = version;

            return item;
        },

        getWpsComponentConfigs: function(description) {
            var processing = Koala.util.AppContext.getAppContext().data.merge.processing;
            var processes = processing.processes;
            var config = Ext.Array.filter(processes, function(process) {
                return process.id === description.identifier;
            })[0];
            if (!config) {
                Ext.log('Process with ID ' + description.identifier + ' not found in app context.');
                return;
            }

            var items = [];

            Ext.each(description.inputs, function(input) {
                var inputConfig = config.inputs[input.identifier];
                if (inputConfig === false) {
                    return;
                }
                items.push(Koala.util.Wps.getInputComponentConfig(input, inputConfig));
            });

            items.push(Koala.util.Wps.getOutputIdentifier(description.outputs, config.output, processing.version));

            return items;
        }

    }

});
