Ext.define('Koala.view.panel.LayerSetTreeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-layersettree',

    requires: ['BasiGX.view.panel.MobileWindow'],

    currentTask: null,

    onShow: function() {
        var me = this;
        var view = me.getView();
        var treeList = view.down('treelist');

        // try to load layerprofile from appContext
        var appContext = BasiGX.view.component.Map.guess().appContext;
        var merge = appContext.data.merge;
        var urls = merge.urls;
        var layerSetUrl = urls['layerset'] ? urls['layerset'] : 'classic/resources/layerset.json';

        if (!view.down('treelist').getStore()) {
            var treeStore = Ext.create('Ext.data.TreeStore', {
                proxy: {
                    type: 'ajax',
                    url: layerSetUrl,
                    reader: {
                        type: 'json'
                    }
                },
                listeners: {
                    load: me.onTreeStoreLoad,
                    scope: me
                }
            });
            treeList.setStore(treeStore);
            treeStore.load();
        }
    },

    onTreeStoreLoad: function(store) {
        var me = this;
        var view = me.getView();
        var treeList = view.down('treelist');
        store.each(function(rec) {
            if (rec.get('text') === 'RODOS-Prognosen') {
                var item = treeList.getItem(rec);
                var iconEl = item.el.query('.x-treelist-item-icon')[0];
                iconEl.style.left = 'inherit';
                iconEl.style.right = '10px';
                iconEl.innerHTML = '<i id="rodos-filter-button" class="x-fa fa-filter"></i>';
                return false;
            }
        });
    },

    clearTask: function() {
        var me = this;
        var task = me.currentTask;
        if (task && task.cancel) {
            task.cancel();
            me.currentTask = null;
        }
    },

    /**
     * Called on singletap, this methdos sets up a delayed handler which may
     * show the layerfilter window.
     *
     * @param {Ext.event.Event} event The Ext.event.Event event
     *                                encapsulating the DOM event.
     * @param {HTMLElement} node The target of the tap.
     */
    setupShowFilterWinCheck: function(event, node) {
        var me = this;
        var treelist = me.getView().down('treelist');
        me.clearTask();
        var selection = treelist.getSelection();
        me.currentTask = new Ext.util.DelayedTask(function() {
            if (selection && selection.isLeaf()) {
                Koala.util.Layer.getMetadataFromUuidAndThen(
                    selection.get('uuid'), me.showChangeFilterSettingsWin.bind(me));
            }
            if (selection.get('text') === 'RODOS-Prognosen' &&
                    node.id === 'rodos-filter-button') {
                me.showRodosFilterPanel();
            }
        });
        me.currentTask.delay(200);
    },

    showRodosFilterPanel: function() {
        var view = this.getView();
        view.up('app-main').down('[name=rodosContainer]').show();
    },

    addLayerWithDefaultFilters: function() {
        // TODO if we want equal behaviour for sets and profiles, the
        //      changes from https://redmine-koala.bfs.de/issues/1445
        //      we have to share the logic in LayerSetChooserController
        //      method addLayers (`visible` setting)
        var me = this;
        me.clearTask();
        var treelist = this.getView().down('treelist');
        var selection = treelist.getSelection();
        if (selection) {
            if (selection.isLeaf()) {
                Koala.util.Layer.addLayerByUuid(selection.get('uuid'));
            } else {
                selection.eachChild(function(layer) {
                    Koala.util.Layer.addLayerByUuid(layer.get('uuid'));
                });
            }
        }
    },

    showChangeFilterSettingsWin: function(metadata) {
        var view = this.getView();
        var filters = Koala.util.Layer.getFiltersFromMetadata(metadata);

        var treelist = this.view.down('treelist');

        var currentSelection = treelist.getSelection();
        var title = currentSelection ?
            currentSelection.data.text :
            metadata.dspText;

        // only allow one filter-window to be open
        var filterPanels = Ext.ComponentQuery.query('k-form-layerfilter');
        Ext.each(filterPanels, function(panel) {
            panel.destroy();
        });

        var filterContainer = view.up('app-main').down('[name=filterContainer]');

        filterContainer.setTitle(title);
        filterContainer.add({
            xtype: 'k-form-layerfilter',
            metadata: metadata,
            filters: filters,
            format: 'j F Y'
        });

        filterContainer.show();
    }
});
