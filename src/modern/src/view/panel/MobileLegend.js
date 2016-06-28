
Ext.define('Koala.view.panel.MobileLegend',{
    extend: 'Ext.Panel',
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

    style: 'border: 0px;',

    html: 'Hello Legend!!'
});
