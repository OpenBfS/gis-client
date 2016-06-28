Ext.define('Koala.view.panel.MobileAddLayer',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobileaddlayer',

    requires: [
        'Koala.view.panel.MobileAddLayerController',
        'Koala.view.panel.MobileAddLayerModel'
    ],

    controller: 'k-panel-mobileaddlayer',
    viewModel: {
        type: 'k-panel-mobileaddlayer'
    },
    config: {
        title: 'Add Layer'
    }
});
