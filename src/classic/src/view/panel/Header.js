
Ext.define("Koala.view.panel.Header",{
    extend: "Ext.panel.Panel",
    xtype: "k-panel-header",

    requires: [
        "Ext.Img",

        "Koala.view.form.field.LanguageCombo",
        "Koala.view.form.field.SearchCombo",
        "Koala.view.toolbar.Header"

//        "Koala.view.panel.HeaderController",
//        "Koala.view.panel.HeaderModel"
    ],

//    controller: "k-panel-header",
//    viewModel: {
//        type: "k-panel-header"
//    },

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    padding: 5,

    cls: 'koala-header',

    items: [
        {
            xtype: 'image',
            width: 200,
            margin: '0 50px',
            // TODO for some strange reason we cannot use bind here...
            alt: 'Logo Bundesamt für Strahlenschutz',
            height: 78,
            src: 'classic/resources/img/bfs-logo.png'
        },
        {
            xtype: 'container',
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'center',
                pack: 'left'
            },
            items: [
                {
                    xtype: 'k-form-field-searchcombo',
                    width: 500
                },
                {
                    xtype: 'button',
                    glyph:'xf057@FontAwesome',
                    style: {
                        borderRadius: 0
                    },
                    handler: function(btn, evt){
                        btn.up().down('k-form-field-searchcombo').clearValue();
                    }
                }
            ]
        },
        {
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'center',
                pack: 'right'
            },
            items: {
                xtype: 'k-toolbar-header'
            }
        }
    ]
});
