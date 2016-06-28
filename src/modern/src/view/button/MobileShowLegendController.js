Ext.define('Koala.view.button.MobileShowLegendController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-button-mobileshowlegend',

    acitvateLegendCard: function() {
        var btn = this.getView();
        var owningTabPanel = btn.up('tabpanel');
        var legendCard = owningTabPanel.down('k-panel-mobilelegend');
        owningTabPanel.setActiveItem(legendCard);
    }

});
