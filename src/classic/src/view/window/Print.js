Ext.define("Koala.view.window.Print",{
    extend: "Ext.window.Window",
    xtype: "k-window-print",

    requires: [
        "Koala.view.window.PrintController",
        "Koala.view.window.PrintModel",

        "Koala.view.form.Print"
    ],

    controller: "k-window-print",
    viewModel: {
        type: "k-window-print"
    },

    bind: {
        title: '{title}'
    },

    minWidth: 300,
    maxWidth: 400,
    minHeight: 150,
    maxHeight: 600,

//    listeners: {
//        afterlayout: function(){
//            this.center();
//        }
//    },

    layout: 'fit',
    bodyPadding: '10px',
    items: [{
        xtype: 'k-form-print',
        url: 'http://10.133.7.63/print-servlet-3.3-SNAPSHOT/print/'
    }]
});
