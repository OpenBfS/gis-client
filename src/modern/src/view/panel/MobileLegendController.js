/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.view.panel.MobileLegendController
 */
Ext.define('Koala.view.panel.MobileLegendController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-mobilelegend',
    requires: [
        'Ext.MessageBox'
    ],

    activeChartingLayer: null,

    /**
     *
     */
    onInitialize: function() {
        this.createTreeList();
    },

    /**
     *
     */
    onPainted: function() {
        this.setInitialCheckStatus();
    },

    /**
     *
     */
    createTreeList: function() {
        var me = this;
        var view = me.getView();
        var treeStore;
        var treePanel;

        treeStore = Ext.create('GeoExt.data.store.LayersTree', {
            layerGroup: Ext.ComponentQuery.query('basigx-component-map')[0].getMap().getLayerGroup()
        });

        treePanel = Ext.create('Ext.list.Tree', {
            store: treeStore,
            width: 'calc(80vw)',
            listeners: {
                selectionchange: me.onSelectionChange,
                tap: {
                    fn: me.onTreeItemTap,
                    element: 'element'
                },
                scope: me
            }
        });

        view.add(treePanel);
    },

    /**
     *
     */
    setInitialCheckStatus: function() {
        var me = this;
        var view = me.getView();
        var treeList = view.down('treelist');
        var treeListItems = treeList.itemMap;

        Ext.iterate(treeListItems, function(k, item) {
            if (item instanceof Ext.list.TreeItem) {
                me.setTreeItemCheckStatus(item);

                // Prepare Slider
                var layer = item.getNode().getOlLayer();
                var slider = document.getElementById('slider_' + layer.id);

                if (slider) {
                    slider.value = layer.getOpacity() * 100;

                    // Clone the element to delete all previous eventlisteners
                    var sliderClone = slider.cloneNode(true);
                    slider.parentNode.replaceChild(sliderClone, slider);
                    sliderClone.addEventListener('change', me.onSliderChange.bind(slider, layer));
                }
            }
        });
    },

    /**
     *
     */
    setTreeItemCheckStatus: function(item) {
        var me = this;
        var layer = item.getNode().getOlLayer();
        item.setText(me.getTreeListItemTpl().apply(layer));
    },

    /**
     * Listener for the selectionchange event.
     * It sets the selected layer as chartable.
     *
     * @param {Ext.list.Tree} treeList The treelist of the MobileLegend.
     * @param {GeoExt.data.model.LayerTreeNode} record The seletcted
     *                                                 LayerTreeNode.
     * @return {undefined}
     */
    onSelectionChange: function(treeList, record) {
      var me = this;
      var layer = record.getOlLayer();
      if (layer && layer !== me.activeChartingLayer) {
        me.toggleActiveChartingLayer(layer);
      }
    },

    /**
     *
     */
    onTreeItemTap: function(evt, target) {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var treeList = view.down('treelist');
        var selection = treeList.getSelection();
        var layer = selection ? selection.getOlLayer() : null;

        var targetClass = target.getAttribute("class");

        if (!targetClass) {
            if (target.getElementsByTagName("img").length > 0) {
                var legend = target.getElementsByTagName("img")[0];
                if (legend.style.display === 'none') {
                    legend.style.display = 'inherit';
                } else {
                    legend.style.display = 'none';
                }
            }
            return false;
        }

        if (targetClass.indexOf("up-icon") > 0) {
            me.changeLayerOrder(layer, 1);
            return false;
        }

        if (targetClass.indexOf("down-icon") > 0) {
            me.changeLayerOrder(layer, -1);
            return false;
        }

        if (targetClass.indexOf("fa-info-circle") > 0) {
            me.showLayerInfo(layer);
            return false;
        }

        if (targetClass.indexOf("fa-times") > 0) {
            me.removeLayer(layer);
            return false;
        }

        if (targetClass.indexOf("fa-eye") > 0) {
            if (layer && layer instanceof ol.layer.Layer) {

                if (me.isLayerAllowedToSetVisible(layer)) {
                    layer.setVisible(!layer.getVisible());
                    me.setTreeItemCheckStatus(treeList.getItem(selection));
                } else {
                    Ext.Msg.show({
                        title: viewModel.get('maxLayersMsgBoxTitle'),
                        message: Ext.String.format(
                                viewModel.get('maxLayersMsgBoxMessage'),
                                view.getMaxVisibleLayers()),
                        buttons: {
                            text: viewModel.get('maxLayersMsgBoxBtnText')
                        }
                    });
                }

            }
            return false;
        }

        // charting toggler
        if (targetClass.indexOf("fa-bar-chart") > 0) {
            me.toggleActiveChartingLayer(layer);
            return false;
        }

        if (targetClass === 'legend-filter-text') {
            me.onLegendFilterTextClick(layer);
            return false;
        }

    },

    /**
     * Sets the given ol.layer.Layer as the active charting layer.
     *
     * @param {ol.layer.Layer} layer The layer to set active charting on.
     */
    toggleActiveChartingLayer: function(layer) {
        if (!(layer instanceof ol.layer.Layer)) {
            return;
        }

        var me = this;
        var view = me.getView();
        var treeList = view.down('treelist');

        // Get the layer associated treelist node.
        var listNode = treeList.getStore().findNode('text', layer.get('name'));

        me.removeAllChartingActiveClasses();

        if (me.activeChartingLayer === layer) {
            me.activeChartingLayer = null;
        } else {
            me.activeChartingLayer = layer;
            me.addChartingActiveClass(treeList.getItem(listNode));
        }

        view.fireEvent('chartinglayerchange', me.activeChartingLayer);
    },

    onLegendFilterTextClick: function(olLayer) {
        var me = this;
        var view = me.getView();
        var filterPanel = view.up('app-main')
                .down('k-panel-mobilepanel[name=filterContainer]');

        if (!(olLayer instanceof ol.layer.Layer)) {
            Ext.Logger.warn('Invalid input parameter. Expected an subclass ' +
                    'of ol.layer.Layer!');
            return;
        }

        if (!filterPanel) {
            Ext.Logger.warn('Could not find the filterContainer panel.');
            return;
        }

        // Remove any existing layer filter form
        var filterForms = filterPanel.query('k-form-layerfilter');
        Ext.each(filterForms, function(panel) {
            panel.destroy();
        });

        var title = olLayer.get('name');
        var metadata = olLayer.metadata;
        var filters = Koala.util.Layer.getFiltersFromMetadata(metadata);

        filterPanel.setTitle(title);
        filterPanel.add({
            xtype: 'k-form-layerfilter',
            metadata: metadata,
            filters: filters,
            format: 'j F Y',
            layer: olLayer
        });

        view.hide();
        filterPanel.show();
    },

    /**
     * Adds the class "k-active-charting-layer" to an item
     * @param {Ext.list.TreeItem} item The tabed treelist item.
     */
    addChartingActiveClass: function(item) {
        if (!item || !item.el) {
            return false;
        }
        var itemElChartIconClass = item.el.down('.fa-bar-chart');

        if (itemElChartIconClass) {
            itemElChartIconClass
                .removeCls('k-inactive-charting-layer')
                .addCls('k-active-charting-layer');
        }
    },

    removeAllChartingActiveClasses: function() {
        var allActive = Ext.DomQuery.select('.k-active-charting-layer');
        Ext.each(allActive, function(active) {
            Ext.fly(active)
                .removeCls('k-active-charting-layer')
                .addCls('k-inactive-charting-layer');
        });
    },

    /**
     *
     */
    isLayerAllowedToSetVisible: function(layer) {
        var me = this;
        var view = me.getView();
        var map = Ext.ComponentQuery.query('basigx-component-map')[0].getMap();
        var mapLayers = map.getLayers();
        var visibleLayers = 0;

        // if maxVisibleLayers is falsy, no limitation is given
        if (!view.getMaxVisibleLayers()) {
            return true;
        }

        // only check if the layer is requested to set visible
        if (layer.getVisible()) {
            return true;
        }

        // get the actual count of visible layers in the map
        mapLayers.forEach(function(lyr) {
            if ((lyr.getSource() instanceof ol.source.Image ||
                    lyr.getSource() instanceof ol.source.Tile) &&
                    lyr.getVisible()) {
                visibleLayers++;
            }
        });

        if (visibleLayers >= view.getMaxVisibleLayers()) {
            return false;
        }

        return true;
    },

    /**
     *
     */
    getTreeListItemTpl: function() {
        var me = this;
        return new Ext.XTemplate(
            '<tpl if="this.display(values)">',
                '<div class="tree-item-tools">',
                  '<span class="left-items">',
                    '<i class="fa fa-arrow-up up-icon" style="color:#157fcc;"></i>',
                    '<i class="fa fa-arrow-down down-icon" style="color:#157fcc;"></i>',
                  '</span>',
                  '<tpl if="this.allowOpacityChange(values)">',
                    '<span class="centered-items">',
                      '<input type="range" id="slider_{id}"/>',
                    '</span>',
                  '</tpl>',
                  '<span class="right-items">',
                      '<tpl if="this.isRemovable(values)">',
                          '<i class="fa fa-times" style="color:#157fcc;"></i>',
                      '</tpl>',
                      '<tpl if="this.allowShortInfo(values)">',
                          '<i class="fa fa-info-circle info" style="color:#157fcc;"></i>',
                      '</tpl>',
                  '</span>',
                '</div>',
                '<div>',
                  '<tpl if="this.isVisible(values)">',
                      '<i class="fa fa-eye" style="color:#157fcc;"></i> {text}',
                  '<tpl else>',
                      '<i class="fa fa-eye-slash" style="color:#808080;"></i> {text}',
                  '</tpl>',
                  '<tpl if="this.isChartableLayer(values)">',
                      ' <i class="fa fa-bar-chart ',
                      '<tpl if="this.isCurrentChartingLayer(values)">',
                          ' k-active-charting-layer',
                      '<tpl else>',
                          ' k-inactive-charting-layer',
                      '</tpl>',
                      '"></i>',
                  '</tpl>',
                  '<tpl if="this.getFilterText(values)">',
                      '</br>',
                      '<div class="legend-filter-text" style="">{[this.getFilterText(values)]}</div>',
                  '</tpl>',
                  '<img style="display:none; max-width:80%; margin-left:20px;" src="{[this.getLegendGraphicUrl(values)]}"></img>',
                '</div>',
            '</tpl>',
             {
                display: function(layer) {
                    return (layer.get(
                        BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER
                    ) !== false);
                },
                isVisible: function(layer) {
                    return layer.getVisible();
                },
                getFilterText: function(layer) {
                    return Koala.util.Layer.getFiltersTextFromMetadata(layer.metadata);
                },
                allowShortInfo: function(layer) {
                    return layer.get('allowShortInfo') || false;
                },
                allowOpacityChange: function(layer) {
                    return layer.get('allowOpacityChange') || false;
                },
                isRemovable: function(layer) {
                    return layer.get('allowRemoval') || false;
                },
                getLegendGraphicUrl: function(layer) {
                    return Koala.util.Layer.getCurrentLegendUrl(layer);
                },
                isChartableLayer: function(layer) {
                    return Koala.util.Layer.isChartableLayer(layer);
                },
                isCurrentChartingLayer: function(layer) {
                    return me.activeChartingLayer === layer;
                }
            }
        );
    },

    /**
     * Event listener for a slider to set the opacity on a given layer.
     *
     * @param {ol.layer.Base} layer The given layer
     * @param {Event} event The change event.
     */
    onSliderChange: function(layer, event) {
        var slider = event.target;
        var opacity = slider.value / 100;
        layer.setOpacity(opacity);
    },

    /**
     * This changes the order of a given layer by a specfic integer.
     * e.G.:
     *  "-1" move the layer behind its underlying layer
     *  "1" raises the layer above his overlying layer
     *
     * @param {ol.layer.Base} layer The layer of which we want to change the
     *                              order.
     * @param {Integer} orderInt A Number by which we want to change the order
     *                           of the layer. E.g. "-1" to decrease by one.
     */
    changeLayerOrder: function(layer, orderInt) {
        var me = this;
        var map = Ext.ComponentQuery.query('basigx-component-map')[0].getMap();
        var layersCollection = map.getLayerGroup().getLayers();
        var collectionLength = layersCollection.getLength();
        var index;

        layersCollection.forEach(function(l, idx) {
            if (l === layer) {
                index = idx;
            }
        });
        var newIndex = index + orderInt;

        // If layer should be moved under the lowest layer, make it the lowest
        // layer
        newIndex = newIndex <= 0 ? 0 : newIndex;

        // If layer should be moved over the most top layer, make it the topmost
        // layer
        newIndex = newIndex >= collectionLength ? collectionLength - 1: newIndex;

        if (index !== newIndex) {
            layersCollection.removeAt(index);
            layersCollection.insertAt(newIndex, layer);
        }

        // This refreshes the templates of the records
        me.setInitialCheckStatus();
    },

    /**
     * Shows the layer metadata info panel.
     * @param {ol.layer.Base} layer The layer of which we want to show the
     *                              the info.
     */
    showLayerInfo: function(layer) {
        var view = this.getView();
        var metadataInfoPanel = view.up('app-main').down('k-panel-mobilemetadatainfo');

        var cql = "Identifier = '" + layer.metadata.id + "'";
        var metadataStore = Ext.create('Koala.store.MetadataSearch');
        metadataStore.getProxy().setExtraParam('constraint', cql);
        metadataStore.on('load', function(store, recs) {
            var rec = recs && recs[0];
            if (rec && metadataInfoPanel) {
                var vm = metadataInfoPanel.getViewModel();
                var fieldNames = Koala.view.panel.MobileMetadataInfo.fieldNames;
                var data = [];

                Ext.Object.each(fieldNames, function(key, value) {
                    data.push({
                        'key': value,
                        'value': rec.get(key)
                    });
                });

                vm.set('name', rec.get('name'));
                vm.set('data', data);
                metadataInfoPanel.show();
            }
            Ext.defer(metadataStore.destroy, 1000, metadataStore);
        }, this, {single: true});
        metadataStore.load();
    },

    /**
     *
     */
    removeLayer: function(layer) {
        var me = this;
        var viewModel = me.getViewModel();
        var map = Ext.ComponentQuery.query('basigx-component-map')[0].getMap();

        Ext.Msg.show({
            title: viewModel.get('removeLayerMsgBoxTitle'),
            message: Ext.String.format(
                    viewModel.get('removeLayerMsgBoxMessage'),
                    layer.get('name')),
            buttons: [{
                text: viewModel.get('removeLayerMsgBoxYesBtnText')
            },{
                text: viewModel.get('removeLayerMsgBoxNoBtnText')
            }],
            fn: function(btnId) {
                if (btnId === viewModel.get('removeLayerMsgBoxYesBtnText')) {
                    map.removeLayer(layer);
                }
            }
        });
    }

});
