Ext.define('Koala.view.panel.MobileImprint',{
    extend: 'Koala.view.panel.MobilePanel',
    xtype: 'k-panel-mobileimprint',

    requires: [
        'Koala.view.panel.MobileImprintController',
        'Koala.view.panel.MobileImprintModel'
    ],

    controller: 'k-panel-mobileimprint',
    viewModel: {
        type: 'k-panel-mobileimprint'
    },

    closeToolAlign: 'left',

    bind: {
        title: '{title}'
    },

    scrollable: 'y',

    //TODO: clean up redundant listeners
    items: [{
        xtype: 'fieldset',
        padding: 5,
        listeners: {
            initialize: function() {
                var me = this;

                Ext.Ajax.request({
                    method: 'GET',
                    url: 'resources/imprint.html',
                    success: function(response) {
                      me.setHtml(response.responseText);
                    },
                    failure: function(response) {
                      Ext.log.warn('Loading imprint-HTML failed: ', response);
                    }
                });
            }
        }
    }, {
        xtype: 'fieldset',
        padding: 5,
        listeners: {
            initialize: function() {
                var me = this;

                Ext.Ajax.request({
                    method: 'GET',
                    url: 'resources/sitepolicy.html',
                    success: function(response) {
                      me.setHtml(response.responseText);
                    },
                    failure: function(response) {
                      Ext.log.warn('Loading sitepolicy-HTML failed: ', response);
                    }
                });
            }
        }
    }]
});
