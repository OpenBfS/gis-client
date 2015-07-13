
Ext.define("Koala.view.button.TimeReference",{
    extend: "Ext.button.Button",
    xtype: "k-button-timereference",

    statics: {
        UTC: 'UTC',
        LOCAL: 'local'
    },
    
    requires: [
        "Koala.view.button.TimeReferenceController",
        "Koala.view.button.TimeReferenceModel"
    ],

    controller: "k-button-timereference",
    viewModel: {
        type: "k-button-timereference"
    },

    enableToggle: true,

    listeners: {
        afterrender: 'setTitleBind',
        toggle: 'setTitleBind'
    },
    
    /**
     * 
     */
    getCurrent: function(){
        var staticMe = Koala.view.button.TimeReference;
        return this.pressed ? staticMe.UTC : staticMe.LOCAL;
    }
});
