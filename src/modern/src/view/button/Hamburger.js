Ext.define('Koala.view.button.Hamburger', {
    extend: 'Ext.Button',
    xtype: 'k-button-hamburger',

    requires: [
        "Koala.view.button.HamburgerController",
        "Koala.view.button.HamburgerModel"
    ],

    controller: "k-button-hamburger",
    viewModel: {
        type: "k-button-hamburger"
    },

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf0c9@FontAwesome',
    html: '<i class="fa fa-bars fa-2x"></i>',

    listeners: {
        tap: 'showMobileMenu'
    }
});
