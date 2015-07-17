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
    maxWidth: 800,
    minHeight: 150,
    maxHeight: 800,

    layout: 'fit',
    bodyPadding: '10px',
    items: [{
        xtype: 'k-form-print',
        url: 'http://bfs-koala.intranet.terrestris.de/print-servlet-3.3-SNAPSHOT/print/'
    }]
});
