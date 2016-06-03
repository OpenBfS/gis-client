
Ext.define('Koala.view.container.MobileLegend',{
    extend: 'Ext.Container',
    xtype: 'k-container-mobilelegend',

    requires: [
        'Koala.view.container.MobileLegendController',
        'Koala.view.container.MobileLegendModel'
    ],

    controller: 'k-container-mobilelegend',
    viewModel: {
        type: 'k-container-mobilelegend'
    },
    config: {
        title: 'Legend'
    },

    html: 'Hello Legend!!'
});
