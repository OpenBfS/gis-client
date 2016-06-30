Ext.define('Koala.view.panel.LayerSetTreeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-layersettree',

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
    }
});
