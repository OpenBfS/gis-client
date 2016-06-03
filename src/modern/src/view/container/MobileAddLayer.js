
Ext.define('Koala.view.container.MobileAddLayer',{
    extend: 'Ext.Container',
    xtype: 'k-container-mobileaddlayer',

    requires: [
        'Koala.view.container.MobileAddLayerController',
        'Koala.view.container.MobileAddLayerModel'
    ],

    controller: 'k-container-mobileaddlayer',
    viewModel: {
        type: 'k-container-mobileaddlayer'
    },
    config: {
        title: 'Add Layer'
    },
    bind: {
        html: '<b>{content}</b>'
    }
});
