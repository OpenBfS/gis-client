Ext.define('Koala.view.panel.Settings',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-settings',

    requires: [
        'Koala.view.panel.SettingsController',
        'Koala.view.panel.SettingsModel'
    ],

    controller: 'k-panel-settings',
    viewModel: {
        type: 'k-panel-settings'
    },

    bind: {
        title: '{title}'
    },

    items: [{
        xtype: 'k-field-languageselect',
        margin: 10
    },{
        xtype: 'fieldset',
        bind: {
            title: '{timereferenceLabel}'
        },
        items: [{
            xtype: 'radiofield',
            name : 'timereference',
            value: 'local',
            bind: {
                label: '{localLabel}'
            },
            checked: true
        },{
            xtype: 'radiofield',
            name : 'timereference',
            value: 'UTC',
            bind: {
                label: '{utcLabel}'
            },
            listeners: {
                change: 'onUtcChanged',
            }
        }]
    }]
});
