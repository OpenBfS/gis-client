Ext.define('Koala.view.panel.MobileLegend',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobilelegend',

    requires: [
        'Koala.view.panel.MobileLegendController',
        'Koala.view.panel.MobileLegendModel'
    ],

    controller: 'k-panel-mobilelegend',
    viewModel: {
        type: 'k-panel-mobilelegend'
    },
    config: {
        title: 'Legend'
    },

    html: 'Hello Legend!!'
});
