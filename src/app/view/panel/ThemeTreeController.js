Ext.define('Koala.view.panel.ThemeTreeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-themetree',

    toggleLayerSetView: function () {
        var view = this.getView();
        var menu = view.up('base-panel-menu');
        var mapContainer = view.up('base-panel-mapcontainer');
        var layersetchooser = mapContainer.down('k-panel-layersetchooser');

        if (layersetchooser.isVisible()) {
            layersetchooser.hide();
        } else {
            layersetchooser.showAt(menu.getWidth(), view.getLocalY());
        }
    }
});
