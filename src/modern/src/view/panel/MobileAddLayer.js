
Ext.define('Koala.view.panel.MobileAddLayer',{
    extend: 'Ext.Panel',
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
    },
    bind: {
        html: '<b>{content}</b>'
    }
});
