Ext.define('Koala.view.panel.MobileEvents',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobileevents',

    requires: [
        'Koala.view.panel.MobileEventsController',
        'Koala.view.panel.MobileEventsModel'
    ],

    controller: 'k-panel-mobileevents',
    viewModel: {
        type: 'k-panel-mobileevents'
    },

    closeToolAlign: 'left',

    bind: {
        title: '{title}'
    },

    scrollable: 'y',

    padding: '20 10 20 10'

});
