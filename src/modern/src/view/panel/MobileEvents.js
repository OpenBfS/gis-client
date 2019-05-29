Ext.define('Koala.view.panel.MobileEvents',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobileevents',

    requires: [
        'Koala.view.panel.MobileEventsController',
        'Koala.view.panel.MobileEventsModel'
    ],

    controller: 'k-panel-mobileevents',
    viewModel: {
        type: 'k-panel-mobileevents'
    },

    closeToolAlign: 'left',

    bind: {
        title: '{title}'
    },

    scrollable: 'y',

    //TODO: clean up redundant listeners
    items: [
    //     {
    //     xtype: 'fieldset',
    //     padding: 5,
    //     listeners: {
    //         initialize: function() {
    //             var me = this;
    //
    //             Ext.Ajax.request({
    //                 method: 'GET',
    //                 url: 'resources/imprint.html',
    //                 success: function(response) {
    //                     me.setHtml(response.responseText);
    //                 },
    //                 failure: function(response) {
    //                     Ext.log.warn('Loading imprint-HTML failed: ', response);
    //                 }
    //             });
    //         }
    //     }
    // }, {
    //     xtype: 'fieldset',
    //     padding: 5,
    //     listeners: {
    //         initialize: function() {
    //             var me = this;
    //
    //             Ext.Ajax.request({
    //                 method: 'GET',
    //                 url: 'resources/sitepolicy.html',
    //                 success: function(response) {
    //                     me.setHtml(response.responseText);
    //                 },
    //                 failure: function(response) {
    //                     Ext.log.warn('Loading sitepolicy-HTML failed: ', response);
    //                 }
    //             });
    //         }
    //     }
    // }
    ]
});
