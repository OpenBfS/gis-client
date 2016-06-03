Ext.define('Koala.view.button.MobileAddLayerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-button-mobileaddlayer',

    acitvateAddLayerCard: function() {
        var btn = this.getView();
        var owningTabPanel = btn.up('tabpanel');
        var addLayerCard = owningTabPanel.down('k-container-mobileaddlayer');
        owningTabPanel.setActiveItem(addLayerCard);
    }
    
});
