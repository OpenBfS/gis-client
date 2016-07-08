Ext.define('Koala.view.panel.Settings',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-settings',

    requires: [
        'Koala.view.panel.SettingsController',
        'Koala.view.panel.SettingsModel',

        'Koala.view.form.field.LanguageSelect'
    ],

    controller: 'k-panel-settings',
    viewModel: {
        type: 'k-panel-settings'
    },

    config: {
        /**
         * The route (template) to apply for this menu component.
         */
        route: 'menu/1/0/0/0/{0}/0',

        /**
         * If set, a close/hide tool will be rendered to the desired panel header
         * side (typically 'left' or 'right').
         */
        closeToolAlign: 'left'
    },

    listeners: {
        show: 'onShow',
        hide: 'onHide'
    },

    bind: {
        title: '{title}'
    },

    items: [{
        xtype: 'k-field-languageselect',
        bind: {
            label: '{languageSelectComboLabel}'
        },
        labelWidth: 150,
        margin: 15
    },{
        xtype: 'fieldset',
        bind: {
            title: '{timereferenceLabel}'
        },
        items: [{
            xtype: 'radiofield',
            name : 'timereference',
            labelWidth: 150,
            value: 'local',
            bind: {
                label: '{localLabel}'
            },
            checked: true
        },{
            xtype: 'radiofield',
            name : 'timereference',
            labelWidth: 150,
            value: 'UTC',
            bind: {
                label: '{utcLabel}'
            },
            listeners: {
                change: 'onUtcChanged'
            }
        }]
    }]
});
