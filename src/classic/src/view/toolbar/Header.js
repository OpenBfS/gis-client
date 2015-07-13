
Ext.define("Koala.view.toolbar.Header",{
    extend: "Ext.toolbar.Toolbar",
    xtype: 'k-toolbar-header',

    requires: [
        "Koala.view.toolbar.HeaderController",
        "Koala.view.toolbar.HeaderModel",
        
        "Koala.view.button.TimeReference"
    ],

    controller: "k-toolbar-header",
    viewModel: {
        type: "k-toolbar-header"
    },

    defaults: {
        scale: 'small'
    },

    items: [
        '->',
        {
            bind: {
                text: '{btnTextFullscreen}'
            },
            handler: 'toggleFullscreen'
        },
        {
            xtype: 'k-button-timereference'
        },
        {
            bind: {
                text: '{btnTextHelp}'
            }
        },
        {
            bind: {
                text: '{btnTextMobile}'
            }
        },
        {
            xtype: 'k-form-field-languagecombo'
        }
    ]
});
