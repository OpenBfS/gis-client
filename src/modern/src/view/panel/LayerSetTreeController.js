Ext.define('Koala.view.panel.LayerSetTreeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-layersettree',

    requires: ['BasiGX.view.panel.MobileWindow'],

    onShow: function(){
        var view = this.getView();
        var viewModel = this.getViewModel();
        var mapComponent = view.up('app-main').down('basigx-component-map');
        var treeList = view.down('treelist');

        if(!view.down('treelist').getStore()){
            var treeStore = Ext.create('Ext.data.TreeStore', {
                proxy: {
                    type: 'ajax',
                    url: 'classic/resources/layerset.json',
                    reader: {
                        type: 'json'
                    }
                }
            });
            treeList.setStore(treeStore);
            treeStore.load();
        }
    },

    currentTask: null,

    setupShowFilterWinCheck: function() {
        var me = this;
        var treelist = this.getView().down('treelist');
        var selection = treelist.getSelection();
        if (me.currentTask) {
            me.currentTask.cancel();
        }
        me.currentTask = new Ext.util.DelayedTask(function(){
            if (selection && selection.isLeaf()) {
                Koala.util.Layer.getMetadataFromUuidAndThen(
                    selection.get('uuid'), me.showChangeFilterSettingsWin.bind(me));
            }
        });
        me.currentTask.delay(200);
    },

    addLayerWithDefaultFilters:  function() {
        // TODO if we want equal behaviour for sets and profiles, the
        //      changes from https://redmine-koala.bfs.de/issues/1445
        //      we have to share the logic in LayerSetChooserController
        //      method addLayers (`visible` setting)
        var me = this;
        var treelist = this.getView().down('treelist');
        var selection = treelist.getSelection();
        if (me.currentTask) {
            me.currentTask.cancel();
        }
        if(selection){
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

        // TODO future enhancements may want to remove the ComponentQuery…
        var treelist = this.view.down('treelist');

        var currentSelection = treelist.getSelection()[0];
        var title = currentSelection ?
            currentSelection.data.text :
            metadata.dspText;

        var winName = 'filter-win-' + metadata.id;

        // only allow one filter-window to be open
        var filterPanel = Ext.ComponentQuery.query('k-form-layerfilter');
        if (filterPanel.length > 0){
            filterPanel[0].up('basigx-panel-mobilewindow').destroy();
        }

        var win = Ext.create('BasiGX.view.panel.MobileWindow', {
            width: '90%',
            height: '90%',
            maxWidth: '95%',
            name: winName,
            title: 'Layer Filter',
            layout: 'fit',
            modal: true,
            items: {
                xtype: 'k-form-layerfilter',
                metadata: metadata,
                filters: filters
            }
        });
        view.add(win);
        win.show();
    }
});
