
Ext.define('Koala.view.button.MobileShowLegend',{
    extend: 'Ext.Button',
    xtype: 'k-button-mobileshowlegend',

    requires: [
        'Koala.view.button.MobileShowLegendController',
        'Koala.view.button.MobileShowLegendModel'
    ],

    controller: 'k-button-mobileshowlegend',
    viewModel: {
        type: 'k-button-mobileshowlegend'
    },

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf022@FontAwesome',
    html: '<i class="fa fa-list-alt fa-2x"></i>',

    listeners: {
        tap: 'acitvateLegendCard'
    }
});
