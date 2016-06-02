
Ext.define('Koala.view.button.MobileLegend',{
    extend: 'Ext.Button',
    xtype: 'k-button-mobilelegend',

    requires: [
        'Koala.view.button.MobileLegendController',
        'Koala.view.button.MobileLegendModel'
    ],

    controller: 'k-button-mobilelegend',
    viewModel: {
        type: 'k-button-mobilelegend'
    },

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf022@FontAwesome',
    html: '<i class="fa fa-list-alt fa-2x"></i>',

    listeners: {
        tap: 'helloMobile'
    }
});
