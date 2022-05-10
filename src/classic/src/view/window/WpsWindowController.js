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
 * @class Koala.view.window.WpsWindowController
 */
Ext.define('Koala.view.window.WpsWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-window-wps',

    requires: [
        'Ext.Promise',
        'Ext.String',
        'Ext.container.Container',
        'Koala.util.AppContext',
        'Koala.util.Wps',
        'Koala.view.wps.WpsCombo',
        'Koala.view.wps.WpsNumber',
        'Koala.view.wps.WpsText',
        'Koala.view.wps.WpsLayerCombo',
        'Koala.view.wps.WpsGeometryChooser',
        'Koala.view.wps.WpsOutputCombo'
    ],

    init: function() {
        this.wpsService = Koala.util.Wps.createWpsService();
    },

    onProcessChange: function(combo, record) {
        var view = this.getView();
        if (!view) {
            return;
        }

        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }
        vm.set('hideRunBtn', true);

        this.cleanupLayer();
        this.cleanupInteraction();

        var id = record.get('processId');
        this.wpsService.describeProcess_GET(function(response) {
            var container = view.down('[name=dynamic-form-container]');
            container.removeAll();
            if (response.textStatus && response.errorThrown) {
                container.add({
                    xtype: 'container',
                    html: '<i>' + vm.get('wpsErrorTitle') + ': ' + vm.get('wpsErrorText') + '</i>',
                    padding: 10
                });
            } else {
                var description = response.processOffering.process;
                try {
                    var items = Koala.util.Wps.getWpsComponentConfigs(description);
                    var context = Koala.util.AppContext.getAppContext();
                    var config = context.data.merge.processing.processes.filter(function(process) {
                        return process.id === id;
                    })[0];
                    items.unshift({
                        html: config.abstract,
                        padding: '5 5 5 5'
                    });
                    items.push({
                        xtype: 'combo',
                        name: 'template-combo',
                        editable: false,
                        store: {
                            data: config.vectorTemplates,
                            fields: ['uuid', 'label']
                        },
                        displayField: 'label',
                        valueField: 'uuid',
                        fieldLabel: 'Template'
                    });
                    container.add(items);
                    vm.set('hideRunBtn', false);
                } catch (err) {
                    var errorTxt = Ext.String.format(
                        vm.get('wpsInputErrorText'),
                        err.message
                    );
                    container.add({
                        xtype: 'container',
                        html: '<i>' + vm.get('wpsErrorTitle') + ': ' + errorTxt + '</i>',
                        padding: 10
                    });
                    vm.set('hideRunBtn', true);
                }
            }
        }, id);
    },

    onRunClick: function(btn) {
        var me = this;
        var view = this.getView();
        if (!view) {
            return;
        }
        var vm = view.lookupViewModel();
        if (!vm) {
            return;
        }
        vm.set('hideErrorMsgContainer', true);
        var wpsService = this.wpsService;
        var processField = btn.up('k-window-wps').down('[name=process-identifier]');
        if (!processField) {
            return;
        }

        var processIdentifier = processField.getValue();
        if (!processIdentifier) {
            return;
        }

        var form = btn.up('[name=dynamic-form-container]');
        var outputFields = Ext.Array.filter(form.items.items, function(item) {
            return item.generateOutput !== undefined;
        });
        if (!outputFields || outputFields.length === 0) {
            return;
        }
        var outputs = Ext.Array.map(outputFields, function(outputField) {
            return outputField.generateOutput();
        });

        view.down('form').setLoading(true);
        view.down('button[name=abort-process]').setHidden(false);

        var inputFields = Ext.Array.filter(form.items.items, function(item) {
            return item.generateInput !== undefined;
        });
        Ext.Promise.all(Ext.Array.map(inputFields, function(input) {
            return input.generateInput();
        })).then(function(inputs) {
            inputs = Ext.Array.filter(inputs, function(input) {
                return input !== undefined;
            });

            var responseFormat = 'document';
            var executionMode = 'sync';
            var lineage = false;
            wpsService.execute(function(response) {
                if (view.down('button[name=abort-process]').isHidden()) {
                    return;
                }
                view.down('form').setLoading(false);
                view.down('button[name=abort-process]').setHidden(true);
                var error = response.getRawResponseDocument().querySelector('ProcessFailed');
                if (error) {
                    var text = error.querySelector('ExceptionText').textContent;
                    vm.set('wpsErrorText', text);
                    vm.set('hideErrorMsgContainer', false);
                    return;
                }
                var data = response.getRawResponseDocument().querySelector('ComplexData,LiteralData');
                var json = data.textContent;
                if (data.getAttribute('encoding') === 'base64') {
                    json = atob(json);
                }
                var fmt = new ol.format.GeoJSON();
                var features = fmt.readFeatures(json, {
                    dataProjection: 'EPSG:3857',
                    featureProjection: 'EPSG:3857'
                });
                var record = view.down('combo[name=process-identifier]').getSelectedRecord();
                var title = record.get('title');
                me.createLayerWithMetadata(title, features);
                view.close();
            }, processIdentifier, responseFormat, executionMode, lineage, inputs, outputs);
        }).catch(function(err) {
            view.down('form').setLoading(false);
            view.down('button[name=abort-process]').setHidden(true);
            vm.set('errorMsg', Ext.String.format(
                vm.get('errorMsgTpl'), err.label));
            vm.set('hideErrorMsgContainer', false);
        });
    },

    createLayerWithMetadata: function(title, features) {
        var uuid = this.getView().down('combo[name=template-combo]').getValue();
        Koala.util.Layer.getMetadataFromUuid(uuid)
            .then(function(metadata) {
                var layerUtil = Koala.util.Layer;
                var layer = layerUtil.layerFromMetadata(metadata, true);
                layer.getSource().addFeatures(features);
                layer.metadata = metadata;
                layerUtil.setOriginalMetadata(layer, metadata);

                // Finally add the layer to the map.
                layerUtil.addOlLayerToMap(layer);
            });
    },

    onBeforeDestroy: function() {
        this.cleanupInteraction();
        this.cleanupLayer();
    },

    cleanupLayer: function() {
        var view = this.getView();
        var map = BasiGX.view.component.Map.guess().getMap();
        if (map && view.layer) {
            map.removeLayer(view.layer);
            view.layer = null;
        }
    },

    cleanupInteraction: function() {
        var view = this.getView();
        var map = BasiGX.view.component.Map.guess().getMap();
        if (map && view.interaction) {
            map.removeInteraction(view.interaction);
            view.interaction = null;
        }
    },

    onProcessAbort: function(btn) {
        btn.setHidden(true);
        btn.up('window').down('form').setLoading(false);
    }

});
