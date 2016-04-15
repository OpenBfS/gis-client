/*global window*/
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
 * @class Koala.view.panel.RoutingLegendTree
 */
Ext.define("Koala.view.panel.RoutingLegendTree", {
    extend: "BasiGX.view.panel.LegendTree",
    xtype: "k-panel-routing-legendtree",

    requires: [
        "Koala.store.MetadataSearch",
        "Koala.util.Layer",
        "Koala.view.panel.RoutingLegendTreeController",
        "Koala.view.panel.RoutingLegendTreeModel",
        "Koala.view.window.MetadataInfo"
    ],

    controller: "k-panel-routing-legendtree",

    viewModel: {
        type: "k-panel-routing-legendtree"
    },

    config: {
        routingEnabled: false,
        selModel: {
            allowDeselect: true,
            mode: "SINGLE"
        }
    },

    hasRoutingListeners: false,

    listeners: {
        selectionchange: 'onSelectionChange',
        beforerender: 'bindUtcBtnToggleHandler',
        beforedestroy: 'unbindUtcBtnToggleHandler'
    },

    statics: {
        findByProp: function(arr, key, val){
            var item = null;
            Ext.each(arr, function(obj){
                if (obj[key] && obj[key] === val) {
                    item = obj;
                    return false; // stop early
                }
            });
            return item;
        },

        reorganizeMenu: function(comp){
            var olLayer = comp.layerRec.getOlLayer();

            var allowShortInfo = olLayer.get('allowShortInfo') || false;
            var allowDownload = olLayer.get('allowDownload') || false;
            var allowRemoval = olLayer.get('allowRemoval') || false;
            var allowOpacityChange = olLayer.get('allowOpacityChange') || false;
            var hasLegend = olLayer.get('hasLegend') || false;

            var shortInfoBtn = comp.down('button[name="shortInfo"]');
            var downloadBtn = comp.down('button[name="download"]');
            var removalBtn = comp.down('button[name="removal"]');
            var opacitySlider = comp.down('slider[name="opacityChange"]');
            var legend = comp.up().down('image[name="legend"]');

            if(shortInfoBtn){
                shortInfoBtn.setVisible(allowShortInfo);
            }
            if(downloadBtn){
                downloadBtn.setVisible(allowDownload);
            }
            if(removalBtn){
                removalBtn.setVisible(allowRemoval);
            }
            if(opacitySlider){
                opacitySlider.setVisible(allowOpacityChange);
            }
            if(legend){
                legend.setVisible(hasLegend);
            }
        },

        // getFilterText: function(record){
        //     var layer = record.getOlLayer();
        //     var LayerUtil = Koala.util.Layer;
        //
        //     if (!layer || !layer.metadata){
        //         return '';
        //     }
        //     return LayerUtil.getFiltersTextFromMetadata(layer.metadata);
        // },

        shortInfoHandler: function(btn){
            var record = btn.layerRec;
            var cql = "Identifier = '" + record.get('metadata').id + "'";
            var metadataStore = Ext.create('Koala.store.MetadataSearch');
            metadataStore.getProxy().setExtraParam('constraint', cql);
            metadataStore.on('load', function(store, recs) {
                var rec = recs && recs[0];
                if (rec) {
                    Ext.create('Koala.view.window.MetadataInfo', {
                        title: rec.get('name'),
                        layout: 'fit',
                        record: rec
                    }).show();
                }
                Ext.defer(metadataStore.destroy, 1000, metadataStore);
            }, this, {single: true});
            metadataStore.load();
        },

        removalHandler: function(btn){
            var layer = btn.layerRec.getOlLayer();
            var map = Ext.ComponentQuery.query('basigx-component-map')[0]
                .getMap();

            Ext.Msg.show({
                title: 'Info',
                message: 'Layer <b>' + layer.get('name') +
                    '</b> aus Karte entfernen?',
                buttonText: {
                    yes: "Ja",
                    no: "Nein"
                },
                fn: function(btnId){
                    if(btnId === "yes"){
                        map.removeLayer(layer);
                    }
                }
            });
        },

        downloadHandler: function(btn){
            var layer = btn.layerRec.getOlLayer();

            Ext.Msg.show({
                title: 'Info',
                message: 'Daten zu <b>' + layer.get('name') +
                    '</b> runterladen?',
                buttonText: {
                    yes: "Ja",
                    no: "Nein"
                },
                fn: function(btnId){
                    if(btnId === "yes"){
                        var url = Koala.util.Layer.getDownloadUrlWithFilter(
                                layer
                            );
                        window.open(url, '_blank');
                    }
                }
            });
        },

        sliderChangeHandler: function(slider, newValue){
            var layer = slider.layerRec.getOlLayer();
            layer.setOpacity(newValue / 100);
        },

        initializeOpacityVal: function(slider){
            var layer = slider.layerRec.getOlLayer();
            slider.setValue(layer.getOpacity() * 100);
        }
    },

    rowBodyCompTemplate: {
        xtype: 'container',
        name: 'legend-tree-row-component',
        scrollable: true,
        items: [ {
            xtype: 'container',
            layout: 'hbox',
            defaults: {
                margin: '0 5px 0 0'
            },
            listeners: {
                // We'll assign a handler to reorganize the menu once the
                // class is defined.
            },
            items: [{
                xtype: 'button',
                name: 'shortInfo',
                glyph: 'xf05a@FontAwesome',
                tooltip: 'Layerinformationen anzeigen'
                // We'll assign a handler to handle clicks here once the
                // class is defined and we can access the static methods
            }, {
                xtype: 'button',
                name: 'download',
                glyph: 'xf0c7@FontAwesome',
                tooltip: 'Daten speichern'
                // We'll assign a handler to handle clicks here once the
                // class is defined and we can access the static methods
            }, {
                xtype: 'button',
                name: 'removal',
                glyph: 'xf00d@FontAwesome',
                tooltip: 'Layer entfernen'
                // We'll assign a handler to handle clicks here once the
                // class is defined and we can access the static methods
            }, {
                xtype: 'slider',
                name: 'opacityChange',
                width: 100,
                value: 100,
                tipText: function(thumb){
                    return String(thumb.value) + '% Sichtbarkeit';
                },
                listeners: {
                    // We'll assign a handler to initialize and handle drags
                    // here once the class is defined and we can access the
                    // static methods
                }
            }]
        },
        // {
        //     xtype: 'component',
        //     name: 'filtertext',
        //     layout: 'hbox',
        //     defaults: {
        //         margin: '0 5px 0 0'
        //     },
        //     html: '{{Koala.view.panel.RoutingLegendTree.getFilterText(record)}}'
        // },
        {
            xtype: 'image',
            name: '{{record.getOlLayer().get("routeId") + "-legendImg"}}',
            margin: '5px 0 0 0',
            src: '{{' +
                'Koala.util.Layer.getCurrentLegendUrl(record.getOlLayer())' +
                '}}',
            width: '{{record.getOlLayer().get("legendWidth")}}',
            height: '{{record.getOlLayer().get("legendHeight")}}',
            alt: '{{"Legende " + record.getOlLayer().get("name")}}'
        }]
    },

    itemExpandedKey: 'koala-rowbody-expanded',

    viewConfig: {
        // TODO verbatim copied from LegendTree from BasiGX, make configurable
        plugins: { ptype: 'treeviewdragdrop' },
        getRowClass: function(record){
            return this.up().getCssForRow(record);
        },
        listeners: {
            drop: 'onLegendItemDrop'
        }
    },

    /**
     * Initialize the component.
     */
    initComponent: function() {
        var me = this;

        // call parent
        me.callParent();

        // See the comment above the constructor why we need this.
        if (me.initiallyCollapsed){
            me.on('afterlayout', function(){
                this.collapse();
            }, me, {single: true, delay: 100});
            me.initiallyCollapsed = null;
        }

        // configure rowexpanderwithcomponents-plugin
        me.plugins[0].hideExpandColumn = false;

        me.bindUpdateHandlers();
    },

    /**
     * Called at the end of the initComponent-sequence, this methods binds some
     * event handlers on various components to react on a state change there.
     * See #unbindUpdateHandlers for the unbind logic bound early in the
     * destroy sequence.
     *
     * @private
     */
    bindUpdateHandlers: function() {
        var me = this;
        // TODO this needs to be changed once we handle more than one map
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var treeView = me.getView();
        var treeStore = me.getStore();

        // Register moveend to update legendUrls
        map.on('moveend', me.updateLegendsWithScale, me);
        // Ensure a previous selection is kept after datachange
        treeStore.on('datachanged', me.layerDataChanged, me);
        // store data on collapse/expand, and use it on drop to keep the
        // expoanded collapsed state after drag and drop
        treeView.on({
            collapsebody: me.onCollapseBody,
            expandbody: me.onExpandBody,
            drop: me.layerDropped,
            scope: me
        });

        // also bind our own unregistering here.
        me.on('beforedestroy', me.unbindUpdateHandlers, me, {single: true});
    },

    /**
     * Unbind the handlers that were bound in #bindUpdateHandlers during the
     * initComponent sequence.
     *
     * @private
     */
    unbindUpdateHandlers: function(){
        var me = this;
        // TODO this needs to be changed once we handle more than one map
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var treeView = me.getView();
        var treeStore = me.getStore();

        // unbind repaintLayerFilterIndication from the individually added
        // layers
        treeStore.each(function(layerNode) {
            var ns = Koala.util.Layer;
            var layer = layerNode.getOlLayer();
            layer.un('change:visible', ns.repaintLayerFilterIndication, ns);
        });

        // Unregister moveend to update legendUrls
        map.un('moveend', me.updateLegendsWithScale, me);
        treeStore.un('datachanged', me.layerDataChanged, me);
        treeView.un({
            collapsebody: me.onCollapseBody,
            expandbody: me.onExpandBody,
            drop: me.layerDropped,
            scope: me
        });
    },

    /**
     * Whenever a rowbody collapses, store the current state.
     *
     * @param {HTMLElement} rowNode The `tr` element owning the expanded row.
     * @param {Ext.data.Model} record The record providing the data.
     */
    onCollapseBody: function(rowNode, record){
        record.set(this.itemExpandedKey, false);
    },

    /**
     * Whenever a rowbody expands, store the current state.
     *
     * @param {HTMLElement} rowNode The `tr` element owning the expanded row.
     * @param {Ext.data.Model} record The record providing the data.
     */
    onExpandBody: function(rowNode, record){
        record.set(this.itemExpandedKey, true);
    },

    /**
     * Restore the complete collapsed / expanded state of all rowbodies of the
     * panel by cascading down the tree and double toggling all candidates. If
     * someone finds a better and API-conformant way, that'd be great.
     */
    layerDropped: function(){
        var me = this;
        var view = me.getView();
        var rowExpanderPlugin = me.getPlugin();
        var rootNode = me.getRootNode();
        var itemExpandedKey = me.itemExpandedKey;
        rootNode.cascadeBy({
            before: function(child) {
                var idx = view.indexOfRow(child);
                var targetState = child.get(itemExpandedKey);
                if (idx !== -1 && Ext.isDefined(targetState)) {
                    rowExpanderPlugin.toggleRow(idx, child);
                    rowExpanderPlugin.toggleRow(idx, child);
                }
            },
            scope: me
        });
    },

    /**
     * When the store has changed (because e.g. a layer was added), we need to
     * do certain things to have a sane state with regard to for example
     * hovering which is reconfigured on selection change on our side.
     */
    layerDataChanged: function() {
        var me = this;
        var selection = me.getSelection();
        // nothing to do if the selection is empty.
        if (Ext.isEmpty(selection)) {
            return;
        }
        var selModel = me.getSelectionModel();
        // Here is what we do:
        // 1) unselect all records, but suppress event handler notification
        selModel.deselectAll(true);
        // 2) select what was previously selected, and trigger the hovering
        //    configurator elsewhere
        selModel.select(selection);
    },

    updateLegendsWithScale: function () {
        var store = this.getStore();
        store.each(function (rec) {
            var layer = rec.getOlLayer();
            var selector = '[name=' + layer.get("routeId") + '-legendImg]';
            var img = Ext.ComponentQuery.query(selector)[0];

            if (img) {
                img.setSrc(Koala.util.Layer.getCurrentLegendUrl(layer));
            }
        });
    },

    applyRoutingEnabled: function(newVal){
        var me = this;
        var controller = me.getController();
        var store = me.getStore();

        if (newVal && !me.hasRoutingListeners) {
            store.on('update', controller.setRouting, controller);
            store.on('datachange', controller.setRouting, controller);
            // controller.setRouting.call(controller, store);
            me.hasRoutingListeners = true;
        } else if (me.hasRoutingListeners){
            store.un('update', controller.setRouting, controller);
            store.un('datachange', controller.setRouting, controller);
            me.hasRoutingListeners = false;
        }
        return newVal;
    }

}, function(cls) {
    // bind the various handlers now that we have access to the static methods
    var layerMenuCfg = cls.prototype.rowBodyCompTemplate.items[0];
    var menuItems = layerMenuCfg.items;

    var infoBtnCfg = cls.findByProp(menuItems, 'name', 'shortInfo');
    var downloadBtnCfg = cls.findByProp(menuItems, 'name', 'download');
    var removalBtnCfg = cls.findByProp(menuItems, 'name', 'removal');
    var opacitySliderCfg = cls.findByProp(menuItems, 'name', 'opacityChange');

    if (layerMenuCfg) {
        layerMenuCfg.listeners.beforerender = cls.reorganizeMenu;
    }
    if (infoBtnCfg) {
        infoBtnCfg.handler = cls.shortInfoHandler;
    }
    if (downloadBtnCfg) {
        downloadBtnCfg.handler = cls.downloadHandler;
    }
    if (removalBtnCfg) {
        removalBtnCfg.handler = cls.removalHandler;
    }
    if (opacitySliderCfg) {
        opacitySliderCfg.listeners.change = cls.sliderChangeHandler;
        opacitySliderCfg.listeners.afterrender = cls.initializeOpacityVal;
    }

});
