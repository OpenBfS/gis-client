Ext.define('Koala.view.panel.LayerSetChooserController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-layersetchooser',

    /**
     *
     */
    onLayerSetDblClick: function () {
        console.log("dblclick");
    },

    /**
     *
     */
    filterLayerSetsByText: function(textfield, newVal) {
        var layerProfileView = this.getView().down('k-view-layerset'),
            store = layerProfileView.getStore();
        store.getFilters().replaceAll({
            property: 'name',
            anyMatch: true,
            value: newVal
        });
    },

    /**
     *
     */
    registerMenuBehaviour: function(layersetchooser){
        var mapContainer = layersetchooser.up('base-panel-mapcontainer');
        var menu = mapContainer.down('base-panel-menu');
        menu.on('collapse', function() {
            if (!layersetchooser.isHidden()) {
                layersetchooser.hide(menu);
                menu.on('expand', layersetchooser.show, layersetchooser, {
                    single: true
                });
            }
        }, layersetchooser);
    }
});
