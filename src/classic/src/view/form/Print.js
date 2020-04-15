/*global setTimeout*/
/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * @class Koala.view.form.Print
 */
Ext.define('Koala.view.form.Print', {
    extend: 'BasiGX.view.form.Print',
    xtype: 'k-form-print',

    requires: [
        'BasiGX.util.Animate',

        'GeoExt.data.MapfishPrintProvider',
        'GeoExt.data.serializer.ImageWMS',
        'GeoExt.data.serializer.TileWMS',
        'GeoExt.data.serializer.Vector',
        'GeoExt.data.serializer.WMTS',
        'GeoExt.data.serializer.XYZ',
        'GeoExt.data.serializer.WMTS',

        'Koala.view.form.IrixFieldSet',
        'Koala.util.DokpoolContext',
        'Koala.util.Object',
        'Koala.util.AppContext',

        'Koala.view.form.PrintModel'
    ],

    maxHeight: null,
    maxWidth: 800,

    config: {
        // dummy for dokpoolContext
        dokpoolContext: null,
        // can be overriden via appContext.json: urls/irix-servlet
        irixUrl: null,
        // can be overriden via appContext.json: urls/irix-servlet
        irixContext: null,
        // can be overriden via appContext.json: print-timeout
        timeoutMilliseconds: 60000,
        // can be overriden via appContext.json: urls/print-transparent-img
        transparentImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif',
        transparentColor: 'rgba(0,0,0,0)',
        chartPrint: false,
        chart: undefined,
        printExtentMovable: true,
        printExtentAlwaysCentered: false,
        printExtentScalable: true,
        skipMapMode: false
    },

    layout: 'hbox',

    viewModel: 'k-form-print',

    irixFieldsetLoaded: undefined,

    initComponent: function() {
        var me = this;
        var dpc;
        me.callParent();

        me.irixFieldsetLoaded = new Ext.Promise(function(resolve) {
            me.resolveIrixFieldsetLoaded = resolve.bind(this);
        });

        /**
         * necessary to override the BasiGXs bind.
         */
        me.setBind();

        var appContext = BasiGX.view.component.Map.guess().appContext;
        if (appContext) {
            var configuredIrixServlet = Koala.util.Object.getPathStrOr(
                appContext, 'data/merge/urls/irix-servlet', false
            );
            var configuredIrixContext = Koala.util.Object.getPathStrOr(
                appContext, 'data/merge/urls/irix-context', false
            );
            var configuredPrintTimeout = Koala.util.Object.getPathStrOr(
                appContext, 'data/merge/print-timeout', false
            );
            var configuredTransparentImageUrl = Koala.util.Object.getPathStrOr(
                appContext, 'data/merge/urls/print-transparent-img', false
            );

            if (configuredIrixServlet && configuredIrixContext) {
                me.setIrixUrl(configuredIrixServlet);
                me.setIrixContext(configuredIrixContext);
            }
            if (configuredPrintTimeout) {
                me.setTimeoutMilliseconds(configuredPrintTimeout);
            }
            if (configuredTransparentImageUrl) {
                me.setTransparentImageUrl(configuredTransparentImageUrl);
            }
        }

        var appCombo = me.down('combo[name=appCombo]');
        appCombo.setFieldLabel('Printapp');

        //prevent slow connectivity issues
        appCombo.setDisabled(true);
        appCombo.getStore().on('datachanged', function() {
            this.setDisabled(false);
        }, appCombo);

        if (configuredIrixServlet && configuredIrixContext) {
            appCombo.on('select', me.addIrixFieldset, me);
            dpc = Ext.create('Koala.util.DokpoolContext');
            me.setDokpoolContext(dpc);
        }

        me.on('beforeattributefieldsadd', me.onBeforeAttributeFieldsAdd);
        me.on('attributefieldsadd', me.onAttributeFieldsAdd);

        if (this.config.chartPrint) {
            appCombo.getStore().on('load', function() {
                appCombo.setValue(appCombo.getStore().getAt(1));
                appCombo.fireEvent('select', appCombo, appCombo.getStore().getAt(1), null);
            });
        }
    },

    listeners: {
        genericfieldsetadded: function() {
            var me = this;
            // only show irix checkbox if irix-urls are configured
            // && printIrix is allowed
            var allowIrixPrint = false;
            var tools = Koala.util.AppContext.getAppContext().data.merge.tools;
            if (tools.indexOf('irixPrintBtn') !== -1) {
                allowIrixPrint = true;
            }
            if (allowIrixPrint && me.getIrixUrl() && me.getIrixContext()) {
                this.addIrixCheckbox();
            }
            this.addBboxFieldset();
            if (this.config.chartPrint) {
                this.down('k-form-irixfieldset').show();
                this.down('[name=generic-fieldset]').hide();
                this.down('[name=bbox-fieldset]').hide();
                this.down('[name=legendsFieldset]').hide();
                this.down('fieldset[name=map]').hide();
                this.down('fieldset[name=attributes]').hide();
                this.down('fieldset[name=print-app-fieldset]').hide();
            }
        }
    },

    /**
     * It returns a container with a textfield and a corresponding editbutton
     * as items.
     *
     * @param {Ext.data.Model} attributeRec An Ext.data.Model containing
     *                                      attribute data.
     * @return {Object} An object representation of an Ext.container.Container
     */
    getStringFieldContainer: function(attributeRec) {
        var me = this;
        return {
            xtype: 'container',
            layout: 'hbox',
            name: attributeRec.get('name') + '_container',
            margin: '5px 0px',
            items: [{
                xtype: 'textfield',
                name: attributeRec.get('name'),
                fieldLabel: attributeRec.get('name'),
                value: attributeRec.get('default'),
                allowBlank: true,
                editable: false
            }, {
                xtype: 'button',
                name: attributeRec.get('name') + '_editbutton',
                handler: me.onTextFieldEditButtonClicked,
                iconCls: 'fa fa-pencil'
            }]
        };
    },

    /**
     * Listener for the textfield edit buttons. It will open a window with a
     * htmleditor with the textfields value. The textfield has to be in the same
     * container as the editbutton.
     */
    onTextFieldEditButtonClicked: function() {
        var me = this.up('k-form-print');
        var textfield = this.up('container').down('textfield');
        Ext.create('Ext.window.Window', {
            title: textfield.getFieldLabel() + ' HTML',
            layout: 'fit',
            modal: true,
            autoShow: true,
            correspondingTextfield: textfield,
            items: [{
                xtype: 'htmleditor',
                value: textfield.getValue(),
                // TODO Remove if fonts are configured to
                // match the server fonts,
                enableFont: false,
                enableAlignments: false,
                listeners: {
                    render: function() {
                        var unlinkBtn = {
                            xtype: 'button',
                            iconCls: 'x-fa fa-unlink',
                            handler: function() {
                                this.relayCmd('unlink');
                            },
                            scope: this,
                            tooltip: me.getViewModel().get('unlinkTooltip')
                        };
                        var createlinkIdx = this.getToolbar().items.keys.indexOf('createlink');

                        if (createlinkIdx) {
                            this.getToolbar().insert(createlinkIdx + 1, unlinkBtn);
                        }
                    }
                }
            }],
            bbar: ['->',
                {
                    xtype: 'button',
                    text: 'OK',
                    name: 'setValueButton',
                    handler: function(button) {
                        var win = button.up('window');
                        var editor = win.down('htmleditor');
                        win.correspondingTextfield.setValue(editor.getValue());
                        win.close();
                    }
                }]
        });
    },

    /**
     * Create a fieldset instead of an checkbox because we want to choose which
     * layerlegends we want to print and which not.
     * @override
     */
    getLegendAttributeFields: function() {
        var me = this;
        var legendsFieldset = Ext.create('Ext.form.FieldSet', {
            bind: {
                title: '{printLegendsFieldSetTitle}'
            },
            id: 'legendsFieldset',
            name: 'legendsFieldset',
            checkboxName: 'legendsFieldsetCheckBox',
            checkboxToggle: true
        });
        me.initLegendsFieldset(legendsFieldset);

        return legendsFieldset;
    },

    /**
     * Filters the layer by properties or params. Used in getLegendObject.
     * This method can/should be overriden in the application.
     *
     * @param ol.layer
     */
    legendLayerFilter: function(layer) {
        var fsSelector = 'fieldset[name="legendsFieldset"]';
        var cbSelector = 'checkbox[name='+layer.get('name')+'_visible]';
        var legendFieldset = Ext.ComponentQuery.query(fsSelector)[0];
        var layerCheckbox = legendFieldset.down(cbSelector);

        if (layerCheckbox && !legendFieldset.getCollapsed() &&
                layer.checked &&
                layer.get('opacity') > 0 &&
                layer.get('allowPrint') &&
                layerCheckbox.layer === layer &&
                layerCheckbox.checked) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Update the content of the legendsFieldset. Remove all. Get visible and
     * printable Layers from Map. Add those to the fieldset.
     */
    initLegendsFieldset: function(legendsFieldset) {
        var me = this;
        if (!legendsFieldset) {
            return;
        }

        var mapPanel = Ext.ComponentQuery.query('k-component-map')[0];
        var layers = BasiGX.util.Layer.getAllLayers(mapPanel.getMap());

        var layerLegendContainers = [];

        // The layers are initially not synchronous with the layerTree. So we
        // reverse the Array initially.
        layers.reverse();

        Ext.each(layers, function(layer) {
            if (layer.get('allowPrint') && layer.get('legendUrl') !== '') {
                var layerLegendContainer = me.createLegendContainer(layer);
                layerLegendContainers.push(layerLegendContainer);
            }
        });

        var timeReferenceButton = Ext.ComponentQuery.query(
            'k-button-timereference')[0];
        var treePanel = Ext.ComponentQuery.query(
            'k-panel-routing-legendtree')[0];
        var treeStore = treePanel.getStore();
        var onUtcToggle = function() {
            Ext.each(layerLegendContainers, function(layerLegendContainer) {
                me.updateLegendText(layerLegendContainer);
            });
        };

        treeStore.on('nodemove', me.onTreeStoreNodeMove);
        treeStore.on('nodeinsert', me.onTreeStoreNodeInsert, me);
        treeStore.on('nodeappend', me.onTreeStoreNodeInsert, me);
        treeStore.on('noderemove', me.onTreeStoreNodeRemove, me);
        timeReferenceButton.on('toggle', onUtcToggle);
        legendsFieldset.on('destroy', function() {
            treeStore.un('nodemove', me.onTreeStoreNodeMove);
            treeStore.un('nodeinsert', me.onTreeStoreNodeInsert, me);
            treeStore.un('nodeappend', me.onTreeStoreNodeInsert, me);
            treeStore.un('noderemove', me.onTreeStoreNodeRemove, me);
            timeReferenceButton.un('toggle', onUtcToggle);
        });

        if (layerLegendContainers.length > 0) {
            legendsFieldset.show();
        } else {
            legendsFieldset.hide();
        }

        legendsFieldset.add(layerLegendContainers);
    },

    createLegendContainer: function(layer) {
        var me = this;
        var legendTextHtml = me.prepareLegendTextHtml(layer);
        var layerLegendContainer = Ext.create('Ext.container.Container', {
            layer: layer,
            name: layer.get('name') + '_layerLegendContainer',
            disabled: !layer.get('visible'),
            items: [{
                xtype: 'checkbox',
                checked: true,
                name: layer.get('name') + '_visible',
                layer: layer,
                boxLabel: layer.get('name')
            }, {
                xtype: 'container',
                layout: 'hbox',
                items: [{
                    xtype: 'textfield',
                    name: layer.get('name') + '_legendtext',
                    editable: false,
                    bind: {
                        fieldLabel: '{updateLegendtext}'
                    },
                    value: legendTextHtml,
                    allowBlank: true
                }, {
                    xtype: 'button',
                    name: layer.get('name') + '_legendtexteditbutton',
                    handler: me.onTextFieldEditButtonClicked,
                    iconCls: 'fa fa-pencil'
                }]
            }]
        });

        var onLayerVisibilityChange = me.onLayerVisibilityChange.bind(
            me, layerLegendContainer);
        var updateLegendText = me.updateLegendText.bind(
            me, layerLegendContainer);

        layer.on('change:visible',
            onLayerVisibilityChange
        );
        layer.on('change',
            updateLegendText
        );

        layerLegendContainer.on('beforedestroy', function() {
            layer.un('change:visible',
                onLayerVisibilityChange
            );
            layer.un('change',
                updateLegendText
            );
        });

        return layerLegendContainer;
    },

    /**
    * A listener for the treeStore on nodeMove event. Reorders the
    * layerLegendContainers to be synchronous with the maps layer order.
    *
    */
    onTreeStoreNodeMove: function() {
        var legendsFieldset = Ext.ComponentQuery.query(
            'fieldset[name="legendsFieldset"]')[0];
        var itemsClone = Ext.clone(legendsFieldset.items.items);
        legendsFieldset.removeAll(false);

        var treeStore = this;
        // We need to delay the store-Iteration as the "nodeMove" event is
        // fired before the node is readded to the store. The iteration will then
        // skip the moved node. This is not nice and we should change it to an
        // other event or strategy maybe.
        // TODO
        setTimeout(function() {
            treeStore.each(function(layerNode) {
                var layer = layerNode.getData();
                var matchedItem = Ext.Array.findBy(itemsClone, function(item) {
                    return item.name === layer.get('name') + '_layerLegendContainer';
                });
                legendsFieldset.add(matchedItem);
            });
        }, 200);

    },

    /**
    * A listener for the treeStore nodeInsert event. Adds a layerLegendContainer
    * to the legendsFieldset.
    *
    */
    onTreeStoreNodeInsert: function(node, inserted) {
        var me = this;
        var layer = inserted.getOlLayer();
        var legendContainer = me.createLegendContainer(layer);
        var legendsFieldset = me.down('fieldset[name="legendsFieldset"]');
        legendsFieldset.insert(0, legendContainer);

        if (legendsFieldset.items.items.length > 0 && legendsFieldset.hidden === true) {
            Ext.getCmp('legendsFieldset').show();
        }
    },

    /**
    * A listener for the treeStore nodeRemove event. Removes a layerLegendContainer
    * from the legendsFieldset if the corresponding layer is removed from the
    * tree.
    *
    */
    onTreeStoreNodeRemove: function(node, removed) {
        var me = this;
        var layer = removed.getOlLayer();
        var legendsFieldset = me.down('fieldset[name="legendsFieldset"]');
        var componentName = layer.get('name') + '_layerLegendContainer';
        var legendContainer = legendsFieldset.down('[name='+componentName+']');
        legendsFieldset.remove(legendContainer);
    },

    /**
     * Get's called when the layers visibility changes. If it set to invisible
     * the container for the corresponding legend while get disabled and
     * deactivated.
     * @param {Ext.container.Container} layerLegendContainer The layerLegendContainer
     *                                                       of the layer.
     * @param {ol.Object.Event} evt The 'change:visible' event of a layer.
     */
    onLayerVisibilityChange: function(layerLegendContainer, evt) {
        layerLegendContainer.setDisabled(evt.oldValue);
        var checkbox = layerLegendContainer.down('checkbox');
        checkbox.setValue(!evt.oldValue);
    },

    /**
     * Updates the Value of the underlying legend textfield of a given
     * layerLegendContainer.
     *
     * @param {Ext.container.Container} layerLegendContainer The layerLegendContainer
     *                                                       of the layer.
     * @param {ol.Object.Event} evt The 'change' event of a layer.
     */
    updateLegendText: function(layerLegendContainer) {
        var me = this;
        var layer = layerLegendContainer.layer;
        var legendText = me.prepareLegendTextHtml(layer);
        layerLegendContainer.down('textfield').setValue(legendText);
    },

    /**
     * Prepares the legendText for a given layer. It returns the layerName extended
     * by a textual representation of the layer filter if given.
     * @param {ol.layer.Base} layer A layer.
     * @return {String} The markup representation for the legendtext.
     */
    prepareLegendTextHtml: function(layer) {
        var layerName = layer.get('name'); // fallback
        if ('metadata' in layer && 'printTitle' in layer.metadata) {
            layerName = layer.metadata.printTitle;
        }
        var filterText = Koala.util.Layer.getFiltersTextFromMetadata(
            layer.metadata);

        if (Ext.isEmpty(filterText)) {
            return layerName;
        } else {
            return layerName + '<br/><font color="#999999">' + filterText + '</font>';
        }
    },

    /**
     * Called before a `attributefields`-object is added to the fieldset. This
     * method will hide the legend_template and map_template fields, but also
     * set their respective value according to a convention.
     *
     * @param {BasiGX.view.form.Print} printForm The print form instance.
     * @param {Object} attributefields An `attributefields`-object, which often
     *     are formfields like `textfields`, `combos` etc.
     */
    onBeforeAttributeFieldsAdd: function(printForm, attributeFields, attributeRec) {
        Koala.util.Hooks.executeBeforeAddHook(
            printForm, attributeFields, attributeRec);
    },

    getCheckBoxBooleanFields: function(attributeRec) {
        return {
            xtype: 'checkbox',
            name: attributeRec.get('name'),
            checked: true,
            fieldLabel: attributeRec.get('name')
        };
    },

    /**
     * Create a checkbox instead of a textfield
     * if type is Boolean.
     * @override
     */
    addAttributeFields: function(attributeRec, fieldset) {
        var me = this;
        var map = me.getMapComponent().getMap();

        var attributeFields;
        switch (attributeRec.get('type')) {
            case 'MapAttributeValues':
                attributeFields = me.getMapAttributeFields(attributeRec);
                map.on('moveend', me.renderAllClientInfos, me);
                break;
            case 'NorthArrowAttributeValues':
                attributeFields = me.getNorthArrowAttributeFields(attributeRec);
                break;
            case 'ScalebarAttributeValues':
                attributeFields = me.getScalebarAttributeFields(attributeRec);
                break;
            case 'LegendAttributeValue':
                attributeFields = me.getLegendAttributeFields(attributeRec);
                break;
            case 'String':
                attributeFields = me.getStringFieldContainer(attributeRec);
                break;
            case 'Boolean':
                attributeFields = me.getCheckBoxBooleanFields(attributeRec);
                break;
            case 'DataSourceAttributeValue':
                //Ext.toast('Data Source not yet supported');
                attributeFields = me.getStringFieldContainer(attributeRec);
                break;
            default:
                break;
        }

        if (attributeFields) {
            var doContinue = me.fireEvent(
                'beforeattributefieldsadd', me, attributeFields, attributeRec
            );
            // a beforeattributefieldsadd handler may have cancelled the adding
            if (doContinue !== false) {
                var added = fieldset.add(attributeFields);
                me.fireEvent('attributefieldsadd', me, attributeFields, added);
            }
        }
    },

    /**
     * Validate all fields on creation so they are marked as red if invalid.
     *
     * If https://github.com/terrestris/BasiGX/pull/74 is merged all fields are
     * allowed to be Blank. Set mandatory fields here if you need some.
     */
    onAttributeFieldsAdd: function(printForm, attributeFields, addedField) {
        if (Ext.isFunction(addedField.validate)) {
            addedField.validate();
        }
    },

    /**
     * Overrides the default createPrint method;
     */
    createPrint: function() {
        var view = this;
        var spec = {};
        var mapComponent = view.getMapComponent();
        var map = mapComponent.getMap();
        var mapView = map.getView();
        var viewRes = mapView.getResolution();
        var layoutCombo = view.down('combo[name="layout"]');
        var layout = layoutCombo.getValue();
        var formatCombo = view.down('combo[name="format"]');
        var format = formatCombo.getValue();
        var attributes = {};
        var projection = mapView.getProjection().getCode();
        var rotation = mapView.getRotation();

        layoutCombo.getStore().sort('name', 'ASC');
        formatCombo.getStore().sort('field1', 'ASC');

        var printLayers = [];
        var serializedLayers = [];

        var overlays = mapComponent.getMap().getOverlays();

        var promises = [];

        var ratioX = 1;
        var ratioY = 1;

        if (this.transformInteraction) {
            var boxFeature = this.transformInteraction.layers_[0].getSource().getFeatures()[0];
            var extent = boxFeature.getGeometry().getExtent();
            var resolution = mapView.getResolution();
            var extentPixelWidth = (extent[2] - extent[0]) / resolution;
            var extentPixelHeight = (extent[3] - extent[1]) / resolution;
            var mapWidth, mapHeight;
            var layouts = this.provider.capabilityRec.layouts().data.items;

            Ext.each(layouts, function(lay) {
                var atts = lay.attributes();
                Ext.each(atts, function(attribute) {
                    Ext.each(attribute.data.items, function(att) {
                        if (att.data.name === 'map') {
                            mapWidth = att.data.clientInfo.width;
                            mapHeight = att.data.clientInfo.height;
                        }
                    });
                });
            });
            ratioX = mapWidth / extentPixelWidth;
            ratioY = mapHeight / extentPixelHeight;
        }

        overlays.forEach(function(overlay) {
            var coords = overlay.centerCoords;
            var containerEl = overlay.getElement();
            if (!containerEl || !containerEl.parentNode) {
                return;
            }
            view.hideHiddenTabs();
            // workaround to get object tags to render properly with html2canvas
            var htmlNode = containerEl.querySelector('.html-tab > input');
            if (htmlNode && htmlNode.checked) {
                try {
                    var node = document.querySelector('.html-tab object').contentDocument.documentElement;
                    if (node) {
                        containerEl = node;
                    }
                } catch (e) {
                    // no object tag found, go ahead with the original container
                }
            }
            var width = containerEl.offsetWidth;
            var height = containerEl.offsetHeight;
            if (containerEl.style.visibility === 'hidden') {
                // probably a minimized carto window, just print the chart
                containerEl = containerEl.querySelector('svg');
                // use view box for correct width/height, offsetWidth/Height won't work for svgs
                var dims = containerEl.viewBox.baseVal;
                width = dims.width;
                height = dims.height;
                // correct for carto window minimize mode translation
                coords = overlay.getPosition().slice();
                coords[0] += (width / 2) * resolution;
                coords[1] -= (height / 2) * resolution;
                // 28 pixels for the header height
                coords[1] -= 28 * resolution;
                // 5 pixels from the translate
                coords[1] += 5 * resolution;
                // 34 pixels from the translate
                coords[0] += 34 * resolution;
                // 15 magic pixels
                coords[0] += 15 * resolution;
            }
            document.querySelectorAll('.k-d3-hidden').forEach(function(item) {
                item.style.display = 'none';
            });
            document.querySelectorAll('.k-d3-download-icon,.k-d3-color-icon,.k-d3-delete-icon')
                .forEach(function(item) {
                    item.style.display = 'none';
                });
            var promise;
            if (containerEl.localName === 'svg') {
                promise = new Ext.Promise(function(resolve) {
                    width *= ratioX;
                    height *= ratioY;
                    var canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    var svg = containerEl.cloneNode(true);
                    svg.style.transform = null;
                    var data = new XMLSerializer().serializeToString(svg);
                    var win = window.URL || window.webkitURL || window;
                    var img = new Image();
                    var blob = new Blob([data], { type: 'image/svg+xml' });
                    var url = win.createObjectURL(blob);
                    img.onload = function() {
                        canvas.getContext('2d').drawImage(img, 0, 0);
                        win.revokeObjectURL(url);
                        resolve(canvas);
                    };
                    img.src = url;
                });
            } else {
                promise = html2canvas(containerEl);
            }
            promises.push(promise);
            promise.then(function(canvas) {
                width *= ratioX;
                height *= ratioY;

                view.showHiddenTabs();
                document.querySelectorAll('.k-d3-download-icon,.k-d3-color-icon,.k-d3-delete-icon')
                    .forEach(function(item) {
                        item.style.display = 'block';
                    });
                printLayers.push({
                    type: 'chart',
                    coordinates: coords,
                    popup: canvas.toDataURL('image/png'),
                    width: width,
                    height: height,
                    getSource: function() {
                        return this;
                    }
                });
                document.querySelectorAll('.k-d3-hidden')
                    .forEach(function(item) {
                        item.style.display = 'block';
                    });
            });
        });

        Ext.Promise.all(promises).then(function() {
            mapComponent.getLayers().forEach(function(layer) {
                if (layer.get('printLayer') && !!layer.checked) {
                    var printLayer = layer.get('printLayer');
                    // adopt the opacity of the original layer on the print layer
                    printLayer.setOpacity(layer.get('opacity'));
                    printLayers.push(printLayer);
                } else {
                    var isChecked = !!layer.checked;
                    var hasName = isChecked && !!layer.get('name');
                    var nonOpaque = hasName && (layer.get('opacity') > 0);
                    var inTree = nonOpaque && (layer.get(
                        BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER
                    ) !== false); // may be undefined for certain layers

                    if (isChecked && hasName && nonOpaque && inTree) {
                        if (layer instanceof ol.layer.Vector &&
                            layer.getSource().getFeatures().length < 1) {
                            return false;
                        }
                        printLayers.push(layer);
                    } else if (layer.get('printSpecial') || layer.get('isSelectionLayer')) {
                        printLayers.push(layer);
                    } else {
                        return false;
                    }
                }
            });

            var fsSelector = 'fieldset[name=attributes] fieldset[name=map]';
            var fieldsets = view.query(fsSelector);
            var dpi = 90;

            Ext.each(printLayers, function(layer) {
                var source = layer.getSource();
                var serialized = {};

                var serializer = GeoExt.data.MapfishPrintProvider
                    .findSerializerBySource(source);
                if (serializer) {
                    serialized = serializer.serialize(layer, source, viewRes, mapComponent.map);
                    serializedLayers.push(serialized);
                }
            }, view);

            Ext.each(printLayers, function(layer) {
                var source = layer.getSource();

                if (source.type === 'chart') {
                    var symbolizer =
                        {
                            type: 'point',
                            externalGraphic: source.popup,
                            graphicFormat: 'image/png'
                        };
                    symbolizer.graphicWidth = source.height;
                    serializedLayers.push({
                        type: 'geojson',
                        style: {
                            version: 2,
                            '*': {
                                symbolizers: [symbolizer]
                            }
                        },
                        geojson: {
                            type: 'FeatureCollection',
                            totalFeatures: 1,
                            features: [
                                {
                                    type: 'Feature',
                                    properties: {},
                                    geometry: {
                                        type: 'Point',
                                        coordinates: source.coordinates
                                    }
                                }
                            ],
                            crs: {
                                type: 'name',
                                properties: {
                                    name: projection
                                }
                            }
                        }
                    });
                }
            }, view);

            Ext.each(fieldsets, function(fs) {
                var name = fs.name;
                // TODO double check when rotated
                var featureBbox;
                if (fs.extentFeature) {
                    featureBbox = fs.extentFeature.getGeometry().getExtent();
                }
                dpi = fs.down('[name="dpi"]').getValue();

                attributes[name] = {
                    bbox: featureBbox,
                    dpi: dpi,
                    layers: serializedLayers.reverse(),
                    projection: projection,
                    rotation: rotation
                };

            }, view);

            // Get all Fields except the DPI Field
            // TODO This query should be optimized or changed into some
            // different kind of logic
            var additionalFields = view.query(
                'fieldset[name=attributes]>field[name!=dpi],' +
                'fieldset[name=attributes]>container>textfield[name!=dpi]'
            );

            Ext.each(additionalFields, function(field) {
                if (field.getName() === 'scalebar') {
                    attributes.scalebar = view.getScaleBarObject();
                    // handle the desire to have a scalebar or not by setting
                    // colors to transparent, crude but we didn' find a better
                    // solution. See https://github.com/terrestris/BasiGX/pull/74#issuecomment-209954558
                    if (field.getValue() === false) {
                        attributes.scalebar = view.setScalebarInvisible(
                            attributes.scalebar
                        );
                    }
                } else if (field.getName() === 'northArrow') {
                    attributes.northArrow = view.getNorthArrowObject();
                    // handle the desire to have a northArrow or not by setting
                    // colors to transparent, crude but we didn' find a better
                    // solution. See https://github.com/terrestris/BasiGX/pull/74#issuecomment-209954558
                    if (field.getValue() === false) {
                        attributes.northArrow = view.setNorthArrowInvisible(
                            attributes.northArrow
                        );
                    }
                } else {
                    attributes[field.getName()] = field.getValue();
                }
            }, view);

            var legendFieldset = view.down('fieldset[name="legendsFieldset"]');
            if (legendFieldset && !legendFieldset.getCollapsed()) {
                attributes.legend = view.getLegendObject();

                // Override layer name in legend with value from legendTextField
                Ext.each(attributes.legend.classes, function(clazz) {
                    var legendTextField = legendFieldset.down(
                        'textfield[name=' + clazz.name + '_legendtext]');
                    var layer = BasiGX.util.Layer.getLayerByName(clazz.name);
                    var currentLegendUrl = Koala.util.Layer.getCurrentLegendUrl(layer);

                    if (currentLegendUrl) {
                        clazz.icons[0] = currentLegendUrl;
                    }

                    if (legendTextField) {
                        clazz.name = legendTextField.getValue();
                    }
                });
            }

            var hookedAttributes = Ext.clone(attributes);

            Koala.util.Hooks.executeBeforePostHook(view, hookedAttributes);

            var app = view.down('combo[name=appCombo]').getValue();
            var url = view.getUrl() + app + '/buildreport.' + format;
            spec.attributes = hookedAttributes;
            spec.layout = layout;
            spec.outputFilename = layout;

            var irixCheckBox = view.down('[name="irix-fieldset-checkbox"]');
            if (irixCheckBox && irixCheckBox.getValue()) {
                var irixJson = {};
                var mapfishPrint = [];

                if (view.isValid()) {
                    spec.outputFormat = format;
                    mapfishPrint[0] = spec;
                    irixJson = view.setUpIrixJson(mapfishPrint);

                    var hookedIrixAttributes = Ext.clone(irixJson);

                    Koala.util.Hooks.executeBeforePostHook(view, hookedIrixAttributes.irix);

                    url = view.getIrixUrl();
                    Ext.Ajax.request({
                        url: url,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        jsonData: hookedIrixAttributes,
                        scope: view,
                        success: view.irixPostSuccessHandler,
                        failure: view.genericPostFailureHandler,
                        timeout: view.getTimeoutMilliseconds()
                    });
                }
            } else {
                var startTime = new Date().getTime();
                Ext.Ajax.request({
                    url: view.getUrl() + app + '/report.' + format,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    jsonData: Ext.encode(spec),
                    scope: view,
                    success: function(response) {
                        var data = Ext.decode(response.responseText);
                        view.setLoading(format + ' ' +
                            view.getViewModel().get('downloadOngoingMiddleText'));
                        view.downloadWhenReady(startTime, data);
                    },
                    failure: view.genericPostFailureHandler,
                    timeout: view.getTimeoutMilliseconds()
                });
            }
        });
    },

    /**
     * Explicitly hides the carto window tabs that are currently not visible.
     */
    hideHiddenTabs: function() {
        document.querySelectorAll('.cartowindow > div').forEach(function(item) {
            if (item.clientWidth === 0 || item.clientHeight === 0) {
                item.style.display = 'none';
            }
        });
        document.querySelectorAll('.cartowindow > div > input[type=radio]').forEach(function(item) {
            item.style.display = 'none';
        });
    },

    /**
     * Shows the carto window tabs with zero width or height.
     */
    showHiddenTabs: function() {
        document.querySelectorAll('.cartowindow > div').forEach(function(item) {
            if (item.clientWidth === 0 || item.clientHeight === 0) {
                item.style.display = 'block';
            }
        });
    },

    /**
     * Returns and modifies the given MapFish Print 3 attribute `scalebar`
     * (http://mapfish.github.io/mapfish-print-doc/attributes.html#!scalebar)
     * to be invisible. This is done by setting various colors to a transparent
     * value.
     *
     * @param {object} scalebar A scalebar object as it is returned from the
     *     BasiGX method getScaleBarObject()
     * @return {object} The scalebar object configured as invisible.
     */
    setScalebarInvisible: function(scalebar) {
        var keys = [
            'backgroundColor',
            'barBgColor',
            'color',
            'fontColor'
        ];
        var newColor = this.getTransparentColor();
        Ext.each(keys, function(key) {
            scalebar[key] = newColor;
        });
        return scalebar;
    },

    /**
     * Returns and modifies the given MapFish Print 3 attribute `northArrow`
     * (http://mapfish.github.io/mapfish-print-doc/attributes.html#!northArrow)
     * to be invisible. This is done by setting various colors to a transparent
     * value and also by setting the `graphic` to a transparent image.
     *
     * @param {object} northArrow A northArrow object as it is returned from the
     *     BasiGX method getNorthArrowObject()
     * @return {object} The northArrow object configured as invisible.
     */
    setNorthArrowInvisible: function(northArrow) {
        var keys = [
            'backgroundColor'
        ];
        var newColor = this.getTransparentColor();
        Ext.each(keys, function(key) {
            northArrow[key] = newColor;
        });
        northArrow.graphic = this.getTransparentImageUrl();
        return northArrow;
    },

    /**
     */
    genericPostFailureHandler: function(response) {
        var viewModel = this.getViewModel();
        var msg = viewModel.get('serverError');
        msg = Ext.String.format(msg, response.status || 'n.a.');
        Ext.Msg.show({
            title: viewModel.get('serverErrorTitle'),
            message: msg,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.WARNING
        });
    },

    /**
     */
    irixPostSuccessHandler: function(response, options) {
        var me = this;
        var irixJson = options.jsonData;
        var chosenRequestType = irixJson['request-type'];
        var uploadOnly = 'upload';
        var repondTypes = ['respond', 'upload/respond'];
        var expectResponse = Ext.Array.contains(
            repondTypes, chosenRequestType
        );

        if (chosenRequestType === uploadOnly) {
            Ext.Msg.show({
                title: me.getViewModel().get('serverUploadSuccessTitle'),
                message: me.getViewModel().get('serverUploadSuccess'),
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.INFO
            });
        } else if (expectResponse) {
            var content = response.responseText;
            if (content) {
                var w;
                var success = false;
                try {
                    w = window.open(
                        'data:application/xml,' +
                        encodeURIComponent(content)
                    );
                    success = true;
                } catch (e) {
                    Ext.log.warn(e);
                    try {
                        w = window.open();
                    } catch (e2) {
                        Ext.log.warn(e2);
                    }
                    if (w && 'focus' in w && 'document' in w) {
                        w.document.write(content);
                        w.document.close();
                        w.focus();
                        success = true;
                    }
                }
                if (!success) {
                    Ext.Msg.show({
                        title: me.getViewModel().get('disablePopupBlockerTitle'),
                        message: me.getViewModel().get('disablePopupBlocker'),
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.INFO
                    });
                }
            } else {
                Ext.Msg.show({
                    title: me.getViewModel().get('unexpectedResponseTitle'),
                    message: me.getViewModel().get('unexpectedResponse'),
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.WARNING
                });
            }
        }
    },

    /**
     */
    downloadWhenReady: function(startTime, data) {
        var me = this;
        var elapsedMs = (new Date().getTime() - startTime);
        var format = me.down('combo[name="format"]')
            .getValue();

        var dspElapsedMs = (elapsedMs/1000).toFixed(3) + ' s';
        var loadMsg = format + ' ' + me.getViewModel().get('downloadOngoingMiddleText') + ': ' +
            dspElapsedMs;
        me.setLoading(loadMsg);

        if (elapsedMs > me.getTimeoutMilliseconds()) {
            Ext.log.warn('Print aborted after ' + dspElapsedMs);
            me.setLoading(false);
            Ext.Msg.show({
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.ERROR,
                title: me.getViewModel().get('warnPrintTimedOutTitle'),
                message: me.getViewModel().get('warnPrintTimedOutText')
            });

        } else {
            setTimeout(function() {
                Ext.Ajax.request({
                    url: me.getUrl() + 'status/' + data.ref + '.json',
                    success: function(response) {
                        var statusData = Ext.decode(response.responseText);
                        if (statusData.done) {
                            me.setLoading(false);
                            var dlBtn = me.down('button[name="downloadPrint"]');
                            dlBtn.link = me.getUrl() + 'report/' + data.ref;
                            dlBtn.show();
                            BasiGX.util.Animate.shake(dlBtn);
                            var fields = dlBtn.up('k-form-print').query('field');
                            Ext.each(fields, function(field) {
                                field.on('change', function() {
                                    dlBtn.hide();
                                }, field, {single: true});
                            });
                        } else {
                            me.downloadWhenReady(startTime, data);
                        }
                    },
                    failure: function(response) {
                        Ext.log.warn('server-side failure with status code '
                            + response.status);
                        //proceed until being successfull or reaching print-timeout
                        me.downloadWhenReady(startTime, data);
                    },
                    timeout: 500
                });
            }, 500);
        }
    },

    updateFeatureBbox: function(bboxTextfield) {
        var me = this;
        var fsSelector = 'fieldset[name=attributes] fieldset[name=map]';
        var fieldsets = me.query(fsSelector);
        var featureBbox = '';

        Ext.each(fieldsets, function(fs) {
            // TODO double check when rotated
            if (fs.extentFeature) {
                featureBbox = fs.extentFeature.getGeometry().getExtent();
            }
        }, this);

        bboxTextfield.setValue(featureBbox);
    },

    addBboxFieldset: function() {
        var me = this;
        var mapFieldSet = me.down('fieldset[name=map]');
        var map = me.getMapComponent().getMap();
        var bboxTextfield = Ext.create('Ext.form.field.Text', {
            bind: {
                fieldLabel: '{mapBboxLabel}'
            },
            readOnly: true,
            labelWidth: 40,
            width: 150,
            value: ''
        });

        var listenerFunction = function() {
            me.updateFeatureBbox(bboxTextfield);
        };

        map.on('moveend', listenerFunction);

        bboxTextfield.on('destroy', function() {
            map.un('moveend', listenerFunction);
        });
        if (me.transformInteraction) {
            me.transformInteraction.on('translateend', listenerFunction);
            me.transformInteraction.on('scaleend', listenerFunction);
        }

        var bboxFieldSet = Ext.create('Ext.form.FieldSet', {
            name: 'bbox-fieldset',
            layout: 'hbox',
            border: false,
            margin: '0 0 0 -10',
            items: [
                bboxTextfield,
                {
                //TODO update bbox of irix-upload sos-job
                    xtype: 'button',
                    bind: {
                        text: '{mapBboxButton}'
                    },
                    margin: '0 0 0 55',
                    handler: function() {
                        Ext.Msg.alert(me.getViewModel().get('mapBboxButton'),
                            '<b>' + me.getViewModel().get('mapBboxLabel') +
                                ':</b> ' + bboxTextfield.getValue());
                    }
                }]
        });

        me.updateFeatureBbox(bboxTextfield);
        mapFieldSet.add(bboxFieldSet);
    },

    addIrixCheckbox: function() {
        var me = this;
        var genericFieldset = me.down('fieldset[name=generic-fieldset]');
        var irixCheckbox = Ext.create('Ext.form.field.Checkbox', {
            name: 'irix-fieldset-checkbox',
            boxLabel: 'DokPool',
            checked: this.config.chartPrint,
            handler: function(checkbox, checked) {
                var irixFieldset = me.down('k-form-irixfieldset');
                if (checked) {
                    irixFieldset.show();
                } else {
                    irixFieldset.hide();
                }
            }
        });

        genericFieldset.add(irixCheckbox);
    },

    addIrixFieldset: function() {
        var me = this;
        var fs = me.down('k-form-irixfieldset');
        var checkBox = me.down('[name="irix-fieldset-checkbox"]');

        if (!fs) {
            var irixFieldset = Ext.create('Koala.view.form.IrixFieldSet',{
                flex: 2
            });
            me.add(irixFieldset);
            me.resolveIrixFieldsetLoaded();
        } else {
            checkBox.setValue(false);
        }

    },

    setUpIrixJson: function(mapfishPrint) {
        var me = this;
        var irixJson = {};
        irixJson.irix = me.formItemToJson(me.down('k-form-irixfieldset'));
        // the generic serialisation needs a little bit shuffeling
        irixJson = me.adjustIrixSerialisation(irixJson);
        // always add the printapp to the top-lvel for irix:
        irixJson.printapp = me.down('[name="appCombo"]').getValue();
        if (!this.config.chartPrint) {
            irixJson['mapfish-print'] = mapfishPrint;
        }
        return irixJson;
    },

    /**
     * Certain fields must live inside the irix fieldset, as they only make
     * sense for this type of "print"; yet their serialisation cannot live in
     * dedicted irix-object, as it is e.g. expected on the top-level. Thus
     * the "irixContext.json" represents the allocation how it shall look like inside
     * the print window. This method will adjust a JSON (e.g. from formItemToJson),
     * and shuffle certain key / value pairs around: currently only 'request-type'.
     *
     * @param {object} irixJson The JSON for the IRIX service, a representation
     *     of the form.
     * @return {object} The adjusted serialisation.
     */
    adjustIrixSerialisation: function(irixJson) {
        var irix = irixJson.irix;
        // move requestType or request-type out of irix object to top-level
        var correctRequestTypeKey = 'request-type';
        // For backwards compatibility, we iterate over two variants
        var keysReqestType = ['requestType', correctRequestTypeKey];
        if (irix) {
            var reqType;
            Ext.each(keysReqestType, function(keyRequestType) {
                if (keyRequestType in irix) {
                    // if both were present, the dashed version will win.
                    reqType = irix[keyRequestType];
                    // delete the one under key 'irix'
                    delete irixJson.irix[keyRequestType];
                    // set on top-level.
                    irixJson[correctRequestTypeKey] = reqType;
                }
            });

            //move "DokpoolContentType", "IsElan", "IsDoksys", "IsRodos", "IsRei"
            //back to  "DokpoolMeta"
            //and "ReportContext", "Confidentiality"
            //back to "Identification"
            //and "ElanScenarios"
            //back to "DokpoolMeta"
            irixJson.irix.Identification.ReportContext = irixJson.irix.ReportContext;
            delete irixJson.irix.ReportContext;

            irixJson.irix.Identification.Confidentiality = irixJson.irix.Confidentiality;
            delete irixJson.irix.Confidentiality;

            irixJson.irix.DokpoolMeta.DokpoolContentType = irixJson.irix.DokpoolContentType;
            delete irixJson.irix.DokpoolContentType;

            irixJson.irix.DokpoolMeta.IsElan = irixJson.irix.DokpoolBehaviour.IsElan;
            irixJson.irix.DokpoolMeta.IsDoksys = irixJson.irix.DokpoolBehaviour.IsDoksys;
            irixJson.irix.DokpoolMeta.IsRodos = irixJson.irix.DokpoolBehaviour.IsRodos;
            irixJson.irix.DokpoolMeta.IsRei = irixJson.irix.DokpoolBehaviour.IsRei;
            delete irixJson.irix.DokpoolBehaviour;

            irixJson.irix.DokpoolMeta.Elan = {};
            irixJson.irix.DokpoolMeta.Elan.Scenarios = irixJson.irix.Scenarios;
            delete irixJson.irix.Scenarios;
        }
        if (this.config.chartPrint) {
            irixJson['mapfish-print'] = undefined;
            delete irixJson['mapfish-print'];
            irixJson['img-print'] = [{
                mimetype: 'image/png',
                inputFormat: 'png',
                metadata: [],
                outputFormat: 'png',
                value: this.config.chart
            }];
        }
        return irixJson;
    },

    formItemToJson: function(formItem) {
        var me = this;
        var children = formItem.items.items;
        var json = {};

        Ext.each(children, function(child) {
            if (child instanceof Ext.form.FieldSet ||
                child instanceof Ext.form.FieldContainer) {

                if (child.valueField && child.valueField.getValue()) {
                    json[child.name] = child.valueField.getValue();
                } else {
                    json[child.name] = me.formItemToJson(child);
                }

            } else if (child instanceof Ext.Container) {
                json[child.name] = child.down('textfield').getValue();
            } else {
                json[child.name] = child.getValue();
            }
        });

        return json;
    }
});
