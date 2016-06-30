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

    config: {
        title: 'Einstellungen'
    },

    items: [{
        xtype: 'k-field-languageselect'
    }]
});
