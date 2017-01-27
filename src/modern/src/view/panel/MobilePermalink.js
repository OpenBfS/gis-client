Ext.define('Koala.view.panel.MobilePermalink',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobilepermalink',

    requires: [
        'Koala.view.panel.MobilePermalinkController',
        'Koala.view.panel.MobilePermalinkModel'
    ],

    controller: 'k-panel-mobilepermalink',
    viewModel: {
        type: 'k-panel-mobilepermalink'
    },

    closeToolAlign: 'left',

    bind: {
        title: '{title}'
    },

    listeners: {
        show: 'refreshPermalink'
    },

    items: [{
        xtype: 'textfield',
        name: 'textfield-permalink',
        editable: false,
        labelAlign: 'top',
        margin: 15,
        bind: {
            label: '{title}',
            value: '{permalink}'
        }
    }]
});
