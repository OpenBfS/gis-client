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
      if(layer){
        me.setActiveChartingLayer(layer);
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
        if(targetClass.indexOf("fa-bar-chart") > 0) {
            me.setActiveChartingLayer(layer);
        }

        if (target.getElementsByTagName("img").length > 0) {
            var legend = target.getElementsByTagName("img")[0];
            if (legend.style.display === 'none') {
                legend.style.display = 'inherit';
            } else {
                legend.style.display = 'none';
            }
        }

        if (targetClass === 'legend-filter-text') {
            me.onLegendFilterTextClick(layer);
        }
    },

    /**
     * Sets the given ol.layer.Layer as the active charting layer.
     *
     * @param {ol.layer.Layer} layer The layer to set active charting on.
     */
    setActiveChartingLayer: function(layer) {
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
        Ext.each(filterForms, function(panel){
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

    addChartingActiveClass: function(item) {
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
                '<tpl if="this.isRemovable(values)">',
                    '<span style="float:right"><i class="fa fa-times" style="color:#157fcc;"></i></span>',
                '</tpl>',
                '<tpl if="this.getFilterText(values)">',
                    '<div class="legend-filter-text" style="color:#666; margin-left:20px; white-space:pre-line;">{[this.getFilterText(values)]}</div>',
                '</tpl>',
                '<img style="display:none; max-width:80%; margin-left:20px;" src="{[this.getLegendGraphicUrl(values)]}"></img>',
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
            fn: function(btnId){
                if (btnId === viewModel.get('removeLayerMsgBoxYesBtnText')) {
                    map.removeLayer(layer);
                }
            }
        });
    }

});
