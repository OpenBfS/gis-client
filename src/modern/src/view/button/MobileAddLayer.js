
Ext.define('Koala.view.button.MobileAddLayer',{
    extend: 'Ext.Button',
    xtype: 'k-button-mobileaddlayer',

    requires: [
        'Koala.view.button.MobileAddLayerController',
        'Koala.view.button.MobileAddLayerModel'
    ],

    controller: 'k-button-mobileaddlayer',
    viewModel: {
        type: 'k-button-mobileaddlayer'
    },

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf067@FontAwesome',
    html: '<span class="fa-stack">' +
             '<i class="fa fa-list-alt fa-stack-2x"></i>' +
             '<i class="fa fa-plus-circle fa-stack-1x fa-inverse"></i>' +
           '</span>',

    listeners: {
        tap: 'acitvateAddLayerCard'
    },
/*    constructor: function(cfg){
        if (cfg.text){
            this.setHtml(this.getHtml() + cfg.text);
        }
        this.callParent([cfg]);
    }
    */
    initialize: function() {
        this.callParent();
        if (this.getText()){
            this.setHtml(this.getHtml() + this.getText());
        }
    }
});
