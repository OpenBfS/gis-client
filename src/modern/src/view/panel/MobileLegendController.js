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

    setTreeItemCheckStatus: function(item) {
        var me = this;
        var layer = item.getNode().getOlLayer();
        item.setText(me.getTreeListItemTpl().apply(layer));
    },

    onTreeItemTap: function(evt, target) {
        var me = this;
        var view = me.getView();
        var treeList = view.down('treelist');
        var selection = treeList.getSelection();
        var layer = selection ? selection.getOlLayer() : null;

        if (layer && layer instanceof ol.layer.Layer) {
            layer.setVisible(!layer.getVisible());
            me.setTreeItemCheckStatus(treeList.getItem(selection));
        }
    },

    getTreeListItemTpl: function() {
        var me = this;

        return new Ext.XTemplate(
            '<tpl if="this.isVisible(values)">',
                '<i class="fa fa-eye"></i> {text} <br> <span style="color:#666;">{[this.getFilterText(values)]}</span>',
                '<tpl if="this.isRemovable(values)">',
                    '<i class="fa fa-times"></i>',
                '</tpl>',
            '<tpl else>',
                '<i class="fa fa-eye-slash"></i> {text}',
            '</tpl>', {
                isVisible: function(layer) {
                    return layer.getVisible();
                },
                getFilterText: function(layer) {
                    return Koala.util.Layer.getFiltersTextFromMetadata(layer.metadata);
                },
                isRemovable: function(layer) {
                    return layer.get('allowRemoval') || false;
                }
            }
        );
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

});
