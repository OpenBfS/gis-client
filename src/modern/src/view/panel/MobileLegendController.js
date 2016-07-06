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

    /**
     *
     */
    onInitialize: function() {
        var me = this;
        me.createTreeList();
    },

    /**
     *
     */
    onShow: function() {
        var me = this;
        me.setInitialCheckStatus();
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
            layerGroup: Ext.ComponentQuery.query('basigx-component-map')[0].getMap().getLayerGroup(),
            filters: [
                function(rec) {
                    var layer = rec.getOlLayer();
                    var showKey = 'bp_displayInLayerSwitcher';
                    if (layer.get(showKey) === false) {
                        return false;
                    }
                    return true;
                }
            ]
        });

        treePanel = Ext.create('Ext.list.Tree', {
            store: treeStore,
            width: 'calc(80vw)',
            listeners: {
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
     *
     */
    onTreeItemTap: function(evt, target) {
        var me = this;
        var view = me.getView();
        var treeList = view.down('treelist');
        var selection = treeList.getSelection();
        var layer = selection ? selection.getOlLayer() : null;

        if(!target.getAttribute("class")){
            return false;
        }

        if(target.getAttribute("class").indexOf("fa-times") > 0){
            me.removeLayer(layer);
            return false;
        }

        if (target.getAttribute("class").indexOf("fa-eye") > 0){
            if (layer && layer instanceof ol.layer.Layer) {
                layer.setVisible(!layer.getVisible());
                me.setTreeItemCheckStatus(treeList.getItem(selection));
            }
            return false;
        }

        if (target.getElementsByTagName("img").length > 0) {
            var legend = target.getElementsByTagName("img")[0];
            if (legend.style.display === 'none') {
                legend.style.display = 'inherit';
            } else {
                legend.style.display = 'none';
            }
        }
    },

    /**
     *
     */
    getTreeListItemTpl: function() {
        var me = this;

        return new Ext.XTemplate(
            '<tpl if="this.isVisible(values)">',
                '<i class="fa fa-eye" style="color:#157fcc;"></i> {text}',
            '<tpl else>',
                '<i class="fa fa-eye-slash" style="color:#808080;"></i> {text}',
            '</tpl>',
            '<tpl if="this.isChartingLayer(values)">',
                ' <i class="fa fa-bar-chart"></i>',
            '</tpl>',
            '<tpl if="this.isRemovable(values)">',
                '<span style="float:right"><i class="fa fa-times" style="color:#157fcc;"></i></span>',
            '</tpl>',
            '<tpl if="this.getFilterText(values)">',
                '<div style="color:#666; margin-left:20px; white-space:pre-line;">{[this.getFilterText(values)]}</div>',
            '</tpl>',
            '<img style="display:none; max-width:80%; margin-left:20px;" src="{[this.getLegendGraphicUrl(values)]}"></img>',
             {
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
                isChartingLayer: function(layer) {
                    // TODO: set layer property accordingly
                    return !!layer.hasActiveChart;
                }
            }
        );
    },

    /**
     *
     */
    removeLayer: function(layer){
        var map = Ext.ComponentQuery.query('basigx-component-map')[0].getMap();

        Ext.Msg.show({
            title: 'Info',
            message: 'Layer <b>' + layer.get('name') +
                '</b> aus Karte entfernen?',
            buttons: [{
                text: "Ja"
            },{
                text: "Nein"
            }],
            fn: function(btnId){
                if(btnId === "Ja"){
                    map.removeLayer(layer);
                }
            }
        });
    }

});
