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
        },
        hasCollapseAllBtn: true,
        hasExpandAllBtn: true,
        hasToggleAllBtn: false,
        hasRemoveAllLayersBtn: true,
        textProperty: 'nameWithSuffix'
    },

    hasRoutingListeners: false,

    listeners: {
        selectionchange: 'onSelectionChange',
        beforerender: 'bindUtcBtnToggleHandler',
        beforedestroy: 'unbindUtcBtnToggleHandler'
    },

    statics: {
        /**
         * This object holds the names for certain model fields we use to
         * communicate the loading status of certain layers. The fields will
         * be set on the `GeoExt.data.model.LayerTreeNode`-instances.
         */
        FIELDAMES_LOAD_INDICATION: {
            /**
             * Whether we have already bound listeners to this LayerTreeNode.
             * Needed so we don't bind multiple times and to see if there is
             * anythin we need to remove once the record is removed from the
             * store.
             */
            IS_BOUND: '__load_indication_bound',
            /**
             * An array of Keys of the event handlers we need to remove added
             * handlers when they are no longer needed.
             */
            LISTENER_KEYS: '__load_indication_keys',
            /**
             * The name of the field we set to true once loading starts; and to
             * false, once we are done loading. Already provided by ExtJS.
             */
            IS_LOADING: 'loading'
        },

        /**
         * Returns the prefix which should be used for the source when one wants
         * to bind to the load events.
         *
         * @param {ol.source.Source} source The source to determine the
         *   loadevent prefix for.
         * @return {String} The prefix for the load event; can be either
         *   `'tile'`, `'image'` (OpenLayers) or `'vector'` (our own).
         */
        getLoadEventPrefixBySource: function(source) {
            var prefix;
            if (!source) {
                return prefix;
            }

            if (source instanceof ol.source.Tile) {
                // E.g. TileWMS, XYZ, …
                prefix = 'tile';
            } else if (source instanceof ol.source.Image) {
                // E.g. ImageWMS, …
                prefix = 'image';
            } else if (source instanceof ol.source.Vector) {
                // These events are fired by ourself, not from OpenLayers. See the
                // method Koala.util.Layer#getInternalSourceConfig where we setup a
                // `loader` function with appropriate callbacks dispatching the
                // vectorloadstart / … events.
                prefix = 'vector';
            }
            return prefix;
        },

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
            var allowChangeFilter = olLayer.metadata || false;
            var allowDownload = olLayer.get('allowDownload') || false;
            var allowRemoval = olLayer.get('allowRemoval') || false;
            var allowStyle = olLayer instanceof ol.layer.Vector;
            var allowOpacityChange = olLayer.get('allowOpacityChange') || false;
            var hasLegend = olLayer.get('hasLegend') || false;

            var shortInfoBtn = comp.down('button[name="shortInfo"]');
            var changeFilterBtn = comp.down('button[name="filter"]');
            var downloadBtn = comp.down('button[name="download"]');
            var removalBtn = comp.down('button[name="removal"]');
            var styleBtn = comp.down('button[name="style"]');
            var opacitySlider = comp.down('slider[name="opacityChange"]');
            var legend = comp.up().down('image[name="' + olLayer.get("routeId") + '-legendImg"]');

            if(shortInfoBtn){
                shortInfoBtn.setVisible(allowShortInfo);
            }
            if(changeFilterBtn) {
                changeFilterBtn.setVisible(allowChangeFilter);
            }
            if(downloadBtn){
                downloadBtn.setVisible(allowDownload);
            }
            if(removalBtn){
                removalBtn.setVisible(allowRemoval);
            }
            if(styleBtn){
                styleBtn.setVisible(allowStyle);
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

        changeFilterHandler: function(btn){
            var record = btn.layerRec;
            var layer = btn.layerRec.getOlLayer();
            Koala.util.Layer.showChangeFilterSettingsWin(
                record.get('metadata'), layer
            );
        },

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

        styleHandler: function(btn){
            var layer = btn.layerRec.getOlLayer();
            var win = Ext.ComponentQuery.query('[name=style-layer]')[0];
            if(!win){
                Ext.create('Ext.window.Window', {
                    name: 'style-layer',
                    title: 'Layer Style',
                    width: 800,
                    height: 450,
                    layout: 'fit',
                    items: [{
                        xtype: 'k_container_styler_styler',
                        viewModel:{
                            data: {
                                layer: layer
                            }
                        }
                    }]
                }).show();
            } else {
                BasiGX.util.Animate.shake(win);
            }
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
                name: 'filter',
                glyph: 'xf0b0@FontAwesome',
                tooltip: 'Layerfilter ändern'
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
                xtype: 'button',
                name: 'style',
                glyph: 'xf1fc@FontAwesome',
                tooltip: 'Layerstil anpassen'
                // We'll assign a handler to handle clicks here once the
                // class is defined and we can access the static methods
            }, {
                xtype: 'slider',
                name: 'opacityChange',
                width: 80,
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
        plugins: {
            ptype: 'treeviewdragdrop'
        },
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

        me.checkAddCollapseExpandButtons();

        // configure rowexpanderwithcomponents-plugin
        me.plugins[0].hideExpandColumn = false;

        me.bindUpdateHandlers();
        me.bindLoadIndicationHandlers();
    },

    /**
     * Checks whether we shall add any of the collapse / expand / toggle buttons
     * and also adds these as configured to the view in a footer toolbar.
     */
    checkAddCollapseExpandButtons: function() {
        var me = this;
        var hasCollapseAllBtn = me.getHasCollapseAllBtn();
        var hasToggleAllBtn = me.getHasToggleAllBtn();
        var hasExpandAllBtn = me.getHasExpandAllBtn();
        var hasRemoveAllLayersBtn = me.getHasRemoveAllLayersBtn();
        if (!hasCollapseAllBtn && !hasToggleAllBtn && !hasExpandAllBtn){
            return;
        }

        var items = [];

        if (hasCollapseAllBtn) {
            items.push(me.getModeBtnConfig('collapse'));
        }
        if (hasToggleAllBtn) {
            items.push(me.getModeBtnConfig('toggle'));
        }
        if (hasExpandAllBtn) {
            items.push(me.getModeBtnConfig('expand'));
        }
        if (hasRemoveAllLayersBtn) {
            items.push(me.getModeBtnConfig('remove-layers'));
        }

        var fbar = {
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: items
        };
        me.addDocked(fbar);
    },

    /**
     * Returns a button config for the collapse / expand / toggle button.
     *
     * @param {String} mode The mode to get a config for; either `toggle`,
     *     `expand` or `collapse`.
     * @return {Object} The button config or `undefined` in case of an illegal
     *     mode.
     * @protected
     */
    getModeBtnConfig: function(mode) {
        var me = this;
        var cfg = {
            xtype: 'button',
            scope: me
        };
        switch(mode) {
            case 'collapse':
                cfg.glyph = 'xf147@FontAwesome';
                cfg.bind = {
                    text: '{btnTxtCollapseAll}',
                    tooltip: '{btnTooltipCollapseAll}'
                };
                cfg.handler = me.collapseAllBodies;
                break;
            case 'toggle':
                cfg.glyph = 'xf074@FontAwesome';
                cfg.bind = {
                    text: '{btnTxtToggleAll}',
                    tooltip: '{btnTooltipToogleAll}'
                };
                cfg.handler = me.toggleAllBodies;
                break;
            case 'expand':
                cfg.glyph = 'xf196@FontAwesome';
                cfg.bind = {
                    text: '{btnTxtExpandAll}',
                    tooltip: '{btnTooltipExpandAll}'
                };
                cfg.handler = me.expandAllBodies;
                break;
            case 'remove-layers':
                cfg.glyph = 'xf1f8@FontAwesome';
                cfg.bind = {
                    text: '{btnTxtRemoveAllLayers}',
                    tooltip: '{btnTooltipRemoveAllLayers}'
                };
                cfg.handler = me.removeAllLayers;
                break;
            default:
                Ext.log.warn('Unexpected mode for btn config ' + mode);
                return;
        }
        return cfg;
    },

    /**
     * Removes all activated layers with 'allowRemoval=true' from the map.
     */
    removeAllLayers: function(){
        var viewModel = this.getViewModel();
        var store = this.getStore();
        var map = Ext.ComponentQuery.query('basigx-component-map')[0]
            .getMap();
        var layersToRemove = [];

        Ext.Msg.confirm(
            viewModel.get('confirmTitleRemoveAllLayersAll'),
            viewModel.get('confirmMsgRemoveAllLayers'),
            function(btnId){
                if(btnId === "yes"){
                    store.each(function(rec){
                        var layer = rec.getOlLayer();
                        if(layer.get("allowRemoval")){
                            layersToRemove.push(layer);
                        }
                    });

                    Ext.each(layersToRemove, function(layer){
                        map.removeLayer(layer);
                    });
                }
        });

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
        // expanded / collapsed state after drag and drop
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
     * `initComponent` sequence.
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
     * Called at the end of the initComponent-sequence, this methods binds some
     * event handlers, that set the `loading` field of the layer records to
     * `true` while tiles / images are loading via OpenLayers.
     *
     * @private
     */
    bindLoadIndicationHandlers: function() {
        var me = this;
        var store = me.getStore();
        // First the initial state
        store.each(me.bindLoadIndicationToRecord, me);
        store.on({
            add: me.handleLayerStoreAdd,
            remove: me.handleLayerStoreRemove,
            scope: me
        });
        me.on('beforedestroy', me.unbindLoadIndicationHandlers, me, {
            single: true
        });
    },

    /**
     * Unbind the handlers that were bound in #bindLoadIndicationHandlers during
     * the `initComponent` sequence.
     *
     * @private
     */
    unbindLoadIndicationHandlers: function(){
        var me = this;
        var store = me.getStore();
        store.each(me.unbindLoadIndicationFromRecord, me);
        store.un({
            add: me.handleLayerStoreAdd,
            remove: me.handleLayerStoreRemove,
            scope: me
        });
    },

    /**
     * Bound as handler for the `add`-event of the store, this method modifies
     * the `text` of the displayed record and binds listeners to all added
     * records to show whether they are loading. See also the method
     * #bindLoadIndicationToRecord.
     *
     * @param {GeoExt.data.store.LayersTree} store The store to which the
     *   records have been added.
     * @param {Array<GeoExt.data.model.LayerTreeNode>} recs The layer records
     *   which were added.
     * @private
     */
    handleLayerStoreAdd: function(store, recs) {
        // Replace the text of the treerecords with the configured textProperty
        // to enable the filter logic
        var textProperty = this.getTextProperty();
        if (textProperty) {
            Ext.each(recs, function(layerRec){
                var layer = layerRec.getOlLayer();
                layerRec.set('text', layer.get(textProperty));
            });
        }
        Ext.each(recs, this.bindLoadIndicationToRecord, this);
    },

    /**
     * Bound as handler for the `remove`-event of the store, this method unbinds
     * listeners that were added via #bindLoadIndicationToRecord. See also the
     * method #unbindLoadIndicationFromRecord.
     *
     * @param {GeoExt.data.store.LayersTree} store The store from which the
     *   records have been removed.
     * @param {Array<GeoExt.data.model.LayerTreeNode>} recs The layer records
     *   which were removed.
     * @private
     */
    handleLayerStoreRemove: function(store, recs) {
        Ext.each(recs, this.unbindLoadIndicationFromRecord, this);
    },

    /**
     * Given a layer-record, this method will bind listeners (only once), on the
     * layers' source to update the field `loading` of the layer-record. In case
     * of an load-error, the `visible` field of the layer will be set to false.
     *
     * @param {GeoExt.data.model.LayerTreeNode} rec The layer record for which
     *   we want to setup load-indication.
     * @private
     */
    bindLoadIndicationToRecord: function(rec) {
        var me = this;
        var staticMe = me.self;
        var fieldNames = staticMe.FIELDAMES_LOAD_INDICATION;
        var fieldnameLoadIndicationBound = fieldNames.IS_BOUND;
        var fieldnameLoadIndicationKeys = fieldNames.LISTENER_KEYS;
        var fieldnameLoadIndicationLoading = fieldNames.IS_LOADING;
        if (rec.get(fieldnameLoadIndicationBound) === true) {
            // already bound for this record, exiting…
            return;
        }
        var layer = rec.getOlLayer();
        var source = layer && layer.getSource();

        if (!source) {
            // Rather unlikely but who knows…
            Ext.log.warn('Unable to determine a source for load indication');
            return;
        }

        var evtPrefix = staticMe.getLoadEventPrefixBySource(source);

        if (!evtPrefix) {
            // Rather unlikely but who knows…
            Ext.log.warn('Unable to determine event for load indication');
            return;
        }

        // These are the plain handlers that will work on both the layer record
        // and on the layer itself.
        var loadStartFunc = function() {
            rec.set(fieldnameLoadIndicationLoading, true);
            var row = Ext.get(me.getView().getRowByRecord(rec));
            if (row) {
                row.removeCls('k-loading-failed');
            }
            me.layerDropped(); // restores collapsed/expanded state
        };
        var loadEndFunc = function() {
            rec.set(fieldnameLoadIndicationLoading, false);
            me.layerDropped(); // restores collapsed/expanded state
        };
        var loadErrorFunc = function() {
            loadEndFunc();
            layer.set('visible', false);
            var row = Ext.get(me.getView().getRowByRecord(rec));
            if (row) {
                var task = new Ext.util.DelayedTask(function(){
                    row.addCls('k-loading-failed');
                });
                task.delay(150);
            }
        };

        // buffer the loadEnd function, so that the loading indicator doesn't
        // 'flicker'
        var bufferedLoadEndFunc = Ext.Function.createBuffered(loadEndFunc, 250);

        // Here comes the actual binding to the appropriate events:
        var startKey = source.on(evtPrefix + 'loadstart', loadStartFunc);
        var endKey = source.on(evtPrefix + 'loadend', bufferedLoadEndFunc);
        var errorKey = source.on(evtPrefix + 'loaderror', loadErrorFunc);

        // Set the internal flags that loading indication is bound and the
        // associated event keys.
        rec.set(fieldnameLoadIndicationBound, true);
        rec.set(fieldnameLoadIndicationKeys, [startKey, endKey, errorKey]);
    },

    /**
     * Given a layer-record, this method will unbind listeners that might have
     * been bound by #bindLoadIndicationToRecord.
     *
     * @param {GeoExt.data.model.LayerTreeNode} rec The layer record for which
     *   we want to destroy load-indication.
     * @private
     */
    unbindLoadIndicationFromRecord: function(rec) {
        var staticMe = Koala.view.panel.RoutingLegendTree;
        var fieldNames = staticMe.FIELDAMES_LOAD_INDICATION;
        var fieldnameLoadIndicationBound = fieldNames.IS_BOUND;
        var fieldnameLoadIndicationKeys = fieldNames.LISTENER_KEYS;
        if (rec.get(fieldnameLoadIndicationBound) !== true) {
            return;
        }
        var listenerKeys = rec.get(fieldnameLoadIndicationKeys);
        if (Ext.isArray(listenerKeys)) {
            Ext.each(listenerKeys, function(listenerKey) {
                ol.Observable.unByKey(listenerKey);
            });
        }
        rec.set(fieldnameLoadIndicationBound, false);
        rec.set(fieldnameLoadIndicationKeys, []);
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
        var rowExpanderPlugin = me.getPlugin('rowexpanderwithcomponents');
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
        Koala.util.Layer.repaintLayerFilterIndication();
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
            if (img && img.el && img.el.dom) {
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

    var filterBtnCfg = cls.findByProp(menuItems, 'name', 'filter');
    var infoBtnCfg = cls.findByProp(menuItems, 'name', 'shortInfo');
    var downloadBtnCfg = cls.findByProp(menuItems, 'name', 'download');
    var removalBtnCfg = cls.findByProp(menuItems, 'name', 'removal');
    var styleBtnCfg = cls.findByProp(menuItems, 'name', 'style');
    var opacitySliderCfg = cls.findByProp(menuItems, 'name', 'opacityChange');

    if (layerMenuCfg) {
        layerMenuCfg.listeners.beforerender = cls.reorganizeMenu;
    }
    if (filterBtnCfg) {
        filterBtnCfg.handler = cls.changeFilterHandler;
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
    if (styleBtnCfg) {
        styleBtnCfg.handler = cls.styleHandler;
    }
    if (opacitySliderCfg) {
        opacitySliderCfg.listeners.change = cls.sliderChangeHandler;
        opacitySliderCfg.listeners.afterrender = cls.initializeOpacityVal;
    }

});
