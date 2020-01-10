Ext.define('Koala.view.panel.MobileEvents',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobileevents',

    requires: [
        'Koala.view.window.ElanScenarioWindowController',
        'Koala.view.panel.MobileEventsModel'
    ],

    controller: 'k-window-elanscenarios',
    viewModel: {
        type: 'k-panel-mobileevents'
    },

    id: 'elanwindowid',

    closeToolAlign: 'left',

    bind: {
        title: '{title}'
    },

    scrollable: 'y',

    padding: '20 10 20 10',

    listeners: {
        hide: 'updateContent'
    }

});
